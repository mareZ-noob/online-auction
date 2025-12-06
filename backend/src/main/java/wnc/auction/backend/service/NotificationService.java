package wnc.auction.backend.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@Slf4j
public class NotificationService {

    // Store SSE emitters by user ID
    private final Map<Long, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    // Store SSE emitters by product ID for real-time bid updates
    private final Map<Long, List<SseEmitter>> productEmitters = new ConcurrentHashMap<>();

    /**
     * Create SSE connection for user notifications
     */
    public SseEmitter createUserConnection(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeUserEmitter(userId, emitter));
        emitter.onTimeout(() -> removeUserEmitter(userId, emitter));
        emitter.onError(e -> removeUserEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("Connected to notification stream"));
        } catch (IOException e) {
            log.error("Error sending initial event", e);
            removeUserEmitter(userId, emitter);
        }

        log.info("SSE connection created for user: {}", userId);
        return emitter;
    }

    /**
     * Create SSE connection for product bid updates
     */
    public SseEmitter createProductConnection(Long productId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        productEmitters
                .computeIfAbsent(productId, k -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitter.onCompletion(() -> removeProductEmitter(productId, emitter));
        emitter.onTimeout(() -> removeProductEmitter(productId, emitter));
        emitter.onError(e -> removeProductEmitter(productId, emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("Connected to product stream"));
        } catch (IOException e) {
            log.error("Error sending initial event", e);
            removeProductEmitter(productId, emitter);
        }

        log.info("SSE connection created for product: {}", productId);
        return emitter;
    }

    /**
     * Send bid update to all clients watching a product
     */
    public void sendBidUpdate(Long productId, BigDecimal amount, String bidderName) {
        List<SseEmitter> emitters = productEmitters.get(productId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("amount", amount);
        data.put("bidderName", maskUserName(bidderName));
        data.put("timestamp", LocalDateTime.now().toString());

        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("bid_update").data(data));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        // Remove dead emitters
        emitters.removeAll(deadEmitters);

        log.info("Sent bid update for product {} to {} clients", productId, emitters.size());
    }

    /**
     * Send notification to user
     */
    public void sendUserNotification(Long userId, String type, Object data) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(type).data(data));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        // Remove dead emitters
        emitters.removeAll(deadEmitters);

        log.info("Sent {} notification to user {} ({} clients)", type, userId, emitters.size());
    }

    /**
     * Send notification to multiple users
     */
    public void sendBulkNotification(List<Long> userIds, String type, Object data) {
        for (Long userId : userIds) {
            sendUserNotification(userId, type, data);
        }
    }

    /**
     * Notify user they were outbid
     */
    public void notifyOutbid(Long userId, Long productId, String productName, BigDecimal newAmount) {
        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("productName", productName);
        data.put("newAmount", newAmount);
        data.put("timestamp", LocalDateTime.now().toString());

        sendUserNotification(userId, "outbid", data);
    }

    /**
     * Notify seller of new bid
     */
    public void notifyNewBid(Long sellerId, Long productId, String productName, BigDecimal amount, String bidderName) {
        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("productName", productName);
        data.put("amount", amount);
        data.put("bidderName", maskUserName(bidderName));
        data.put("timestamp", LocalDateTime.now().toString());

        sendUserNotification(sellerId, "new_bid", data);
    }

    /**
     * Notify auction ended
     */
    public void notifyAuctionEnded(
            Long userId, Long productId, String productName, boolean isWinner, BigDecimal finalAmount) {
        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("productName", productName);
        data.put("isWinner", isWinner);
        data.put("finalAmount", finalAmount);
        data.put("timestamp", LocalDateTime.now().toString());

        sendUserNotification(userId, "auction_ended", data);
    }

    /**
     * Notify new question
     */
    public void notifyNewQuestion(
            Long sellerId, Long productId, String productName, String question, String askerName) {
        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("productName", productName);
        data.put("question", question);
        data.put("askerName", askerName);
        data.put("timestamp", LocalDateTime.now().toString());

        sendUserNotification(sellerId, "new_question", data);
    }

    /**
     * Notify question answered
     */
    public void notifyQuestionAnswered(Long userId, Long productId, String productName, String answer) {
        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("productName", productName);
        data.put("answer", answer);
        data.put("timestamp", LocalDateTime.now().toString());

        sendUserNotification(userId, "question_answered", data);
    }

    /**
     * Broadcast system message to all connected users
     */
    public void broadcastSystemMessage(String message) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", message);
        data.put("timestamp", LocalDateTime.now().toString());

        for (Map.Entry<Long, List<SseEmitter>> entry : userEmitters.entrySet()) {
            sendUserNotification(entry.getKey(), "system_message", data);
        }

        log.info("Broadcast system message to all users");
    }

    private void removeUserEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
        log.info("SSE connection removed for user: {}", userId);
    }

    private void removeProductEmitter(Long productId, SseEmitter emitter) {
        List<SseEmitter> emitters = productEmitters.get(productId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                productEmitters.remove(productId);
            }
        }
        log.info("SSE connection removed for product: {}", productId);
    }

    private String maskUserName(String fullName) {
        if (fullName == null || fullName.length() <= 4) {
            return "****";
        }
        String[] parts = fullName.split(" ");
        String lastName = parts[parts.length - 1];
        return "****" + lastName;
    }

    /**
     * Get statistics about active connections
     */
    public Map<String, Integer> getConnectionStats() {
        int userConnections =
                userEmitters.values().stream().mapToInt(List::size).sum();

        int productConnections =
                productEmitters.values().stream().mapToInt(List::size).sum();

        Map<String, Integer> stats = new HashMap<>();
        stats.put("activeUserConnections", userConnections);
        stats.put("activeProductConnections", productConnections);
        stats.put("usersWatching", userEmitters.size());
        stats.put("productsWatched", productEmitters.size());

        return stats;
    }
}
