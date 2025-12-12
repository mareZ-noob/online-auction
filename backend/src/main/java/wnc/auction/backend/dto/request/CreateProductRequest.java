package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank(message = "{validation.product.name.required}")
    private String name;

    @NotBlank(message = "{validation.product.description.required}")
    private String description;

    @NotNull(message = "{validation.required}")
    @DecimalMin(value = "0.0", inclusive = false, message = "{validation.product.price.min}")
    private BigDecimal startingPrice;

    @NotNull(message = "{validation.required}")
    @DecimalMin(value = "0.0", inclusive = false, message = "{validation.product.price.min}")
    private BigDecimal stepPrice;

    @DecimalMin(value = "0.0", inclusive = false, message = "{validation.product.price.min}")
    private BigDecimal buyNowPrice;

    @NotNull(message = "{validation.product.category.required}")
    private Long categoryId;

    @NotNull(message = "{validation.product.endtime.required}")
    private LocalDateTime endTime;

    private Boolean autoExtend = false;
    private Boolean allowUnratedBidders = false;

    private List<String> images;
}
