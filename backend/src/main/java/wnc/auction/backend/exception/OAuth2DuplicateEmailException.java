package wnc.auction.backend.exception;

import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;

public class OAuth2DuplicateEmailException extends OAuth2AuthenticationException {

    private final String idToken;

    public OAuth2DuplicateEmailException(String errorCode, String message, String idToken) {
        super(new OAuth2Error(errorCode), message);
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }
}
