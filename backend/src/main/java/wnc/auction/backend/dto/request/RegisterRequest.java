package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import wnc.auction.backend.validation.StrongPassword;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "{validation.email.required}")
    @Email(message = "{validation.email.invalid}")
    private String email;

    @NotBlank(message = "{validation.password.required}")
    @StrongPassword(message = "{validation.password.strong}")
    private String password;

    @NotBlank(message = "{validation.fullname.required}")
    private String fullName;

    private String address;

    @NotBlank(message = "{validation.recaptcha.required}")
    private String recaptchaToken;

    private String adminSignature;
}
