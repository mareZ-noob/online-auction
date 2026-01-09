package wnc.auction.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Add request logging interceptor
        registry.addInterceptor(new RequestLoggingInterceptor()).addPathPatterns("/api/**");

        // Add rate limit interceptor
        registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/api/**");
    }
}
