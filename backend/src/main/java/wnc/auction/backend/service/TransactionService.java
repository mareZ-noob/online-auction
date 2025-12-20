package wnc.auction.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.RatingDto;
import wnc.auction.backend.dto.model.TransactionDto;
import wnc.auction.backend.dto.request.*;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.dto.response.StripeCheckoutResponse;
import wnc.auction.backend.dto.response.TransactionDetailsResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.ForbiddenException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.RatingMapper;
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
    private final ChatService chatService;
    private final NotificationService notificationService;

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

    public TransactionDetailsResponse getTransactionDetails(Long productId) {
        Product product =
                productRepository.findById(productId).orElseThrow(() -> new NotFoundException("Product not found"));

        Long currentUserId = CurrentUser.getUserId();

        // Check if auction has ended
        if (product.getStatus() != ProductStatus.COMPLETED) {
            throw new BadRequestException("Auction has not ended yet");
        }

        Optional<Transaction> transactionOpt = transactionRepository.findByProductId(productId);

        // Determine user role
        boolean isBuyer = product.getCurrentBidder() != null
                && currentUserId != null
                && product.getCurrentBidder().getId().equals(currentUserId);
        boolean isSeller = currentUserId != null && product.getSeller().getId().equals(currentUserId);

        if (isBuyer || isSeller) {
            // Full transaction details for buyer and seller
            Transaction transaction = transactionOpt.orElseGet(() -> createInitialTransaction(product));

            return TransactionDetailsResponse.builder()
                    .hasAccess(true)
                    .transaction(TransactionMapper.toDto(transaction))
                    .isBuyer(isBuyer)
                    .isSeller(isSeller)
                    .chatEnabled(true)
                    .build();
        } else {
            // Limited information for other users
            return TransactionDetailsResponse.builder()
                    .hasAccess(false)
                    .productId(productId)
                    .productName(product.getName())
                    .finalPrice(product.getCurrentPrice())
                    .status("COMPLETED")
                    .message("Sản phẩm đã kết thúc")
                    .chatEnabled(false)
                    .build();
        }
    }

    // Step 1: Create checkout session (Payment)
    public StripeCheckoutResponse initiatePayment(Long transactionId, String currency) {
        Transaction transaction = getTransactionForBuyer(transactionId);

        if (transaction.getStatus() != TransactionStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Transaction is not in pending payment status");
        }

        // This will be handled by StripePaymentService
        // Return placeholder - actual implementation in StripePaymentService
        throw new RuntimeException("Use StripePaymentService.createCheckoutSession instead");
    }

    // Step 2: Update shipping address
    public TransactionDto updateShippingAddress(Long transactionId, UpdateShippingAddressRequest request) {
        Transaction transaction = getTransactionForBuyer(transactionId);

        transaction.setShippingAddress(request.getShippingAddress());
        transaction = transactionRepository.save(transaction);

        // Send system message
        chatService.sendSystemMessage(
                transactionId, "Buyer has provided shipping address: " + request.getShippingAddress());

        // Notify seller
        notificationService.sendUserNotification(
                transaction.getSeller().getId(),
                "shipping_address_updated",
                Map.of(
                        "transactionId",
                        transactionId,
                        "productName",
                        transaction.getProduct().getName()));

        log.info("Shipping address updated for transaction: {}", transactionId);
        return TransactionMapper.toDto(transaction);
    }

    // Step 3: Confirm payment and ship order (Seller)
    public TransactionDto shipOrder(Long transactionId, ShipOrderRequest request) {
        Transaction transaction = getTransactionForSeller(transactionId);

        if (transaction.getStatus() != TransactionStatus.PAYMENT_CONFIRMED) {
            throw new BadRequestException("Payment must be confirmed before shipping");
        }

        if (transaction.getShippingAddress() == null
                || transaction.getShippingAddress().isEmpty()) {
            throw new BadRequestException("Shipping address is required");
        }

        transaction.setStatus(TransactionStatus.SHIPPED);
        transaction.setTrackingNumber(request.getTrackingNumber());
        transaction.setShippedAt(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        // Send system message
        chatService.sendSystemMessage(
                transactionId, "Order has been shipped. Tracking number: " + request.getTrackingNumber());

        // Send email to buyer
        emailService.sendOrderShippedNotification(
                transaction.getBuyer().getId(),
                transaction.getProduct().getId(),
                transaction.getProduct().getName(),
                request.getTrackingNumber());

        // Notify buyer
        notificationService.sendUserNotification(
                transaction.getBuyer().getId(),
                "order_shipped",
                Map.of(
                        "transactionId", transactionId,
                        "productName", transaction.getProduct().getName(),
                        "trackingNumber", request.getTrackingNumber()));

        log.info("Order shipped for transaction: {}", transactionId);
        return TransactionMapper.toDto(transaction);
    }

    // Step 4: Confirm delivery (Buyer)
    public TransactionDto confirmDelivery(Long transactionId) {
        Transaction transaction = getTransactionForBuyer(transactionId);

        if (transaction.getStatus() != TransactionStatus.SHIPPED) {
            throw new BadRequestException("Order must be shipped before confirming delivery");
        }

        transaction.setStatus(TransactionStatus.DELIVERED);
        transaction.setDeliveredAt(LocalDateTime.now());
        transaction = transactionRepository.save(transaction);

        // Send system message
        chatService.sendSystemMessage(transactionId, "Buyer has confirmed delivery. Please rate each other.");

        // Notify seller
        notificationService.sendUserNotification(
                transaction.getSeller().getId(),
                "delivery_confirmed",
                Map.of(
                        "transactionId",
                        transactionId,
                        "productName",
                        transaction.getProduct().getName()));

        log.info("Delivery confirmed for transaction: {}", transactionId);
        return TransactionMapper.toDto(transaction);
    }

    // Complete transaction (Both parties have rated)
    public TransactionDto completeTransaction(Long transactionId) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        if (transaction.getStatus() != TransactionStatus.DELIVERED) {
            throw new BadRequestException("Order must be delivered first");
        }

        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction = transactionRepository.save(transaction);

        chatService.sendSystemMessage(transactionId, "Transaction completed successfully!");

        log.info("Transaction completed: {}", transactionId);
        return TransactionMapper.toDto(transaction);
    }

    // Cancel transaction (Seller only)
    public TransactionDto cancelTransaction(Long transactionId, CancelTransactionRequest request) {
        Transaction transaction = getTransactionForSeller(transactionId);

        if (transaction.getStatus() == TransactionStatus.DELIVERED
                || transaction.getStatus() == TransactionStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel completed transaction");
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

        // Send system message
        chatService.sendSystemMessage(transactionId, "Transaction cancelled by seller. Reason: " + request.getReason());

        // Notify buyer
        notificationService.sendUserNotification(
                transaction.getBuyer().getId(),
                "transaction_cancelled",
                Map.of(
                        "transactionId", transactionId,
                        "productName", transaction.getProduct().getName(),
                        "reason", request.getReason()));

        log.info("Transaction cancelled: {}", transactionId);
        return TransactionMapper.toDto(transaction);
    }

    // Rate other party
    public RatingDto rateUser(RateUserRequest request) {
        Long raterId = CurrentUser.getUserId();
        User rater = userRepository.findById(raterId).orElseThrow(() -> new NotFoundException("User not found"));

        User user =
                userRepository.findById(request.getUserId()).orElseThrow(() -> new NotFoundException("User not found"));

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Transaction transaction = transactionRepository
                .findByProductId(product.getId())
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        // Verify rater is involved
        if (!transaction.getBuyer().getId().equals(raterId)
                && !transaction.getSeller().getId().equals(raterId)) {
            throw new ForbiddenException("You can only rate users you transacted with");
        }

        // Check if already rated
        Optional<Rating> existingRating = ratingRepository.findByUserIdAndRatedByIdAndProductId(
                request.getUserId(), raterId, request.getProductId());

        Rating rating;
        if (existingRating.isPresent()) {
            // Update existing rating
            rating = existingRating.get();

            // Update user's rating counts
            if (rating.getIsPositive() != request.getIsPositive()) {
                if (request.getIsPositive()) {
                    user.setPositiveRatings(user.getPositiveRatings() + 1);
                    user.setNegativeRatings(user.getNegativeRatings() - 1);
                } else {
                    user.setPositiveRatings(user.getPositiveRatings() - 1);
                    user.setNegativeRatings(user.getNegativeRatings() + 1);
                }
            }

            rating.setIsPositive(request.getIsPositive());
            rating.setComment(request.getComment());
        } else {
            // Create new rating
            rating = Rating.builder()
                    .user(user)
                    .ratedBy(rater)
                    .product(product)
                    .isPositive(request.getIsPositive())
                    .comment(request.getComment())
                    .build();

            // Update user's rating counts
            if (request.getIsPositive()) {
                user.setPositiveRatings(user.getPositiveRatings() + 1);
            } else {
                user.setNegativeRatings(user.getNegativeRatings() + 1);
            }
        }

        rating = ratingRepository.save(rating);
        userRepository.save(user);

        // Send system message
        chatService.sendSystemMessage(transaction.getId(), rater.getFullName() + " has rated " + user.getFullName());

        // Check if both have rated, complete transaction
        boolean buyerRated = ratingRepository
                .findByUserIdAndRatedByIdAndProductId(
                        transaction.getSeller().getId(), transaction.getBuyer().getId(), product.getId())
                .isPresent();

        boolean sellerRated = ratingRepository
                .findByUserIdAndRatedByIdAndProductId(
                        transaction.getBuyer().getId(), transaction.getSeller().getId(), product.getId())
                .isPresent();

        if (buyerRated && sellerRated && transaction.getStatus() == TransactionStatus.DELIVERED) {
            completeTransaction(transaction.getId());
        }

        log.info("User {} rated by user {}: {}", request.getUserId(), raterId, request.getIsPositive());

        return RatingMapper.toDto(rating);
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

    private Transaction createInitialTransaction(Product product) {
        if (product.getCurrentBidder() == null) {
            throw new BadRequestException("No winner for this auction");
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

        // Send initial system message
        chatService.sendSystemMessage(transaction.getId(), "Transaction created. Please proceed with payment.");

        return transaction;
    }

    private Transaction getTransactionForBuyer(Long transactionId) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getBuyer().getId().equals(userId)) {
            throw new ForbiddenException("Only buyer can perform this action");
        }

        return transaction;
    }

    private Transaction getTransactionForSeller(Long transactionId) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getSeller().getId().equals(userId)) {
            throw new ForbiddenException("Only seller can perform this action");
        }

        return transaction;
    }
}
