package com.carevia.shared.dto.request.review;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ModerateReviewRequest {

    @Size(max = 2000, message = "Admin reply must not exceed 2000 characters")
    private String adminReply;

    private Boolean hidden;
}