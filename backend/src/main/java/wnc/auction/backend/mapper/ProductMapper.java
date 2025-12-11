package wnc.auction.backend.mapper;

import java.time.Duration;
import java.time.LocalDateTime;
import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.ProductDto;
import wnc.auction.backend.dto.model.ProductListDto;
import wnc.auction.backend.model.Product;

@UtilityClass
public class ProductMapper {

    public static ProductDto toDto(Product product, Long currentUserId, boolean isBlocked) {
        boolean isWatched = false;
        if (currentUserId != null) {
            // Check if product is in user's watchlist
            // This would require WatchListRepository injection
        }

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .startingPrice(product.getStartingPrice())
                .currentPrice(product.getCurrentPrice())
                .stepPrice(product.getStepPrice())
                .buyNowPrice(product.getBuyNowPrice())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .sellerId(product.getSeller().getId())
                .sellerName(product.getSeller().getFullName())
                .sellerRating(product.getSeller().getRatingPercentage())
                .currentBidderId(
                        product.getCurrentBidder() != null
                                ? product.getCurrentBidder().getId()
                                : null)
                .currentBidderName(
                        product.getCurrentBidder() != null
                                ? product.getCurrentBidder().getFullName()
                                : null)
                .currentBidderRating(
                        product.getCurrentBidder() != null
                                ? product.getCurrentBidder().getRatingPercentage()
                                : null)
                .startTime(product.getStartTime())
                .endTime(product.getEndTime())
                .timeRemaining(calculateTimeRemaining(product.getEndTime()))
                .autoExtend(product.getAutoExtend())
                .allowUnratedBidders(product.getAllowUnratedBidders())
                .status(product.getStatus().name())
                .bidCount(product.getBidCount())
                .images(product.getImages())
                .isNew(product.isNew())
                .isWatched(isWatched)
                .isCurrentUserBlocked(isBlocked)
                .createdAt(product.getCreatedAt())
                .sellerId(product.getSeller().getId())
                .sellerName(product.getSeller().getFullName())
                .build();
    }

    public static ProductListDto toListDto(Product product) {
        return ProductListDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .currentPrice(product.getCurrentPrice())
                .buyNowPrice(product.getBuyNowPrice())
                .thumbnailImage(
                        product.getImages().isEmpty()
                                ? null
                                : product.getImages().get(0))
                .currentBidderName(
                        product.getCurrentBidder() != null
                                ? maskUserName(product.getCurrentBidder().getFullName())
                                : null)
                .endTime(product.getEndTime())
                .timeRemaining(calculateTimeRemaining(product.getEndTime()))
                .bidCount(product.getBidCount())
                .isNew(product.isNew())
                .categoryName(product.getCategory().getName())
                .createdAt(product.getCreatedAt())
                .build();
    }

    private static String calculateTimeRemaining(LocalDateTime endTime) {
        Duration duration = Duration.between(LocalDateTime.now(), endTime);

        if (duration.isNegative()) {
            return "Ended";
        }

        long days = duration.toDays();
        if (days >= 3) {
            return endTime.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }

        if (days > 0) {
            return days + " days left";
        }

        long hours = duration.toHours();
        if (hours > 0) {
            return hours + " hours left";
        }

        long minutes = duration.toMinutes();
        return minutes + " minutes left";
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
