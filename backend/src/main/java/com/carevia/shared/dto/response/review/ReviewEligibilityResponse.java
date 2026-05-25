package com.carevia.shared.dto.response.review;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewEligibilityResponse {
    private Boolean canReview;
    private Boolean alreadyReviewed;
    private Boolean hasCompletedOrder;
    private Long completedOrderId;
    private String completedOrderCode;
    private String message;
}