package wnc.auction.backend.dto.model;

import java.time.LocalDateTime;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;
    private String email;
    private String fullName;
    private String address;
    private LocalDateTime dateOfBirth;
    private String role;
    private Set<String> linkedProviders;
    private Boolean emailVerified;
    private Integer positiveRatings;
    private Integer negativeRatings;
    private String region;
    private String preferredLanguage;
    private Double ratingPercentage;
    private LocalDateTime createdAt;
}
