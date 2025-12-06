package wnc.auction.backend.exception;

public class ForbiddenException extends AuctionException {

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String errorCode, Object... args) {
        super(errorCode, args);
    }
}
