package wnc.auction.backend.aspect;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Slf4j
@Aspect
@Component
public class LoggingAspect {

    private static final String REQUEST_ID = "requestId";
    private static final String USER_ID = "userId";

    @Around("execution(* wnc.auction.backend.controller..*(..))")
    public Object logControllerMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String requestId = UUID.randomUUID().toString();
        MDC.put(REQUEST_ID, requestId);

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String className = signature.getDeclaringType().getSimpleName();
        String methodName = signature.getName();

        // Get HTTP request details
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        String httpMethod = null;
        String requestUri = null;
        String clientIp = null;

        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            httpMethod = request.getMethod();
            requestUri = request.getRequestURI();
            clientIp = getClientIp(request);
        }

        Instant start = Instant.now();

        log.info(
                "Request started - Method: {}.{}, HTTP: {} {}, RequestId: {}, IP: {}",
                className,
                methodName,
                httpMethod,
                requestUri,
                requestId,
                clientIp);

        try {
            Object result = joinPoint.proceed();

            Duration duration = Duration.between(start, Instant.now());
            log.info(
                    "Request completed - Method: {}.{}, Duration: {}ms, RequestId: {}",
                    className,
                    methodName,
                    duration.toMillis(),
                    requestId);

            return result;
        } catch (Exception e) {
            Duration duration = Duration.between(start, Instant.now());
            log.error(
                    "Request failed - Method: {}.{}, Duration: {}ms, RequestId: {}, Error: {}",
                    className,
                    methodName,
                    duration.toMillis(),
                    requestId,
                    e.getMessage(),
                    e);
            throw e;
        } finally {
            MDC.remove(REQUEST_ID);
            MDC.remove(USER_ID);
        }
    }

    @Around("execution(* wnc.auction.backend.service..*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String className = signature.getDeclaringType().getSimpleName();
        String methodName = signature.getName();

        Instant start = Instant.now();

        log.debug("Service method started - {}.{}", className, methodName);

        try {
            Object result = joinPoint.proceed();

            Duration duration = Duration.between(start, Instant.now());
            log.debug("Service method completed - {}.{}, Duration: {}ms", className, methodName, duration.toMillis());

            return result;
        } catch (Exception e) {
            Duration duration = Duration.between(start, Instant.now());
            log.error(
                    "Service method failed - {}.{}, Duration: {}ms, Error: {}",
                    className,
                    methodName,
                    duration.toMillis(),
                    e.getMessage(),
                    e);
            throw e;
        }
    }

    @Around("execution(* wnc.auction.backend.repository..*(..))")
    public Object logRepositoryMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String className = signature.getDeclaringType().getSimpleName();
        String methodName = signature.getName();

        Instant start = Instant.now();

        log.trace("Repository method started - {}.{}", className, methodName);

        try {
            Object result = joinPoint.proceed();

            Duration duration = Duration.between(start, Instant.now());
            log.trace(
                    "Repository method completed - {}.{}, Duration: {}ms", className, methodName, duration.toMillis());

            return result;
        } catch (Exception e) {
            Duration duration = Duration.between(start, Instant.now());
            log.error(
                    "Repository method failed - {}.{}, Duration: {}ms, Error: {}",
                    className,
                    methodName,
                    duration.toMillis(),
                    e.getMessage(),
                    e);
            throw e;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Handle multiple IPs in X-Forwarded-For
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
