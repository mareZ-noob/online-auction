package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import wnc.auction.backend.dto.event.AuditLogMessage;
import wnc.auction.backend.model.enumeration.LogType;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topic.audit-log:audit-log}")
    private String auditLogTopic;

    @Value("${app.kafka.topic.exception-log:exception-log}")
    private String exceptionLogTopic;

    @Async("taskExecutor")
    public void sendAuditLog(AuditLogMessage message) {
        try {
            String topic = determineTopicByLogType(message.getLogType());
            kafkaTemplate.send(topic, message.getTraceId(), message);
            log.debug("Sent audit log to topic: {} with traceId: {}", topic, message.getTraceId());
        } catch (Exception e) {
            log.error("Failed to send audit log to Kafka: {}", e.getMessage(), e);
        }
    }

    private String determineTopicByLogType(LogType logType) {
        if (logType == LogType.EXCEPTION_ERROR) {
            return exceptionLogTopic;
        }
        return auditLogTopic;
    }
}
