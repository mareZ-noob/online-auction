package wnc.auction.backend.mapper;

import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.ChatMessageDto;
import wnc.auction.backend.model.ChatMessage;
import wnc.auction.backend.security.CurrentUser;

@UtilityClass
public class ChatMessageMapper {

    public static ChatMessageDto toDto(ChatMessage message) {
        Long currentUserId = CurrentUser.getUserId();

        return ChatMessageDto.builder()
                .id(message.getId())
                .transactionId(message.getTransaction().getId())
                .senderId(message.getSender() != null ? message.getSender().getId() : null)
                .senderName(message.getSender() != null ? message.getSender().getFullName() : "System")
                .message(message.getMessage())
                .messageType(message.getMessageType().name())
                .isRead(message.getIsRead())
                .attachmentUrl(message.getAttachmentUrl())
                .createdAt(message.getCreatedAt())
                .isOwnMessage(message.getSender() != null
                        && currentUserId != null
                        && message.getSender().getId().equals(currentUserId))
                .build();
    }
}
