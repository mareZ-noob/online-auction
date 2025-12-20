package wnc.auction.backend.service;

import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.ChatMessageDto;
import wnc.auction.backend.dto.request.SendChatMessageRequest;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.ForbiddenException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.ChatMessageMapper;
import wnc.auction.backend.model.ChatMessage;
import wnc.auction.backend.model.Transaction;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.MessageType;
import wnc.auction.backend.repository.ChatMessageRepository;
import wnc.auction.backend.repository.TransactionRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.CurrentUser;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Send a chat message
    public ChatMessageDto sendMessage(SendChatMessageRequest request) {
        Long senderId = CurrentUser.getUserId();
        User sender = userRepository.findById(senderId).orElseThrow(() -> new NotFoundException("User not found"));

        Transaction transaction = transactionRepository
                .findById(request.getTransactionId())
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        // Verify sender is buyer or seller
        if (!transaction.getBuyer().getId().equals(senderId)
                && !transaction.getSeller().getId().equals(senderId)) {
            throw new ForbiddenException("You are not part of this transaction");
        }

        // Create message
        ChatMessage message = ChatMessage.builder()
                .transaction(transaction)
                .sender(sender)
                .message(request.getMessage())
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.TEXT)
                .attachmentUrl(request.getAttachmentUrl())
                .isRead(false)
                .build();

        message = chatMessageRepository.save(message);

        // Send real-time notification to the other party
        Long recipientId = transaction.getBuyer().getId().equals(senderId)
                ? transaction.getSeller().getId()
                : transaction.getBuyer().getId();

        notificationService.sendUserNotification(
                recipientId,
                "new_chat_message",
                Map.of(
                        "transactionId", transaction.getId(),
                        "productId", transaction.getProduct().getId(),
                        "productName", transaction.getProduct().getName(),
                        "senderName", sender.getFullName(),
                        "message", request.getMessage(),
                        "messageId", message.getId(),
                        "timestamp", message.getCreatedAt().toString()));

        log.info("Chat message sent: {} for transaction: {}", message.getId(), transaction.getId());

        return ChatMessageMapper.toDto(message);
    }

    // Get chat messages for a transaction
    public List<ChatMessageDto> getMessages(Long transactionId) {
        Long userId = CurrentUser.getUserId();
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        // Verify user is buyer or seller
        if (!transaction.getBuyer().getId().equals(userId)
                && !transaction.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("You are not part of this transaction");
        }

        List<ChatMessage> messages = chatMessageRepository.findByTransactionId(transactionId);

        // Mark messages as read
        chatMessageRepository.markMessagesAsRead(transactionId, userId);

        return messages.stream().map(ChatMessageMapper::toDto).collect(Collectors.toList());
    }

    // Get chat messages with pagination
    public PageResponse<ChatMessageDto> getMessagesPaged(Long transactionId, int page, int size) {
        Long userId = CurrentUser.getUserId();
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        // Verify user is buyer or seller
        if (!transaction.getBuyer().getId().equals(userId)
                && !transaction.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("You are not part of this transaction");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messagePage = chatMessageRepository.findByTransactionIdPaged(transactionId, pageable);

        List<ChatMessageDto> content =
                messagePage.getContent().stream().map(ChatMessageMapper::toDto).collect(Collectors.toList());

        return PageResponse.<ChatMessageDto>builder()
                .content(content)
                .page(messagePage.getNumber())
                .size(messagePage.getSize())
                .totalElements(messagePage.getTotalElements())
                .totalPages(messagePage.getTotalPages())
                .last(messagePage.isLast())
                .build();
    }

    // Get unread message count
    public long getUnreadCount(Long transactionId) {
        Long userId = CurrentUser.getUserId();
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        if (!transaction.getBuyer().getId().equals(userId)
                && !transaction.getSeller().getId().equals(userId)) {
            return 0;
        }

        return chatMessageRepository.countUnreadMessages(transactionId, userId);
    }

    // Mark all messages as read
    public void markAllAsRead(Long transactionId) {
        Long userId = CurrentUser.getUserId();
        chatMessageRepository.markMessagesAsRead(transactionId, userId);
    }

    // Send system message (e.g., "Payment confirmed", "Order shipped")
    public ChatMessageDto sendSystemMessage(Long transactionId, String message) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        // System messages are sent by the system (no sender)
        ChatMessage chatMessage = ChatMessage.builder()
                .transaction(transaction)
                .sender(null) // System message
                .message(message)
                .messageType(MessageType.SYSTEM)
                .isRead(false)
                .build();

        chatMessage = chatMessageRepository.save(chatMessage);

        // Notify both buyer and seller
        notificationService.sendUserNotification(
                transaction.getBuyer().getId(),
                "system_message",
                Map.of(
                        "transactionId", transactionId,
                        "message", message));

        notificationService.sendUserNotification(
                transaction.getSeller().getId(),
                "system_message",
                Map.of(
                        "transactionId", transactionId,
                        "message", message));

        return ChatMessageMapper.toDto(chatMessage);
    }
}
