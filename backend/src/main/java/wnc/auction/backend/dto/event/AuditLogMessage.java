package wnc.auction.backend.dto.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogMessage {

    private String traceId;
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
}
