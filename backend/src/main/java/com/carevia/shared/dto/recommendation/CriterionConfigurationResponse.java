package com.carevia.shared.dto.recommendation;

import com.carevia.shared.model.recommendation.TriangularFuzzyNumber;

public record CriterionConfigurationResponse(
	String id,
	String name,
	CriterionPreference preference,
	TriangularFuzzyNumber weight
) {
}