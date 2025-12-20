package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import wnc.auction.backend.model.enumeration.MessageType;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendChatMessageRequest {

    @NotNull
    private Long transactionId;

    @NotBlank
    private String message;

    private MessageType messageType;
    private String attachmentUrl;
}
