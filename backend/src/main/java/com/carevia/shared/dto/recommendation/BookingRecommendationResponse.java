package com.carevia.shared.dto.recommendation;

import com.carevia.shared.model.recommendation.TriangularFuzzyNumber;

import java.util.List;

public record BookingRecommendationResponse(
	String algorithm,
	String scenarioName,
	String serviceId,
	TriangularFuzzyNumber positiveIdealSolution,
	TriangularFuzzyNumber negativeIdealSolution,
	List<CriterionConfigurationResponse> criteria,
	List<RankedBookingOptionResponse> rankings
) {
}