package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private static final Logger auditLog = LoggerFactory.getLogger("AUDIT_LOGGER");

    public void logUserLogin(String userId, String ipAddress, boolean success) {
        MDC.put("userId", userId);
        MDC.put("clientIp", ipAddress);
        MDC.put("action", "USER_LOGIN");

        if (success) {
            auditLog.info("User login successful - userId: {}, ip: {}", userId, ipAddress);
        } else {
            auditLog.warn("User login failed - userId: {}, ip: {}", userId, ipAddress);
        }

        MDC.clear();
    }

    public void logUserLogout(String userId) {
        MDC.put("userId", userId);
        MDC.put("action", "USER_LOGOUT");

        auditLog.info("User logout - userId: {}", userId);

        MDC.clear();
    }

    public void logUserRegistration(String userId, String email) {
        MDC.put("userId", userId);
        MDC.put("action", "USER_REGISTRATION");

        auditLog.info("User registration - userId: {}, email: {}", userId, email);

        MDC.clear();
    }

    public void logPasswordChange(String userId, String changedBy) {
        MDC.put("userId", userId);
        MDC.put("changedBy", changedBy);
        MDC.put("action", "PASSWORD_CHANGE");

        auditLog.info("Password changed - userId: {}, changedBy: {}", userId, changedBy);

        MDC.clear();
    }

    public void logPasswordReset(String userId, String resetBy) {
        MDC.put("userId", userId);
        MDC.put("resetBy", resetBy);
        MDC.put("action", "PASSWORD_RESET");

        auditLog.info("Password reset - userId: {}, resetBy: {}", userId, resetBy);

        MDC.clear();
    }

    public void logUserDeletion(String userId, String deletedBy) {
        MDC.put("userId", userId);
        MDC.put("deletedBy", deletedBy);
        MDC.put("action", "USER_DELETION");

        auditLog.warn("User deleted - userId: {}, deletedBy: {}", userId, deletedBy);

        MDC.clear();
    }

    public void logAuctionCreation(String auctionId, String userId) {
        MDC.put("auctionId", auctionId);
        MDC.put("userId", userId);
        MDC.put("action", "AUCTION_CREATION");

        auditLog.info("Auction created - auctionId: {}, userId: {}", auctionId, userId);

        MDC.clear();
    }

    public void logBidPlacement(String bidId, String auctionId, String userId, double amount) {
        MDC.put("bidId", bidId);
        MDC.put("auctionId", auctionId);
        MDC.put("userId", userId);
        MDC.put("action", "BID_PLACEMENT");

        auditLog.info(
                "Bid placed - bidId: {}, auctionId: {}, userId: {}, amount: {}", bidId, auctionId, userId, amount);

        MDC.clear();
    }

    public void logPaymentAttempt(String paymentId, String userId, double amount, String currency, boolean success) {
        MDC.put("paymentId", paymentId);
        MDC.put("userId", userId);
        MDC.put("action", "PAYMENT_ATTEMPT");

        if (success) {
            auditLog.info(
                    "Payment successful - paymentId: {}, userId: {}, amount: {} {}",
                    paymentId,
                    userId,
                    amount,
                    currency);
        } else {
            auditLog.warn(
                    "Payment failed - paymentId: {}, userId: {}, amount: {} {}", paymentId, userId, amount, currency);
        }

        MDC.clear();
    }

    public void logDataAccess(String userId, String resourceType, String resourceId, String action) {
        MDC.put("userId", userId);
        MDC.put("resourceType", resourceType);
        MDC.put("resourceId", resourceId);
        MDC.put("action", "DATA_ACCESS");

        auditLog.info(
                "Data access - userId: {}, resourceType: {}, resourceId: {}, action: {}",
                userId,
                resourceType,
                resourceId,
                action);

        MDC.clear();
    }

    public void logSecurityEvent(String eventType, String userId, String details) {
        MDC.put("userId", userId);
        MDC.put("eventType", eventType);
        MDC.put("action", "SECURITY_EVENT");

        auditLog.warn("Security event - type: {}, userId: {}, details: {}", eventType, userId, details);

        MDC.clear();
    }

    public void logAdminAction(String adminId, String action, String targetUserId, String details) {
        MDC.put("adminId", adminId);
        MDC.put("targetUserId", targetUserId);
        MDC.put("action", "ADMIN_ACTION");

        auditLog.info(
                "Admin action - adminId: {}, action: {}, targetUserId: {}, details: {}",
                adminId,
                action,
                targetUserId,
                details);

        MDC.clear();
    }

    public void logConfigurationChange(String userId, String configKey, String oldValue, String newValue) {
        MDC.put("userId", userId);
        MDC.put("configKey", configKey);
        MDC.put("action", "CONFIGURATION_CHANGE");

        auditLog.info(
                "Configuration changed - userId: {}, key: {}, oldValue: {}, newValue: {}",
                userId,
                configKey,
                oldValue,
                newValue);

        MDC.clear();
    }

    public void logFileUpload(String userId, String fileName, long fileSize, String fileType) {
        MDC.put("userId", userId);
        MDC.put("fileName", fileName);
        MDC.put("action", "FILE_UPLOAD");

        auditLog.info(
                "File uploaded - userId: {}, fileName: {}, size: {} bytes, type: {}",
                userId,
                fileName,
                fileSize,
                fileType);

        MDC.clear();
    }

    public void logApiKeyGeneration(String userId, String apiKeyId) {
        MDC.put("userId", userId);
        MDC.put("apiKeyId", apiKeyId);
        MDC.put("action", "API_KEY_GENERATION");

        auditLog.info("API key generated - userId: {}, apiKeyId: {}", userId, apiKeyId);

        MDC.clear();
    }

    public void logApiKeyRevocation(String userId, String apiKeyId) {
        MDC.put("userId", userId);
        MDC.put("apiKeyId", apiKeyId);
        MDC.put("action", "API_KEY_REVOCATION");

        auditLog.warn("API key revoked - userId: {}, apiKeyId: {}", userId, apiKeyId);

        MDC.clear();
    }
}
