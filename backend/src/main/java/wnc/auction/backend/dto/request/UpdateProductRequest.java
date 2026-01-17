package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {

    @NotNull(message = "{validation.product.category.required}")
    @Positive(message = "{validation.product.category.positive}")
    private Long categoryId;

    private String name;

    private String additionalDescription;
}
