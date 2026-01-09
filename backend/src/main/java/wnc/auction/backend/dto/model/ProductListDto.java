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
public class ProductListDto {

    private Long id;
    private String name;
    private String description;
    private BigDecimal currentPrice;
    private BigDecimal bidPrice;
    private BigDecimal buyNowPrice;
    private String thumbnailImage;
    private String currentBidderName;
    private LocalDateTime endTime;
    private String timeRemaining;
    private Integer bidCount;
    private Boolean isNew;
    private String categoryName;
    private LocalDateTime createdAt;
    private Long sellerId;
    private String sellerName;
    private Boolean isHoldingPrice;
    private Integer currentUserRank;
}
