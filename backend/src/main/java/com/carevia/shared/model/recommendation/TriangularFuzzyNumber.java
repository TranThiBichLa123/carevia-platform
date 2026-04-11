package com.carevia.shared.model.recommendation;

public record TriangularFuzzyNumber(double lower, double middle, double upper) {

	public TriangularFuzzyNumber {
		if (lower < 0 || middle < 0 || upper < 0) {
			throw new IllegalArgumentException("Fuzzy number values must be non-negative.");
		}
		if (lower > middle || middle > upper) {
			throw new IllegalArgumentException("Fuzzy number must satisfy lower <= middle <= upper.");
		}
	}

	public static TriangularFuzzyNumber crisp(double value) {
		return new TriangularFuzzyNumber(value, value, value);
	}

	public static TriangularFuzzyNumber zero() {
		return new TriangularFuzzyNumber(0.0, 0.0, 0.0);
	}

	public static TriangularFuzzyNumber one() {
		return new TriangularFuzzyNumber(1.0, 1.0, 1.0);
	}

	public TriangularFuzzyNumber divideBy(double denominator) {
		if (denominator < 0) {
			throw new IllegalArgumentException("Normalization denominator must be non-negative.");
		}
		if (denominator == 0.0) {
			return zero();
		}
		return new TriangularFuzzyNumber(lower / denominator, middle / denominator, upper / denominator);
	}

	public TriangularFuzzyNumber normalizeCost(double bestCost) {
		if (bestCost < 0) {
			throw new IllegalArgumentException("Best cost must be non-negative.");
		}
		if (bestCost == 0.0) {
			return zero();
		}
		if (lower == 0.0) {
			return zero();
		}
		return new TriangularFuzzyNumber(bestCost / upper, bestCost / middle, bestCost / lower);
	}

	public TriangularFuzzyNumber multiply(TriangularFuzzyNumber other) {
		return new TriangularFuzzyNumber(
			lower * other.lower,
			middle * other.middle,
			upper * other.upper
		);
	}

	public double distanceTo(TriangularFuzzyNumber other) {
		double lowerDelta = lower - other.lower;
		double middleDelta = middle - other.middle;
		double upperDelta = upper - other.upper;
		return Math.sqrt((lowerDelta * lowerDelta + middleDelta * middleDelta + upperDelta * upperDelta) / 3.0);
	}

	public TriangularFuzzyNumber round(int scale) {
		double factor = Math.pow(10, scale);
		return new TriangularFuzzyNumber(
			Math.round(lower * factor) / factor,
			Math.round(middle * factor) / factor,
			Math.round(upper * factor) / factor
		);
	}
}