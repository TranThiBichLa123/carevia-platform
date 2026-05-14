package com.carevia.controller.review;

import com.carevia.service.ReviewService;
import com.carevia.shared.annotation.AdminOnly;
import com.carevia.shared.dto.request.review.ModerateReviewRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@Tag(name = "Admin Reviews", description = "Administrative review moderation APIs")
public class AdminReviewController {

    private final ReviewService reviewService;

    public AdminReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @AdminOnly
    @Operation(summary = "Get reviews for admin moderation")
    public ResponseEntity<?> getReviews(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean hidden,
            @RequestParam(required = false) Long deviceId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getAdminReviews(search, hidden, deviceId, pageable));
    }

    @PatchMapping("/{reviewId}")
    @AdminOnly
    @Operation(summary = "Moderate a review by replying or changing visibility")
    public ResponseEntity<?> moderateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ModerateReviewRequest request) {
        return ResponseEntity.ok(reviewService.moderateReview(reviewId, request));
    }
}