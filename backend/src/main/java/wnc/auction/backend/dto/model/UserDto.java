package wnc.auction.backend.dto.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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
    private List<String> linkedProviders;
    private Boolean emailVerified;
    private Integer positiveRatings;
    private Integer negativeRatings;
    private Double ratingPercentage;
    private LocalDateTime createdAt;
}
