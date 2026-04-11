package com.carevia.shared.dto.recommendation;

import com.carevia.shared.model.recommendation.TriangularFuzzyNumber;

public enum LinguisticTerm {
	VERY_LOW(0.0, 0.0, 0.1),
	LOW(0.0, 0.1, 0.3),
	MEDIUM_LOW(0.1, 0.3, 0.5),
	MEDIUM(0.3, 0.5, 0.7),
	MEDIUM_HIGH(0.5, 0.7, 0.9),
	HIGH(0.7, 0.9, 1.0),
	VERY_HIGH(0.9, 1.0, 1.0);

	private final TriangularFuzzyNumber fuzzyNumber;

	LinguisticTerm(double lower, double middle, double upper) {
		this.fuzzyNumber = new TriangularFuzzyNumber(lower, middle, upper);
	}

	public TriangularFuzzyNumber toFuzzyNumber() {
		return fuzzyNumber;
	}
}