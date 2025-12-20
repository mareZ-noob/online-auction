package wnc.auction.backend.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE m.transaction.id = :transactionId " + "ORDER BY m.createdAt ASC")
    List<ChatMessage> findByTransactionId(@Param("transactionId") Long transactionId);

    @Query("SELECT m FROM ChatMessage m WHERE m.transaction.id = :transactionId " + "ORDER BY m.createdAt DESC")
    Page<ChatMessage> findByTransactionIdPaged(@Param("transactionId") Long transactionId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE " + "m.transaction.id = :transactionId AND "
            + "m.sender.id != :userId AND "
            + "m.isRead = false")
    long countUnreadMessages(@Param("transactionId") Long transactionId, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE " + "m.transaction.id = :transactionId AND "
            + "m.sender.id != :userId AND "
            + "m.isRead = false")
    void markMessagesAsRead(@Param("transactionId") Long transactionId, @Param("userId") Long userId);
}
