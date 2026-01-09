package wnc.auction.backend.service;

import java.time.Instant;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final String RATE_LIMIT_PREFIX = "rate_limit:";

    /**
     * Check if a request is allowed under the rate limit using sliding window
     * algorithm.
     *
     * @param key           Unique identifier for the rate limit (e.g., user ID +
     *                      endpoint)
     * @param limit         Maximum number of requests allowed
     * @param windowSeconds Time window in seconds
     * @return true if request is allowed, false if rate limit exceeded
     */
    public boolean isAllowed(String key, int limit, int windowSeconds) {
        String redisKey = RATE_LIMIT_PREFIX + key;
        long now = Instant.now().toEpochMilli();
        long windowStart = now - TimeUnit.SECONDS.toMillis(windowSeconds);

        try {
            ZSetOperations<String, String> zSetOps = redisTemplate.opsForZSet();

            // Remove old entries outside the current window
            zSetOps.removeRangeByScore(redisKey, 0, windowStart);

            // Count current requests in the window
            Long currentCount = zSetOps.count(redisKey, windowStart, now);

            if (currentCount != null && currentCount >= limit) {
                log.warn("Rate limit exceeded for key: {}, current count: {}, limit: {}", key, currentCount, limit);
                return false;
            }

            // Add current request timestamp
            String requestId = now + ":" + System.nanoTime();
            zSetOps.add(redisKey, requestId, now);

            // Set expiration to cleanup old keys
            redisTemplate.expire(redisKey, windowSeconds * 2, TimeUnit.SECONDS);

            return true;

        } catch (Exception e) {
            log.error("Error checking rate limit for key: {}", key, e);
            // Fail open - allow request if Redis is down
            return true;
        }
    }

    /**
     * Get the remaining number of requests allowed in the current window.
     *
     * @param key           Unique identifier for the rate limit
     * @param limit         Maximum number of requests allowed
     * @param windowSeconds Time window in seconds
     * @return Number of remaining requests
     */
    public long getRemainingRequests(String key, int limit, int windowSeconds) {
        String redisKey = RATE_LIMIT_PREFIX + key;
        long now = Instant.now().toEpochMilli();
        long windowStart = now - TimeUnit.SECONDS.toMillis(windowSeconds);

        try {
            ZSetOperations<String, String> zSetOps = redisTemplate.opsForZSet();

            // Remove old entries
            zSetOps.removeRangeByScore(redisKey, 0, windowStart);

            // Count current requests
            Long currentCount = zSetOps.count(redisKey, windowStart, now);

            return Math.max(0, limit - (currentCount != null ? currentCount : 0));

        } catch (Exception e) {
            log.error("Error getting remaining requests for key: {}", key, e);
            return limit;
        }
    }

    /**
     * Get the time in seconds until the rate limit resets.
     *
     * @param key           Unique identifier for the rate limit
     * @param windowSeconds Time window in seconds
     * @return Seconds until reset, or 0 if no requests in window
     */
    public long getResetTime(String key, int windowSeconds) {
        String redisKey = RATE_LIMIT_PREFIX + key;
        long now = Instant.now().toEpochMilli();
        long windowStart = now - TimeUnit.SECONDS.toMillis(windowSeconds);

        try {
            ZSetOperations<String, String> zSetOps = redisTemplate.opsForZSet();

            // Get the oldest request in the current window
            var oldestRequest = zSetOps.rangeByScore(redisKey, windowStart, now, 0, 1);

            if (oldestRequest != null && !oldestRequest.isEmpty()) {
                String oldest = oldestRequest.iterator().next();
                long oldestTimestamp = Long.parseLong(oldest.split(":")[0]);
                long resetTime = oldestTimestamp + TimeUnit.SECONDS.toMillis(windowSeconds);
                return Math.max(0, (resetTime - now) / 1000);
            }

            return 0;

        } catch (Exception e) {
            log.error("Error getting reset time for key: {}", key, e);
            return 0;
        }
    }

    /**
     * Clear rate limit for a specific key (useful for testing or admin operations).
     *
     * @param key Unique identifier for the rate limit
     */
    public void clearRateLimit(String key) {
        String redisKey = RATE_LIMIT_PREFIX + key;
        try {
            redisTemplate.delete(redisKey);
            log.info("Cleared rate limit for key: {}", key);
        } catch (Exception e) {
            log.error("Error clearing rate limit for key: {}", key, e);
        }
    }
}
