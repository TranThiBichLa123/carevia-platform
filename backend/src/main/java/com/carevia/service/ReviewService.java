package com.carevia.service;

import com.carevia.service.storage.CloudinaryStorageService;
import com.carevia.shared.dto.response.device.DeviceImageUploadResponse;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.Device;
import com.carevia.core.domain.Order;
import com.carevia.core.domain.Review;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.DeviceRepository;
import com.carevia.core.repository.OrderRepository;
import com.carevia.core.repository.ReviewRepository;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.review.CreateReviewRequest;
import com.carevia.shared.dto.request.review.ModerateReviewRequest;
import com.carevia.shared.dto.response.review.AdminReviewResponse;
import com.carevia.shared.dto.response.review.ReviewEligibilityResponse;
import com.carevia.shared.dto.response.review.ReviewResponse;
import com.carevia.shared.exception.InvalidRequestException;
import com.carevia.shared.exception.ResourceNotFoundException;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final DeviceRepository deviceRepository;
    private final AccountRepository accountRepository;
        private final OrderRepository orderRepository;
        private final CloudinaryStorageService cloudinaryStorageService;

    public ReviewService(ReviewRepository reviewRepository, DeviceRepository deviceRepository,
                        AccountRepository accountRepository, OrderRepository orderRepository,
                        CloudinaryStorageService cloudinaryStorageService) {
        this.reviewRepository = reviewRepository;
        this.deviceRepository = deviceRepository;
        this.accountRepository = accountRepository;
                this.orderRepository = orderRepository;
                this.cloudinaryStorageService = cloudinaryStorageService;
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

        @Transactional(readOnly = true)
        public ReviewEligibilityResponse getReviewEligibility(Long deviceId, Long accountId) {
                deviceRepository.findById(deviceId)
                                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));

                Order completedOrder = findLatestCompletedOrder(accountId, deviceId);
                boolean alreadyReviewed = reviewRepository.existsByAccountIdAndDeviceId(accountId, deviceId);
                boolean canReview = completedOrder != null && !alreadyReviewed;

                String message;
                if (canReview) {
                        message = "Bạn có thể viết đánh giá cho sản phẩm này từ đơn hàng đã hoàn tất.";
                } else if (alreadyReviewed) {
                        message = "Bạn đã gửi đánh giá cho sản phẩm này rồi.";
                } else {
                        message = "Chỉ khách hàng có đơn hàng đã hoàn tất chứa sản phẩm này mới được viết đánh giá.";
                }

                return ReviewEligibilityResponse.builder()
                                .canReview(canReview)
                                .alreadyReviewed(alreadyReviewed)
                                .hasCompletedOrder(completedOrder != null)
                                .completedOrderId(completedOrder != null ? completedOrder.getId() : null)
                                .completedOrderCode(completedOrder != null ? completedOrder.getOrderCode() : null)
                                .message(message)
                                .build();
        }

    @Transactional
    public ReviewResponse createReview(Long deviceId, Long accountId, CreateReviewRequest request) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + accountId));

                if (reviewRepository.existsByAccountIdAndDeviceId(accountId, deviceId)) {
                        throw new InvalidRequestException("Bạn đã đánh giá sản phẩm này rồi.");
                }

                Order completedOrder = findLatestCompletedOrder(accountId, deviceId);
                if (completedOrder == null) {
                        throw new InvalidRequestException("Chỉ có thể đánh giá sau khi đơn hàng chứa sản phẩm này đã hoàn tất.");
                }

        Review review = Review.builder()
                .device(device)
                .account(account)
                .order(completedOrder)
                .rating(request.getRating())
                .effectivenessRating(request.getEffectivenessRating())
                .safetyRating(request.getSafetyRating())
                .ergonomicsRating(request.getErgonomicsRating())
                .durabilityRating(request.getDurabilityRating())
                .mediaUrls(normalizeMediaUrls(request.getMediaUrls()))
                .comment(request.getComment())
                .isVerifiedPurchase(true)
                .isHidden(false)
                .build();

        Review saved = reviewRepository.save(review);

                refreshDeviceReviewStats(device);

        return toResponse(saved);
    }

        private Order findLatestCompletedOrder(Long accountId, Long deviceId) {
                return orderRepository.findCompletedOrdersForDeviceReview(accountId, deviceId, PageRequest.of(0, 1))
                                .stream()
                                .findFirst()
                                .orElse(null);
        }

        public DeviceImageUploadResponse uploadReviewImage(Long deviceId, MultipartFile file) {
                deviceRepository.findById(deviceId)
                                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));

                CloudinaryStorageService.UploadResult uploadResult = cloudinaryStorageService.uploadReviewImage(file, deviceId);
                return DeviceImageUploadResponse.builder()
                                .imageUrl(uploadResult.getUrl())
                                .imagePublicId(uploadResult.getPublicId())
                                .build();
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
                .effectivenessRating(r.getEffectivenessRating())
                .safetyRating(r.getSafetyRating())
                .ergonomicsRating(r.getErgonomicsRating())
                .durabilityRating(r.getDurabilityRating())
                .mediaUrls(r.getMediaUrls() != null ? r.getMediaUrls() : List.of())
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
                                .effectivenessRating(review.getEffectivenessRating())
                                .safetyRating(review.getSafetyRating())
                                .ergonomicsRating(review.getErgonomicsRating())
                                .durabilityRating(review.getDurabilityRating())
                                .mediaUrls(review.getMediaUrls() != null ? review.getMediaUrls() : List.of())
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

        private List<String> normalizeMediaUrls(List<String> mediaUrls) {
                if (mediaUrls == null || mediaUrls.isEmpty()) {
                        return null;
                }

                List<String> normalizedUrls = mediaUrls.stream()
                                .filter(url -> url != null && !url.isBlank())
                                .limit(4)
                                .toList();

                return normalizedUrls.isEmpty() ? null : normalizedUrls;
        }
}
