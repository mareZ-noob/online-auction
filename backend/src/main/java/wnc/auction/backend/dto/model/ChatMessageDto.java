package wnc.auction.backend.dto.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {

    private Long id;
    private Long transactionId;
    private Long senderId;
    private String senderName;
    private String message;
    private String messageType;
    private Boolean isRead;
    private String attachmentUrl;
    private LocalDateTime createdAt;
    private Boolean isOwnMessage;
}
