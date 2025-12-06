package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import wnc.auction.backend.dto.model.*;
import wnc.auction.backend.dto.request.*;
import wnc.auction.backend.dto.response.ApiResponse;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.service.*;

@RestController
@RequestMapping("/api/bidder")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('BIDDER', 'SELLER', 'ADMIN')")
@Tag(name = "Bidder", description = "Bidder-specific endpoints")
public class BidderController {

    private final BidService bidService;
    private final WatchListService watchListService;
    private final QuestionService questionService;
    private final ProductService productService;
    private final TransactionService transactionService;
    private final RatingService ratingService;
    private final UpgradeRequestService upgradeRequestService;

    // Bid Operations
    @PostMapping("/bids")
    @Operation(summary = "Place a bid on a product")
    public ResponseEntity<ApiResponse<BidDto>> placeBid(@Valid @RequestBody PlaceBidRequest request) {
        BidDto bid = bidService.placeBid(request);
        return ResponseEntity.ok(ApiResponse.success("Bid placed successfully", bid));
    }

    @GetMapping("/bids")
    @Operation(summary = "Get my bid history")
    public ResponseEntity<ApiResponse<PageResponse<BidDto>>> getMyBids(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<BidDto> bids = bidService.getMyBids(page, size);
        return ResponseEntity.ok(ApiResponse.success(bids));
    }

    @GetMapping("/products/{productId}/bids")
    @Operation(summary = "Get bid history for a product")
    public ResponseEntity<ApiResponse<List<BidHistoryDto>>> getBidHistory(@PathVariable Long productId) {
        List<BidHistoryDto> history = bidService.getBidHistory(productId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // Watchlist Operations
    @PostMapping("/watchlist/{productId}")
    @Operation(summary = "Add product to watchlist")
    public ResponseEntity<ApiResponse<Void>> addToWatchList(@PathVariable Long productId) {
        watchListService.addToWatchList(productId);
        return ResponseEntity.ok(ApiResponse.success("Added to watchlist", null));
    }

    @DeleteMapping("/watchlist/{productId}")
    @Operation(summary = "Remove product from watchlist")
    public ResponseEntity<ApiResponse<Void>> removeFromWatchList(@PathVariable Long productId) {
        watchListService.removeFromWatchList(productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from watchlist", null));
    }

    @GetMapping("/watchlist")
    @Operation(summary = "Get my watchlist")
    public ResponseEntity<ApiResponse<PageResponse<ProductListDto>>> getMyWatchList(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<ProductListDto> watchList = watchListService.getMyWatchList(page, size);
        return ResponseEntity.ok(ApiResponse.success(watchList));
    }

    @GetMapping("/watchlist/check/{productId}")
    @Operation(summary = "Check if product is in watchlist")
    public ResponseEntity<ApiResponse<Boolean>> isInWatchList(@PathVariable Long productId) {
        boolean inWatchList = watchListService.isInWatchList(productId);
        return ResponseEntity.ok(ApiResponse.success(inWatchList));
    }

    // Question Operations
    @PostMapping("/questions")
    @Operation(summary = "Ask a question about a product")
    public ResponseEntity<ApiResponse<QuestionDto>> askQuestion(@Valid @RequestBody AskQuestionRequest request) {
        QuestionDto question = questionService.askQuestion(request);
        return ResponseEntity.ok(ApiResponse.success("Question submitted", question));
    }

    @GetMapping("/questions")
    @Operation(summary = "Get my questions")
    public ResponseEntity<ApiResponse<PageResponse<QuestionDto>>> getMyQuestions(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<QuestionDto> questions = questionService.getMyQuestions(page, size);
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    // Product Browsing
    @GetMapping("/products/bidding")
    @Operation(summary = "Get products I'm currently bidding on")
    public ResponseEntity<ApiResponse<PageResponse<ProductListDto>>> getMyBiddingProducts(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<ProductListDto> products = productService.getMyBiddingProducts(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/won")
    @Operation(summary = "Get products I've won")
    public ResponseEntity<ApiResponse<PageResponse<ProductListDto>>> getMyWonProducts(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<ProductListDto> products = productService.getMyWonProducts(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    // Transaction Operations
    @GetMapping("/purchases")
    @Operation(summary = "Get my purchases")
    public ResponseEntity<ApiResponse<PageResponse<TransactionDto>>> getMyPurchases(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<TransactionDto> transactions = transactionService.getMyPurchases(page, size);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @GetMapping("/transactions/{transactionId}")
    @Operation(summary = "Get transaction details")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransaction(@PathVariable Long transactionId) {
        TransactionDto transaction = transactionService.getTransaction(transactionId);
        return ResponseEntity.ok(ApiResponse.success(transaction));
    }

    @GetMapping("/transactions/product/{productId}")
    @Operation(summary = "Get transaction by product ID")
    public ResponseEntity<ApiResponse<TransactionDto>> getTransactionByProduct(@PathVariable Long productId) {
        TransactionDto transaction = transactionService.getTransactionByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(transaction));
    }

    @PutMapping("/transactions/{transactionId}/shipping-address")
    @Operation(summary = "Update shipping address")
    public ResponseEntity<ApiResponse<TransactionDto>> updateShippingAddress(
            @PathVariable Long transactionId, @Valid @RequestBody UpdateShippingAddressRequest request) {
        TransactionDto transaction = transactionService.updateShippingAddress(transactionId, request);
        return ResponseEntity.ok(ApiResponse.success("Shipping address updated", transaction));
    }

    @PostMapping("/transactions/{transactionId}/confirm-payment")
    @Operation(summary = "Confirm payment")
    public ResponseEntity<ApiResponse<TransactionDto>> confirmPayment(
            @PathVariable Long transactionId, @Valid @RequestBody ConfirmPaymentRequest request) {
        TransactionDto transaction = transactionService.confirmPayment(transactionId, request);
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed", transaction));
    }

    @PostMapping("/transactions/{transactionId}/confirm-delivery")
    @Operation(summary = "Confirm delivery received")
    public ResponseEntity<ApiResponse<TransactionDto>> confirmDelivery(@PathVariable Long transactionId) {
        TransactionDto transaction = transactionService.confirmDelivery(transactionId);
        return ResponseEntity.ok(ApiResponse.success("Delivery confirmed", transaction));
    }

    // Rating Operations
    @PostMapping("/ratings")
    @Operation(summary = "Rate a user (seller)")
    public ResponseEntity<ApiResponse<RatingDto>> rateUser(@Valid @RequestBody RateUserRequest request) {
        RatingDto rating = ratingService.rateUser(request);
        return ResponseEntity.ok(ApiResponse.success("Rating submitted", rating));
    }

    // Upgrade Request
    @PostMapping("/upgrade-request")
    @Operation(summary = "Request upgrade to seller")
    public ResponseEntity<ApiResponse<UpgradeRequestDto>> requestUpgrade(
            @Valid @RequestBody CreateUpgradeRequest request) {
        UpgradeRequestDto upgradeRequest = upgradeRequestService.createUpgradeRequest(request);
        return ResponseEntity.ok(ApiResponse.success("Upgrade request submitted", upgradeRequest));
    }

    @GetMapping("/upgrade-requests")
    @Operation(summary = "Get my upgrade requests")
    public ResponseEntity<ApiResponse<List<UpgradeRequestDto>>> getMyUpgradeRequests() {
        List<UpgradeRequestDto> requests = upgradeRequestService.getMyUpgradeRequests();
        return ResponseEntity.ok(ApiResponse.success(requests));
    }
}
