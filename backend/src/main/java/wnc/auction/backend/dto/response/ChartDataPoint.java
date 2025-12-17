package wnc.auction.backend.dto.response;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChartDataPoint {
    private String label; // e.g., "01/2025" or "2025"
    private long newUsers;
    private long newProducts;
    private BigDecimal revenue;
}
