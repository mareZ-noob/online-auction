package wnc.auction.backend.aspect;

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
import wnc.auction.backend.dto.event.AuditLogMessage;
import wnc.auction.backend.model.enumeration.LogType;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.service.AuditLogProducer;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class ServiceAuditAspect {

    private final AuditLogProducer auditLogProducer;

    // Pointcut targeting all classes in the service package except AuditLogProducer
    @Pointcut(
            "execution(* wnc.auction.backend.service..*(..)) && !within(wnc.auction.backend.service.AuditLogProducer)")
    public void serviceLayer() {}

    @Around("serviceLayer()")
    public Object logServiceExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();

        String traceId = UUID.randomUUID().toString();
        String serviceClass = joinPoint.getTarget().getClass().getSimpleName();
        String serviceMethod = joinPoint.getSignature().getName();
        Object result;

        try {
            result = joinPoint.proceed();

            // Send success service log
            sendServiceLog(traceId, serviceClass, serviceMethod, System.currentTimeMillis() - start, null, null);

            return result;
        } catch (Exception e) {
            // Send exception log for service layer
            sendServiceExceptionLog(traceId, serviceClass, serviceMethod, System.currentTimeMillis() - start, e);
            throw e;
        }
    }

    private void sendServiceLog(
            String traceId,
            String serviceClass,
            String serviceMethod,
            long executionTime,
            String errorMessage,
            String exceptionType) {
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
                .logType(LogType.SERVICE_EXECUTION)
                .executionTimeMs(executionTime)
                .userId(userId)
                .email(userEmail)
                .serviceClass(serviceClass)
                .serviceMethod(serviceMethod)
                .serviceName(serviceClass + "." + serviceMethod)
                .errorMessage(errorMessage)
                .exceptionType(exceptionType)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogProducer.sendAuditLog(auditMessage);
    }

    private void sendServiceExceptionLog(
            String traceId, String serviceClass, String serviceMethod, long executionTime, Exception e) {
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
                .executionTimeMs(executionTime)
                .userId(userId)
                .email(userEmail)
                .serviceClass(serviceClass)
                .serviceMethod(serviceMethod)
                .serviceName(serviceClass + "." + serviceMethod)
                .errorMessage(e.getMessage())
                .exceptionType(e.getClass().getName())
                .stackTrace(getStackTrace(e))
                .timestamp(LocalDateTime.now())
                .build();

        auditLogProducer.sendAuditLog(exceptionMessage);
    }

    private String getStackTrace(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }
}
