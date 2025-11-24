package wnc.auction.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wnc.auction.backend.model.Otp;
import wnc.auction.backend.model.enumeration.OtpType;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {

    @Query("SELECT o FROM Otp o WHERE " +
            "o.email = :email AND " +
            "o.code = :code AND " +
            "o.type = :type AND " +
            "o.used = false AND " +
            "o.expiresAt > :now")
    Optional<Otp> findValidOtp(@Param("email") String email,
                               @Param("code") String code,
                               @Param("type") OtpType type,
                               @Param("now") LocalDateTime now);

    void deleteByEmailAndType(String email, OtpType type);
}