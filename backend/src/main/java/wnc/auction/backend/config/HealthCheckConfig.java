package wnc.auction.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.kafka.core.KafkaTemplate;

@Configuration
@RequiredArgsConstructor
public class HealthCheckConfig {

    private final RedisConnectionFactory redisConnectionFactory;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Bean
    public HealthIndicator customHealthIndicator() {
        return () -> {
            // Add custom health checks here
            boolean healthy = true;
            String message = "Application is running";

            // Check critical services
            try {
                // Redis check
                redisConnectionFactory.getConnection().ping();
            } catch (Exception e) {
                healthy = false;
                message = "Redis connection failed: " + e.getMessage();
            }

            if (healthy) {
                return Health.up().withDetail("message", message).build();
            } else {
                return Health.down().withDetail("message", message).build();
            }
        };
    }

    @Bean
    public HealthIndicator kafkaHealthIndicator() {
        return () -> {
            try {
                // Simple check - if we can get metrics, Kafka is likely healthy
                kafkaTemplate.metrics();
                return Health.up().withDetail("message", "Kafka is healthy").build();
            } catch (Exception e) {
                return Health.down()
                        .withDetail("message", "Kafka connection failed")
                        .withDetail("error", e.getMessage())
                        .build();
            }
        };
    }
}
