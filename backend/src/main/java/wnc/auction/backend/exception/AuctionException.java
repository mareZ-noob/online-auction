package wnc.auction.backend.exception;

import wnc.auction.backend.utils.MessagesUtils;

public class AuctionException extends RuntimeException {

    private final String message;

    public AuctionException(String message) {
        this.message = MessagesUtils.getMessage(message);
    }

    public AuctionException(String errorCode, Object... var2) {
        this.message = MessagesUtils.getMessage(errorCode, var2);
    }

    @Override
    public String getMessage() {
        return message;
    }
}
