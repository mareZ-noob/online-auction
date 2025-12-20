package wnc.auction.backend.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripeCheckoutResponse {
    private String sessionId;
    private String checkoutUrl;
    private Long transactionId;
    private BigDecimal amount;
    private String currency;
}
