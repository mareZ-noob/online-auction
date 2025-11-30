package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.RatingDto;
import wnc.auction.backend.dto.request.RateUserRequest;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.ForbiddenException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.RatingMapper;
import wnc.auction.backend.model.Product;
import wnc.auction.backend.model.Rating;
import wnc.auction.backend.model.Transaction;
import wnc.auction.backend.model.User;
import wnc.auction.backend.repository.ProductRepository;
import wnc.auction.backend.repository.RatingRepository;
import wnc.auction.backend.repository.TransactionRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.utils.Constants;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final TransactionRepository transactionRepository;

    public RatingDto rateUser(RateUserRequest request) {
        Long raterId = CurrentUser.getUserId();
        User rater = userRepository.findById(raterId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found"));

        // Verify that rater is involved in this transaction
        Transaction transaction = transactionRepository.findByProductId(product.getId())
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        if (!transaction.getBuyer().getId().equals(raterId) &&
            !transaction.getSeller().getId().equals(raterId)) {
            throw new ForbiddenException("You can only rate users you transacted with");
        }

        // Check if already rated
        Optional<Rating> existing = ratingRepository.findByUserIdAndRatedByIdAndProductId(
            request.getUserId(), raterId, request.getProductId()
        );

        Rating rating;
        if (existing.isPresent()) {
            // Update existing rating
            rating = existing.get();

            // Update user's rating counts
            if (rating.getIsPositive() != request.getIsPositive()) {
                if (request.getIsPositive()) {
                    user.setPositiveRatings(user.getPositiveRatings() + 1);
                    user.setNegativeRatings(user.getNegativeRatings() - 1);
                } else {
                    user.setPositiveRatings(user.getPositiveRatings() - 1);
                    user.setNegativeRatings(user.getNegativeRatings() + 1);
                }
            }

            rating.setIsPositive(request.getIsPositive());
            rating.setComment(request.getComment());
        } else {
            // Create new rating
            rating = Rating.builder()
                    .user(user)
                    .ratedBy(rater)
                    .product(product)
                    .isPositive(request.getIsPositive())
                    .comment(request.getComment())
                    .build();

            // Update user's rating counts
            if (request.getIsPositive()) {
                user.setPositiveRatings(user.getPositiveRatings() + 1);
            } else {
                user.setNegativeRatings(user.getNegativeRatings() + 1);
            }
        }

        rating = ratingRepository.save(rating);
        userRepository.save(user);

        log.info("User {} rated by user {}: {}",
            request.getUserId(), raterId, request.getIsPositive());

        return RatingMapper.toDto(rating);
    }

    public PageResponse<RatingDto> getUserRatings(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Rating> ratingPage = ratingRepository.findByUserId(userId, pageable);

        List<RatingDto> content = ratingPage.getContent().stream()
                .map(RatingMapper::toDto)
                .toList();

        return PageResponse.<RatingDto>builder()
                .content(content)
                .page(ratingPage.getNumber())
                .size(ratingPage.getSize())
                .totalElements(ratingPage.getTotalElements())
                .totalPages(ratingPage.getTotalPages())
                .last(ratingPage.isLast())
                .build();
    }
}
