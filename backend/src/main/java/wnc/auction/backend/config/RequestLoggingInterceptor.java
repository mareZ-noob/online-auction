package wnc.auction.backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
class RequestLoggingInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();

        log.info("Request: {} {} {}", method, uri, query != null ? "?" + query : "");

        return true;
    }

    @Override
    public void afterCompletion(
            HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {

        String method = request.getMethod();
        String uri = request.getRequestURI();
        int status = response.getStatus();

        log.info("Response: {} {} - Status: {}", method, uri, status);
    }
}
