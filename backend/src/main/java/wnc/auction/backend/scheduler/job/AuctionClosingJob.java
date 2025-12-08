package wnc.auction.backend.scheduler.job;

import java.math.BigDecimal;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.model.Product;
import wnc.auction.backend.model.enumeration.ProductStatus;
import wnc.auction.backend.repository.ProductRepository;
import wnc.auction.backend.service.EmailService;
import wnc.auction.backend.service.NotificationService;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuctionClosingJob extends QuartzJobBean {

    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        JobDataMap dataMap = context.getJobDetail().getJobDataMap();
        Long productId = dataMap.getLong("productId");

        log.info("Quartz Job: Executing auction closure for product ID: {}", productId);

        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            log.warn("Product {} not found during job execution", productId);
            return;
        }

        Product product = productOpt.get();

        // Double check status and time (to avoid race conditions)
        if (product.getStatus() != ProductStatus.ACTIVE) {
            log.info("Product {} is already closed or cancelled", productId);
            return;
        }

        // Close the auction
        product.setStatus(ProductStatus.COMPLETED);
        productRepository.save(product);

        // Notify Logic
        handleNotifications(product);

        log.info("Auction {} closed successfully via Quartz.", productId);
    }

    private void handleNotifications(Product product) {
        BigDecimal finalPrice = product.getCurrentPrice();
        String productName = product.getName();
        Long sellerId = product.getSeller().getId();

        if (product.getCurrentBidder() != null) {
            Long winnerId = product.getCurrentBidder().getId();

            // Notify Winner
            emailService.sendAuctionEndedNotification(
                    winnerId, product.getId(), productName, true, finalPrice.toString());
            notificationService.notifyAuctionEnded(winnerId, product.getId(), productName, true, finalPrice);

            // Notify Seller (Success)
            emailService.sendAuctionEndedNotification(
                    sellerId, product.getId(), productName, false, finalPrice.toString());
            notificationService.notifyAuctionEnded(sellerId, product.getId(), productName, false, finalPrice);
        } else {
            // Notify Seller (Fail - No bids)
            emailService.sendAuctionEndedNotification(sellerId, product.getId(), productName, false, "0");
            notificationService.notifyAuctionEnded(sellerId, product.getId(), productName, false, BigDecimal.ZERO);
        }
    }
}
