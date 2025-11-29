package wnc.auction.backend.mapper;

import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.RatingDto;
import wnc.auction.backend.model.Rating;

@UtilityClass
public class RatingMapper {

    public static RatingDto toDto(Rating rating) {
        return RatingDto.builder()
                .id(rating.getId())
                .userId(rating.getUser().getId())
                .userName(rating.getUser().getFullName())
                .ratedById(rating.getRatedBy().getId())
                .ratedByName(rating.getRatedBy().getFullName())
                .productId(rating.getProduct() != null ? rating.getProduct().getId() : null)
                .productName(rating.getProduct() != null ? rating.getProduct().getName() : null)
                .isPositive(rating.getIsPositive())
                .comment(rating.getComment())
                .createdAt(rating.getCreatedAt())
                .build();
    }
}