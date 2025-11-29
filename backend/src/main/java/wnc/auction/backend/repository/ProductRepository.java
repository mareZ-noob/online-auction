package wnc.auction.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.Product;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Find active products
    @Query("SELECT p FROM Product p WHERE " +
            "p.status = 'ACTIVE' AND p.endTime > :now")
    Page<Product> findActiveProducts(@Param("now") LocalDateTime now, Pageable pageable);

    // Find by category
    @Query("SELECT p FROM Product p WHERE " +
            "p.category.id = :categoryId AND " +
            "p.status = 'ACTIVE' AND p.endTime > :now")
    Page<Product> findByCategoryAndActive(@Param("categoryId") Long categoryId,
                                          @Param("now") LocalDateTime now,
                                          Pageable pageable);

    // Full-text search
    @Query("SELECT p FROM Product p WHERE " +
            "p.status = 'ACTIVE' AND p.endTime > :now AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword,
                                 @Param("now") LocalDateTime now,
                                 Pageable pageable);

    // Search by category and keyword
    @Query("SELECT p FROM Product p WHERE " +
            "p.category.id = :categoryId AND " +
            "p.status = 'ACTIVE' AND p.endTime > :now AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProductsByCategory(@Param("categoryId") Long categoryId,
                                           @Param("keyword") String keyword,
                                           @Param("now") LocalDateTime now,
                                           Pageable pageable);

    // Top 5 ending soon
    @Query("SELECT p FROM Product p WHERE " +
            "p.status = 'ACTIVE' AND p.endTime > :now " +
            "ORDER BY p.endTime ASC")
    List<Product> findTop5EndingSoon(@Param("now") LocalDateTime now, Pageable pageable);

    // Top 5 most bids
    @Query("SELECT p FROM Product p WHERE " +
            "p.status = 'ACTIVE' AND p.endTime > :now " +
            "ORDER BY p.bidCount DESC")
    List<Product> findTop5MostBids(@Param("now") LocalDateTime now, Pageable pageable);

    // Top 5 highest price
    @Query("SELECT p FROM Product p WHERE " +
            "p.status = 'ACTIVE' AND p.endTime > :now " +
            "ORDER BY p.currentPrice DESC")
    List<Product> findTop5HighestPrice(@Param("now") LocalDateTime now, Pageable pageable);

    // Products by seller
    @Query("SELECT p FROM Product p WHERE " +
            "p.seller.id = :sellerId AND " +
            "p.status = 'ACTIVE' AND p.endTime > :now")
    Page<Product> findBySellerActive(@Param("sellerId") Long sellerId,
                                     @Param("now") LocalDateTime now,
                                     Pageable pageable);

    // Products won by bidder
    @Query("SELECT p FROM Product p WHERE " +
            "p.currentBidder.id = :bidderId AND " +
            "p.status = 'COMPLETED' AND p.endTime < :now")
    Page<Product> findProductsWonByBidder(@Param("bidderId") Long bidderId,
                                          @Param("now") LocalDateTime now,
                                          Pageable pageable);

    // Products bidded by user
    @Query("SELECT DISTINCT p FROM Product p " +
            "JOIN p.bids b WHERE b.user.id = :userId AND " +
            "p.status = 'ACTIVE' AND p.endTime > :now")
    Page<Product> findProductsBiddedByUser(@Param("userId") Long userId,
                                           @Param("now") LocalDateTime now,
                                           Pageable pageable);

    // Find products ending soon for auto-extend check
    @Query("SELECT p FROM Product p WHERE " +
            "p.status = 'ACTIVE' AND " +
            "p.autoExtend = true AND " +
            "p.endTime BETWEEN :now AND :threshold")
    List<Product> findProductsForAutoExtend(@Param("now") LocalDateTime now,
                                            @Param("threshold") LocalDateTime threshold);

    // Find completed products without winner
    @Query("SELECT p FROM Product p WHERE " +
            "p.status = 'ACTIVE' AND " +
            "p.endTime < :now")
    List<Product> findExpiredProducts(@Param("now") LocalDateTime now);

    // Related products in same category
    @Query("SELECT p FROM Product p WHERE " +
            "p.category.id = :categoryId AND " +
            "p.id != :productId AND " +
            "p.status = 'ACTIVE' AND p.endTime > :now " +
            "ORDER BY p.createdAt DESC")
    List<Product> findRelatedProducts(@Param("categoryId") Long categoryId,
                                      @Param("productId") Long productId,
                                      @Param("now") LocalDateTime now,
                                      Pageable pageable);
}
