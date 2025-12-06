package wnc.auction.backend.aspect;

import jakarta.servlet.http.HttpServletRequest;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.UUID;
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
import wnc.auction.backend.model.enumeration.LogType;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.service.AuditLogProducer;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class ControllerAuditAspect {

    private final AuditLogProducer auditLogProducer;

    @Pointcut("execution(* wnc.auction.backend.controller..*(..))")
    public void controllerLayer() {}

    @Around("controllerLayer()")
    public Object logControllerAccess(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes != null ? attributes.getRequest() : null;

        String traceId = UUID.randomUUID().toString();
        Object result;
        String errorMessage = null;
        int status = 200;

        try {
            result = joinPoint.proceed();

            if (result instanceof org.springframework.http.ResponseEntity<?> responseEntity) {
                status = responseEntity.getStatusCode().value();
            }

            return result;
        } catch (Exception e) {
            errorMessage = e.getMessage();
            status = 500;

            // Send exception log
            sendExceptionLog(traceId, request, e, System.currentTimeMillis() - start);

            throw e;
        } finally {
            if (request != null && errorMessage == null) {
                sendControllerLog(traceId, request, status, System.currentTimeMillis() - start, null);
            }
        }
    }

    private void sendControllerLog(
            String traceId, HttpServletRequest request, int status, long executionTime, String errorMessage) {
        Long userId = null;
        String userEmail = "anonymous";
        try {
            userId = CurrentUser.getUserId();
            String email = CurrentUser.getEmail();
            if (email != null) userEmail = email;
        } catch (Exception ignored) {
        }

        AuditLogMessage auditMessage = AuditLogMessage.builder()
                .traceId(traceId)
                .logType(LogType.CONTROLLER_ACCESS)
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

        auditLogProducer.sendAuditLog(auditMessage);
    }

    private void sendExceptionLog(String traceId, HttpServletRequest request, Exception e, long executionTime) {
        Long userId = null;
        String userEmail = "anonymous";
        try {
            userId = CurrentUser.getUserId();
            String email = CurrentUser.getEmail();
            if (email != null) userEmail = email;
        } catch (Exception ignored) {
        }

        AuditLogMessage exceptionMessage = AuditLogMessage.builder()
                .traceId(traceId)
                .logType(LogType.EXCEPTION_ERROR)
                .method(request != null ? request.getMethod() : null)
                .path(request != null ? request.getRequestURI() : null)
                .status(500)
                .executionTimeMs(executionTime)
                .userId(userId)
                .email(userEmail)
                .clientIp(request != null ? getClientIp(request) : null)
                .errorMessage(e.getMessage())
                .exceptionType(e.getClass().getName())
                .stackTrace(getStackTrace(e))
                .timestamp(LocalDateTime.now())
                .parameters(request != null ? request.getParameterMap() : null)
                .build();

        auditLogProducer.sendAuditLog(exceptionMessage);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0];
        }
        return request.getRemoteAddr();
    }

    private String getStackTrace(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }
}
