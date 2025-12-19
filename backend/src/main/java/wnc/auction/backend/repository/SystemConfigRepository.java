package wnc.auction.backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import wnc.auction.backend.model.SystemConfig;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {

    Optional<SystemConfig> findByKey(String key);
}
