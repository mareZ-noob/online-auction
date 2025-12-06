package wnc.auction.backend.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import wnc.auction.backend.service.UserService;

@Component
@RequiredArgsConstructor
@Slf4j
public class TokenCleanupScheduler {

    private final UserService userService;

    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredTokens() {
        log.info("Starting scheduled cleanup of expired blacklisted tokens");
        userService.cleanupExpiredBlacklistedTokens();
    }
}
