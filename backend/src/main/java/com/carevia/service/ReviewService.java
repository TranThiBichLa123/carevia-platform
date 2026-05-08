package com.carevia.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.Device;
import com.carevia.core.domain.Review;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.DeviceRepository;
import com.carevia.core.repository.ReviewRepository;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.review.CreateReviewRequest;
import com.carevia.shared.dto.response.review.ReviewResponse;
import com.carevia.shared.exception.ResourceNotFoundException;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final DeviceRepository deviceRepository;
    private final AccountRepository accountRepository;

    public ReviewService(ReviewRepository reviewRepository, DeviceRepository deviceRepository,
            AccountRepository accountRepository) {
        this.reviewRepository = reviewRepository;
        this.deviceRepository = deviceRepository;
        this.accountRepository = accountRepository;
    }

    public PageResponse<ReviewResponse> getReviewsByDevice(Long deviceId, Pageable pageable) {
        Page<Review> page = reviewRepository.findByDeviceIdAndIsHiddenFalse(deviceId, pageable);
        return PageResponse.<ReviewResponse>builder()
                .items(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    @Transactional
    public ReviewResponse createReview(Long deviceId, Long accountId, CreateReviewRequest request) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

        Review review = Review.builder()
                .device(device)
                .account(account)
                .rating(request.getRating())
                .comment(request.getComment())
                .isVerifiedPurchase(false)
                .isHidden(false)
                .build();

        Review saved = reviewRepository.save(review);

        // Update device average rating
        device.updateRating(request.getRating());
        deviceRepository.save(device);

        return toResponse(saved);
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .accountId(r.getAccount().getId())
                .accountName(r.getAccount().getUsername())
                .accountAvatar(r.getAccount().getAvatarUrl())
                .rating(r.getRating())
                .comment(r.getComment())
                .isVerifiedPurchase(r.getIsVerifiedPurchase())
                .adminReply(r.getAdminReply())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
