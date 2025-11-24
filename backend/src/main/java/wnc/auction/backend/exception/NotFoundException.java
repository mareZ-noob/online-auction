package wnc.auction.backend.exception;

public class NotFoundException extends AuctionException {

    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException(String errorCode, Object... args) {
        super(errorCode, args);
    }
}
