package wnc.auction.backend.scheduler.job;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.service.EmailService;
import wnc.auction.backend.service.NotificationService;
import wnc.auction.backend.service.ProductService;

@Component
@Slf4j
@RequiredArgsConstructor
public class SellerRoleExpirationJob extends QuartzJobBean {

    private final UserRepository userRepository;
    private final ProductService productService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    @Transactional
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        JobDataMap dataMap = context.getJobDetail().getJobDataMap();
        Long userId = dataMap.getLong("userId");

        log.info("Quartz Job: Executing seller role expiration for User ID: {}", userId);

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("User {} not found during role expiration job", userId);
            return;
        }

        // Downgrade User Role
        if (user.getRole() == UserRole.SELLER) {
            user.setRole(UserRole.BIDDER);
            user.setRoleExpirationDate(null); // Clear expiration
            userRepository.save(user);
            log.info("User {} downgraded to BIDDER successfully.", userId);

            // Exception Handling: Cancel all ACTIVE products
            // If user is no longer a seller, they cannot have active auctions.
            int cancelledCount = productService.cancelAllActiveProductsBySeller(userId);
            log.info("Cancelled {} active products for user {}", cancelledCount, userId);

            // Notify User
            notificationService.sendUserNotification(
                    userId, "SYSTEM_MESSAGE", "Your seller privileges have expired (7 days limit).");
            emailService.sendRoleExpirationEmail(userId);
        }
    }
}
