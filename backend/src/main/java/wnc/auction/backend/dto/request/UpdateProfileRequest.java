package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "{validation.fullname.required}")
    private String fullName;

    private String address;

    @Past(message = "Date of birth must be in the past")
    private LocalDateTime dateOfBirth;
}
