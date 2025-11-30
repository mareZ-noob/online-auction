package wnc.auction.backend.mapper;

import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.BidDto;
import wnc.auction.backend.dto.model.BidHistoryDto;
import wnc.auction.backend.model.Bid;

@UtilityClass
public class BidMapper {

    public static BidDto toDto(Bid bid) {
        return BidDto.builder()
                .id(bid.getId())
                .productId(bid.getProduct().getId())
                .productName(bid.getProduct().getName())
                .userId(bid.getUser().getId())
                .userName(bid.getUser().getFullName())
                .amount(bid.getAmount())
                .isAutoBid(bid.getIsAutoBid())
                .createdAt(bid.getCreatedAt())
                .build();
    }

    public static BidHistoryDto toHistoryDto(Bid bid) {
        return BidHistoryDto.builder()
                .maskedUserName(maskUserName(bid.getUser().getFullName()))
                .amount(bid.getAmount())
                .createdAt(bid.getCreatedAt())
                .build();
    }

    private static String maskUserName(String fullName) {
        if (fullName == null || fullName.length() <= 4) {
            return "****";
        }
        String[] parts = fullName.split(" ");
        String lastName = parts[parts.length - 1];
        return "****" + lastName;
    }
}
