package wnc.auction.backend.dto.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingDto {

    private Long id;
    private Long userId;
    private String userName;
    private Long ratedById;
    private String ratedByName;
    private Long productId;
    private String productName;
    private Boolean isPositive;
    private String comment;
    private LocalDateTime createdAt;
}
