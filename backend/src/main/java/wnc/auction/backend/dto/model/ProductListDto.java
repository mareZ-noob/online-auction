package wnc.auction.backend.dto.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductListDto {

    private Long id;
    private String name;
    private String description;
    private BigDecimal currentPrice;
    private BigDecimal buyNowPrice;
    private String thumbnailImage;
    private String currentBidderName;
    private LocalDateTime endTime;
    private String timeRemaining;
    private Integer bidCount;
    private Boolean isNew;
    private String categoryName;
    private LocalDateTime createdAt;
}
