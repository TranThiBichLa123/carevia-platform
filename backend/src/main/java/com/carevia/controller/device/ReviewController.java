package com.carevia.controller.device;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.ReviewService;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.dto.request.review.CreateReviewRequest;
import com.carevia.shared.util.SecurityUtils;

@RestController
@RequestMapping("/api/v1/devices/{deviceId}/reviews")
@Tag(name = "Reviews", description = "Device review APIs")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @Operation(summary = "Get reviews for a device")
    public ResponseEntity<?> getReviews(
            @PathVariable Long deviceId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByDevice(deviceId, pageable));
    }

    @PostMapping
    @Authenticated
    @Operation(summary = "Submit a review for a device")
    public ResponseEntity<?> createReview(
            @PathVariable Long deviceId,
            @Valid @RequestBody CreateReviewRequest request) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new com.carevia.shared.exception.UnauthorizedException("Not authenticated"));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(deviceId, accountId, request));
    }
}
