package wnc.auction.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.BlockedBidder;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockedBidderRepository extends JpaRepository<BlockedBidder, Long> {

    boolean existsByProductIdAndBidderId(Long productId, Long bidderId);

    Optional<BlockedBidder> findByProductIdAndBidderId(Long productId, Long bidderId);

    @Query("SELECT bb FROM BlockedBidder bb WHERE bb.product.id = :productId")
    List<BlockedBidder> findByProductId(@Param("productId") Long productId);
}
