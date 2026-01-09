package wnc.auction.backend.exception;

public class RateLimitExceededException extends AuctionException {

    private final long retryAfter;
    private final long remaining;

    public RateLimitExceededException(String message, long retryAfter, long remaining) {
        super(message);
        this.retryAfter = retryAfter;
        this.remaining = remaining;
    }

    public long getRetryAfter() {
        return retryAfter;
    }

    public long getRemaining() {
        return remaining;
    }
}
