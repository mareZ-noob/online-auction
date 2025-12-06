package wnc.auction.backend.exception;

public class JWTException extends AuctionException {

    public JWTException(String message) {
        super(message);
    }

    public JWTException(String errorCode, Object... args) {
        super(errorCode, args);
    }
}
