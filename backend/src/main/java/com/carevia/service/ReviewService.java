package com.carevia.service;

import com.carevia.core.domain.AuditLog;
import com.carevia.service.storage.CloudinaryStorageService;
import com.carevia.shared.dto.response.device.DeviceImageUploadResponse;
import com.carevia.core.domain.Account;
import com.carevia.core.domain.Device;
import com.carevia.core.domain.Order;
import com.carevia.core.domain.Review;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.AuditLogRepository;
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
import com.carevia.shared.util.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReviewService {

        private static final Duration STAFF_REPLY_EDIT_WINDOW = Duration.ofMinutes(30);
        private static final int STAFF_REPLY_MAX_EDITS = 2;

    private final ReviewRepository reviewRepository;
    private final DeviceRepository deviceRepository;
    private final AccountRepository accountRepository;
        private final OrderRepository orderRepository;
        private final CloudinaryStorageService cloudinaryStorageService;
        private final StaffBrandAccessService staffBrandAccessService;
        private final AuditLogRepository auditLogRepository;
        private final ObjectMapper objectMapper;

    public ReviewService(ReviewRepository reviewRepository, DeviceRepository deviceRepository,
                        AccountRepository accountRepository, OrderRepository orderRepository,
                        CloudinaryStorageService cloudinaryStorageService,
                        StaffBrandAccessService staffBrandAccessService,
                        AuditLogRepository auditLogRepository,
                        ObjectMapper objectMapper) {
        this.reviewRepository = reviewRepository;
        this.deviceRepository = deviceRepository;
        this.accountRepository = accountRepository;
                this.orderRepository = orderRepository;
                this.cloudinaryStorageService = cloudinaryStorageService;
                this.staffBrandAccessService = staffBrandAccessService;
                this.auditLogRepository = auditLogRepository;
                this.objectMapper = objectMapper;
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
                        applyReplyUpdate(review, request.getAdminReply(), false);
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

        @Transactional
        public ReviewResponse replyToReviewAsStaff(Long reviewId, ModerateReviewRequest request) {
                if (request.getHidden() != null) {
                        throw new InvalidRequestException("Staff chỉ được cập nhật nội dung phản hồi công khai.");
                }

                if (request.getAdminReply() == null) {
                        throw new InvalidRequestException("Nội dung phản hồi không được để trống.");
                }

                Review review = reviewRepository.findById(reviewId)
                                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + reviewId));

                staffBrandAccessService.requireManageableDevice(review.getDevice());

                                String trimmedReply = normalizeReply(request.getAdminReply());
                                if (trimmedReply == null) {
                        throw new InvalidRequestException("Nội dung phản hồi không được để trống.");
                }

                                applyReplyUpdate(review, trimmedReply, true);
                Review saved = reviewRepository.save(review);
                return toResponse(saved);
        }

        private void applyReplyUpdate(Review review, String requestedReply, boolean enforceStaffLimits) {
                String normalizedReply = normalizeReply(requestedReply);
                String currentReply = normalizeReply(review.getAdminReply());
                Instant now = Instant.now();

                if (normalizedReply == null) {
                        if (currentReply != null) {
                                recordReplyAudit(review, currentReply, null, review.getAdminReplyEditCount(), review.getAdminReplyEditCount());
                        }
                        review.addAdminReply(null);
                        review.setAdminReplyCreatedAt(null);
                        review.setAdminReplyEditedAt(null);
                        review.setAdminReplyEditCount(0);
                        return;
                }

                if (currentReply == null) {
                        review.addAdminReply(normalizedReply);
                        review.setAdminReplyCreatedAt(now);
                        review.setAdminReplyEditedAt(null);
                        review.setAdminReplyEditCount(0);
                        return;
                }

                if (currentReply.equals(normalizedReply)) {
                        return;
                }

                int currentEditCount = review.getAdminReplyEditCount() != null ? review.getAdminReplyEditCount() : 0;
                if (enforceStaffLimits) {
                        Instant replyCreatedAt = review.getAdminReplyCreatedAt();
                        if (replyCreatedAt == null) {
                                throw new InvalidRequestException("Không xác định được thời điểm đăng phản hồi để chỉnh sửa.");
                        }
                        if (now.isAfter(replyCreatedAt.plus(STAFF_REPLY_EDIT_WINDOW))) {
                                throw new InvalidRequestException("Phản hồi chỉ được chỉnh sửa trong vòng 30 phút kể từ khi đăng.");
                        }
                        if (currentEditCount >= STAFF_REPLY_MAX_EDITS) {
                                throw new InvalidRequestException("Phản hồi chỉ được chỉnh sửa tối đa 2 lần.");
                        }
                }

                int nextEditCount = currentEditCount + 1;
                recordReplyAudit(review, currentReply, normalizedReply, currentEditCount, nextEditCount);
                review.addAdminReply(normalizedReply);
                review.setAdminReplyCreatedAt(review.getAdminReplyCreatedAt() != null ? review.getAdminReplyCreatedAt() : now);
                review.setAdminReplyEditedAt(now);
                review.setAdminReplyEditCount(nextEditCount);
        }

        private void recordReplyAudit(Review review, String oldReply, String newReply, Integer previousEditCount, Integer nextEditCount) {
                Account actor = resolveCurrentActor();
                if (actor == null) {
                        return;
                }

                Map<String, Object> payload = new LinkedHashMap<>();
                payload.put("reviewId", review.getId());
                payload.put("deviceId", review.getDevice() != null ? review.getDevice().getId() : null);
                payload.put("oldReply", oldReply);
                payload.put("newReply", newReply);
                payload.put("previousEditCount", previousEditCount != null ? previousEditCount : 0);
                payload.put("nextEditCount", nextEditCount != null ? nextEditCount : 0);
                payload.put("replyCreatedAt", review.getAdminReplyCreatedAt());
                payload.put("replyEditedAt", Instant.now());

                auditLogRepository.save(AuditLog.logUpdate(
                                "review_reply",
                                String.valueOf(review.getId()),
                                toJson(payload),
                                actor,
                                resolveIpAddress()));
        }

        private Account resolveCurrentActor() {
                return SecurityUtils.getCurrentUserId()
                                .flatMap(accountRepository::findById)
                                .orElse(null);
        }

        private String resolveIpAddress() {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes == null) {
                        return null;
                }

                HttpServletRequest request = attributes.getRequest();
                String forwardedFor = request.getHeader("X-Forwarded-For");
                if (forwardedFor != null && !forwardedFor.isBlank()) {
                        return forwardedFor.split(",")[0].trim();
                }

                return request.getRemoteAddr();
        }

        private String toJson(Map<String, Object> payload) {
                try {
                        return objectMapper.writeValueAsString(payload);
                } catch (JsonProcessingException exception) {
                        return "{\"serializationError\":\"" + exception.getMessage().replace("\"", "'") + "\"}";
                }
        }

        private String normalizeReply(String reply) {
                if (reply == null) {
                        return null;
                }

                String trimmedReply = reply.trim();
                return trimmedReply.isEmpty() ? null : trimmedReply;
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
                .adminReplyCreatedAt(r.getAdminReplyCreatedAt())
                .adminReplyEditedAt(r.getAdminReplyEditedAt())
                .adminReplyEditCount(r.getAdminReplyEditCount() != null ? r.getAdminReplyEditCount() : 0)
                .adminReplyEdited((r.getAdminReplyEditCount() != null ? r.getAdminReplyEditCount() : 0) > 0)
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
                                .adminReplyCreatedAt(review.getAdminReplyCreatedAt())
                                .adminReplyEditedAt(review.getAdminReplyEditedAt())
                                .adminReplyEditCount(review.getAdminReplyEditCount() != null ? review.getAdminReplyEditCount() : 0)
                                .adminReplyEdited((review.getAdminReplyEditCount() != null ? review.getAdminReplyEditCount() : 0) > 0)
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
