package wnc.auction.backend.dto.response;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RecaptchaResponse {
    private boolean success;
    private String challenge_ts;
    private String hostname;
    private List<String> errorCodes;
}
