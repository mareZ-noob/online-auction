package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import wnc.auction.backend.dto.model.ChatMessageDto;
import wnc.auction.backend.dto.request.SendChatMessageRequest;
import wnc.auction.backend.dto.response.ApiResponse;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.model.enumeration.MessageType;
import wnc.auction.backend.service.ChatService;
import wnc.auction.backend.service.FileStorageService;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Real-time chat for buyer-seller communication")
@PreAuthorize("hasAnyRole('BIDDER', 'SELLER', 'ADMIN')")
public class ChatController {

    private final ChatService chatService;
    private final FileStorageService fileStorageService;

    @PostMapping("/send")
    @Operation(summary = "Send a chat message")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendMessage(@Valid @RequestBody SendChatMessageRequest request) {

        ChatMessageDto message = chatService.sendMessage(request);

        return ResponseEntity.ok(ApiResponse.success("Message sent", message));
    }

    @PostMapping(value = "/send-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Send an image chat message")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendImageMessage(
            @RequestParam("transactionId") Long transactionId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "message", required = false, defaultValue = "Sent an image") String messageText) {

        String fileUrl = fileStorageService.storeFile(file);

        // Create the request object
        SendChatMessageRequest request = new SendChatMessageRequest();
        request.setTransactionId(transactionId);
        request.setMessage(messageText); // Optional caption
        request.setMessageType(MessageType.IMAGE);
        request.setAttachmentUrl(fileUrl);

        // Delegate to existing chat service logic
        ChatMessageDto message = chatService.sendMessage(request);

        return ResponseEntity.ok(ApiResponse.success("Image sent", message));
    }

    @GetMapping("/messages/{transactionId}")
    @Operation(summary = "Get all messages for a transaction")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getMessages(@PathVariable Long transactionId) {

        List<ChatMessageDto> messages = chatService.getMessages(transactionId);

        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/messages/{transactionId}/paged")
    @Operation(summary = "Get messages with pagination")
    public ResponseEntity<ApiResponse<PageResponse<ChatMessageDto>>> getMessagesPaged(
            @PathVariable Long transactionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        PageResponse<ChatMessageDto> messages = chatService.getMessagesPaged(transactionId, page, size);

        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @GetMapping("/unread-count/{transactionId}")
    @Operation(summary = "Get unread message count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long transactionId) {

        long count = chatService.getUnreadCount(transactionId);

        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PostMapping("/mark-read/{transactionId}")
    @Operation(summary = "Mark all messages as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@PathVariable Long transactionId) {

        chatService.markAllAsRead(transactionId);

        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }

    @GetMapping(value = "/stream/{transactionId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Subscribe to chat updates (SSE)")
    public SseEmitter subscribeToChatUpdates(@PathVariable Long transactionId) {

        return chatService.subscribeToChat(transactionId);
    }
}
