package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import wnc.auction.backend.dto.response.*;
import wnc.auction.backend.service.StripePaymentService;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Stripe payment endpoints with VND and USD support")
@PreAuthorize("hasAnyRole('BIDDER', 'SELLER', 'ADMIN')")
public class PaymentController {

    private final StripePaymentService stripePaymentService;

    @PostMapping("/create-checkout-session")
    @Operation(summary = "Create Stripe checkout session", description = "Supports both VND and USD currencies")
    public ResponseEntity<ApiResponse<StripeCheckoutResponse>> createCheckoutSession(
            @RequestParam Long transactionId, @RequestParam(defaultValue = "vnd") String currency) {

        StripeCheckoutResponse response = stripePaymentService.createCheckoutSession(transactionId, currency);

        return ResponseEntity.ok(ApiResponse.success("Checkout session created successfully", response));
    }

    @GetMapping("/verify")
    @Operation(summary = "Verify payment after redirect from Stripe")
    public ResponseEntity<ApiResponse<PaymentVerificationResponse>> verifyPayment(
            @RequestParam String sessionId, @RequestParam Long transactionId) {

        PaymentVerificationResponse response = stripePaymentService.verifyPayment(sessionId, transactionId);

        return ResponseEntity.ok(ApiResponse.success(
                response.isSuccess() ? "Payment verified successfully" : "Payment verification failed", response));
    }

    @GetMapping("/session/{sessionId}")
    @Operation(summary = "Get payment session details")
    public ResponseEntity<ApiResponse<StripeSessionDetailsResponse>> getSessionDetails(@PathVariable String sessionId) {

        StripeSessionDetailsResponse response = stripePaymentService.getSessionDetails(sessionId);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/cancel/{transactionId}")
    @Operation(summary = "Cancel payment session")
    public ResponseEntity<ApiResponse<Void>> cancelPaymentSession(@PathVariable Long transactionId) {

        stripePaymentService.cancelPaymentSession(transactionId);

        return ResponseEntity.ok(ApiResponse.success("Payment session cancelled", null));
    }

    @GetMapping("/currencies/{transactionId}")
    @Operation(summary = "Get supported currencies with exchange rates")
    public ResponseEntity<ApiResponse<Map<String, CurrencyInfo>>> getSupportedCurrencies(
            @PathVariable Long transactionId, @RequestParam(required = false) BigDecimal amount) {

        Map<String, CurrencyInfo> currencies =
                stripePaymentService.getSupportedCurrencies(amount != null ? amount : new BigDecimal("1000000"));

        return ResponseEntity.ok(ApiResponse.success(currencies));
    }

    @GetMapping("/convert")
    @Operation(summary = "Convert amount between currencies")
    public ResponseEntity<ApiResponse<Map<String, Object>>> convertCurrency(
            @RequestParam BigDecimal amount, @RequestParam String from, @RequestParam String to) {

        BigDecimal converted = stripePaymentService.convertCurrency(amount, from, to);

        Map<String, Object> result = new HashMap<>();
        result.put("originalAmount", amount);
        result.put("originalCurrency", from.toUpperCase());
        result.put("convertedAmount", converted);
        result.put("convertedCurrency", to.toUpperCase());

        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
