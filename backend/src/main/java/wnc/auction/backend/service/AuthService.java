package wnc.auction.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.exception.UnauthorizedException;
import wnc.auction.backend.mapper.UserMapper;
import wnc.auction.backend.model.Otp;
import wnc.auction.backend.model.RefreshToken;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.OtpType;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.OtpRepository;
import wnc.auction.backend.repository.RefreshTokenRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.JwtTokenProvider;
import wnc.auction.backend.security.UserPrincipal;

import java.time.LocalDateTime;
import java.util.Random;

@Service
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

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository, OtpRepository otpRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider, EmailService emailService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.emailService = emailService;
    }

    @Value("${app.otp.expiration-minutes}")
    private int otpExpirationMinutes;

    public AuthResponse register(RegisterRequest request) {
        // Validate reCAPTCHA (implement actual validation)

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .address(request.getAddress())
                .role(UserRole.BIDDER)
                .emailVerified(false)
                .isActive(true)
                .positiveRatings(0)
                .negativeRatings(0)
                .build();

        user = userRepository.save(user);

        // Send OTP for email verification
        sendEmailVerificationOtp(user.getEmail());

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        return generateAuthResponse(authentication);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        return generateAuthResponse(authentication);
    }

    public AuthResponse refreshToken(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token expired");
        }

        UserPrincipal userPrincipal = UserPrincipal.create(token.getUser());
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities()
        );

        String newAccessToken = tokenProvider.generateAccessToken(authentication);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .user(UserMapper.toDto(token.getUser()))
                .build();
    }

    public void sendEmailVerificationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email already verified");
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
        emailService.sendOtpEmail(email, code, "Email Verification");
    }

    public void verifyEmail(VerifyOtpRequest request) {
        Otp otp = otpRepository.findValidOtp(
                        request.getEmail(),
                        request.getCode(),
                        OtpType.EMAIL_VERIFICATION,
                        LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setEmailVerified(true);
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);
    }

    public void sendPasswordResetOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

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
        emailService.sendOtpEmail(email, code, "Password Reset");
    }

    public void resetPassword(ResetPasswordRequest request) {
        Otp otp = otpRepository.findValidOtp(
                        request.getEmail(),
                        request.getCode(),
                        OtpType.PASSWORD_RESET,
                        LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP"));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);

        // Invalidate all refresh tokens
        refreshTokenRepository.deleteByUserId(user.getId());
    }

    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    private AuthResponse generateAuthResponse(Authentication authentication) {
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Save refresh token
        RefreshToken token = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
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

}
