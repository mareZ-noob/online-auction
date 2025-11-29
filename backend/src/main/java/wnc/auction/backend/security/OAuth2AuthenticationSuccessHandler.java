package wnc.auction.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;

    @Value("${app.frontend.url}")
    private String frontendURL;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        // Generate the same JWT used for local login
        String token = tokenProvider.generateAccessToken(authentication);

        String idToken = "";
        if (authentication.getPrincipal() instanceof OidcUser oidcUser && oidcUser.getIdToken() != null) {
            idToken = oidcUser.getIdToken().getTokenValue();
        }

        // Redirect to Frontend (e.g., localhost:5173/oauth2/redirect) with token
        // The Frontend should parse this token and store it in localStorage
        return UriComponentsBuilder.fromUriString(String.format("%s/oauth2/redirect", frontendURL))
                .queryParam("token", token)
                .queryParam("id_token", idToken)
                .build().toUriString();
    }
}
