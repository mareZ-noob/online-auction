package wnc.auction.backend.dto.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {

    private Long id;
    private String name;
    private String description;
    private BigDecimal startingPrice;
    private BigDecimal currentPrice;
    private BigDecimal stepPrice;
    private BigDecimal buyNowPrice;
    private Long categoryId;
    private String categoryName;
    private Long sellerId;
    private String sellerName;
    private Double sellerRating;
    private Long currentBidderId;
    private String currentBidderName;
    private Double currentBidderRating;
    private Integer currentBidderPositiveRatings;
    private Integer currentBidderNegativeRatings;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String timeRemaining;
    private Boolean autoExtend;
    private Boolean allowUnratedBidders;
    private String status;
    private Integer bidCount;
    private List<String> images;
    private Boolean isNew;
    private Boolean isWatched;
    private LocalDateTime createdAt;
    private Boolean isCurrentUserBlocked;
    private Boolean isHoldingPrice;
    private Integer currentUserRank;
}
