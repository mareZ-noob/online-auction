package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.UserDto;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    public DashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalBidders = userRepository.findByRole(UserRole.BIDDER).size();
        long totalSellers = userRepository.findByRole(UserRole.SELLER).size();
        long totalProducts = productRepository.count();

        long activeProducts = productRepository.findActiveProducts(
            LocalDateTime.now(), PageRequest.of(0, Integer.MAX_VALUE)
        ).getTotalElements();

        long completedProducts = totalProducts - activeProducts;

        // Calculate total revenue (sum of all completed transactions)
        List<Transaction> completedTransactions = transactionRepository
                .findByStatus(TransactionStatus.DELIVERED);
        BigDecimal totalRevenue = completedTransactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // New users this month
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0);
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

    public PageResponse<UserDto> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage = userRepository.findAll(pageable);

        List<UserDto> content = userPage.getContent().stream()
                .map(UserMapper::toDto)
                .toList();

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
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        product.setStatus(ProductStatus.CANCELLED);
        productRepository.save(product);

        log.info("Product {} removed by admin", productId);
    }
}
