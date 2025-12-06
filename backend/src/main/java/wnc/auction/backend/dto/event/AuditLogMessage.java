package wnc.auction.backend.dto.event;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import wnc.auction.backend.model.enumeration.LogType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogMessage {

    private String traceId;
    private LogType logType;
    private String method;
    private String path;
    private Integer status;
    private Long executionTimeMs;
    private Long userId;
    private String email;
    private String clientIp;
    private String errorMessage;
    private LocalDateTime timestamp;
    private Map<String, String[]> parameters;

    // Service layer specific fields
    private String serviceClass;
    private String serviceMethod;
    private String serviceName;

    // Exception specific fields
    private String exceptionType;
    private String stackTrace;
}
