package com.carevia.shared.dto.recommendation;

import java.util.List;

public record RankedDeviceOptionResponse(
	int rank,
	String optionId,
	String deviceId,
	String name,
	double closenessCoefficient,
	double distanceToPositiveIdeal,
	double distanceToNegativeIdeal,
	boolean recommended,
	List<CriterionBreakdownResponse> criteriaBreakdown
) {
}
