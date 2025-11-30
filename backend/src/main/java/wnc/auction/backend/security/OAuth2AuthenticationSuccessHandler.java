package wnc.auction.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;

    @Value("${app.frontend.url}")
    private String frontendURL;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

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

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) {

        log.info("Determining target URL for authentication: {}", authentication.getName());

        // Generate JWT token
        String token = tokenProvider.generateAccessToken(authentication);
        log.info("Generated JWT token for user");

        String idToken = "";
        if (authentication.getPrincipal() instanceof OidcUser oidcUser && oidcUser.getIdToken() != null) {
            idToken = oidcUser.getIdToken().getTokenValue();
            log.info("Extracted OIDC ID token");
        }

        // Build frontend redirect URL
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendURL)
                .path("/oauth2/redirect")
                .queryParam("token", token)
                .queryParam("id_token", idToken)
                .build()
                .toUriString();

        log.info("Built redirect URL: {}", redirectUrl);

        return redirectUrl;
    }
}
