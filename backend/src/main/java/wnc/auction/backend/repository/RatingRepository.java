package wnc.auction.backend.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.Rating;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    @Query("SELECT r FROM Rating r WHERE r.user.id = :userId " + "ORDER BY r.createdAt DESC")
    Page<Rating> findByUserId(@Param("userId") Long userId, Pageable pageable);

    Optional<Rating> findByUserIdAndRatedByIdAndProductId(Long userId, Long ratedById, Long productId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE " + "r.user.id = :userId AND r.isPositive = true")
    int countPositiveRatings(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE " + "r.user.id = :userId AND r.isPositive = false")
    int countNegativeRatings(@Param("userId") Long userId);
}
