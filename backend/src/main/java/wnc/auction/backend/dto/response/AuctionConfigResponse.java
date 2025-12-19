package wnc.auction.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionConfigResponse {

    private int thresholdMinutes;
    private int durationMinutes;
}
