package com.carevia.shared.dto.recommendation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RecommendationCriterionRequest(
	@NotBlank String id,
	@NotBlank String name,
	@NotNull CriterionPreference preference,
	@NotNull @Valid FuzzyValueInput weight
) {
}