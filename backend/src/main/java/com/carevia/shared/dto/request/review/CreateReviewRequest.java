package com.carevia.shared.dto.request.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CreateReviewRequest {

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @NotNull(message = "Effectiveness rating is required")
    @Min(value = 1, message = "Effectiveness rating must be at least 1")
    @Max(value = 5, message = "Effectiveness rating must be at most 5")
    private Integer effectivenessRating;

    @NotNull(message = "Safety rating is required")
    @Min(value = 1, message = "Safety rating must be at least 1")
    @Max(value = 5, message = "Safety rating must be at most 5")
    private Integer safetyRating;

    @NotNull(message = "Ergonomics rating is required")
    @Min(value = 1, message = "Ergonomics rating must be at least 1")
    @Max(value = 5, message = "Ergonomics rating must be at most 5")
    private Integer ergonomicsRating;

    @NotNull(message = "Durability rating is required")
    @Min(value = 1, message = "Durability rating must be at least 1")
    @Max(value = 5, message = "Durability rating must be at most 5")
    private Integer durabilityRating;

    @Size(max = 4, message = "You can upload up to 4 review images")
    private List<String> mediaUrls;

    private String comment;
}
