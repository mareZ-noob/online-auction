package wnc.auction.backend.security;

import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;

public class OAuth2AdminAccessDeniedException extends OAuth2AuthenticationException {

    private final String idToken;

    public OAuth2AdminAccessDeniedException(OAuth2Error error, String idToken) {
        super(error);
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }
}
