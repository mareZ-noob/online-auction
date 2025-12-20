package wnc.auction.backend.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.response.CurrencyInfo;
import wnc.auction.backend.dto.response.PaymentVerificationResponse;
import wnc.auction.backend.dto.response.StripeCheckoutResponse;
import wnc.auction.backend.dto.response.StripeSessionDetailsResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.ForbiddenException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.model.Transaction;
import wnc.auction.backend.model.enumeration.TransactionStatus;
import wnc.auction.backend.repository.ProductRepository;
import wnc.auction.backend.repository.TransactionRepository;
import wnc.auction.backend.security.CurrentUser;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StripePaymentService {

    @Value("${app.stripe.api-key}")
    private String stripeApiKey;

    @Value("${app.stripe.currency:usd}")
    private String defaultCurrency;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
        log.info("Stripe initialized with default currency: {}", defaultCurrency);
    }

    // Create Stripe Checkout Session
    public StripeCheckoutResponse createCheckoutSession(Long transactionId, String currency) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        Long userId = CurrentUser.getUserId();
        if (!transaction.getBuyer().getId().equals(userId)) {
            throw new ForbiddenException("Only buyer can make payment");
        }

        if (transaction.getStatus() != TransactionStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Transaction is not in pending payment status");
        }

        // Validate currency
        if (!isValidCurrency(currency)) {
            throw new BadRequestException("Currency must be either 'usd' or 'vnd'");
        }

        try {
            // Calculate amount based on currency
            long amount = calculateStripeAmount(transaction.getAmount(), currency);

            // Create Stripe Checkout Session
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}&transaction_id="
                            + transactionId)
                    .setCancelUrl(frontendUrl + "/payment/cancel?transaction_id=" + transactionId)
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency(currency.toLowerCase())
                                    .setUnitAmount(amount)
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName(transaction.getProduct().getName())
                                            .setDescription("Auction purchase - "
                                                    + transaction.getProduct().getName())
                                            .addImage(
                                                    transaction
                                                                    .getProduct()
                                                                    .getImages()
                                                                    .isEmpty()
                                                            ? null
                                                            : transaction
                                                                    .getProduct()
                                                                    .getImages()
                                                                    .get(0))
                                            .build())
                                    .build())
                            .setQuantity(1L)
                            .build())
                    .putMetadata("transaction_id", transactionId.toString())
                    .putMetadata("product_id", transaction.getProduct().getId().toString())
                    .putMetadata("buyer_id", transaction.getBuyer().getId().toString())
                    .putMetadata("seller_id", transaction.getSeller().getId().toString())
                    .setPaymentIntentData(SessionCreateParams.PaymentIntentData.builder()
                            .putMetadata("transaction_id", transactionId.toString())
                            .build())
                    .build();

            Session session = Session.create(params);

            // Store session ID in transaction
            transaction.setStripeSessionId(session.getId());
            transaction.setPaymentCurrency(currency.toUpperCase());
            transactionRepository.save(transaction);

            log.info("Created Stripe checkout session: {} for transaction: {}", session.getId(), transactionId);

            return StripeCheckoutResponse.builder()
                    .sessionId(session.getId())
                    .checkoutUrl(session.getUrl())
                    .transactionId(transactionId)
                    .amount(transaction.getAmount())
                    .currency(currency.toUpperCase())
                    .build();

        } catch (StripeException e) {
            log.error("Failed to create Stripe checkout session", e);
            throw new RuntimeException("Failed to create payment session: " + e.getMessage());
        }
    }

    // Verify payment success after redirect
    public PaymentVerificationResponse verifyPayment(String sessionId, Long transactionId) {
        try {
            Transaction transaction = transactionRepository
                    .findById(transactionId)
                    .orElseThrow(() -> new NotFoundException("Transaction not found"));

            // Retrieve session from Stripe
            Session session = Session.retrieve(sessionId);

            // Verify session belongs to transaction
            if (!session.getId().equals(transaction.getStripeSessionId())) {
                throw new BadRequestException("Session ID mismatch");
            }

            // Check payment status
            boolean paid = "paid".equals(session.getPaymentStatus());

            if (paid && transaction.getStatus() == TransactionStatus.PENDING_PAYMENT) {
                // Update transaction status
                transaction.setStatus(TransactionStatus.PAYMENT_CONFIRMED);
                transaction.setPaidAt(LocalDateTime.now());
                transaction.setStripePaymentIntentId(session.getPaymentIntent());
                transactionRepository.save(transaction);

                log.info("Payment verified and confirmed for transaction: {}", transactionId);
            }

            return PaymentVerificationResponse.builder()
                    .success(paid)
                    .transactionId(transactionId)
                    .sessionId(sessionId)
                    .paymentStatus(session.getPaymentStatus())
                    .amountPaid(session.getAmountTotal())
                    .currency(session.getCurrency())
                    .message(paid ? "Payment successful" : "Payment not completed")
                    .build();

        } catch (StripeException e) {
            log.error("Failed to verify payment", e);
            throw new RuntimeException("Failed to verify payment: " + e.getMessage());
        }
    }

    // Get payment session details
    public StripeSessionDetailsResponse getSessionDetails(String sessionId) {
        try {
            Session session = Session.retrieve(sessionId);

            return StripeSessionDetailsResponse.builder()
                    .sessionId(session.getId())
                    .paymentStatus(session.getPaymentStatus())
                    .amountTotal(session.getAmountTotal())
                    .currency(session.getCurrency())
                    .customerEmail(session.getCustomerEmail())
                    .expiresAt(session.getExpiresAt())
                    .build();

        } catch (StripeException e) {
            log.error("Failed to retrieve session details", e);
            throw new RuntimeException("Failed to retrieve session details: " + e.getMessage());
        }
    }

    // Cancel payment session
    public void cancelPaymentSession(Long transactionId) {
        Transaction transaction = transactionRepository
                .findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        if (transaction.getStripeSessionId() != null) {
            try {
                Session session = Session.retrieve(transaction.getStripeSessionId());

                // Stripe checkout sessions expire automatically
                // We just need to update our transaction
                if (!"paid".equals(session.getPaymentStatus())) {
                    transaction.setStripeSessionId(null);
                    transactionRepository.save(transaction);

                    log.info("Payment session cancelled for transaction: {}", transactionId);
                }
            } catch (StripeException e) {
                log.error("Failed to cancel payment session", e);
            }
        }
    }

    private long calculateStripeAmount(BigDecimal amount, String currency) {
        if ("vnd".equalsIgnoreCase(currency)) {
            // VND doesn't use decimal places
            return amount.longValue();
        } else {
            // USD uses cents
            return amount.multiply(new BigDecimal("100"))
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValue();
        }
    }

    public BigDecimal convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (fromCurrency.equalsIgnoreCase(toCurrency)) {
            return amount;
        }

        // Simplified conversion rate (update with real rates)
        // 1 USD = 24,000 VND (approximate)
        BigDecimal exchangeRate = new BigDecimal("24000");

        if ("vnd".equalsIgnoreCase(fromCurrency) && "usd".equalsIgnoreCase(toCurrency)) {
            return amount.divide(exchangeRate, 2, RoundingMode.HALF_UP);
        } else if ("usd".equalsIgnoreCase(fromCurrency) && "vnd".equalsIgnoreCase(toCurrency)) {
            return amount.multiply(exchangeRate).setScale(0, RoundingMode.HALF_UP);
        }

        return amount;
    }

    // Get supported currencies with exchange rates
    public Map<String, CurrencyInfo> getSupportedCurrencies(BigDecimal baseAmountVND) {
        Map<String, CurrencyInfo> currencies = new HashMap<>();

        currencies.put(
                "VND",
                CurrencyInfo.builder()
                        .code("VND")
                        .symbol("₫")
                        .name("Vietnamese Dong")
                        .amount(baseAmountVND)
                        .build());

        BigDecimal amountUSD = convertCurrency(baseAmountVND, "VND", "USD");
        currencies.put(
                "USD",
                CurrencyInfo.builder()
                        .code("USD")
                        .symbol("$")
                        .name("US Dollar")
                        .amount(amountUSD)
                        .build());

        return currencies;
    }

    private boolean isValidCurrency(String currency) {
        return "usd".equalsIgnoreCase(currency) || "vnd".equalsIgnoreCase(currency);
    }
}
