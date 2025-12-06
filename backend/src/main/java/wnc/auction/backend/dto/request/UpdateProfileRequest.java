package wnc.auction.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
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
    private LocalDateTime dateOfBirth;
}
