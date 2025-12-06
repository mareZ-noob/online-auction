package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import wnc.auction.backend.dto.response.ApiResponse;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Real-time notification endpoints using SSE")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping(value = "/stream/user", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to user notifications (SSE)")
    public SseEmitter subscribeToUserNotifications() {
        Long userId = CurrentUser.getUserId();
        return notificationService.createUserConnection(userId);
    }

    @GetMapping(value = "/stream/product/{productId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to product bid updates (SSE)")
    public SseEmitter subscribeToProductUpdates(@PathVariable Long productId) {
        return notificationService.createProductConnection(productId);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get notification connection statistics")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getConnectionStats() {
        Map<String, Integer> stats = notificationService.getConnectionStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
