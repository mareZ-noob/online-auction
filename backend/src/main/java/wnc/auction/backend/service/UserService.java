package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.RatingDto;
import wnc.auction.backend.dto.model.UserDto;
import wnc.auction.backend.dto.request.ChangePasswordRequest;
import wnc.auction.backend.dto.request.UpdateProfileRequest;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.UserMapper;
import wnc.auction.backend.model.User;
import wnc.auction.backend.repository.RatingRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.CurrentUser;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RatingRepository ratingRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDto getCurrentUser() {
        Long userId = CurrentUser.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return UserMapper.toDto(user);
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return UserMapper.toDto(user);
    }

    public UserDto updateProfile(UpdateProfileRequest request) {
        Long userId = CurrentUser.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setFullName(request.getFullName());
        user.setAddress(request.getAddress());
        user.setDateOfBirth(request.getDateOfBirth());

        user = userRepository.save(user);
        return UserMapper.toDto(user);
    }

    public void changePassword(ChangePasswordRequest request) {
        Long userId = CurrentUser.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public PageResponse<RatingDto> getMyRatings(int page, int size) {
        // Implementation similar to other paginated methods
        return null;
    }
}
