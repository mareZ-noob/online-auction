package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductDescriptionRequest {

    @NotBlank(message = "{validation.product.description.required}")
    private String additionalDescription;
}
