package com.carevia.shared.dto.recommendation;

import com.carevia.shared.model.recommendation.TriangularFuzzyNumber;

import java.util.List;

public record DeviceRecommendationResponse(
	String algorithm,
	String scenarioName,
	TriangularFuzzyNumber positiveIdeal,
	TriangularFuzzyNumber negativeIdeal,
	List<CriterionConfigurationResponse> criteria,
	List<RankedDeviceOptionResponse> rankings
) {
}
