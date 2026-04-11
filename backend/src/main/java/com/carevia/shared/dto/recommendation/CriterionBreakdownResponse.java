package com.carevia.shared.dto.recommendation;

import com.carevia.shared.model.recommendation.TriangularFuzzyNumber;

public record CriterionBreakdownResponse(
	String criterionId,
	String criterionName,
	TriangularFuzzyNumber rawScore,
	TriangularFuzzyNumber normalizedScore,
	TriangularFuzzyNumber weightedScore
) {
}