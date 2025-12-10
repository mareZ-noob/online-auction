package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wnc.auction.backend.dto.model.*;
import wnc.auction.backend.dto.request.SearchRequest;
import wnc.auction.backend.dto.response.ApiResponse;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.service.BidService;
import wnc.auction.backend.service.CategoryService;
import wnc.auction.backend.service.ProductService;
import wnc.auction.backend.service.QuestionService;

@Slf4j
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Tag(name = "Public", description = "Public endpoints accessible without authentication")
public class PublicController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final QuestionService questionService;
    private final BidService bidService;

    @GetMapping("/products/top/ending-soon")
    @Operation(summary = "Get top 5 products ending soon")
    public ResponseEntity<ApiResponse<List<ProductListDto>>> getTop5EndingSoon() {
        List<ProductListDto> products = productService.getTop5EndingSoon();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/top/most-bids")
    @Operation(summary = "Get top 5 products with most bids")
    public ResponseEntity<ApiResponse<List<ProductListDto>>> getTop5MostBids() {
        List<ProductListDto> products = productService.getTop5MostBids();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/top/highest-price")
    @Operation(summary = "Get top 5 highest priced products")
    public ResponseEntity<ApiResponse<List<ProductListDto>>> getTop5HighestPrice() {
        List<ProductListDto> products = productService.getTop5HighestPrice();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products")
    @Operation(summary = "Get all active products")
    public ResponseEntity<ApiResponse<PageResponse<ProductListDto>>> getActiveProducts(
            @Parameter(description = "Page number", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10") @RequestParam(defaultValue = "20") int size) {
        PageResponse<ProductListDto> products = productService.getActiveProducts(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get product details")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(
            @Parameter(description = "Product ID", example = "1") @PathVariable Long id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/products/{id}/comments")
    @Operation(summary = "Get comments (questions) for a product with pagination")
    public ResponseEntity<ApiResponse<PageResponse<QuestionDto>>> getProductComments(
            @Parameter(description = "Product ID", example = "1") @PathVariable Long id,
            @Parameter(description = "Page number", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") @RequestParam(defaultValue = "20") int size) {

        PageResponse<QuestionDto> comments = questionService.getProductQuestions(id, page, size);

        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @GetMapping("/products/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public ResponseEntity<ApiResponse<PageResponse<ProductListDto>>> getProductsByCategory(
            @Parameter(description = "Category ID", example = "1") @PathVariable Long categoryId,
            @Parameter(description = "Page number", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "10") @RequestParam(defaultValue = "20") int size) {
        PageResponse<ProductListDto> products = productService.getProductsByCategory(categoryId, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping("/products/search")
    @Operation(summary = "Search products")
    public ResponseEntity<ApiResponse<PageResponse<ProductListDto>>> searchProducts(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                            description = "Search criteria",
                            content = @Content(examples = @ExampleObject(value = """
											{
											"keyword": "iphone",
											"categoryId": 1,
											"sortBy": "price",
											"sortDirection": "asc",
											"page": 0,
											"size": 10
											}""")))
                    @RequestBody
                    SearchRequest request) {
        PageResponse<ProductListDto> products = productService.searchProducts(request);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/{id}/related")
    @Operation(summary = "Get related products")
    public ResponseEntity<ApiResponse<List<ProductListDto>>> getRelatedProducts(
            @Parameter(description = "Product ID", example = "1") @PathVariable Long id) {
        List<ProductListDto> products = productService.getRelatedProducts(id);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/categories/root")
    @Operation(summary = "Get root categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getRootCategories() {
        List<CategoryDto> categories = categoryService.getRootCategories();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/categories/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategory(
            @Parameter(description = "Category ID", example = "1") @PathVariable Long id) {
        CategoryDto category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(category));
    }

    @GetMapping("/categories/{id}/children")
    @Operation(summary = "Get sub-categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getSubCategories(
            @Parameter(description = "Parent Category ID", example = "1") @PathVariable Long id) {
        List<CategoryDto> categories = categoryService.getSubCategories(id);
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/products/{id}/bid-ranking")
    @Operation(summary = "Get paginated bid ranking for a product")
    public ResponseEntity<ApiResponse<PageResponse<BidHistoryDto>>> getBidRanking(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        PageResponse<BidHistoryDto> ranking = bidService.getBidRanking(id, page, size);
        return ResponseEntity.ok(ApiResponse.success(ranking));
    }
}
