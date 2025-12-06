package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPaymentRequest {

    @NotBlank(message = "{validation.payment.method.required}")
    private String paymentMethod;

    @NotBlank(message = "{validation.transaction.id.required}")
    private String transactionId;
}
