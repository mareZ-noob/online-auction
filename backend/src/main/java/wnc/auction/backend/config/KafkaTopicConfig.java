package wnc.auction.backend.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${app.audit.topic:auction-audit-logs}")
    private String auditTopicName;

    @Bean
    public NewTopic auditTopic() {
        return TopicBuilder.name(auditTopicName)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
