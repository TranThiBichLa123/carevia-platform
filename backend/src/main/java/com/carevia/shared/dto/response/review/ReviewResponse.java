package com.carevia.shared.dto.response.review;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class ReviewResponse {
    private Long id;
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
    private Instant adminReplyCreatedAt;
    private Instant adminReplyEditedAt;
    private Integer adminReplyEditCount;
    private Boolean adminReplyEdited;
    private Instant createdAt;
}
