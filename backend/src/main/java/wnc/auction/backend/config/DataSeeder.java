package wnc.auction.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.model.Category;
import wnc.auction.backend.model.Product;
import wnc.auction.backend.model.SocialAccount;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.AuthProvider;
import wnc.auction.backend.model.enumeration.ProductStatus;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.CategoryRepository;
import wnc.auction.backend.repository.ProductRepository;
import wnc.auction.backend.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Check if data already exists to avoid duplication
        if (userRepository.count() == 0) {
            log.info("Start seeding initial data...");
            seedData();
            log.info("Data seeding completed.");
        }
    }

    private void seedData() {
        // Create Users
        // Admin
        User admin = User.builder()
                .email("admin@auction.com")
                .password(passwordEncoder.encode("1"))
                .fullName("System Administrator")
                .address("123 Admin St")
                .role(UserRole.ADMIN)
                .socialAccounts(new ArrayList<>())
                .emailVerified(true)
                .isActive(true)
                .positiveRatings(0)
                .negativeRatings(0)
                .build();

        SocialAccount adminLocal = SocialAccount.builder()
                .provider(AuthProvider.LOCAL)
                .providerId("admin@auction.com")
                .email("admin@auction.com")
                .name("System Administrator")
                .user(admin)
                .build();

        admin.getSocialAccounts().add(adminLocal);

        // Seller
        User seller = User.builder()
                .email("seller@auction.com")
                .password(passwordEncoder.encode("1"))
                .fullName("John Seller")
                .address("456 Market St")
                .role(UserRole.SELLER)
                .socialAccounts(new ArrayList<>())
                .emailVerified(true)
                .isActive(true)
                .positiveRatings(10)
                .negativeRatings(0)
                .build();

        SocialAccount sellerLocal = SocialAccount.builder()
                .provider(AuthProvider.LOCAL)
                .providerId("seller@auction.com")
                .email("seller@auction.com")
                .name("John Seller")
                .user(seller)
                .build();

        seller.getSocialAccounts().add(sellerLocal);

        // Bidder
        User bidder = User.builder()
                .email("bidder@auction.com")
                .password(passwordEncoder.encode("1"))
                .fullName("Alice Bidder")
                .address("789 Auction Rd")
                .role(UserRole.BIDDER)
                .socialAccounts(new ArrayList<>())
                .emailVerified(true)
                .isActive(true)
                .positiveRatings(5)
                .negativeRatings(0)
                .build();

        SocialAccount bidderLocal = SocialAccount.builder()
                .provider(AuthProvider.LOCAL)
                .providerId("bidder@auction.com")
                .email("bidder@auction.com")
                .name("Alice Bidder")
                .user(bidder)
                .build();

        bidder.getSocialAccounts().add(bidderLocal);

        userRepository.saveAll(Arrays.asList(admin, seller, bidder));

        // Create Categories
        // Parent: Electronics
        Category electronics = Category.builder()
                .name("Electronics")
                .description("Electronic devices and gadgets")
                .parent(null)
                .build();
        electronics = categoryRepository.save(electronics);

        // Child: Laptops (Parent: Electronics)
        Category laptops = Category.builder()
                .name("Laptops")
                .description("Notebooks and gaming laptops")
                .parent(electronics)
                .build();

        // Child: Smartphones (Parent: Electronics)
        Category smartphones = Category.builder()
                .name("Smartphones")
                .description("Mobile phones")
                .parent(electronics)
                .build();

        // Parent: Fashion
        Category fashion = Category.builder()
                .name("Fashion")
                .description("Clothing and accessories")
                .parent(null)
                .build();
        fashion = categoryRepository.save(fashion);

        // Child: Men's Wear
        Category mensWear = Category.builder()
                .name("Men's Wear")
                .description("Clothing for men")
                .parent(fashion)
                .build();

        categoryRepository.saveAll(Arrays.asList(laptops, smartphones, mensWear));

        // Create Products
        List<String> sampleImages = new ArrayList<>();
        sampleImages.add("https://example.com/image1.jpg");
        sampleImages.add("https://example.com/image2.jpg");
        sampleImages.add("https://example.com/image3.jpg");

        // Product 1: iPhone 15 (Active)
        Product iphone = Product.builder()
                .name("iPhone 15 Pro Max")
                .description("Brand new, sealed box. 256GB storage.")
                .startingPrice(new BigDecimal("1000.00"))
                .currentPrice(new BigDecimal("1000.00"))
                .stepPrice(new BigDecimal("50.00"))
                .buyNowPrice(new BigDecimal("1500.00"))
                .category(smartphones)
                .seller(seller)
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusDays(3)) // Ends in 3 days
                .autoExtend(true)
                .allowUnratedBidders(true)
                .status(ProductStatus.ACTIVE)
                .bidCount(0)
                .images(sampleImages)
                .descriptionHistory(new ArrayList<>())
                .build();

        // Product 2: MacBook Pro (Active)
        Product macbook = Product.builder()
                .name("MacBook Pro M3")
                .description("Used for 1 month, like new.")
                .startingPrice(new BigDecimal("2000.00"))
                .currentPrice(new BigDecimal("2000.00"))
                .stepPrice(new BigDecimal("100.00"))
                .buyNowPrice(new BigDecimal("2800.00"))
                .category(laptops)
                .seller(seller)
                .startTime(LocalDateTime.now())
                .endTime(LocalDateTime.now().plusDays(7)) // Ends in 7 days
                .autoExtend(false)
                .allowUnratedBidders(false)
                .status(ProductStatus.ACTIVE)
                .bidCount(0)
                .images(sampleImages)
                .descriptionHistory(new ArrayList<>())
                .build();

        // Product 3: Vintage Jacket (Ending Soon)
        Product jacket = Product.builder()
                .name("Vintage Leather Jacket")
                .description("Classic style, size L.")
                .startingPrice(new BigDecimal("50.00"))
                .currentPrice(new BigDecimal("50.00"))
                .stepPrice(new BigDecimal("5.00"))
                .category(mensWear)
                .seller(seller)
                .startTime(LocalDateTime.now().minusDays(2))
                .endTime(LocalDateTime.now().plusHours(2)) // Ends in 2 hours
                .autoExtend(true)
                .allowUnratedBidders(true)
                .status(ProductStatus.ACTIVE)
                .bidCount(0)
                .images(sampleImages)
                .descriptionHistory(new ArrayList<>())
                .build();

        productRepository.saveAll(Arrays.asList(iphone, macbook, jacket));
    }
}
