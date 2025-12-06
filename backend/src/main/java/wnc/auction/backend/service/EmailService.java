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

    public void sendOtpEmail(Long userId, String code, String purpose) {
        Locale locale = localeService.getLocaleByUserId(userId);
        sendOtpEmailWithLocale(getUserEmail(userId), code, purpose, locale);
    }

    public void sendBidNotification(Long userId, String productName, String bidderName, String amount) {
        Locale locale = localeService.getLocaleByUserId(userId);
        sendBidNotificationWithLocale(getUserEmail(userId), productName, bidderName, amount, locale);
    }

    public void sendOutbidNotification(Long userId, String productName, String amount) {
        Locale locale = localeService.getLocaleByUserId(userId);
        sendOutbidNotificationWithLocale(getUserEmail(userId), productName, amount, locale);
    }

    public void sendAuctionEndedNotification(Long userId, String productName, boolean isWinner, String finalAmount) {
        Locale locale = localeService.getLocaleByUserId(userId);
        sendAuctionEndedNotificationWithLocale(getUserEmail(userId), productName, isWinner, finalAmount, locale);
    }

    public void sendQuestionNotification(Long userId, String productName, String question, String askerName) {
        Locale locale = localeService.getLocaleByUserId(userId);
        sendQuestionNotificationWithLocale(getUserEmail(userId), productName, question, askerName, locale);
    }

    public void sendOtpEmailByEmail(String email, String code, String purpose) {
        Locale locale = localeService.getLocaleByEmail(email);
        sendOtpEmailWithLocale(email, code, purpose, locale);
    }

    public void sendBidNotificationByEmail(String email, String productName, String bidderName, String amount) {
        Locale locale = localeService.getLocaleByEmail(email);
        sendBidNotificationWithLocale(email, productName, bidderName, amount, locale);
    }

    public void sendOutbidNotificationByEmail(String email, String productName, String amount) {
        Locale locale = localeService.getLocaleByEmail(email);
        sendOutbidNotificationWithLocale(email, productName, amount, locale);
    }

    public void sendAuctionEndedNotificationByEmail(
            String email, String productName, boolean isWinner, String finalAmount) {
        Locale locale = localeService.getLocaleByEmail(email);
        sendAuctionEndedNotificationWithLocale(email, productName, isWinner, finalAmount, locale);
    }

    public void sendQuestionNotificationByEmail(String email, String productName, String question, String askerName) {
        Locale locale = localeService.getLocaleByEmail(email);
        sendQuestionNotificationWithLocale(email, productName, question, askerName, locale);
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
            String to, String productName, String bidderName, String amount, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("bidderName", bidderName);
            context.setVariable("amount", amount);

            String htmlContent = templateEngine.process("bid-notification", context);
            String subject = messageSource.getMessage("email.bid.subject", new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Bid notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send bid notification", e);
        }
    }

    private void sendOutbidNotificationWithLocale(String to, String productName, String amount, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("amount", amount);

            String htmlContent = templateEngine.process("outbid-notification", context);
            String subject = messageSource.getMessage("email.outbid.subject", new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Outbid notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send outbid notification", e);
        }
    }

    private void sendAuctionEndedNotificationWithLocale(
            String to, String productName, boolean isWinner, String finalAmount, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("finalAmount", finalAmount);
            context.setVariable("isWinner", isWinner);

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
            String to, String productName, String question, String askerName, Locale locale) {
        try {
            Context context = new Context(locale);
            context.setVariable("productName", productName);
            context.setVariable("question", question);
            context.setVariable("askerName", askerName);

            String htmlContent = templateEngine.process("question-notification", context);
            String subject = messageSource.getMessage("email.question.subject", new Object[] {productName}, locale);

            sendHtmlEmail(to, subject, htmlContent);
            log.info("Question notification sent to: {} in locale: {}", to, locale);
        } catch (Exception e) {
            log.error("Failed to send question notification", e);
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
