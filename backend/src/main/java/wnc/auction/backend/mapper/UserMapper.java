package wnc.auction.backend.mapper;

import lombok.experimental.UtilityClass;
import wnc.auction.backend.dto.model.UserDto;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.AuthProvider;

import java.util.ArrayList;
import java.util.List;

@UtilityClass
public class UserMapper {

    public static UserDto toDto(User user) {
        List<String> providers = new ArrayList<>(user.getSocialAccounts().stream()
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
                .positiveRatings(user.getPositiveRatings())
                .negativeRatings(user.getNegativeRatings())
                .ratingPercentage(user.getRatingPercentage())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
