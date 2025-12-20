package wnc.auction.backend.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import wnc.auction.backend.dto.model.TransactionDto;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDetailsResponse {

    private Boolean hasAccess;
    private TransactionDto transaction;
    private Boolean isBuyer;
    private Boolean isSeller;
    private Boolean chatEnabled;

    // For non-participants
    private Long productId;
    private String productName;
    private BigDecimal finalPrice;
    private String status;
    private String message;
}
