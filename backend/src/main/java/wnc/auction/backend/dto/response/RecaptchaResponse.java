package wnc.auction.backend.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class RecaptchaResponse {
    private boolean success;
    private String challenge_ts;
    private String hostname;
    private List<String> errorCodes;
}
