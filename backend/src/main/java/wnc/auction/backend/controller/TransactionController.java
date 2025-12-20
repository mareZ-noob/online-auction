package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import wnc.auction.backend.dto.model.RatingDto;
import wnc.auction.backend.dto.model.TransactionDto;
import wnc.auction.backend.dto.request.CancelTransactionRequest;
import wnc.auction.backend.dto.request.RateUserRequest;
import wnc.auction.backend.dto.request.ShipOrderRequest;
import wnc.auction.backend.dto.request.UpdateShippingAddressRequest;
import wnc.auction.backend.dto.response.ApiResponse;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.dto.response.StripeCheckoutResponse;
import wnc.auction.backend.dto.response.TransactionDetailsResponse;
import wnc.auction.backend.service.StripePaymentService;
import wnc.auction.backend.service.TransactionService;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "4-step transaction completion flow")
@PreAuthorize("hasAnyRole('BIDDER', 'SELLER', 'ADMIN')")
public class TransactionController {

    private final TransactionService transactionService;
    private final StripePaymentService stripePaymentService;

    @GetMapping("/product/{productId}")
    @Operation(
            summary = "Get transaction details by product",
            description = "Returns full details for buyer/seller, limited info for others")
    public ResponseEntity<ApiResponse<TransactionDetailsResponse>> getTransactionByProduct(
            @PathVariable Long productId) {

        TransactionDetailsResponse response = transactionService.getTransactionDetails(productId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{transactionId}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransaction(@PathVariable Long transactionId) {

        // This would use the original getTransaction method
        return ResponseEntity.ok(ApiResponse.success(null)); // Implement
    }

    // Payment
    @PostMapping("/{transactionId}/payment/initiate")
    @Operation(summary = "Step 1: Initiate payment (Buyer)", description = "Creates Stripe checkout session")
    public ResponseEntity<ApiResponse<StripeCheckoutResponse>> initiatePayment(
            @PathVariable Long transactionId, @RequestParam(defaultValue = "vnd") String currency) {

        StripeCheckoutResponse response = stripePaymentService.createCheckoutSession(transactionId, currency);

        return ResponseEntity.ok(ApiResponse.success("Payment initiated. Please complete checkout.", response));
    }

    // Shipping Address
    @PutMapping("/{transactionId}/shipping-address")
    @Operation(summary = "Step 2: Update shipping address (Buyer)")
    public ResponseEntity<ApiResponse<TransactionDto>> updateShippingAddress(
            @PathVariable Long transactionId, @Valid @RequestBody UpdateShippingAddressRequest request) {

        TransactionDto transaction = transactionService.updateShippingAddress(transactionId, request);

        return ResponseEntity.ok(ApiResponse.success("Shipping address updated", transaction));
    }

    // Ship Order
    @PostMapping("/{transactionId}/ship")
    @Operation(summary = "Step 3: Ship order with tracking (Seller)")
    public ResponseEntity<ApiResponse<TransactionDto>> shipOrder(
            @PathVariable Long transactionId, @Valid @RequestBody ShipOrderRequest request) {

        TransactionDto transaction = transactionService.shipOrder(transactionId, request);

        return ResponseEntity.ok(ApiResponse.success("Order marked as shipped", transaction));
    }

    // Confirm Delivery
    @PostMapping("/{transactionId}/confirm-delivery")
    @Operation(summary = "Step 4: Confirm delivery (Buyer)")
    public ResponseEntity<ApiResponse<TransactionDto>> confirmDelivery(@PathVariable Long transactionId) {

        TransactionDto transaction = transactionService.confirmDelivery(transactionId);

        return ResponseEntity.ok(ApiResponse.success("Delivery confirmed", transaction));
    }

    // Rating
    @PostMapping("/rate")
    @Operation(summary = "Rate the other party (Buyer or Seller)")
    public ResponseEntity<ApiResponse<RatingDto>> rateUser(@Valid @RequestBody RateUserRequest request) {

        RatingDto rating = transactionService.rateUser(request);

        return ResponseEntity.ok(ApiResponse.success("Rating submitted successfully", rating));
    }

    // Cancel
    @PostMapping("/{transactionId}/cancel")
    @Operation(summary = "Cancel transaction (Seller only)")
    public ResponseEntity<ApiResponse<TransactionDto>> cancelTransaction(
            @PathVariable Long transactionId, @Valid @RequestBody CancelTransactionRequest request) {

        TransactionDto transaction = transactionService.cancelTransaction(transactionId, request);

        return ResponseEntity.ok(ApiResponse.success("Transaction cancelled", transaction));
    }

    // List Transactions
    @GetMapping("/my-purchases")
    @Operation(summary = "Get my purchases (Buyer)")
    public ResponseEntity<ApiResponse<PageResponse<TransactionDto>>> getMyPurchases(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {

        PageResponse<TransactionDto> transactions = transactionService.getMyPurchases(page, size);

        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @GetMapping("/my-sales")
    @Operation(summary = "Get my sales (Seller)")
    public ResponseEntity<ApiResponse<PageResponse<TransactionDto>>> getMySales(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {

        PageResponse<TransactionDto> transactions = transactionService.getMySales(page, size);

        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
}
