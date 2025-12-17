package wnc.auction.backend.mapper;

import java.util.HashSet;
import java.util.Set;
import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.UserDto;
import wnc.auction.backend.model.User;

@UtilityClass
public class UserMapper {

    public static UserDto toDto(User user) {
        Set<String> providers = new HashSet<>(user.getSocialAccounts().stream()
                .map(acc -> acc.getProvider().name())
                .toList());

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            providers.add("LOCAL");
        }

        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .address(user.getAddress())
                .dateOfBirth(user.getDateOfBirth())
                .role(user.getRole().name())
                .linkedProviders(providers)
                .emailVerified(user.getEmailVerified())
                .isActive(user.getIsActive())
                .positiveRatings(user.getPositiveRatings())
                .negativeRatings(user.getNegativeRatings())
                .ratingPercentage(user.getRatingPercentage())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
