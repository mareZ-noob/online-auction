package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AskQuestionRequest {

    @NotNull(message = "{validation.product.id.required}")
    private Long productId;

    @NotBlank(message = "{validation.question.required}")
    private String question;
}
