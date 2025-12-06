package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RateUserRequest {

    @NotNull(message = "{validation.required}")
    private Long userId;

    @NotNull(message = "{validation.product.id.required}")
    private Long productId;

    @NotNull(message = "{validation.required}")
    private Boolean isPositive;

    private String comment;
}
