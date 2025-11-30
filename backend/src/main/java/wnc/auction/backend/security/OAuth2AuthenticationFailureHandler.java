package wnc.auction.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {

        log.error("OAuth2 Authentication failed: {}", exception.getMessage(), exception);

        String targetUrl = frontendUrl + "/login"; // Redirect to login page instead
        String errorCode = "LOGIN_FAILED";
        String errorMessage = "Authentication failed";

        // Parse exception for specific error types
        String exceptionMessage = exception.getMessage();

        if (exceptionMessage != null) {
            if (exceptionMessage.contains("email_not_verified")) {
                errorCode = "EMAIL_NOT_VERIFIED";
                errorMessage = "Please verify your email before logging in";
            } else if (exceptionMessage.contains("Email not verified")) {
                errorCode = "EMAIL_NOT_VERIFIED";
                errorMessage = "Email verification required";
            } else if (exceptionMessage.contains("account_exists") || exceptionMessage.contains("already exists")) {
                errorCode = "ACCOUNT_EXISTS";
                errorMessage = "An account with this email already exists. Please login with your password.";
            } else if (exceptionMessage.contains("access_denied")) {
                errorCode = "ACCESS_DENIED";
                errorMessage = "Access was denied";
            } else if (exceptionMessage.contains("Failed to link")) {
                errorCode = "LINK_FAILED";
                errorMessage = "Failed to link accounts. Please try again or contact support.";
            }
        }

        targetUrl = UriComponentsBuilder.fromUriString(targetUrl)
                .queryParam("error", errorCode)
                .queryParam("message", errorMessage)
                .build().toUriString();

        log.info("Redirecting to: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
