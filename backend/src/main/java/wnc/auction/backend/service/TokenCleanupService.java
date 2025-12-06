package wnc.auction.backend.service;

import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import wnc.auction.backend.repository.TokenBlacklistRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupService {

    private final TokenBlacklistRepository tokenBlacklistRepository;

    @Scheduled(cron = "${app.jobs.token-cleanup-cron:0 0 0 * * ?}")
    public void deleteExpiredTokens() {
        log.info("Job: Starting deletion of expired blacklisted tokens.");

        LocalDateTime now = LocalDateTime.now();

        int deletedCount = tokenBlacklistRepository.deleteExpiredTokens(now);

        if (deletedCount > 0) {
            log.info("Job: Deleted {} expired blacklisted tokens.", deletedCount);
        } else {
            log.info("Job: No expired blacklisted tokens to delete.");
        }
    }
}
