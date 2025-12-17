package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import wnc.auction.backend.dto.model.CategoryDto;
import wnc.auction.backend.dto.model.ProductListDto;
import wnc.auction.backend.dto.model.UpgradeRequestDto;
import wnc.auction.backend.dto.model.UserDto;
import wnc.auction.backend.dto.request.CategoryRequest;
import wnc.auction.backend.dto.request.ReviewUpgradeRequest;
import wnc.auction.backend.dto.response.ApiResponse;
import wnc.auction.backend.dto.response.ChartDataPoint;
import wnc.auction.backend.dto.response.DashboardStats;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.service.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Administrator endpoints")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final CategoryService categoryService;
    private final ProductService productService;
    private final UpgradeRequestService upgradeRequestService;
    private final NotificationService notificationService;

    // Dashboard
    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboard() {
        DashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/dashboard/chart")
    @Operation(summary = "Get chart statistics (MONTHLY or YEARLY)")
    public ResponseEntity<ApiResponse<List<ChartDataPoint>>> getChartStats(
            @RequestParam(defaultValue = "MONTHLY") String type) {
        List<ChartDataPoint> chartData = adminService.getChartStats(type);
        return ResponseEntity.ok(ApiResponse.success(chartData));
    }

    // User Management
    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<UserDto> users = adminService.getAllUsers(page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user details")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{userId}/disable")
    @Operation(summary = "Disable user account and logout from all devices")
    public ResponseEntity<ApiResponse<Void>> disableAccount(@PathVariable Long userId) {
        userService.disableAccount(userId);
        return ResponseEntity.ok(ApiResponse.success("User account disabled and logged out from all devices", null));
    }

    @PutMapping("/{userId}/enable")
    @Operation(summary = "Enable user account")
    public ResponseEntity<ApiResponse<Void>> enableAccount(@PathVariable Long userId) {
        userService.enableAccount(userId);
        return ResponseEntity.ok(ApiResponse.success("User account enabled", null));
    }

    @PostMapping("/{userId}/force-logout")
    @Operation(summary = "Force logout user from all devices without disabling account")
    public ResponseEntity<ApiResponse<Void>> forceLogout(@PathVariable Long userId) {
        userService.forceLogoutAllDevices(userId);
        return ResponseEntity.ok(ApiResponse.success("User logged out from all devices", null));
    }

    // Category Management
    @PostMapping("/categories")
    @Operation(summary = "Create a category")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryDto category = categoryService.createCategory(request);
        return ResponseEntity.ok(ApiResponse.success("Category created", category));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        CategoryDto category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated", category));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }

    // Product Management
    @DeleteMapping("/products/{id}")
    @Operation(summary = "Remove a product")
    public ResponseEntity<ApiResponse<Void>> removeProduct(@PathVariable Long id) {
        adminService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product removed", null));
    }

    @GetMapping("/products")
    @Operation(summary = "Get all products")
    public ResponseEntity<ApiResponse<PageResponse<ProductListDto>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<ProductListDto> products = productService.getActiveProducts(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    // Upgrade Request Management
    @GetMapping("/upgrade-requests")
    @Operation(summary = "Get pending upgrade requests")
    public ResponseEntity<ApiResponse<PageResponse<UpgradeRequestDto>>> getPendingUpgradeRequests(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        PageResponse<UpgradeRequestDto> requests = upgradeRequestService.getPendingRequests(page, size);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PostMapping("/upgrade-requests/{id}/review")
    @Operation(summary = "Review an upgrade request")
    public ResponseEntity<ApiResponse<UpgradeRequestDto>> reviewUpgradeRequest(
            @PathVariable Long id, @Valid @RequestBody ReviewUpgradeRequest request) {
        UpgradeRequestDto upgradeRequest = upgradeRequestService.reviewUpgradeRequest(id, request);
        return ResponseEntity.ok(ApiResponse.success("Request reviewed", upgradeRequest));
    }

    // Notification Management
    @PostMapping("/notifications/broadcast")
    @Operation(summary = "Broadcast system message to all users")
    public ResponseEntity<ApiResponse<Void>> broadcastMessage(@RequestParam String message) {
        notificationService.broadcastSystemMessage(message);
        return ResponseEntity.ok(ApiResponse.success("Message broadcast", null));
    }

    @GetMapping("/notifications/stats")
    @Operation(summary = "Get notification connection statistics")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getNotificationStats() {
        Map<String, Integer> stats = notificationService.getConnectionStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
