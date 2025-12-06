package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceBidRequest {

    @NotNull(message = "{validation.product.id.required}")
    private Long productId;

    @NotNull(message = "{validation.required}")
    @DecimalMin(value = "0.0", inclusive = false, message = "{validation.bid.amount.min}")
    private BigDecimal amount;

    private BigDecimal maxAutoBidAmount;
}
