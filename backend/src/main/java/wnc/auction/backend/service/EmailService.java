package wnc.auction.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Locale;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import wnc.auction.backend.exception.AuctionException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.model.User;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.utils.Constants;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final MessageSource messageSource;
    private final LocaleService localeService;
    private final UserRepository userRepository;

    @Value("${app.mail.from-address}")
    private String fromAddress;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void sendOtpEmail(Long userId, String code, String purpose) {
        Locale locale = localeService.getLocaleByUserId(userId);
        sendOtpEmailWithLocale(getUserEmail(userId), code, purpose, locale);
    }

    public void sendBidNotification(Long userId, Long productId, String productName, String bidderName, String amount) {
        Locale locale = localeService.getLocaleByUserId(userId);
        String productUrl = String.format("%s/products/%d", frontendUrl, productId);
        sendBidNotificationWithLocale(getUserEmail(userId), productName, bidderName, amount, productUrl, locale);
    }

    public void sendOutbidNotification(Long userId, Long productId, String productName, String amount) {
        Locale locale = localeService.getLocaleByUserId(userId);
        String productUrl = String.format("%s/products/%d", frontendUrl, productId);
        sendOutbidNotificationWithLocale(getUserEmail(userId), productName, amount, productUrl, locale);
    }

    public void sendAuctionEndedNotification(
            Long userId, Long productId, String productName, boolean isWinner, String finalAmount) {
        Locale locale = localeService.getLocaleByUserId(userId);
        String productUrl = String.format("%s/products/%d", frontendUrl, productId);
        sendAuctionEndedNotificationWithLocale(
                getUserEmail(userId), productName, isWinner, finalAmount, productUrl, locale);
    }

    public void sendQuestionNotification(
            Long userId, Long productId, String productName, String question, String askerName) {
        Locale locale = localeService.getLocaleByUserId(userId);
        String productUrl = String.format("%s/products/%d", frontendUrl, productId);
        sendQuestionNotificationWithLocale(getUserEmail(userId), productName, question, askerName, productUrl, locale);
    }

    public void sendOrderShippedNotification(Long userId, Long productId, String productName, String trackingNumber) {
        Locale locale = localeService.getLocaleByUserId(userId);
        // Construct the product URL for the email button
        String productUrl = String.format("%s/products/%d", frontendUrl, productId);

        sendOrderShippedNotificationWithLocale(getUserEmail(userId), productName, trackingNumber, productUrl, locale);
    }

    // Overloaded methods for direct email sending (optional, if needed)
    public void sendOtpEmailByEmail(String email, String code, String purpose) {
        Locale locale = localeService.getLocaleByEmail(email);
        sendOtpEmailWithLocale(email, code, purpose, locale);
    }

    public void sendRoleExpirationEmail(Long userId) {
        Locale locale = localeService.getLocaleByUserId(userId);
        sendRoleExpirationEmailWithLocale(getUserEmail(userId), locale);
    }

    public void sendBidderBlockedNotification(Long userId, Long productId, String productName, String sellerName) {
        Locale locale = localeService.getLocaleByUserId(userId);
        String productUrl = String.format("%s/products/%d", frontendUrl, productId);
        sendBidderBlockedNotificationWithLocale(getUserEmail(userId), productName, sellerName, productUrl, locale);
    }

    public void sendPasswordResetNotification(Long userId, String newPassword) {
        Locale locale = localeService.getLocaleByUserId(userId);
        sendPasswordResetNotificationWithLocale(getUserEmail(userId), newPassword, locale);
    }

    public void sendProductUpdatedNotification(
            Long userId, Long productId, String productName, String updateDescription) {
        Locale locale = localeService.getLocaleByUserId(userId);
        String productUrl = String.format("%s/products/%d", frontendUrl, productId);
        sendProductUpdatedNotificationWithLocale(
                getUserEmail(userId), productName, updateDescription, productUrl, locale);
    }

    private void sendOtpEmailWithLocale(String to, String code, String purpose, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("code", code);
            context.setVariable("purpose", purpose);

            String htmlContent = templateEngine.process("otp-email", context);
            String subject = messageSource.getMessage("email.otp.subject", new Object[] {purpose}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("OTP email sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send OTP email", e);
            throw new AuctionException(Constants.ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    private void sendBidNotificationWithLocale(
            String to, String productName, String bidderName, String amount, String productUrl, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("bidderName", bidderName);
            context.setVariable("amount", amount);
            context.setVariable("productUrl", productUrl);

            String htmlContent = templateEngine.process("bid-notification", context);
            String subject = messageSource.getMessage("email.bid.subject", new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Bid notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send bid notification", e);
        }
    }

    private void sendOutbidNotificationWithLocale(
            String to, String productName, String amount, String productUrl, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("amount", amount);
            context.setVariable("productUrl", productUrl);

            String htmlContent = templateEngine.process("outbid-notification", context);
            String subject = messageSource.getMessage("email.outbid.subject", new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Outbid notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send outbid notification", e);
        }
    }

    private void sendAuctionEndedNotificationWithLocale(
            String to, String productName, boolean isWinner, String finalAmount, String productUrl, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("finalAmount", finalAmount);
            context.setVariable("isWinner", isWinner);
            context.setVariable("productUrl", productUrl);

            String htmlContent = templateEngine.process("auction-ended", context);

            String subjectKey = isWinner ? "email.auction.winner.subject" : "email.auction.ended.subject";
            String subject = messageSource.getMessage(subjectKey, new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Auction ended notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send auction ended notification", e);
        }
    }

    private void sendQuestionNotificationWithLocale(
            String to, String productName, String question, String askerName, String productUrl, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("question", question);
            context.setVariable("askerName", askerName);
            context.setVariable("productUrl", productUrl);

            String htmlContent = templateEngine.process("question-notification", context);
            String subject = messageSource.getMessage("email.question.subject", new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Question notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send question notification", e);
        }
    }

    private void sendRoleExpirationEmailWithLocale(String to, Locale locale) {
        try {
            Context context = new Context(locale);

            // Render template
            String htmlContent = templateEngine.process("role-expiration", context);

            // Get subject from properties
            String subject = messageSource.getMessage("email.role.expiration.subject", null, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Role expiration email sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send role expiration email", e);
        }
    }

    private void sendOrderShippedNotificationWithLocale(
            String to, String productName, String trackingNumber, String productUrl, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("trackingNumber", trackingNumber);
            context.setVariable("productUrl", productUrl);

            // Process the Thymeleaf template "order-shipped.html"
            String htmlContent = templateEngine.process("order-shipped", context);

            // Get localized subject
            String subject =
                    messageSource.getMessage("email.order.shipped.subject", new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Order shipped notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send order shipped notification", e);
        }
    }

    private void sendBidderBlockedNotificationWithLocale(
            String to, String productName, String sellerName, String productUrl, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("sellerName", sellerName);
            context.setVariable("productUrl", productUrl);

            String htmlContent = templateEngine.process("bidder-blocked", context);
            String subject = messageSource.getMessage("email.blocked.subject", new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Bidder blocked notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send bidder blocked notification", e);
        }
    }

    private void sendPasswordResetNotificationWithLocale(String to, String newPassword, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("newPassword", newPassword);

            String htmlContent = templateEngine.process("password-reset", context);
            String subject = messageSource.getMessage("email.password.reset.subject", null, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Password reset notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send password reset notification", e);
        }
    }

    private void sendProductUpdatedNotificationWithLocale(
            String to, String productName, String updateDescription, String productUrl, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("updateDescription", updateDescription);
            context.setVariable("productUrl", productUrl);

            String htmlContent = templateEngine.process("product-updated", context);
            String subject =
                    messageSource.getMessage("email.product.updated.subject", new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Product updated notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send product updated notification", e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromAddress);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private String getUserEmail(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.map(User::getEmail).orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));
    }
}
