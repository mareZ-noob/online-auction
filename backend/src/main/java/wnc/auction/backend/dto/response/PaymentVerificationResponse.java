package wnc.auction.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationResponse {

    private boolean success;
    private Long transactionId;
    private String sessionId;
    private String paymentStatus;
    private Long amountPaid;
    private String currency;
    private String message;
}
