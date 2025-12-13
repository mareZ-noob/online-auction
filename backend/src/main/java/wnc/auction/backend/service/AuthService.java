package wnc.auction.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HashSet;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.request.LoginRequest;
import wnc.auction.backend.dto.request.RegisterRequest;
import wnc.auction.backend.dto.request.ResetPasswordRequest;
import wnc.auction.backend.dto.request.VerifyOtpRequest;
import wnc.auction.backend.dto.response.AuthResponse;
import wnc.auction.backend.exception.*;
import wnc.auction.backend.mapper.UserMapper;
import wnc.auction.backend.model.*;
import wnc.auction.backend.model.enumeration.AuthProvider;
import wnc.auction.backend.model.enumeration.OtpType;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.OtpRepository;
import wnc.auction.backend.repository.RefreshTokenRepository;
import wnc.auction.backend.repository.TokenBlacklistRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.JwtTokenProvider;
import wnc.auction.backend.security.UserPrincipal;
import wnc.auction.backend.utils.Constants;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final RecaptchaService recaptchaService;

    @Value("${app.otp.expiration-minutes}")
    private int otpExpirationMinutes;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenDurationMs;

    @Value("${app.security.admin-registration.public-key-path}")
    private Resource adminPublicKeyResource;

    private String cachedPublicKeyStr;

    @PostConstruct
    public void init() {
        try {
            if (adminPublicKeyResource.exists()) {
                String rawKey =
                        new String(adminPublicKeyResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                this.cachedPublicKeyStr = rawKey.replace("-----BEGIN PUBLIC KEY-----", "")
                        .replace("-----END PUBLIC KEY-----", "")
                        .replaceAll("\\s+", "");
                log.info("Admin public key loaded successfully from resources.");
            } else {
                log.warn("Admin public key file not found at configured path.");
            }
        } catch (Exception e) {
            log.error("Failed to load admin public key file", e);
        }
    }

    private boolean verifyAdminSignature(String data, String signatureStr) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(this.cachedPublicKeyStr);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            PublicKey publicKey = kf.generatePublic(spec);

            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            signature.update(data.getBytes(StandardCharsets.UTF_8));

            byte[] signatureBytes = Base64.getDecoder().decode(signatureStr);
            return signature.verify(signatureBytes);
        } catch (Exception e) {
            log.error("Error verifying admin signature", e);
            return false;
        }
    }

    public void register(RegisterRequest request) {
        // Validate reCAPTCHA
        // recaptchaService.validateToken(request.getRecaptchaToken());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        UserRole role = UserRole.BIDDER;

        if (request.getAdminSignature() != null && !request.getAdminSignature().isEmpty()) {
            // Use the cached key string loaded from file
            if (this.cachedPublicKeyStr != null
                    && verifyAdminSignature(request.getEmail(), request.getAdminSignature())) {
                role = UserRole.ADMIN;
                log.info("Verified Admin signature for email: {}", request.getEmail());
            } else {
                log.warn("Invalid Admin signature or Public Key not loaded for email: {}", request.getEmail());
            }
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .address(request.getAddress())
                .role(role)
                .socialAccounts(new HashSet<>())
                .emailVerified(false)
                .isActive(true)
                .positiveRatings(0)
                .negativeRatings(0)
                .build();

        SocialAccount socialAccount = SocialAccount.builder()
                .provider(AuthProvider.LOCAL)
                .providerId(user.getEmail())
                .email(user.getEmail())
                .name(user.getFullName())
                .user(user)
                .build();

        user.getSocialAccounts().add(socialAccount);

        user = userRepository.save(user);

        // Send OTP for email verification
        sendEmailVerificationOtp(user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        // Check if email is verified
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository
                .findById(userPrincipal.getId())
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            throw new UnauthorizedException(Constants.ErrorCode.EMAIL_NOT_VERIFIED);
        }

        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new UnauthorizedException(Constants.ErrorCode.ACCOUNT_DEACTIVATED);
        }

        return generateAuthResponse(authentication);
    }

    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken token = refreshTokenRepository
                .findByToken(refreshToken)
                .orElseThrow(() -> new JWTException(Constants.ErrorCode.INVALID_REFRESH_TOKEN));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new JWTException(Constants.ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        UserPrincipal userPrincipal = UserPrincipal.create(token.getUser());
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());

        String newAccessToken = tokenProvider.generateAccessToken(authentication);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .user(UserMapper.toDto(token.getUser()))
                .build();
    }

    public void sendEmailVerificationOtp(String email) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException(Constants.ErrorCode.EMAIL_ALREADY_VERIFIED);
        }

        // Delete existing OTPs
        otpRepository.deleteByEmailAndType(email, OtpType.EMAIL_VERIFICATION);

        // Generate OTP
        String code = generateOtpCode();

        Otp otp = Otp.builder()
                .email(email)
                .code(code)
                .type(OtpType.EMAIL_VERIFICATION)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .used(false)
                .build();

        otpRepository.save(otp);

        // Send email
        emailService.sendOtpEmail(user.getId(), code, "Email Verification");
    }

    public void verifyEmail(VerifyOtpRequest request) {
        Otp otp = otpRepository
                .findValidOtp(request.getEmail(), request.getCode(), OtpType.EMAIL_VERIFICATION, LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException(Constants.ErrorCode.INVALID_OTP));

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        user.setEmailVerified(true);
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);
    }

    public void sendPasswordResetOtp(String email) {
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        // Delete existing OTPs
        otpRepository.deleteByEmailAndType(email, OtpType.PASSWORD_RESET);

        // Generate OTP
        String code = generateOtpCode();

        Otp otp = Otp.builder()
                .email(email)
                .code(code)
                .type(OtpType.PASSWORD_RESET)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .used(false)
                .build();

        otpRepository.save(otp);

        // Send email
        emailService.sendOtpEmail(user.getId(), code, "Password Reset");
    }

    public void resetPassword(ResetPasswordRequest request) {
        Otp otp = otpRepository
                .findValidOtp(request.getEmail(), request.getCode(), OtpType.PASSWORD_RESET, LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);

        // Invalidate all refresh tokens
        refreshTokenRepository.deleteByUserId(user.getId());
    }

    public void logout(String refreshToken, String authorizationHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String accessToken = authorizationHeader.substring(7);

            try {
                if (!tokenBlacklistRepository.existsByToken(accessToken)) {

                    LocalDateTime expiresAt = tokenProvider.getExpirationDateFromToken(accessToken);
                    Long userId = tokenProvider.getUserIdFromToken(accessToken);

                    if (expiresAt != null && userId != null) {

                        if (expiresAt.isAfter(LocalDateTime.now())) {
                            TokenBlacklist tokenBlacklist = TokenBlacklist.builder()
                                    .token(accessToken)
                                    .userId(userId)
                                    .expiresAt(expiresAt)
                                    .blacklistedAt(LocalDateTime.now())
                                    .reason("User Logout")
                                    .build();
                            tokenBlacklistRepository.save(tokenBlacklist);
                        }
                    }
                }
            } catch (ExpiredJwtException e) {
                log.info("Logout with expired access token. Skipping blacklist.");
            } catch (Exception e) {
                log.warn("Error processing access token during logout: {}", e.getMessage());
            }
        }

        refreshTokenRepository.findByToken(refreshToken).ifPresent(refreshTokenRepository::delete);
    }

    private AuthResponse generateAuthResponse(Authentication authentication) {
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository
                .findById(userPrincipal.getId())
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        LocalDateTime expiryDate = LocalDateTime.now().plus(refreshTokenDurationMs, ChronoUnit.MILLIS);

        // Save refresh token
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(expiryDate)
                .build();
        refreshTokenRepository.save(token);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserMapper.toDto(user))
                .build();
    }

    private String generateOtpCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    public AuthResponse exchangeToken(String code) {
        String redisKey = "auth_code:" + code;

        Object cachedData = redisTemplate.opsForValue().get(redisKey);

        if (cachedData == null) {
            throw new BadRequestException(Constants.ErrorCode.INVALID_AUTH_CODE);
        }

        AuthResponse authResponse;
        try {
            if (cachedData instanceof AuthResponse) {
                authResponse = (AuthResponse) cachedData;
            } else {
                authResponse = objectMapper.convertValue(cachedData, AuthResponse.class);
            }
        } catch (Exception e) {
            log.error("Error converting cached auth data", e);
            throw new AuctionException(Constants.ErrorCode.AUTH_PROCESSING_ERROR);
        }

        redisTemplate.delete(redisKey);

        log.info("Token exchanged successfully for code: {}", code);
        return authResponse;
    }
}
