package wnc.auction.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.UserDto;
import wnc.auction.backend.dto.response.AuctionConfigResponse;
import wnc.auction.backend.dto.response.ChartDataPoint;
import wnc.auction.backend.dto.response.DashboardStats;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.UserMapper;
import wnc.auction.backend.model.Product;
import wnc.auction.backend.model.Transaction;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.ProductStatus;
import wnc.auction.backend.model.enumeration.TransactionStatus;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UpgradeRequestRepository upgradeRequestRepository;
    private final SystemConfigService systemConfigService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public DashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalBidders = userRepository.findByRole(UserRole.BIDDER).size();
        long totalSellers = userRepository.findByRole(UserRole.SELLER).size();
        long totalProducts = productRepository.count();

        long activeProducts = productRepository
                .findActiveProducts(LocalDateTime.now(), PageRequest.of(0, Integer.MAX_VALUE))
                .getTotalElements();

        long completedProducts = totalProducts - activeProducts;

        // Calculate total revenue (sum of all completed transactions)
        List<Transaction> completedTransactions = transactionRepository.findByStatus(TransactionStatus.DELIVERED);
        BigDecimal totalRevenue =
                completedTransactions.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        // New users this month
        LocalDateTime monthStart =
                LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newUsersThisMonth = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt().isAfter(monthStart))
                .count();

        // New products this month
        long newProductsThisMonth = productRepository.findAll().stream()
                .filter(p -> p.getCreatedAt().isAfter(monthStart))
                .count();

        // Pending upgrade requests
        long upgradeRequestsPending = upgradeRequestRepository
                .findPendingRequests(PageRequest.of(0, Integer.MAX_VALUE))
                .getTotalElements();

        return DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalBidders(totalBidders)
                .totalSellers(totalSellers)
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .completedProducts(completedProducts)
                .totalRevenue(totalRevenue)
                .newUsersThisMonth(newUsersThisMonth)
                .newProductsThisMonth(newProductsThisMonth)
                .upgradeRequestsPending(upgradeRequestsPending)
                .build();
    }

    public PageResponse<UserDto> getAllUsers(int page, int size, String keyword, UserRole role) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.searchUsers(keyword, role, pageable);

        List<UserDto> content =
                userPage.getContent().stream().map(UserMapper::toDto).toList();

        return PageResponse.<UserDto>builder()
                .content(content)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    public void deleteProduct(Long productId) {
        Product product =
                productRepository.findById(productId).orElseThrow(() -> new NotFoundException("Product not found"));

        product.setStatus(ProductStatus.CANCELLED);
        productRepository.save(product);

        log.info("Product {} removed by admin", productId);
    }

    public List<ChartDataPoint> getChartStats(String type) {
        List<ChartDataPoint> stats = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        if ("MONTHLY".equalsIgnoreCase(type)) {
            // Get stats for the last 12 months
            for (int i = 11; i >= 0; i--) {
                LocalDateTime start = now.minusMonths(i)
                        .withDayOfMonth(1)
                        .withHour(0)
                        .withMinute(0)
                        .withSecond(0);
                LocalDateTime end = start.plusMonths(1).minusSeconds(1);

                String label = start.getMonthValue() + "/" + start.getYear();
                stats.add(collectStats(label, start, end));
            }
        } else if ("YEARLY".equalsIgnoreCase(type)) {
            // Get stats for the last 5 years
            for (int i = 4; i >= 0; i--) {
                LocalDateTime start = now.minusYears(i)
                        .withDayOfYear(1)
                        .withHour(0)
                        .withMinute(0)
                        .withSecond(0);
                LocalDateTime end = start.plusYears(1).minusSeconds(1);

                String label = String.valueOf(start.getYear());
                stats.add(collectStats(label, start, end));
            }
        }

        return stats;
    }

    private ChartDataPoint collectStats(String label, LocalDateTime start, LocalDateTime end) {
        long newUsers = userRepository.countByCreatedAtBetween(start, end);
        long newProducts = productRepository.countByCreatedAtBetween(start, end);

        List<Transaction> transactions = transactionRepository.findCompletedTransactionsInPeriod(start, end);
        BigDecimal revenue = transactions.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return ChartDataPoint.builder()
                .label(label)
                .newUsers(newUsers)
                .newProducts(newProducts)
                .revenue(revenue)
                .build();
    }

    public AuctionConfigResponse getAuctionConfig() {
        int threshold = systemConfigService.getIntConfig("AUCTION_EXTEND_THRESHOLD", 5);
        int duration = systemConfigService.getIntConfig("AUCTION_EXTEND_DURATION", 10);

        return AuctionConfigResponse.builder()
                .thresholdMinutes(threshold)
                .durationMinutes(duration)
                .build();
    }

    public void updateAuctionConfig(int threshold, int duration) {
        systemConfigService.updateConfig("AUCTION_EXTEND_THRESHOLD", String.valueOf(threshold));
        systemConfigService.updateConfig("AUCTION_EXTEND_DURATION", String.valueOf(duration));
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        // Soft delete by marking as inactive
        user.setIsActive(false);
        userRepository.save(user);

        log.info("User {} (email: {}) deleted by admin", userId, user.getEmail());
    }

    public String resetUserPassword(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));

        // Generate a random temporary password
        String tempPassword = generateTemporaryPassword();

        // Encode and save the new password
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);

        // Send email notification to user
        emailService.sendPasswordResetNotification(userId, tempPassword);

        log.info("Password reset for user {} (email: {}) by admin", userId, user.getEmail());

        return tempPassword;
    }

    private String generateTemporaryPassword() {
        // Generate a secure random password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder password = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }
}
