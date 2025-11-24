package wnc.auction.backend.mapper;

import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.UserDto;
import wnc.auction.backend.model.User;

@UtilityClass
public class UserMapper {

    public static UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .address(user.getAddress())
                .dateOfBirth(user.getDateOfBirth())
                .role(user.getRole().name())
                .emailVerified(user.getEmailVerified())
                .positiveRatings(user.getPositiveRatings())
                .negativeRatings(user.getNegativeRatings())
                .ratingPercentage(user.getRatingPercentage())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
