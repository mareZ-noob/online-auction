package wnc.auction.backend.dto.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidDto {

    private Long id;
    private Long productId;
    private String productName;
    private Long userId;
    private String userName;
    private String maskedUserName;
    private BigDecimal amount;
    private Boolean isAutoBid;
    private LocalDateTime createdAt;
}
