package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import wnc.auction.backend.validation.StrongPassword;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @StrongPassword(message = "Password must be strong: at least 8 chars, 1 upper, 1 lower, 1 digit, 1 special char")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String address;

    @NotBlank(message = "reCAPTCHA token is required")
    private String recaptchaToken;
}
