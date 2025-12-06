package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangeLanguageRequest {

    @NotBlank(message = "{validation.language.required}")
    @Pattern(regexp = "^(vi|en)$", message = "{validation.language.invalid}")
    private String language;
}
