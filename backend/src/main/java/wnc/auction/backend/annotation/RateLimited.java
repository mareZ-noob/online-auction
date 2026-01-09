package wnc.auction.backend.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimited {

    /**
     * Maximum number of requests allowed within the time window
     */
    int limit() default 100;

    /**
     * Time window in seconds
     */
    int windowSeconds() default 60;

    /**
     * Custom key prefix for this rate limit (optional)
     * If not specified, the method name will be used
     */
    String keyPrefix() default "";

    /**
     * Whether to apply rate limit per user (true) or globally (false)
     * When true, each user gets their own limit
     * When false, the limit is shared across all users
     */
    boolean perUser() default true;
}
