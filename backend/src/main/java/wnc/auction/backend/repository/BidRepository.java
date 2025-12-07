package wnc.auction.backend.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.Bid;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    @Query("SELECT b FROM Bid b WHERE b.product.id = :productId " + "ORDER BY b.amount DESC, b.createdAt ASC")
    List<Bid> findByProductOrderByAmountDesc(@Param("productId") Long productId);

    @Query("SELECT b FROM Bid b WHERE b.product.id = :productId " + "ORDER BY b.createdAt DESC")
    Page<Bid> findByProductOrderByCreatedAtDesc(@Param("productId") Long productId, Pageable pageable);

    List<Bid> findByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT b FROM Bid b WHERE b.user.id = :userId " + "ORDER BY b.createdAt DESC")
    Page<Bid> findByUserOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    // Get highest bid for a product
    @Query("SELECT b FROM Bid b WHERE b.product.id = :productId " + "ORDER BY b.amount DESC, b.createdAt ASC")
    List<Bid> findHighestBidForProduct(@Param("productId") Long productId, Pageable pageable);

    // Get second highest bid
    @Query("SELECT b FROM Bid b WHERE b.product.id = :productId " + "ORDER BY b.amount DESC, b.createdAt ASC")
    List<Bid> findTop2BidsForProduct(@Param("productId") Long productId, Pageable pageable);

    // Find people enabled Auto-bid
    @Query("SELECT b FROM Bid b WHERE b.product.id = :productId AND b.user.id <> :userId AND b.isAutoBid = true")
    List<Bid> findByProductAndUserNotAndIsAutoBidTrue(@Param("productId") Long productId, @Param("userId") Long userId);
}
