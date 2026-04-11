package com.carevia.shared.dto.recommendation;

import java.util.List;

public record RankedBookingOptionResponse(
	int rank,
	String optionId,
	String sessionId,
	String branchName,
	String locationDetail,
	String startTime,
	String endTime,
	double closenessCoefficient,
	double distanceToPositiveIdeal,
	double distanceToNegativeIdeal,
	boolean recommended,
	List<CriterionBreakdownResponse> criteriaBreakdown
) {
}