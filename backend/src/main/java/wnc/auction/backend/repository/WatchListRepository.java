package wnc.auction.backend.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.WatchList;

@Repository
public interface WatchListRepository extends JpaRepository<WatchList, Long> {

    @Query("SELECT w FROM WatchList w WHERE w.user.id = :userId")
    Page<WatchList> findByUserId(@Param("userId") Long userId, Pageable pageable);

    Optional<WatchList> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);

    long countByProductId(Long productId);
}
