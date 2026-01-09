package wnc.auction.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.RatingDto;
import wnc.auction.backend.dto.model.UserDto;
import wnc.auction.backend.dto.request.ChangeLanguageRequest;
import wnc.auction.backend.dto.request.ChangePasswordRequest;
import wnc.auction.backend.dto.request.UpdateProfileRequest;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.UserMapper;
import wnc.auction.backend.model.RefreshToken;
import wnc.auction.backend.model.TokenBlacklist;
import wnc.auction.backend.model.User;
import wnc.auction.backend.repository.RatingRepository;
import wnc.auction.backend.repository.RefreshTokenRepository;
import wnc.auction.backend.repository.TokenBlacklistRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.security.JwtTokenProvider;
import wnc.auction.backend.utils.Constants;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final KeycloakService keycloakService;

    public UserDto getCurrentUser() {
        Long userId = CurrentUser.getUserId();
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));
        return UserMapper.toDto(user);
    }

    public UserDto getUserById(Long id) {
        User user = userRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));
        return UserMapper.toDto(user);
    }

    public UserDto updateProfile(UpdateProfileRequest request) {
        Long userId = CurrentUser.getUserId();
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        user.setFullName(request.getFullName());
        user.setAddress(request.getAddress());
        user.setDateOfBirth(request.getDateOfBirth());

        user = userRepository.save(user);
        return UserMapper.toDto(user);
    }

    public void changePassword(ChangePasswordRequest request) {
        Long userId = CurrentUser.getUserId();
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public PageResponse<RatingDto> getMyRatings(int page, int size) {
        // Implementation similar to other paginated methods
        return null;
    }

    public void disableAccount(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        // Set account as inactive
        user.setIsActive(false);
        userRepository.save(user);

        // Invalidate all sessions
        invalidateAllUserSessions(userId, "ACCOUNT_DISABLED");

        // Disable in Keycloak
        keycloakService.disableUser(user.getEmail());

        log.info("Account disabled for user: {} (email: {})", userId, user.getEmail());
    }

    public void enableAccount(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        user.setIsActive(true);
        userRepository.save(user);

        // Enable in Keycloak
        keycloakService.enableUser(user.getEmail());

        log.info("Account enabled for user: {} (email: {})", userId, user.getEmail());
    }

    public void forceLogoutAllDevices(Long userId) {
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        invalidateAllUserSessions(userId, "ADMIN_FORCE_LOGOUT");

        log.info("Force logout user: {} (email: {}) from all devices", userId, user.getEmail());
    }

    private void invalidateAllUserSessions(Long userId, String reason) {
        int deletedRefreshTokens = refreshTokenRepository.deleteByUserId(userId);
        log.debug("Deleted {} refresh tokens for user {}", deletedRefreshTokens, userId);

        List<RefreshToken> tokens = refreshTokenRepository.findByUserId((userId));
        for (RefreshToken refreshToken : tokens) {
            blacklistAccessToken(refreshToken.getToken(), userId, reason);
        }

        log.info("Invalidated all sessions for user {} - Reason: {}", userId, reason);
    }

    private void blacklistAccessToken(String token, Long userId, String reason) {
        try {
            LocalDateTime expiresAt = jwtTokenProvider.getExpirationDateFromToken(token);

            TokenBlacklist blacklistedToken = TokenBlacklist.builder()
                    .token(token)
                    .userId(userId)
                    .expiresAt(expiresAt)
                    .blacklistedAt(LocalDateTime.now())
                    .reason(reason)
                    .build();

            tokenBlacklistRepository.save(blacklistedToken);
            log.debug("Token blacklisted for user {} - Reason: {}", userId, reason);
        } catch (Exception e) {
            log.error("Failed to blacklist token for user {}", userId, e);
        }
    }

    @Transactional
    public void cleanupExpiredBlacklistedTokens() {
        int deleted = tokenBlacklistRepository.deleteExpiredTokens(LocalDateTime.now());
        log.info("Cleaned up {} expired blacklisted tokens", deleted);
    }

    public void changeLanguage(ChangeLanguageRequest request) {
        Long userId = CurrentUser.getUserId();
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        user.setPreferredLanguage(request.getLanguage());

        if ("vi".equals(request.getLanguage())) {
            user.setRegion("VN");
        } else {
            user.setRegion("US"); // Default region for English
        }

        userRepository.save(user);
        log.info("User {} changed language to {}", userId, request.getLanguage());
    }
}
