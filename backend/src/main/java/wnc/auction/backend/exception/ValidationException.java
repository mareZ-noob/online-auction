package wnc.auction.backend.exception;

import java.util.Map;

public class ValidationException extends AuctionException {

    private final Map<String, String> errors;

    public ValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }

    public ValidationException(String messageCode, Map<String, String> errors, Object... args) {
        super(messageCode, args);
        this.errors = errors;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}