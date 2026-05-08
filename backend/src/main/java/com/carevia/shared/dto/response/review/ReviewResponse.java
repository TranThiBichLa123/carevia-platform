package com.carevia.shared.dto.response.review;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long accountId;
    private String accountName;
    private String accountAvatar;
    private Integer rating;
    private String comment;
    private Boolean isVerifiedPurchase;
    private String adminReply;
    private Instant createdAt;
}
