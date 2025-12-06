package wnc.auction.backend.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {

    private long totalUsers;
    private long totalBidders;
    private long totalSellers;
    private long totalProducts;
    private long activeProducts;
    private long completedProducts;
    private BigDecimal totalRevenue;
    private long newUsersThisMonth;
    private long newProductsThisMonth;
    private long upgradeRequestsPending;
}
