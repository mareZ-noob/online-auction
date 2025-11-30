package wnc.auction.backend.mapper;

import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.UpgradeRequestDto;
import wnc.auction.backend.model.UpgradeRequest;

@UtilityClass
public class UpgradeRequestMapper {

    public static UpgradeRequestDto toDto(UpgradeRequest request) {
        return new UpgradeRequestDto(
                request.getId(),
                request.getUser().getId(),
                request.getUser().getFullName(),
                request.getUser().getEmail(),
                request.getStatus().name(),
                request.getReason(),
                request.getReviewedBy() != null ? request.getReviewedBy().getId() : null,
                request.getReviewedBy() != null ? request.getReviewedBy().getFullName() : null,
                request.getReviewedAt(),
                request.getCreatedAt()
        );
    }
}

