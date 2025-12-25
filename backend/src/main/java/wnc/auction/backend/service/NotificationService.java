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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import wnc.auction.backend.dto.model.BidHistoryDto;
import wnc.auction.backend.mapper.BidMapper;
import wnc.auction.backend.model.Bid;
import wnc.auction.backend.repository.BidRepository;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    // Store SSE emitters by user ID
    private final Map<Long, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    // Store SSE emitters by product ID for real-time bid updates
    private final Map<Long, List<SseEmitter>> productEmitters = new ConcurrentHashMap<>();

    // Store SSE emitters by chat transaction ID for real-time chat messages
    private final Map<Long, List<SseEmitter>> chatEmitters = new ConcurrentHashMap<>();

    private final BidRepository bidRepository;

    // Create SSE connection for user notifications
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

    // Create SSE connection for product bid updates
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

    public SseEmitter subscribeToChat(Long transactionId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE); // Timeout set to max

        // Create list if not exists and add emitter
        chatEmitters
                .computeIfAbsent(transactionId, k -> new CopyOnWriteArrayList<>())
                .add(emitter);

        // Remove emitter on completion or timeout
        emitter.onCompletion(() -> removeChatEmitter(transactionId, emitter));
        emitter.onTimeout(() -> removeChatEmitter(transactionId, emitter));
        emitter.onError((e) -> removeChatEmitter(transactionId, emitter));

        return emitter;
    }

    @Scheduled(fixedRate = 30000)
    public void sendHeartbeat() {
        // Ping users
        for (List<SseEmitter> emitters : userEmitters.values()) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("ping").data("keep-alive"));
                } catch (IOException e) {
                    // Dead emitters will be cleaned up by onError/onTimeout
                }
            }
        }

        // Ping product watchers
        for (List<SseEmitter> emitters : productEmitters.values()) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("ping").data("keep-alive"));
                } catch (IOException e) {
                    // Ignore
                }
            }
        }

        // Ping chat participants
        for (List<SseEmitter> emitters : chatEmitters.values()) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("ping").data("keep-alive"));
                } catch (IOException e) {
                    // Ignore
                }
            }
        }
    }

    // Send bid update to all clients watching a product
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

        // Fetch top 10 Leaderboard
        List<Bid> topBids = bidRepository.findHighestBidForProduct(productId, PageRequest.of(0, 10));

        // Page<Bid> topBidsPage = bidRepository.findBidRankingByProduct(productId, PageRequest.of(0, 10));

        // Map to DTO
        List<BidHistoryDto> leaderboard =
                topBids.stream().map(BidMapper::toHistoryDto).toList();

        // Prepare payload containing both latest bid and the new leaderboard
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("latestBid", data);
        eventData.put("leaderboard", leaderboard);

        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                // Send event named 'leaderboard_update'
                emitter.send(SseEmitter.event().name("leaderboard_update").data(eventData));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        // Remove dead emitters
        emitters.removeAll(deadEmitters);

        log.info("Sent bid update for product {} to {} clients", productId, emitters.size());
    }

    // Send notification to user
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

    public void sendChatUpdate(Long transactionId, Object data) {
        List<SseEmitter> emitters = chatEmitters.get(transactionId);
        if (emitters != null) {
            // Send to all subscribers of this transaction
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("chat_message").data(data));
                } catch (IOException e) {
                    emitter.completeWithError(e);
                }
            }
        }
    }

    // Send notification to multiple users
    public void sendBulkNotification(List<Long> userIds, String type, Object data) {
        for (Long userId : userIds) {
            sendUserNotification(userId, type, data);
        }
    }

    // Notify user they were outbid
    public void notifyOutbid(Long userId, Long productId, String productName, BigDecimal newAmount) {
        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("productName", productName);
        data.put("newAmount", newAmount);
        data.put("timestamp", LocalDateTime.now().toString());

        sendUserNotification(userId, "outbid", data);
    }

    // Notify seller of new bid
    public void notifyNewBid(Long sellerId, Long productId, String productName, BigDecimal amount, String bidderName) {
        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("productName", productName);
        data.put("amount", amount);
        data.put("bidderName", maskUserName(bidderName));
        data.put("timestamp", LocalDateTime.now().toString());

        sendUserNotification(sellerId, "new_bid", data);
    }

    // Notify auction ended
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

    // Notify new question
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

    // Notify question answered
    public void notifyQuestionAnswered(Long userId, Long productId, String productName, String answer) {
        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("productName", productName);
        data.put("answer", answer);
        data.put("timestamp", LocalDateTime.now().toString());

        sendUserNotification(userId, "question_answered", data);
    }

    // Broadcast system message to all connected users
    public void broadcastSystemMessage(String message) {
        Map<String, Object> data = new HashMap<>();
        data.put("message", message);
        data.put("timestamp", LocalDateTime.now().toString());

        for (Map.Entry<Long, List<SseEmitter>> entry : userEmitters.entrySet()) {
            sendUserNotification(entry.getKey(), "system_message", data);
        }

        log.info("Broadcast system message to all users");
    }

    public void broadcastAuctionEnded(Long productId, String productName, String winnerName, BigDecimal finalAmount) {
        List<SseEmitter> emitters = productEmitters.get(productId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        Map<String, Object> data = new HashMap<>();
        data.put("productId", productId);
        data.put("productName", productName);
        data.put("winnerName", maskUserName(winnerName)); // Mask the winner's name for privacy
        data.put("finalAmount", finalAmount);
        data.put("timestamp", LocalDateTime.now().toString());
        data.put("status", "COMPLETED"); // Signal frontend to disable bidding

        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                // Send event named 'auction_closed' to differentiate from personal 'auction_ended'
                emitter.send(SseEmitter.event().name("auction_closed").data(data));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        // Remove dead emitters
        emitters.removeAll(deadEmitters);

        log.info("Broadcast auction ended for product {} to {} clients", productId, emitters.size());
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

    private void removeChatEmitter(Long transactionId, SseEmitter emitter) {
        List<SseEmitter> emitters = chatEmitters.get(transactionId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                chatEmitters.remove(transactionId);
            }
        }
    }

    private String maskUserName(String fullName) {
        if (fullName == null || fullName.length() <= 4) {
            return "****";
        }
        String[] parts = fullName.split(" ");
        String lastName = parts[parts.length - 1];
        return "****" + lastName;
    }

    // Get statistics about active connections
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
