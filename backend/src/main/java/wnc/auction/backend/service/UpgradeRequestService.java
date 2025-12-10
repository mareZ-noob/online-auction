package wnc.auction.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import wnc.auction.backend.dto.model.UpgradeRequestDto;
import wnc.auction.backend.dto.request.CreateUpgradeRequest;
import wnc.auction.backend.dto.request.ReviewUpgradeRequest;
import wnc.auction.backend.dto.response.PageResponse;
import wnc.auction.backend.exception.BadRequestException;
import wnc.auction.backend.exception.NotFoundException;
import wnc.auction.backend.mapper.UpgradeRequestMapper;
import wnc.auction.backend.model.UpgradeRequest;
import wnc.auction.backend.model.User;
import wnc.auction.backend.model.enumeration.RequestStatus;
import wnc.auction.backend.model.enumeration.UserRole;
import wnc.auction.backend.repository.UpgradeRequestRepository;
import wnc.auction.backend.repository.UserRepository;
import wnc.auction.backend.security.CurrentUser;
import wnc.auction.backend.utils.Constants;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UpgradeRequestService {

    private final UpgradeRequestRepository upgradeRequestRepository;
    private final UserRepository userRepository;
    private final UserSchedulerService userSchedulerService;

    public UpgradeRequestDto createUpgradeRequest(CreateUpgradeRequest request) {
        Long userId = CurrentUser.getUserId();
        User user = userRepository
                .findById(userId)
                .orElseThrow(() -> new NotFoundException(Constants.ErrorCode.USER_NOT_FOUND));

        if (user.getRole() != UserRole.BIDDER) {
            throw new BadRequestException("Only bidders can request upgrade");
        }

        // Check if there's already a pending request
        Optional<UpgradeRequest> pending = upgradeRequestRepository.findPendingRequestByUserId(userId);

        if (pending.isPresent()) {
            throw new BadRequestException("You already have a pending upgrade request");
        }

        UpgradeRequest upgradeRequest = UpgradeRequest.builder()
                .user(user)
                .status(RequestStatus.PENDING)
                .reason(request.getReason())
                .build();

        upgradeRequest = upgradeRequestRepository.save(upgradeRequest);

        log.info("Upgrade request created by user: {}", userId);

        return UpgradeRequestMapper.toDto(upgradeRequest);
    }

    public PageResponse<UpgradeRequestDto> getPendingRequests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UpgradeRequest> requestPage = upgradeRequestRepository.findPendingRequests(pageable);

        List<UpgradeRequestDto> content = requestPage.getContent().stream()
                .map(UpgradeRequestMapper::toDto)
                .toList();

        return PageResponse.<UpgradeRequestDto>builder()
                .content(content)
                .page(requestPage.getNumber())
                .size(requestPage.getSize())
                .totalElements(requestPage.getTotalElements())
                .totalPages(requestPage.getTotalPages())
                .last(requestPage.isLast())
                .build();
    }

    public UpgradeRequestDto reviewUpgradeRequest(Long requestId, ReviewUpgradeRequest request) {
        Long adminId = CurrentUser.getUserId();
        User admin = userRepository.findById(adminId).orElseThrow(() -> new NotFoundException("Admin not found"));

        UpgradeRequest upgradeRequest = upgradeRequestRepository
                .findById(requestId)
                .orElseThrow(() -> new NotFoundException("Upgrade request not found"));

        if (upgradeRequest.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Request has already been reviewed");
        }

        upgradeRequest.setStatus(request.getApproved() ? RequestStatus.APPROVED : RequestStatus.REJECTED);
        upgradeRequest.setReviewedBy(admin);
        upgradeRequest.setReviewedAt(LocalDateTime.now());

        // If approved, upgrade user to seller
        if (request.getApproved()) {
            User user = upgradeRequest.getUser();
            user.setRole(UserRole.SELLER);
            LocalDateTime expirationTime = LocalDateTime.now().plusDays(7);
            user.setRoleExpirationDate(expirationTime);

            // Schedule
            userSchedulerService.scheduleSellerExpiration(user.getId(), expirationTime);

            log.info("User {} upgraded to SELLER for 7 days until {}", user.getId(), expirationTime);
            userRepository.save(user);
        }

        upgradeRequest = upgradeRequestRepository.save(upgradeRequest);

        log.info(
                "Upgrade request {} {} by admin {}",
                requestId,
                request.getApproved() ? "approved" : "rejected",
                adminId);

        return UpgradeRequestMapper.toDto(upgradeRequest);
    }

    public List<UpgradeRequestDto> getMyUpgradeRequests() {
        Long userId = CurrentUser.getUserId();
        List<UpgradeRequest> requests = upgradeRequestRepository.findByUserId(userId);

        return requests.stream().map(UpgradeRequestMapper::toDto).toList();
    }
}
