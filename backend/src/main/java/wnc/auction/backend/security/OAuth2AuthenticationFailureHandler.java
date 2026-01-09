package wnc.auction.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend.url}")
    private String frontendURL;

    @Value("${app.frontend.admin-url}")
    private String adminFrontendURL;

    @Value("${spring.security.oauth2.client.provider.keycloak.issuer-uri}")
    private String keycloakIssuerUri;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request, HttpServletResponse response, AuthenticationException exception)
            throws IOException, ServletException {

        log.error("OAuth2 Authentication Failed: {}", exception.getMessage());

        // Check if this is an admin access denial with ID token
        if (exception instanceof OAuth2AdminAccessDeniedException) {
            OAuth2AdminAccessDeniedException adminException = (OAuth2AdminAccessDeniedException) exception;
            String idToken = adminException.getIdToken();

            // Build post-logout redirect URI (simple URL without error params)
            // We'll add error params after Keycloak redirects back
            String postLogoutRedirectUri = adminFrontendURL + "/auth/sign-in";

            // Build Keycloak logout URL with id_token_hint
            // UriComponentsBuilder handles encoding automatically
            String logoutUrl = UriComponentsBuilder.fromUriString(keycloakIssuerUri)
                    .path("/protocol/openid-connect/logout")
                    .queryParam("id_token_hint", idToken)
                    .queryParam("post_logout_redirect_uri", postLogoutRedirectUri)
                    .build()
                    .toUriString();

            log.info("Admin access denied, redirecting to Keycloak logout to clear session: {}", logoutUrl);
            getRedirectStrategy().sendRedirect(request, response, logoutUrl);
            return;
        }

        // For other OAuth2 errors, redirect back to the originating frontend
        // Determine which frontend based on the OAuth2 registration ID
        String requestUri = request.getRequestURI();
        boolean isFromAdminFrontend = requestUri != null && requestUri.contains("keycloak-admin");

        // Determine target frontend URL based on the registration ID
        String targetFrontendUrl = isFromAdminFrontend ? adminFrontendURL : frontendURL;

        // Build error message
        String errorMessage =
                exception.getMessage() != null ? exception.getMessage() : "Authentication failed. Please try again.";

        // Build redirect URL - always redirect back to the same frontend
        String targetUrl = UriComponentsBuilder.fromUriString(targetFrontendUrl)
                .path("/auth/sign-in")
                .queryParam("error", URLEncoder.encode(errorMessage, StandardCharsets.UTF_8))
                .build()
                .toUriString();

        log.info(
                "OAuth2 failure for registration: {}, redirecting to {} frontend: {}",
                isFromAdminFrontend ? "keycloak-admin" : "keycloak",
                isFromAdminFrontend ? "admin" : "regular",
                targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
