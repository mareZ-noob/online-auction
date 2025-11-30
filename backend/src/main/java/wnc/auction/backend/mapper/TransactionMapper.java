package wnc.auction.backend.mapper;

import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.TransactionDto;
import wnc.auction.backend.model.Transaction;

@UtilityClass
public class TransactionMapper {

    public static TransactionDto toDto(Transaction transaction) {
        return TransactionDto.builder()
                .id(transaction.getId())
                .productId(transaction.getProduct().getId())
                .productName(transaction.getProduct().getName())
                .buyerId(transaction.getBuyer().getId())
                .buyerName(transaction.getBuyer().getFullName())
                .sellerId(transaction.getSeller().getId())
                .sellerName(transaction.getSeller().getFullName())
                .amount(transaction.getAmount())
                .status(transaction.getStatus().name())
                .shippingAddress(transaction.getShippingAddress())
                .trackingNumber(transaction.getTrackingNumber())
                .paidAt(transaction.getPaidAt())
                .shippedAt(transaction.getShippedAt())
                .deliveredAt(transaction.getDeliveredAt())
                .cancelled(transaction.getCancelled())
                .cancellationReason(transaction.getCancellationReason())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
