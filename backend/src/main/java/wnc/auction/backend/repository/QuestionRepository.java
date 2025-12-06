package wnc.auction.backend.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.Question;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("SELECT q FROM Question q WHERE q.product.id = :productId " + "ORDER BY q.createdAt DESC")
    List<Question> findByProductId(@Param("productId") Long productId);

    @Query("SELECT q FROM Question q WHERE q.user.id = :userId " + "ORDER BY q.createdAt DESC")
    Page<Question> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.product.seller.id = :sellerId " + "AND q.answer IS NULL "
            + "ORDER BY q.createdAt DESC")
    List<Question> findUnansweredQuestionsBySeller(@Param("sellerId") Long sellerId);
}
