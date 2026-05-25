package com.carevia.shared.dto.response.review;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class AdminReviewResponse {
    private Long id;
    private Long deviceId;
    private String deviceName;
    private Long accountId;
    private String accountName;
    private String accountAvatar;
    private Integer rating;
    private Integer effectivenessRating;
    private Integer safetyRating;
    private Integer ergonomicsRating;
    private Integer durabilityRating;
    private List<String> mediaUrls;
    private String comment;
    private Boolean isVerifiedPurchase;
    private String adminReply;
    private Boolean isHidden;
    private Instant createdAt;
    private Instant updatedAt;
}