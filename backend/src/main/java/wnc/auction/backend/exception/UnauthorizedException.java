package wnc.auction.backend.exception;

public class UnauthorizedException extends AuctionException {

    public UnauthorizedException(String message) {
        super(message);
    }

    public UnauthorizedException(String errorCode, Object... args) {
        super(errorCode, args);
    }
}
