package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import wnc.auction.backend.dto.event.AuditLogMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.audit.topic:auction-audit-logs}")
    private String topic;

    @Async("taskExecutor")
    public void sendAuditLog(AuditLogMessage message) {
        try {
            // Send message to Kafka with traceId as the key
            kafkaTemplate.send(topic, message.getTraceId(), message);
            log.debug("Audit log sent to Kafka: {}", message.getTraceId());
        } catch (Exception e) {
            log.error("Failed to send audit log to Kafka", e);
        }
    }
}
