package wnc.auction.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.Transaction;
import wnc.auction.backend.model.enumeration.TransactionStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByProductId(Long productId);

    @Query("SELECT t FROM Transaction t WHERE t.buyer.id = :buyerId " +
            "ORDER BY t.createdAt DESC")
    Page<Transaction> findByBuyerId(@Param("buyerId") Long buyerId,
                                    Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.seller.id = :sellerId " +
            "ORDER BY t.createdAt DESC")
    Page<Transaction> findBySellerId(@Param("sellerId") Long sellerId,
                                     Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.status = :status")
    List<Transaction> findByStatus(@Param("status") TransactionStatus status);
}
