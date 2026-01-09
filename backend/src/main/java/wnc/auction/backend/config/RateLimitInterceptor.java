package wnc.auction.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import wnc.auction.backend.annotation.RateLimited;
import wnc.auction.backend.exception.RateLimitExceededException;
import wnc.auction.backend.service.RateLimitService;

@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitService rateLimitService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        RateLimited rateLimited = handlerMethod.getMethodAnnotation(RateLimited.class);
        if (rateLimited == null) {
            return true;
        }

        // Build rate limit key
        String key = buildRateLimitKey(request, handlerMethod, rateLimited);

        // Check rate limit
        boolean allowed = rateLimitService.isAllowed(key, rateLimited.limit(), rateLimited.windowSeconds());

        if (!allowed) {
            long retryAfter = rateLimitService.getResetTime(key, rateLimited.windowSeconds());
            long remaining =
                    rateLimitService.getRemainingRequests(key, rateLimited.limit(), rateLimited.windowSeconds());

            throw new RateLimitExceededException(
                    String.format(
                            "Rate limit exceeded. Maximum %d requests per %d seconds. Please try again in %d seconds.",
                            rateLimited.limit(), rateLimited.windowSeconds(), retryAfter),
                    retryAfter,
                    remaining);
        }

        // Add rate limit headers to response
        long remaining = rateLimitService.getRemainingRequests(key, rateLimited.limit(), rateLimited.windowSeconds());
        response.setHeader("X-RateLimit-Limit", String.valueOf(rateLimited.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));
        response.setHeader("X-RateLimit-Window", String.valueOf(rateLimited.windowSeconds()));

        return true;
    }

    /**
     * Build a unique key for rate limiting based on user, IP, and endpoint.
     */
    private String buildRateLimitKey(HttpServletRequest request, HandlerMethod handlerMethod, RateLimited rateLimited) {
        StringBuilder keyBuilder = new StringBuilder();

        // Add custom prefix or method name
        if (!rateLimited.keyPrefix().isEmpty()) {
            keyBuilder.append(rateLimited.keyPrefix());
        } else {
            keyBuilder.append(handlerMethod.getMethod().getName());
        }

        keyBuilder.append(":");

        // Add user identifier if perUser is true
        if (rateLimited.perUser()) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null
                    && authentication.isAuthenticated()
                    && !"anonymousUser".equals(authentication.getPrincipal())) {
                // Use authenticated user's name/ID
                keyBuilder.append(authentication.getName());
            } else {
                // Use IP address for unauthenticated requests
                keyBuilder.append(getClientIp(request));
            }
        } else {
            // Global rate limit (shared across all users)
            keyBuilder.append("global");
        }

        return keyBuilder.toString();
    }

    /**
     * Get client IP address, considering X-Forwarded-For header for proxied
     * requests.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
