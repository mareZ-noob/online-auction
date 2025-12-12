package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import wnc.auction.backend.dto.model.*;
import wnc.auction.backend.dto.request.*;
import wnc.auction.backend.dto.response.ApiResponse;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.BadRequestException;
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

    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new product with images")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @Parameter(
                            description = "Product data in JSON format",
                            content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
                    @RequestPart("data")
                    @Valid
                    CreateProductRequest request,
            @Parameter(description = "Product images (min 3)") @RequestPart("images") List<MultipartFile> images) {

        if (images == null || images.size() < 3) {
            throw new BadRequestException("At least 3 images are required");
        }

        ProductDto product = productService.createProductWithImages(request, images);
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

    @GetMapping("/ratings/check/{productId}")
    @Operation(summary = "Check if I have rated this product")
    public ResponseEntity<ApiResponse<RatingDto>> checkMyRating(@PathVariable Long productId) {
        RatingDto myRating = ratingService.getMyRatingForProduct(productId);

        if (myRating != null) {
            return ResponseEntity.ok(ApiResponse.success("You have rated this product", myRating));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Not rated yet", null));
        }
    }

    // Product Image Management
    @PostMapping(value = "/products/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and add an image to a product")
    public ResponseEntity<ApiResponse<ProductDto>> addProductImage(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        ProductDto product = productService.addProductImage(id, file);
        return ResponseEntity.ok(ApiResponse.success("Image added successfully", product));
    }

    @DeleteMapping("/products/{id}/images")
    @Operation(summary = "Remove an image from a product")
    public ResponseEntity<ApiResponse<ProductDto>> removeProductImage(
            @PathVariable Long id, @RequestBody Map<String, String> request) {
        String imageUrl = request.get("imageUrl");
        ProductDto product = productService.removeProductImage(id, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Image removed successfully", product));
    }
}
