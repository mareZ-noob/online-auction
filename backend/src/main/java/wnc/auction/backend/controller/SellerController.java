package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@RequestMapping("/api/seller")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
@Tag(name = "Seller", description = "Seller-specific endpoints")
public class SellerController {

    private final ProductService productService;
    private final QuestionService questionService;
    private final BidService bidService;
    private final TransactionService transactionService;
    private final RatingService ratingService;

    // Product Management
    @PostMapping("/products")
    @Operation(summary = "Create a new product")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductDto product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("Product created", product));
    }

    @PutMapping("/products/{id}/description")
    @Operation(summary = "Update product description")
    public ResponseEntity<ApiResponse<ProductDto>> updateProductDescription(
            @PathVariable Long id, @Valid @RequestBody UpdateProductDescriptionRequest request) {
        ProductDto product = productService.updateProductDescription(id, request);
        return ResponseEntity.ok(ApiResponse.success("Description updated", product));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete a product")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @GetMapping("/products")
    @Operation(summary = "Get my products")
    public ResponseEntity<ApiResponse<PageResponse<ProductListDto>>> getMyProducts(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<ProductListDto> products = productService.getMyProducts(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    // Bid Management
    @PostMapping("/products/{productId}/block-bidder/{bidderId}")
    @Operation(summary = "Block a bidder from a product")
    public ResponseEntity<ApiResponse<Void>> blockBidder(@PathVariable Long productId, @PathVariable Long bidderId) {
        bidService.blockBidder(productId, bidderId);
        return ResponseEntity.ok(ApiResponse.success("Bidder blocked", null));
    }

    // Question Management
    @PostMapping("/questions/{questionId}/answer")
    @Operation(summary = "Answer a question")
    public ResponseEntity<ApiResponse<QuestionDto>> answerQuestion(
            @PathVariable Long questionId, @Valid @RequestBody AnswerQuestionRequest request) {
        QuestionDto question = questionService.answerQuestion(questionId, request);
        return ResponseEntity.ok(ApiResponse.success("Question answered", question));
    }

    @GetMapping("/questions/unanswered")
    @Operation(summary = "Get unanswered questions with pagination")
    public ResponseEntity<ApiResponse<PageResponse<QuestionDto>>> getUnansweredQuestions(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {

        PageResponse<QuestionDto> questions = questionService.getUnansweredQuestions(page, size);
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    @GetMapping("/products/{productId}/questions")
    @Operation(summary = "Get questions for a product")
    public ResponseEntity<ApiResponse<java.util.List<QuestionDto>>> getProductQuestions(@PathVariable Long productId) {
        java.util.List<QuestionDto> questions = questionService.getProductQuestions(productId);
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    // Transaction Management
    @GetMapping("/sales")
    @Operation(summary = "Get my sales")
    public ResponseEntity<ApiResponse<PageResponse<TransactionDto>>> getMySales(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<TransactionDto> transactions = transactionService.getMySales(page, size);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @PostMapping("/transactions/{transactionId}/ship")
    @Operation(summary = "Ship an order")
    public ResponseEntity<ApiResponse<TransactionDto>> shipOrder(
            @PathVariable Long transactionId, @Valid @RequestBody ShipOrderRequest request) {
        TransactionDto transaction = transactionService.shipOrder(transactionId, request);
        return ResponseEntity.ok(ApiResponse.success("Order shipped", transaction));
    }

    @PostMapping("/transactions/{transactionId}/cancel")
    @Operation(summary = "Cancel a transaction")
    public ResponseEntity<ApiResponse<TransactionDto>> cancelTransaction(
            @PathVariable Long transactionId, @Valid @RequestBody CancelTransactionRequest request) {
        TransactionDto transaction = transactionService.cancelTransaction(transactionId, request);
        return ResponseEntity.ok(ApiResponse.success("Transaction cancelled", transaction));
    }

    // Rating Operations
    @PostMapping("/ratings")
    @Operation(summary = "Rate a user (buyer)")
    public ResponseEntity<ApiResponse<RatingDto>> rateUser(@Valid @RequestBody RateUserRequest request) {
        RatingDto rating = ratingService.rateUser(request);
        return ResponseEntity.ok(ApiResponse.success("Rating submitted", rating));
    }
}
