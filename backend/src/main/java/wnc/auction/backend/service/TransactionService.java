package wnc.auction.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.TransactionDto;
import wnc.auction.backend.dto.request.CancelTransactionRequest;
import wnc.auction.backend.dto.request.ConfirmPaymentRequest;
import wnc.auction.backend.dto.request.ShipOrderRequest;
import wnc.auction.backend.dto.request.UpdateShippingAddressRequest;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.ForbiddenException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.TransactionMapper;
import wnc.auction.backend.model.Product;
import wnc.auction.backend.model.Rating;
import wnc.auction.backend.model.Transaction;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.ProductStatus;
import wnc.auction.backend.model.enumeration.TransactionStatus;
import wnc.auction.backend.repository.ProductRepository;
import wnc.auction.backend.repository.RatingRepository;
import wnc.auction.backend.repository.TransactionRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.utils.Constants;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;
    private final EmailService emailService;

    public TransactionDto createTransaction(Long productId) {
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getStatus() != ProductStatus.COMPLETED) {
            throw new BadRequestException("Product auction has not ended");
        }

        if (product.getCurrentBidder() == null) {
            throw new BadRequestException("No winner for this auction");
        }

        // Check if transaction already exists
        Optional<Transaction> existing = transactionRepository.findByProductId(productId);
        if (existing.isPresent()) {
            return TransactionMapper.toDto(existing.get());
        }

        Transaction transaction = Transaction.builder()
                .product(product)
                .buyer(product.getCurrentBidder())
                .seller(product.getSeller())
                .amount(product.getCurrentPrice())
                .status(TransactionStatus.PENDING_PAYMENT)
                .cancelled(false)
                .build();

        transaction = transactionRepository.save(transaction);

        log.info("Transaction created: {} for product: {}", transaction.getId(), productId);

        return TransactionMapper.toDto(transaction);
    }

    public TransactionDto getTransaction(Long transactionId) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getBuyer().getId().equals(userId)
                && !transaction.getSeller().getId().equals(userId)
                && !CurrentUser.isAdmin()) {
            throw new ForbiddenException("Access denied");
        }

        return TransactionMapper.toDto(transaction);
    }

    public TransactionDto getTransactionByProduct(Long productId) {
        Transaction transaction = transactionRepository
                .findByProductId(productId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getBuyer().getId().equals(userId)
                && !transaction.getSeller().getId().equals(userId)
                && !CurrentUser.isAdmin()) {
            throw new ForbiddenException("Access denied");
        }

        return TransactionMapper.toDto(transaction);
    }

    public TransactionDto updateShippingAddress(Long transactionId, UpdateShippingAddressRequest request) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getBuyer().getId().equals(userId)) {
            throw new ForbiddenException("Only buyer can update shipping address");
        }

        transaction.setShippingAddress(request.getShippingAddress());
        transaction = transactionRepository.save(transaction);

        log.info("Shipping address updated for transaction: {}", transactionId);

        return TransactionMapper.toDto(transaction);
    }

    public TransactionDto confirmPayment(Long transactionId, ConfirmPaymentRequest request) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getBuyer().getId().equals(userId)) {
            throw new ForbiddenException("Only buyer can confirm payment");
        }

        if (transaction.getStatus() != TransactionStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Transaction is not in pending payment status");
        }

        transaction.setStatus(TransactionStatus.PAYMENT_CONFIRMED);
        transaction.setPaidAt(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        log.info("Payment confirmed for transaction: {}", transactionId);

        return TransactionMapper.toDto(transaction);
    }

    public TransactionDto shipOrder(Long transactionId, ShipOrderRequest request) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("Only seller can ship order");
        }

        if (transaction.getStatus() != TransactionStatus.PAYMENT_CONFIRMED) {
            throw new BadRequestException("Payment must be confirmed before shipping");
        }

        transaction.setStatus(TransactionStatus.SHIPPED);
        transaction.setTrackingNumber(request.getTrackingNumber());
        transaction.setShippedAt(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        log.info("Order shipped for transaction: {}", transactionId);

        return TransactionMapper.toDto(transaction);
    }

    public TransactionDto confirmDelivery(Long transactionId) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getBuyer().getId().equals(userId)) {
            throw new ForbiddenException("Only buyer can confirm delivery");
        }

        if (transaction.getStatus() != TransactionStatus.SHIPPED) {
            throw new BadRequestException("Order must be shipped before confirming delivery");
        }

        transaction.setStatus(TransactionStatus.DELIVERED);
        transaction.setDeliveredAt(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        log.info("Delivery confirmed for transaction: {}", transactionId);

        return TransactionMapper.toDto(transaction);
    }

    public TransactionDto cancelTransaction(Long transactionId, CancelTransactionRequest request) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("Only seller can cancel transaction");
        }

        if (transaction.getStatus() == TransactionStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel delivered transaction");
        }

        transaction.setCancelled(true);
        transaction.setCancellationReason(request.getReason());
        transaction.setStatus(TransactionStatus.CANCELLED);
        transaction = transactionRepository.save(transaction);

        // Automatically rate buyer negatively
        Rating rating = Rating.builder()
                .user(transaction.getBuyer())
                .ratedBy(transaction.getSeller())
                .product(transaction.getProduct())
                .isPositive(false)
                .comment("Người thắng không thanh toán")
                .build();

        ratingRepository.save(rating);

        // Update buyer's rating count
        User buyer = transaction.getBuyer();
        buyer.setNegativeRatings(buyer.getNegativeRatings() + 1);
        userRepository.save(buyer);

        log.info("Transaction cancelled: {}", transactionId);

        return TransactionMapper.toDto(transaction);
    }

    public PageResponse<TransactionDto> getMyPurchases(int page, int size) {
        Long buyerId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactionPage = transactionRepository.findByBuyerId(buyerId, pageable);

        List<TransactionDto> content = transactionPage.getContent().stream()
                .map(TransactionMapper::toDto)
                .toList();

        return PageResponse.<TransactionDto>builder()
                .content(content)
                .page(transactionPage.getNumber())
                .size(transactionPage.getSize())
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .last(transactionPage.isLast())
                .build();
    }

    public PageResponse<TransactionDto> getMySales(int page, int size) {
        Long sellerId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactionPage = transactionRepository.findBySellerId(sellerId, pageable);

        List<TransactionDto> content = transactionPage.getContent().stream()
                .map(TransactionMapper::toDto)
                .toList();

        return PageResponse.<TransactionDto>builder()
                .content(content)
                .page(transactionPage.getNumber())
                .size(transactionPage.getSize())
                .totalElements(transactionPage.getTotalElements())
                .totalPages(transactionPage.getTotalPages())
                .last(transactionPage.isLast())
                .build();
    }
}
