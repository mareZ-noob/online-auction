package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wnc.auction.backend.annotation.RateLimited;
import wnc.auction.backend.dto.response.ApiResponse;
import wnc.auction.backend.service.RateLimitService;

@RestController
@RequestMapping("/api/demo/rate-limit")
@RequiredArgsConstructor
@Tag(name = "Rate Limit Demo", description = "Endpoints for testing rate limiting")
public class RateLimitDemoController {

    private final RateLimitService rateLimitService;

    @GetMapping("/strict")
    @Operation(summary = "Strict rate limit - 5 requests per minute")
    @RateLimited(limit = 5, windowSeconds = 60, keyPrefix = "demo:strict")
    public ResponseEntity<ApiResponse<Map<String, Object>>> strictLimit() {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "This endpoint has a strict rate limit of 5 requests per minute");
        data.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/moderate")
    @Operation(summary = "Moderate rate limit - 20 requests per minute")
    @RateLimited(limit = 20, windowSeconds = 60, keyPrefix = "demo:moderate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> moderateLimit() {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "This endpoint has a moderate rate limit of 20 requests per minute");
        data.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/relaxed")
    @Operation(summary = "Relaxed rate limit - 100 requests per minute")
    @RateLimited(limit = 100, windowSeconds = 60, keyPrefix = "demo:relaxed")
    public ResponseEntity<ApiResponse<Map<String, Object>>> relaxedLimit() {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "This endpoint has a relaxed rate limit of 100 requests per minute");
        data.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/global")
    @Operation(summary = "Global rate limit - shared across all users")
    @RateLimited(limit = 50, windowSeconds = 60, keyPrefix = "demo:global", perUser = false)
    public ResponseEntity<ApiResponse<Map<String, Object>>> globalLimit() {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "This endpoint has a global rate limit of 50 requests per minute (shared)");
        data.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/no-limit")
    @Operation(summary = "No rate limit applied")
    public ResponseEntity<ApiResponse<Map<String, Object>>> noLimit() {
        Map<String, Object> data = new HashMap<>();
        data.put("message", "This endpoint has no rate limit");
        data.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/status/{keyPrefix}")
    @Operation(summary = "Check rate limit status for a key")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkStatus(
            @PathVariable String keyPrefix,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "60") int windowSeconds) {

        // Note: This is simplified - in production you'd need to construct the full key
        String key = keyPrefix + ":demo";

        long remaining = rateLimitService.getRemainingRequests(key, limit, windowSeconds);
        long resetTime = rateLimitService.getResetTime(key, windowSeconds);

        Map<String, Object> data = new HashMap<>();
        data.put("key", key);
        data.put("limit", limit);
        data.put("remaining", remaining);
        data.put("resetInSeconds", resetTime);
        data.put("windowSeconds", windowSeconds);

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @DeleteMapping("/clear/{keyPrefix}")
    @Operation(summary = "Clear rate limit for a key (admin only)")
    public ResponseEntity<ApiResponse<Void>> clearRateLimit(@PathVariable String keyPrefix) {
        String key = keyPrefix + ":demo";
        rateLimitService.clearRateLimit(key);
        return ResponseEntity.ok(ApiResponse.success("Rate limit cleared for key: " + key, null));
    }
}
