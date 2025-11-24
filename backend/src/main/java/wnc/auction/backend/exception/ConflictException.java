package wnc.auction.backend.exception;

public class ConflictException extends AuctionException {

    public ConflictException(String message) {
        super(message);
    }

    public ConflictException(String errorCode, Object... args) {
        super(errorCode, args);
    }
}
