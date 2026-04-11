package com.carevia.shared.dto.recommendation;

import com.carevia.shared.model.recommendation.TriangularFuzzyNumber;
import jakarta.validation.constraints.PositiveOrZero;

public record FuzzyValueInput(
	@PositiveOrZero Double value,
	@PositiveOrZero Double lower,
	@PositiveOrZero Double middle,
	@PositiveOrZero Double upper,
	LinguisticTerm linguisticTerm
) {

	public TriangularFuzzyNumber toFuzzyNumber(String fieldName) {
		if (linguisticTerm != null) {
			return linguisticTerm.toFuzzyNumber();
		}

		if (value != null) {
			return TriangularFuzzyNumber.crisp(value);
		}

		boolean hasExplicitFuzzyParts = lower != null || middle != null || upper != null;
		if (hasExplicitFuzzyParts) {
			if (lower == null || middle == null || upper == null) {
				throw new IllegalArgumentException(fieldName + " must provide lower, middle, and upper together.");
			}
			return new TriangularFuzzyNumber(lower, middle, upper);
		}

		throw new IllegalArgumentException(fieldName + " must provide either a linguisticTerm, a value, or lower/middle/upper.");
	}
}