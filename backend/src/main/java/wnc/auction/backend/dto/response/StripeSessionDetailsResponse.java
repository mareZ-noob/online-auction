package wnc.auction.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripeSessionDetailsResponse {

    private String sessionId;
    private String paymentStatus;
    private Long amountTotal;
    private String currency;
    private String customerEmail;
    private Long expiresAt;
}
