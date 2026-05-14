package com.carevia.service;

import com.carevia.core.domain.Account;
import com.carevia.core.domain.Device;
import com.carevia.core.domain.Review;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.DeviceRepository;
import com.carevia.core.repository.ReviewRepository;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.review.CreateReviewRequest;
import com.carevia.shared.dto.request.review.ModerateReviewRequest;
import com.carevia.shared.dto.response.review.AdminReviewResponse;
import com.carevia.shared.dto.response.review.ReviewResponse;
import com.carevia.shared.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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

                refreshDeviceReviewStats(device);

        return toResponse(saved);
    }

        @Transactional(readOnly = true)
        public PageResponse<AdminReviewResponse> getAdminReviews(String search, Boolean hidden, Long deviceId, Pageable pageable) {
                Specification<Review> specification = buildAdminReviewSpecification(search, hidden, deviceId);
                Page<Review> page = reviewRepository.findAll(specification, pageable);

                return PageResponse.<AdminReviewResponse>builder()
                                .items(page.getContent().stream().map(this::toAdminResponse).toList())
                                .page(page.getNumber())
                                .size(page.getSize())
                                .totalItems(page.getTotalElements())
                                .totalPages(page.getTotalPages())
                                .hasNext(page.hasNext())
                                .hasPrevious(page.hasPrevious())
                                .build();
        }

        @Transactional
        public AdminReviewResponse moderateReview(Long reviewId, ModerateReviewRequest request) {
                Review review = reviewRepository.findById(reviewId)
                                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

                if (request.getAdminReply() != null) {
                        String trimmedReply = request.getAdminReply().trim();
                        review.addAdminReply(trimmedReply.isEmpty() ? null : trimmedReply);
                }

                if (request.getHidden() != null) {
                        if (Boolean.TRUE.equals(request.getHidden())) {
                                review.hide();
                        } else {
                                review.show();
                        }
                }

                Review saved = reviewRepository.save(review);
                if (saved.getDevice() != null) {
                        refreshDeviceReviewStats(saved.getDevice());
                }

                return toAdminResponse(saved);
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

        private AdminReviewResponse toAdminResponse(Review review) {
                return AdminReviewResponse.builder()
                                .id(review.getId())
                                .deviceId(review.getDevice() != null ? review.getDevice().getId() : null)
                                .deviceName(review.getDevice() != null ? review.getDevice().getName() : null)
                                .accountId(review.getAccount().getId())
                                .accountName(review.getAccount().getUsername())
                                .accountAvatar(review.getAccount().getAvatarUrl())
                                .rating(review.getRating())
                                .comment(review.getComment())
                                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                                .adminReply(review.getAdminReply())
                                .isHidden(review.getIsHidden())
                                .createdAt(review.getCreatedAt())
                                .updatedAt(review.getUpdatedAt())
                                .build();
        }

        private Specification<Review> buildAdminReviewSpecification(String search, Boolean hidden, Long deviceId) {
                return (root, query, cb) -> {
                        Join<Object, Object> accountJoin = root.join("account", JoinType.LEFT);
                        Join<Object, Object> deviceJoin = root.join("device", JoinType.LEFT);

                        List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

                        if (deviceId != null) {
                                predicates.add(cb.equal(deviceJoin.get("id"), deviceId));
                        }

                        if (hidden != null) {
                                predicates.add(cb.equal(root.get("isHidden"), hidden));
                        }

                        if (search != null && !search.isBlank()) {
                                String likeValue = "%" + search.trim().toLowerCase() + "%";
                                predicates.add(cb.or(
                                                cb.like(cb.lower(root.get("comment")), likeValue),
                                                cb.like(cb.lower(root.get("adminReply")), likeValue),
                                                cb.like(cb.lower(accountJoin.get("username")), likeValue),
                                                cb.like(cb.lower(deviceJoin.get("name")), likeValue)
                                ));
                        }

                        return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
                };
        }

        private void refreshDeviceReviewStats(Device device) {
                Double averageRating = reviewRepository.findAverageRatingByDeviceId(device.getId()).orElse(0.0);
                long visibleReviewCount = reviewRepository.countByDeviceIdAndIsHiddenFalse(device.getId());

                device.setAverageRating(averageRating);
                device.setReviewCount((int) visibleReviewCount);
                deviceRepository.save(device);
        }
}
