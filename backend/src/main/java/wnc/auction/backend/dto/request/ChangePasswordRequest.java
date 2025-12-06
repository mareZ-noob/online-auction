package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import wnc.auction.backend.validation.StrongPassword;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @NotBlank(message = "{validation.password.required}")
    private String oldPassword;

    @NotBlank(message = "{validation.password.required}")
    @StrongPassword(message = "{validation.password.strong}")
    private String newPassword;
}
