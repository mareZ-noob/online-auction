package wnc.auction.backend.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import wnc.auction.backend.dto.event.AuditLogMessage;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.service.AuditLogProducer;

import java.time.LocalDateTime;
import java.util.UUID;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class ControllerAuditAspect {

    private final AuditLogProducer auditLogProducer;

    // Pointcut targeting all classes in the controller package
    @Pointcut("execution(* wnc.auction.backend.controller..*(..))")
    public void controllerLayer() {
    }

    @Around("controllerLayer()")
    public Object logControllerAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        // Capture start time
        long start = System.currentTimeMillis();

        // Get Request attributes
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

        String traceId = UUID.randomUUID().toString();
        Object result;
        String errorMessage = null;
        int status = 200; // Default success

        try {
            // Proceed with the actual method execution
            result = joinPoint.proceed();

            // Try to extract status code if result is ResponseEntity (Optional optimization)
            if (result instanceof org.springframework.http.ResponseEntity<?> responseEntity) {
                status = responseEntity.getStatusCode().value();
            }

            return result;
        } catch (Exception e) {
            // Capture exception details
            errorMessage = e.getMessage();
            status = 500; // Internal Server Error default
            throw e; // Re-throw to let GlobalExceptionHandler handle it
        } finally {
            // Build and send the audit log
            if (request != null) {
                long executionTime = System.currentTimeMillis() - start;

                // Get user info securely from your existing CurrentUser utility
                Long userId = null;
                String userEmail = "anonymous";
                try {
                    userId = CurrentUser.getUserId();
                    String email = CurrentUser.getEmail();
                    if (email != null) userEmail = email;
                } catch (Exception ignored) {
                    // User might not be authenticated
                }

                AuditLogMessage auditMessage = AuditLogMessage.builder()
                        .traceId(traceId)
                        .method(request.getMethod())
                        .path(request.getRequestURI())
                        .status(status)
                        .executionTimeMs(executionTime)
                        .userId(userId)
                        .email(userEmail)
                        .clientIp(getClientIp(request))
                        .errorMessage(errorMessage)
                        .timestamp(LocalDateTime.now())
                        .parameters(request.getParameterMap())
                        .build();

                // Send to Kafka asynchronously
                auditLogProducer.sendAuditLog(auditMessage);
            }
        }
    }

    // Helper to get real IP if behind proxy/load balancer
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }
}
