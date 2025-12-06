package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelTransactionRequest {

    @NotBlank(message = "{validation.reason.required}")
    private String reason;
}
