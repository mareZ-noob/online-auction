package wnc.auction.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.BidDto;
import wnc.auction.backend.dto.model.BidHistoryDto;
import wnc.auction.backend.dto.request.PlaceBidRequest;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.ForbiddenException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.BidMapper;
import wnc.auction.backend.model.Bid;
import wnc.auction.backend.model.BlockedBidder;
import wnc.auction.backend.model.Product;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.ProductStatus;
import wnc.auction.backend.repository.BidRepository;
import wnc.auction.backend.repository.BlockedBidderRepository;
import wnc.auction.backend.repository.ProductRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.utils.Constants;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BidService {

    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final BlockedBidderRepository blockedBidderRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AuctionSchedulerService auctionSchedulerService;
    private final TransactionService transactionService;
    private final SystemConfigService systemConfigService;

    private static final String CONFIG_EXTEND_THRESHOLD = "AUCTION_EXTEND_THRESHOLD";
    private static final String CONFIG_EXTEND_DURATION = "AUCTION_EXTEND_DURATION";

    public BidDto placeBid(PlaceBidRequest request) {
        // Fetch User and Product
        Long bidderId = CurrentUser.getUserId();
        User bidder = userRepository
                .findById(bidderId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.PRODUCT_NOT_FOUND));

        // Validate (Updated to allow current winner to update Auto-Bid)
        validateBid(bidder, product, request.getAmount(), request.getMaxAutoBidAmount());

        // Determine Bid Amount
        boolean isAutoBid = request.getMaxAutoBidAmount() != null;
        BigDecimal bidAmount = request.getAmount();

        if (product.getBuyNowPrice() != null && bidAmount.compareTo(product.getBuyNowPrice()) >= 0) {
            return processBuyNow(product, bidder, bidAmount);
        }

        // Calculate Minimum Requirement
        BigDecimal minBid = product.getCurrentPrice().add(product.getStepPrice());
        if (product.getBidCount() == 0) {
            minBid = product.getStartingPrice();
        }

        if (bidAmount.compareTo(minBid) < 0) {
            throw new BadRequestException("Bid must be at least: " + minBid);
        }

        // Get previous highest bidder for notification
        User previousBidder = product.getCurrentBidder();

        // Save the Manual Bid
        Bid bid = createAndSaveBid(product, bidder, bidAmount, request.getMaxAutoBidAmount(), isAutoBid);

        // Check Auto-Extend Logic (Quartz)
        checkAndTriggerAutoExtend(product);

        // Send Notifications for the manual bid
        // Ensure the manual bidder gets confirmation
        sendBidNotifications(product, bidder, previousBidder, bidAmount);

        // Trigger Reactive Auto-Bidding
        // Check if any previous bidders have an auto-bid that beats this new bid
        triggerReactiveAutoBid(product, bid);

        log.info("Bid placed: {} on product: {} by user: {}", bidAmount, product.getId(), bidderId);

        return BidMapper.toDto(bid);
    }

    private BidDto processBuyNow(Product product, User bidder, BigDecimal amount) {
        // Create the winning bid
        // We force isAutoBid = false because this is a direct buy action
        Bid bid = createAndSaveBid(product, bidder, amount, null, false);

        // Close the auction immediately
        product.setStatus(ProductStatus.COMPLETED);
        product.setEndTime(LocalDateTime.now()); // Update end time to now
        productRepository.save(product);

        // If win then create transaction
        transactionService.createTransaction(product.getId());

        // Unschedule the pending closing job (Important to avoid double processing)
        auctionSchedulerService.unscheduleAuctionClose(product.getId());

        // Send Immediate Notifications (Winner & Seller)
        handleAuctionEndNotifications(product, bidder, amount);

        log.info("Product {} sold via Buy Now to user {}", product.getId(), bidder.getId());

        return BidMapper.toDto(bid);
    }

    private void handleAuctionEndNotifications(Product product, User winner, BigDecimal finalAmount) {
        // Notify Winner
        emailService.sendAuctionEndedNotification(
                winner.getId(), product.getId(), product.getName(), true, finalAmount.toString());
        notificationService.notifyAuctionEnded(winner.getId(), product.getId(), product.getName(), true, finalAmount);

        // Notify Seller
        emailService.sendAuctionEndedNotification(
                product.getSeller().getId(), product.getId(), product.getName(), false, finalAmount.toString());
        notificationService.notifyAuctionEnded(
                product.getSeller().getId(), product.getId(), product.getName(), false, finalAmount);

        // Broadcast to everyone watching the product (Public Product Stream)
        notificationService.broadcastAuctionEnded(
                product.getId(), product.getName(), winner.getFullName(), finalAmount);
    }

    private Bid createAndSaveBid(Product product, User bidder, BigDecimal amount, BigDecimal maxAuto, Boolean isAuto) {
        Bid bid = Bid.builder()
                .product(product)
                .user(bidder)
                .amount(amount)
                .maxAutoBidAmount(maxAuto)
                .isAutoBid(isAuto != null && isAuto)
                .build();

        bid = bidRepository.save(bid);

        // Update product info
        product.setCurrentPrice(amount);
        product.setCurrentBidder(bidder);
        product.setBidCount(product.getBidCount() + 1);
        productRepository.save(product);

        // Emit real-time event via Socket
        notificationService.sendBidUpdate(product.getId(), amount, bidder.getFullName());

        return bid;
    }

    private void triggerReactiveAutoBid(Product product, Bid incomingBid) {
        // Fetch competitor list (all history with auto-bid enabled)
        List<Bid> allCompetitorBids = bidRepository.findByProductAndUserNotAndIsAutoBidTrue(
                product.getId(), incomingBid.getUser().getId());

        if (allCompetitorBids.isEmpty()) return;

        // Filter list: Keep only the LATEST Auto-Bid per user (Fix Zombie Bid issue)
        java.util.Map<Long, Bid> uniqueCompetitors = new java.util.HashMap<>();
        for (Bid b : allCompetitorBids) {
            // Keep the bid with the latest creation date for each user
            if (!uniqueCompetitors.containsKey(b.getUser().getId())
                    || b.getCreatedAt()
                            .isAfter(uniqueCompetitors.get(b.getUser().getId()).getCreatedAt())) {
                uniqueCompetitors.put(b.getUser().getId(), b);
            }
        }

        if (uniqueCompetitors.isEmpty()) return;

        // Identify User A (Current bidder) and User B (Strongest current competitor)
        User currentUser = incomingBid.getUser();
        BigDecimal currentMax = incomingBid.getMaxAutoBidAmount(); // Can be null if it's a manual bid

        // Find the competitor with the highest Max Auto Bid
        Bid strongestCompetitorBid = uniqueCompetitors.values().stream()
                .max(Comparator.comparing(Bid::getMaxAutoBidAmount))
                .orElse(null);

        if (strongestCompetitorBid == null) {
            return;
        }

        User competitor = strongestCompetitorBid.getUser();
        BigDecimal competitorMax = strongestCompetitorBid.getMaxAutoBidAmount();

        // Compare to determine the final winner
        // We compare: Max of current bidder vs Max of competitor

        BigDecimal winnerMax;
        BigDecimal loserMax;
        User winner;

        // If current bidder (A) has no auto-bid or their max is lower than B
        if (currentMax == null || competitorMax.compareTo(currentMax) > 0) {
            // --> Competitor (B) wins
            winner = competitor;
            winnerMax = competitorMax;
            loserMax = (currentMax == null) ? incomingBid.getAmount() : currentMax;
        } else {
            // --> Current bidder (A) wins (since Max A >= Max B)
            winner = currentUser;
            winnerMax = currentMax;
            loserMax = competitorMax;
        }

        // Calculate Final Price
        // Winning price = Loser's Max + Step Price
        BigDecimal finalPrice = loserMax.add(product.getStepPrice());

        // Winning price cannot exceed Winner's Max
        if (finalPrice.compareTo(winnerMax) > 0) {
            finalPrice = winnerMax;
        }

        // Place Bid (One single jump)
        // Check: Only place bid if the calculated final price > current product price
        if (finalPrice.compareTo(product.getCurrentPrice()) > 0) {

            // (Optional) Intermediate step: Place a bid for the loser at their Max
            // (to make bid history look more logical).
            // If absolute speed is priority, skip this and only create the winning bid.
            if (loserMax.compareTo(product.getCurrentPrice()) > 0) {
                createAndSaveBid(product, (winner == currentUser) ? competitor : currentUser, loserMax, loserMax, true);
            }

            log.info("Direct Auto-Bid: User {} wins against others with price {}", winner.getId(), finalPrice);

            // Create the final winning bid
            // Note: If winner is currentUser, we theoretically should update their existing bid or create new.
            // Here we create a new one to simplify history logic.
            createAndSaveBid(product, winner, finalPrice, winnerMax, true);

            // Check Auto-Extend and Schedule
            checkAndTriggerAutoExtend(product);

            // Notify the loser (The one who was just outbid)
            User loser = (winner.getId().equals(currentUser.getId())) ? competitor : currentUser;
            emailService.sendOutbidNotification(
                    loser.getId(), product.getId(), product.getName(), finalPrice.toString());
        }
    }

    private void checkAndTriggerAutoExtend(Product product) {
        if (Boolean.TRUE.equals(product.getAutoExtend())) {

            // Fetch dynamic values from DB (default 5 and 10 if not set in DB)
            int threshold = systemConfigService.getIntConfig(CONFIG_EXTEND_THRESHOLD, 5);
            int duration = systemConfigService.getIntConfig(CONFIG_EXTEND_DURATION, 10);

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime currentEndTime = product.getEndTime();

            // Use the dynamic threshold
            if (now.plusMinutes(threshold).isAfter(currentEndTime)) {
                LocalDateTime newEndTime = currentEndTime.plusMinutes(duration);

                product.setEndTime(newEndTime);
                productRepository.save(product);
                auctionSchedulerService.rescheduleAuctionClose(product.getId(), newEndTime);

                log.info("Auction extended by {} minutes based on Admin config", duration);
            }
        }
    }

    private void validateBid(User bidder, Product product, BigDecimal amount, BigDecimal maxAutoBidAmount) {
        // Check if product is active
        if (product.getStatus() != ProductStatus.ACTIVE) {
            throw new BadRequestException("Product is not active");
        }

        if (LocalDateTime.now().isAfter(product.getEndTime())) {
            throw new BadRequestException("Auction has ended");
        }

        // Check if bidder is seller
        if (product.getSeller().getId().equals(bidder.getId())) {
            throw new BadRequestException("Seller cannot bid on own product");
        }

        // Check if bidder is blocked
        if (blockedBidderRepository.existsByProductIdAndBidderId(product.getId(), bidder.getId())) {
            throw new ForbiddenException("You are blocked from bidding on this product");
        }

        // Check if bidder can bid (rating requirement)
        if (!product.getAllowUnratedBidders() && !bidder.canBid()) {
            throw new ForbiddenException("You need at least 80% positive rating to bid on this product");
        }

        // Check if bidder is current highest bidder
        if (product.getCurrentBidder() != null
                && product.getCurrentBidder().getId().equals(bidder.getId())) {

            // Allow update if they are setting a new Auto-Bid limit
            if (maxAutoBidAmount != null) {
                return;
            }

            throw new BadRequestException("You are already the highest bidder");
        }
    }

    private BigDecimal processAutoBid(Product product, User bidder, BigDecimal amount, BigDecimal maxAmount) {
        Pageable pageable = PageRequest.of(0, 2);
        List<Bid> topBids = bidRepository.findTop2BidsForProduct(product.getId(), pageable);

        if (topBids.isEmpty()) {
            return amount;
        }

        Bid highestBid = topBids.getFirst();

        if (highestBid.getIsAutoBid() && highestBid.getMaxAutoBidAmount() != null) {
            BigDecimal theirMax = highestBid.getMaxAutoBidAmount();
            BigDecimal ourMax = maxAmount;

            if (ourMax.compareTo(theirMax) > 0) {
                return theirMax.add(product.getStepPrice());
            } else if (ourMax.compareTo(theirMax) < 0) {
                throw new BadRequestException("Your max bid is lower than current highest bidder's max bid");
            } else {
                if (highestBid.getCreatedAt().isBefore(LocalDateTime.now())) {
                    throw new BadRequestException("Current bidder has same max bid and bid earlier");
                }
            }
        }
        return product.getCurrentPrice().add(product.getStepPrice());
    }

    private void sendBidNotifications(Product product, User newBidder, User previousBidder, BigDecimal amount) {
        emailService.sendBidNotification(
                product.getSeller().getId(),
                product.getId(),
                product.getName(),
                newBidder.getFullName(),
                amount.toString());

        if (previousBidder != null) {
            emailService.sendOutbidNotification(
                    previousBidder.getId(), product.getId(), product.getName(), amount.toString());
        }
    }

    public List<BidHistoryDto> getBidHistory(Long productId) {
        Pageable pageable = PageRequest.of(0, 100);
        Page<Bid> bids = bidRepository.findByProductOrderByCreatedAtDesc(productId, pageable);

        // Fetch list of blocked user IDs for this product
        List<Long> blockedUserIds = blockedBidderRepository.findByProductId(productId).stream()
                .map(blocked -> blocked.getBidder().getId())
                .toList();

        return bids.getContent().stream()
                .map(bid -> {
                    BidHistoryDto dto = BidMapper.toHistoryDto(bid);

                    // Check if this bid belongs to a blocked user
                    if (blockedUserIds.contains(bid.getUser().getId())) {
                        dto.setBlocked(true);
                    }

                    return dto;
                })
                .toList();
    }

    public PageResponse<BidDto> getMyBids(int page, int size) {
        Long userId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<Bid> bidPage = bidRepository.findByUserOrderByCreatedAtDesc(userId, pageable);
        List<BidDto> content =
                bidPage.getContent().stream().map(BidMapper::toDto).toList();

        return PageResponse.<BidDto>builder()
                .content(content)
                .page(bidPage.getNumber())
                .size(bidPage.getSize())
                .totalElements(bidPage.getTotalElements())
                .totalPages(bidPage.getTotalPages())
                .last(bidPage.isLast())
                .build();
    }

    public void blockBidder(Long productId, Long bidderId) {
        Long sellerId = CurrentUser.getUserId();
        Product product =
                productRepository.findById(productId).orElseThrow(() -> new NotFoundException("Product not found"));

        if (!product.getSeller().getId().equals(sellerId)) {
            throw new ForbiddenException("You can only block bidders from your own products");
        }

        User bidder = userRepository.findById(bidderId).orElseThrow(() -> new NotFoundException("Bidder not found"));

        if (blockedBidderRepository.existsByProductIdAndBidderId(productId, bidderId)) {
            throw new BadRequestException("Bidder is already blocked");
        }

        BlockedBidder blockedBidder =
                BlockedBidder.builder().product(product).bidder(bidder).build();
        blockedBidderRepository.save(blockedBidder);

        if (product.getCurrentBidder() != null
                && product.getCurrentBidder().getId().equals(bidderId)) {
            reassignHighestBidder(product);
        }

        log.info("Bidder {} blocked from product {}", bidderId, productId);
    }

    private void reassignHighestBidder(Product product) {
        List<Long> blockedBidderIds = blockedBidderRepository.findByProductId(product.getId()).stream()
                .map(bb -> bb.getBidder().getId())
                .toList();

        List<Bid> allBids = bidRepository.findByProductOrderByAmountDesc(product.getId());

        // Find the highest bid where the user is not blocked
        // This effectively skips 1st, 2nd, etc. if they are blocked
        java.util.Optional<Bid> validWinnerBid = allBids.stream()
                .filter(bid -> !blockedBidderIds.contains(bid.getUser().getId()))
                .findFirst();

        if (validWinnerBid.isPresent()) {
            Bid winner = validWinnerBid.get();
            // Set the new valid winner
            product.setCurrentBidder(winner.getUser());
            product.setCurrentPrice(winner.getAmount());
        } else {
            // No valid bids left (all bidders blocked or no bids)
            product.setCurrentBidder(null);
            product.setCurrentPrice(product.getStartingPrice());
        }

        productRepository.save(product);
    }

    public PageResponse<BidHistoryDto> getBidRanking(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Bid> bidPage = bidRepository.findByProductOrderByAmountDesc(productId, pageable);

        // Page<Bid> bidPage = bidRepository.findBidRankingByProduct(productId, pageable);

        List<BidHistoryDto> content =
                bidPage.getContent().stream().map(BidMapper::toHistoryDto).toList();

        return PageResponse.<BidHistoryDto>builder()
                .content(content)
                .page(bidPage.getNumber())
                .size(bidPage.getSize())
                .totalElements(bidPage.getTotalElements())
                .totalPages(bidPage.getTotalPages())
                .last(bidPage.isLast())
                .build();
    }
}
