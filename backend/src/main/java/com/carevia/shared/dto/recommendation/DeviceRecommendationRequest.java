package com.carevia.shared.dto.recommendation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record DeviceRecommendationRequest(
	@NotBlank String scenarioName,
	@NotEmpty List<@Valid RecommendationCriterionRequest> criteria,
	@NotEmpty List<@Valid DeviceOptionRequest> alternatives
) {
}
