package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final WatchListRepository watchListRepository;
    private final BlockedBidderRepository blockedBidderRepository;
    private final BidRepository bidRepository;
    private final EmailService emailService;

    @Value("${app.auction.new-product-highlight-minutes}")
    private int newProductHighlightMinutes;

    public ProductDto createProduct(CreateProductRequest request) {
        Long sellerId = CurrentUser.getUserId();
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new NotFoundException("Seller not found"));

        if (seller.getRole() != UserRole.SELLER && seller.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Only sellers can create products");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
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

        log.info("Product created: {} by seller: {}", product.getId(), sellerId);
        return ProductMapper.toDto(product, sellerId);
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Long currentUserId = CurrentUser.getUserId();
        return ProductMapper.toDto(product, currentUserId);
    }

    public ProductDto updateProductDescription(Long id, UpdateProductDescriptionRequest request) {
        Long sellerId = CurrentUser.getUserId();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new ForbiddenException("You can only update your own products");
        }

        // Append to description history
        DescriptionUpdate update = new DescriptionUpdate(
                request.getAdditionalDescription(),
                LocalDateTime.now()
        );
        product.getDescriptionHistory().add(update);

        // Append to main description
        String updatedDescription = product.getDescription() + "\n\n✏️ " +
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                "\n\n- " + request.getAdditionalDescription();
        product.setDescription(updatedDescription);

        product = productRepository.save(product);

        log.info("Product description updated: {}", id);
        return ProductMapper.toDto(product, sellerId);
    }

    public void deleteProduct(Long id) {
        Long sellerId = CurrentUser.getUserId();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

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
        Page<Product> productPage = productRepository.findActiveProducts(
                LocalDateTime.now(), pageable
        );

        return mapToPageResponse(productPage);
    }

    public PageResponse<ProductListDto> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.findByCategoryAndActive(
                categoryId, LocalDateTime.now(), pageable
        );

        return mapToPageResponse(productPage);
    }

    public PageResponse<ProductListDto> searchProducts(SearchRequest request) {
        // Setup Sorting
        Sort sort = switch (request.getSortBy()) {
            case "price" -> Sort.by(request.getSortDirection().equalsIgnoreCase("desc") ?
                    Sort.Direction.DESC : Sort.Direction.ASC, "currentPrice");
            case "created" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.ASC, "endTime");
        };

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);
        Page<Product> productPage;

        // Search Logic
        if (request.getCategoryId() != null) {
            // Search within a specific Category (and its children)
            List<Long> categoryIds = new ArrayList<>();
            categoryIds.add(request.getCategoryId());

            // Recursive: Add sub-categories IDs
            List<Category> children = categoryRepository.findByParentId(request.getCategoryId());
            for (Category child : children) {
                categoryIds.add(child.getId());
            }

            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                // Search by Keyword within Category List
                productPage = productRepository.searchProductsByCategoryIds(
                        categoryIds,
                        request.getKeyword(),
                        LocalDateTime.now(),
                        pageable
                );
            } else {
                // Filter by Category List only
                productPage = productRepository.findByCategoryIdsAndActive(
                        categoryIds,
                        LocalDateTime.now(),
                        pageable
                );
            }
        } else {
            // Global Search (No Category selected)
            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                // Search globally by Keyword
                productPage = productRepository.searchProducts(
                        request.getKeyword(),
                        LocalDateTime.now(),
                        pageable
                );
            } else {
                // No filters applied -> Get all active products
                productPage = productRepository.findActiveProducts(
                        LocalDateTime.now(),
                        pageable
                );
            }
        }

        return mapToPageResponse(productPage);
    }

    public List<ProductListDto> getTop5EndingSoon() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Product> products = productRepository.findTop5EndingSoon(
                LocalDateTime.now(), pageable
        );

        return products.stream()
                .map(ProductMapper::toListDto)
                .toList();
    }

    public List<ProductListDto> getTop5MostBids() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Product> products = productRepository.findTop5MostBids(
                LocalDateTime.now(), pageable
        );

        return products.stream()
                .map(ProductMapper::toListDto)
                .toList();
    }

    public List<ProductListDto> getTop5HighestPrice() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Product> products = productRepository.findTop5HighestPrice(
                LocalDateTime.now(), pageable
        );

        return products.stream()
                .map(ProductMapper::toListDto)
                .toList();
    }

    public List<ProductListDto> getRelatedProducts(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Pageable pageable = PageRequest.of(0, 5);
        List<Product> products = productRepository.findRelatedProducts(
                product.getCategory().getId(),
                productId,
                LocalDateTime.now(),
                pageable
        );

        return products.stream()
                .map(ProductMapper::toListDto)
                .toList();
    }

    public PageResponse<ProductListDto> getMyProducts(int page, int size) {
        Long sellerId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Product> productPage = productRepository.findBySellerActive(
                sellerId, LocalDateTime.now(), pageable
        );

        return mapToPageResponse(productPage);
    }

    public PageResponse<ProductListDto> getMyWonProducts(int page, int size) {
        Long bidderId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("endTime").descending());
        Page<Product> productPage = productRepository.findProductsWonByBidder(
                bidderId, LocalDateTime.now(), pageable
        );

        return mapToPageResponse(productPage);
    }

    public PageResponse<ProductListDto> getMyBiddingProducts(int page, int size) {
        Long userId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("endTime").ascending());
        Page<Product> productPage = productRepository.findProductsBiddedByUser(
                userId, LocalDateTime.now(), pageable
        );

        return mapToPageResponse(productPage);
    }

    public void extendAuction(Long productId, int minutes) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        product.setEndTime(product.getEndTime().plusMinutes(minutes));
        productRepository.save(product);

        log.info("Product {} extended by {} minutes", productId, minutes);
    }

    private PageResponse<ProductListDto> mapToPageResponse(Page<Product> productPage) {
        List<ProductListDto> content = productPage.getContent().stream()
                .map(ProductMapper::toListDto)
                .toList();

        return PageResponse.<ProductListDto>builder()
                .content(content)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }
}
