package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal startingPrice;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal stepPrice;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal buyNowPrice;

    @NotNull
    private Long categoryId;

    @NotNull
    private LocalDateTime endTime;

    private Boolean autoExtend = false;
    private Boolean allowUnratedBidders = false;

    @Size(min = 3, message = "At least 3 images required")
    private List<String> images;
}

