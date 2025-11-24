package wnc.auction.backend.exception;

public class BadRequestException extends AuctionException {

    public BadRequestException(String message) {
        super(message);
    }

    public BadRequestException(String errorCode, Object... args) {
        super(errorCode, args);
    }
}
