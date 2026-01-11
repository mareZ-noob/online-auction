package wnc.auction.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import wnc.auction.backend.dto.response.AuthResponse;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.UserMapper;
import wnc.auction.backend.model.RefreshToken;
import wnc.auction.backend.model.User;
import wnc.auction.backend.repository.RefreshTokenRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.utils.Constants;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.frontend.url}")
    private String frontendURL;

    @Value("${app.frontend.admin-url}")
    private String adminFrontendURL;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenDurationMs;

    private static final long CODE_TTL_SECONDS = 60;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        log.info("OAuth2 Authentication Success for user: {}", authentication.getName());

        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            log.warn("Response has already been committed. Unable to redirect to {}", targetUrl);
            return;
        }

        log.info("Redirecting to: {}", targetUrl);
        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    @Override
    protected String determineTargetUrl(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication) {

        // Generate JWT Tokens
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshTokenStr = tokenProvider.generateRefreshToken(authentication);

        // Retrieve User details to build the full response object
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository
                .findByIdWithSocialAccounts(userPrincipal.getId())
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        LocalDateTime expiryDate = LocalDateTime.now().plus(refreshTokenDurationMs, ChronoUnit.MILLIS);

        // Persist Refresh Token to DB (Same logic as manual login)
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiresAt(expiryDate)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        // Create the AuthResponse object that will be cached
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .user(UserMapper.toDto(user))
                .tokenType("Bearer")
                .build();

        // Generate a unique authorization code (UUID)
        String code = UUID.randomUUID().toString().replace("-", "")
                + UUID.randomUUID().toString().replace("-", "");

        // Store AuthResponse in Redis mapped by the code
        // Key: auth_code:{uuid} -> Value: AuthResponse
        String redisKey = "auth_code:" + code;
        redisTemplate.opsForValue().set(redisKey, authResponse, Duration.ofSeconds(CODE_TTL_SECONDS));

        log.info("Stored auth tokens in Redis with code: {}", code);

        // Determine which frontend to redirect to based on OAuth2 client
        String targetFrontendUrl = frontendURL; // Default to regular frontend

        // Check if this is an OAuth2 authentication
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) authentication;
            String registrationId = oauth2Token.getAuthorizedClientRegistrationId();

            log.info("OAuth2 client registration ID: {}", registrationId);

            // If authenticated via keycloak-admin, redirect to admin frontend
            if ("keycloak-admin".equals(registrationId)) {
                targetFrontendUrl = adminFrontendURL;
                log.info("Redirecting to admin frontend: {}", targetFrontendUrl);
            } else {
                log.info("Redirecting to regular frontend: {}", targetFrontendUrl);
            }
        }

        // Build frontend redirect URL with ONLY the code
        // targetFrontendUrl already includes the base path (/admin for admin frontend)
        // So we just need /oauth2/redirect for both
        String redirectPath = "/oauth2/redirect";

        return UriComponentsBuilder.fromUriString(targetFrontendUrl)
                .path(redirectPath)
                .queryParam("code", code)
                .build()
                .toUriString();
    }
}
