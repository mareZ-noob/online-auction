package wnc.auction.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String to, String code, String purpose) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Your OTP Code - " + purpose);
            message.setText(String.format(
                    "Your OTP code for %s is: %s\n\n" +
                            "This code will expire in 5 minutes.\n\n" +
                            "If you didn't request this, please ignore this email.",
                    purpose, code
            ));

            mailSender.send(message);
            log.info("OTP email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email", e);
            throw new RuntimeException("Failed to send email");
        }
    }

    public void sendBidNotification(String to, String productName, String bidderName, String amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("New Bid on Your Product - " + productName);
            message.setText(String.format(
                    "A new bid has been placed on your product: %s\n\n" +
                            "Bidder: %s\n" +
                            "Amount: %s\n\n" +
                            "View product details at: [PRODUCT_LINK]",
                    productName, bidderName, amount
            ));

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send bid notification", e);
        }
    }

    public void sendOutbidNotification(String to, String productName, String amount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("You've Been Outbid - " + productName);
            message.setText(String.format(
                    "You have been outbid on: %s\n\n" +
                            "Current highest bid: %s\n\n" +
                            "Place a new bid at: [PRODUCT_LINK]",
                    productName, amount
            ));

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send outbid notification", e);
        }
    }

    public void sendAuctionEndedNotification(String to, String productName,
                                             boolean isWinner, String finalAmount) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);

            if (isWinner) {
                message.setSubject("Congratulations! You Won - " + productName);
                message.setText(String.format(
                        "Congratulations! You won the auction for: %s\n\n" +
                                "Final amount: %s\n\n" +
                                "Please proceed with payment at: [TRANSACTION_LINK]",
                        productName, finalAmount
                ));
            } else {
                message.setSubject("Auction Ended - " + productName);
                message.setText(String.format(
                        "The auction for %s has ended.\n\n" +
                                "Final amount: %s\n\n" +
                                "Thank you for participating!",
                        productName, finalAmount
                ));
            }

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send auction ended notification", e);
        }
    }

    public void sendQuestionNotification(String to, String productName,
                                         String question, String askerName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("New Question on Your Product - " + productName);
            message.setText(String.format(
                    "You have a new question on your product: %s\n\n" +
                            "From: %s\n" +
                            "Question: %s\n\n" +
                            "Answer at: [PRODUCT_LINK]",
                    productName, askerName, question
            ));

            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send question notification", e);
        }
    }
}
