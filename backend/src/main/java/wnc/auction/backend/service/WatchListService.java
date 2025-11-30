package wnc.auction.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.ProductListDto;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.ProductMapper;
import wnc.auction.backend.model.Product;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.WatchList;
import wnc.auction.backend.repository.ProductRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.repository.WatchListRepository;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.utils.Constants;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WatchListService {

    private final WatchListRepository watchListRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public void addToWatchList(Long productId) {
        Long userId = CurrentUser.getUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.PRODUCT_NOT_FOUND));

        if (watchListRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("Product already in watchlist");
        }

        WatchList watchList = WatchList.builder()
                .user(user)
                .product(product)
                .build();

        watchListRepository.save(watchList);

        log.info("Product {} added to watchlist by user {}", productId, userId);
    }

    public void removeFromWatchList(Long productId) {
        Long userId = CurrentUser.getUserId();

        if (!watchListRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new NotFoundException("Product not in watchlist");
        }

        watchListRepository.deleteByUserIdAndProductId(userId, productId);

        log.info("Product {} removed from watchlist by user {}", productId, userId);
    }

    public PageResponse<ProductListDto> getMyWatchList(int page, int size) {
        Long userId = CurrentUser.getUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<WatchList> watchListPage = watchListRepository.findByUserId(userId, pageable);

        List<ProductListDto> content = watchListPage.getContent().stream()
                .map(wl -> ProductMapper.toListDto(wl.getProduct()))
                .toList();

        return PageResponse.<ProductListDto>builder()
                .content(content)
                .page(watchListPage.getNumber())
                .size(watchListPage.getSize())
                .totalElements(watchListPage.getTotalElements())
                .totalPages(watchListPage.getTotalPages())
                .last(watchListPage.isLast())
                .build();
    }

    public boolean isInWatchList(Long productId) {
        Long userId = CurrentUser.getUserId();
        if (userId == null) return false;

        return watchListRepository.existsByUserIdAndProductId(userId, productId);
    }
}
