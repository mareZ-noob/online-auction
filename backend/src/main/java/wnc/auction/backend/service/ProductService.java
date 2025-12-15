package wnc.auction.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import wnc.auction.backend.dto.model.ProductDto;
import wnc.auction.backend.dto.model.ProductListDto;
import wnc.auction.backend.dto.request.CreateProductRequest;
import wnc.auction.backend.dto.request.SearchRequest;
import wnc.auction.backend.dto.request.UpdateProductDescriptionRequest;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.ForbiddenException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.ProductMapper;
import wnc.auction.backend.model.Category;
import wnc.auction.backend.model.Product;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.embeddable.DescriptionUpdate;
import wnc.auction.backend.model.enumeration.ProductStatus;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.*;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.utils.Constants;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AuctionSchedulerService auctionSchedulerService;
    private final NotificationService notificationService;
    private final WatchListRepository watchListRepository;
    private final BlockedBidderRepository blockedBidderRepository;
    private final BidRepository bidRepository;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    @Value("${app.auction.new-product-highlight-minutes}")
    private int newProductHighlightMinutes;

    public ProductDto createProductWithImages(CreateProductRequest request, List<MultipartFile> imageFiles) {
        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : imageFiles) {
            String url = fileStorageService.storeFile(file);
            imageUrls.add(url);
        }

        request.setImages(imageUrls);

        return createProduct(request);
    }

    public ProductDto createProduct(CreateProductRequest request) {
        Long sellerId = CurrentUser.getUserId();
        User seller = userRepository.findById(sellerId).orElseThrow(() -> new NotFoundException("Seller not found"));

        if (seller.getRole() != UserRole.SELLER && seller.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Only sellers can create products");
        }

        if (seller.getRole() == UserRole.SELLER
                && seller.getRoleExpirationDate() != null
                && LocalDateTime.now().isAfter(seller.getRoleExpirationDate())) {
            throw new ForbiddenException("Your seller privileges have expired.");
        }

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        if (request.getEndTime().isBefore(LocalDateTime.now().plusHours(1))) {
            throw new BadRequestException("End time must be at least 1 hour from now");
        }

        if (request.getImages() == null || request.getImages().size() < 3) {
            throw new BadRequestException("At least 3 images are required");
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .startingPrice(request.getStartingPrice())
                .currentPrice(request.getStartingPrice())
                .stepPrice(request.getStepPrice())
                .buyNowPrice(request.getBuyNowPrice())
                .category(category)
                .seller(seller)
                .startTime(LocalDateTime.now())
                .endTime(request.getEndTime())
                .autoExtend(request.getAutoExtend())
                .allowUnratedBidders(request.getAllowUnratedBidders())
                .status(ProductStatus.ACTIVE)
                .bidCount(0)
                .images(request.getImages())
                .descriptionHistory(new ArrayList<>())
                .build();

        product = productRepository.save(product);

        // Schedule the closing job
        auctionSchedulerService.scheduleAuctionClose(product.getId(), product.getEndTime());

        log.info("Product created: {} by seller: {}", product.getId(), sellerId);
        return ProductMapper.toDto(product, sellerId, false);
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));

        Long currentUserId = CurrentUser.getUserId();

        // Check if the current user is blocked from this product
        boolean isBlocked = false;
        if (currentUserId != null) {
            isBlocked = blockedBidderRepository.existsByProductIdAndBidderId(id, currentUserId);
        }

        return ProductMapper.toDto(product, currentUserId, isBlocked);
    }

    public ProductDto updateProductDescription(Long id, UpdateProductDescriptionRequest request) {
        Long sellerId = CurrentUser.getUserId();
        Product product = productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new ForbiddenException("You can only update your own products");
        }

        // Append to description history
        DescriptionUpdate update = new DescriptionUpdate(request.getAdditionalDescription(), LocalDateTime.now());
        product.getDescriptionHistory().add(update);

        // Append to main description
        String updatedDescription = product.getDescription() + "\n\n✏️ "
                + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                + "\n\n- "
                + request.getAdditionalDescription();
        product.setDescription(updatedDescription);

        product = productRepository.save(product);

        log.info("Product description updated: {}", id);
        return ProductMapper.toDto(product, sellerId, false);
    }

    public void deleteProduct(Long id) {
        Long sellerId = CurrentUser.getUserId();
        Product product = productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));

        if (!product.getSeller().getId().equals(sellerId) && !CurrentUser.isAdmin()) {
            throw new ForbiddenException("You can only delete your own products");
        }

        if (product.getBidCount() > 0) {
            throw new BadRequestException("Cannot delete product with existing bids");
        }

        productRepository.delete(product);
        log.info("Product deleted: {}", id);
    }

    public PageResponse<ProductListDto> getActiveProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.findActiveProducts(LocalDateTime.now(), pageable);

        return mapToPageResponse(productPage);
    }

    public PageResponse<ProductListDto> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage =
                productRepository.findByCategoryAndActive(categoryId, LocalDateTime.now(), pageable);

        return mapToPageResponse(productPage);
    }

    public PageResponse<ProductListDto> searchProducts(SearchRequest request) {
        // Setup Sorting
        Sort sort =
                switch (request.getSortBy()) {
                    case "price" ->
                        Sort.by(
                                request.getSortDirection().equalsIgnoreCase("desc")
                                        ? Sort.Direction.DESC
                                        : Sort.Direction.ASC,
                                "currentPrice");
                    case "created" -> Sort.by(Sort.Direction.DESC, "createdAt");
                    default -> {
                        // If fetching ALL or COMPLETED, sorting by endTime DESC makes more sense (newest ended first)
                        // If fetching ACTIVE, sorting by endTime ASC makes sense (ending soonest first)
                        if (request.getStatus() == ProductStatus.COMPLETED || request.getStatus() == null) {
                            yield Sort.by(Sort.Direction.DESC, "endTime");
                        }
                        yield Sort.by(Sort.Direction.ASC, "endTime");
                    }
                };

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        // Handle Category Logic (Recursive)
        List<Long> categoryIds = null;
        if (request.getCategoryId() != null) {
            categoryIds = new ArrayList<>();
            categoryIds.add(request.getCategoryId());

            // Get all children categories
            List<Category> children = categoryRepository.findByParentId(request.getCategoryId());
            for (Category child : children) {
                categoryIds.add(child.getId());
            }
        }

        // Handle Keyword (Check for null or empty)
        String keyword =
                (request.getKeyword() != null && !request.getKeyword().trim().isEmpty())
                        ? request.getKeyword().trim()
                        : null;

        // Call the new universal repository method
        Page<Product> productPage = productRepository.findProductsWithFilters(
                request.getStatus(), // If null, it returns all statuses
                categoryIds, // If null, it searches all categories
                keyword, // If null, it ignores keyword
                pageable);

        return mapToPageResponse(productPage);
    }

    public List<ProductListDto> getTop5EndingSoon() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Product> products = productRepository.findTop5EndingSoon(LocalDateTime.now(), pageable);

        return products.stream().map(ProductMapper::toListDto).toList();
    }

    public List<ProductListDto> getTop5MostBids() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Product> products = productRepository.findTop5MostBids(LocalDateTime.now(), pageable);

        return products.stream().map(ProductMapper::toListDto).toList();
    }

    public List<ProductListDto> getTop5HighestPrice() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Product> products = productRepository.findTop5HighestPrice(LocalDateTime.now(), pageable);

        return products.stream().map(ProductMapper::toListDto).toList();
    }

    public List<ProductListDto> getRelatedProducts(Long productId) {
        Product product =
                productRepository.findById(productId).orElseThrow(() -> new NotFoundException("Product not found"));

        Pageable pageable = PageRequest.of(0, 5);
        List<Product> products = productRepository.findRelatedProducts(
                product.getCategory().getId(), productId, LocalDateTime.now(), pageable);

        return products.stream().map(ProductMapper::toListDto).toList();
    }

    public PageResponse<ProductListDto> getMyProducts(int page, int size) {
        Long sellerId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.findBySellerActive(sellerId, LocalDateTime.now(), pageable);

        return mapToPageResponse(productPage);
    }

    public PageResponse<ProductListDto> getMyWonProducts(int page, int size) {
        Long bidderId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("endTime").descending());
        Page<Product> productPage = productRepository.findProductsWonByBidder(bidderId, LocalDateTime.now(), pageable);

        return mapToPageResponse(productPage);
    }

    public PageResponse<ProductListDto> getMyBiddingProducts(int page, int size) {
        Long userId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("endTime").ascending());
        Page<Product> productPage = productRepository.findProductsBiddedByUser(userId, LocalDateTime.now(), pageable);

        return mapToPageResponse(productPage);
    }

    public void extendAuction(Long productId, int minutes) {
        Product product =
                productRepository.findById(productId).orElseThrow(() -> new NotFoundException("Product not found"));

        product.setEndTime(product.getEndTime().plusMinutes(minutes));
        productRepository.save(product);

        // Reschedule Quartz Job
        auctionSchedulerService.rescheduleAuctionClose(productId, product.getEndTime());

        log.info("Product {} extended by {} minutes", productId, minutes);
    }

    private PageResponse<ProductListDto> mapToPageResponse(Page<Product> productPage) {
        List<ProductListDto> content =
                productPage.getContent().stream().map(ProductMapper::toListDto).toList();

        return PageResponse.<ProductListDto>builder()
                .content(content)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Transactional
    public int cancelAllActiveProductsBySeller(Long sellerId) {
        // Fetch all active products by this seller
        List<Product> activeProducts = productRepository.findBySellerAndStatus(sellerId, ProductStatus.ACTIVE);

        int count = 0;
        for (Product product : activeProducts) {
            product.setStatus(ProductStatus.CANCELLED);
            product.setDescription(
                    product.getDescription() + "\n\n[SYSTEM]: Auction cancelled due to seller privilege expiration.");
            productRepository.save(product);

            // Notify current bidder if exists
            if (product.getCurrentBidder() != null) {
                // Return money logic if integrated with payment gateway
                notificationService.notifyOutbid(
                        product.getCurrentBidder().getId(), product.getId(), product.getName(), BigDecimal.ZERO);
            }

            // Unschedule the closing job for this product since it's cancelled
            auctionSchedulerService.unscheduleAuctionClose(product.getId());

            count++;
        }
        return count;
    }

    public ProductDto addProductImage(Long productId, MultipartFile file) {
        Long sellerId = CurrentUser.getUserId();
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.PRODUCT_NOT_FOUND));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new ForbiddenException("You can only update your own products");
        }

        String imageUrl = fileStorageService.storeFile(file);
        product.getImages().add(imageUrl);
        productRepository.save(product);

        log.info("Image added to product {}: {}", productId, imageUrl);
        return ProductMapper.toDto(product, sellerId, false);
    }

    public ProductDto removeProductImage(Long productId, String imageUrl) {
        Long sellerId = CurrentUser.getUserId();
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.PRODUCT_NOT_FOUND));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new ForbiddenException("You can only update your own products");
        }

        if (product.getImages().contains(imageUrl)) {
            product.getImages().remove(imageUrl);

            // Optionally delete from storage (if not used elsewhere)
            fileStorageService.deleteFile(imageUrl);

            productRepository.save(product);
        } else {
            throw new NotFoundException("Image not found in product");
        }

        log.info("Image removed from product {}: {}", productId, imageUrl);
        return ProductMapper.toDto(product, sellerId, false);
    }
}
