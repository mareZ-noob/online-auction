package wnc.auction.backend.dto.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidHistoryDto {

    private String maskedUserName;
    private BigDecimal amount;
    private LocalDateTime createdAt;
}
