package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerQuestionRequest {

    @NotBlank(message = "{validation.answer.required}")
    private String answer;
}
