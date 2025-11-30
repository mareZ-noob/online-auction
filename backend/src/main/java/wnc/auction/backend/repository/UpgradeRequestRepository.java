package wnc.auction.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.UpgradeRequest;

import java.util.List;
import java.util.Optional;

@Repository
public interface UpgradeRequestRepository extends JpaRepository<UpgradeRequest, Long> {

    @Query("SELECT ur FROM UpgradeRequest ur WHERE ur.status = 'PENDING' " +
            "ORDER BY ur.createdAt ASC")
    Page<UpgradeRequest> findPendingRequests(Pageable pageable);

    @Query("SELECT ur FROM UpgradeRequest ur WHERE ur.user.id = :userId " +
            "ORDER BY ur.createdAt DESC")
    List<UpgradeRequest> findByUserId(@Param("userId") Long userId);

    @Query("SELECT ur FROM UpgradeRequest ur WHERE ur.user.id = :userId " +
            "AND ur.status = 'PENDING'")
    Optional<UpgradeRequest> findPendingRequestByUserId(@Param("userId") Long userId);
}
