package com.carevia.shared.dto.recommendation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.Map;

public record BookingOptionRequest(
	@NotBlank String optionId,
	@NotBlank String sessionId,
	@NotBlank String branchName,
	@NotBlank String locationDetail,
	@NotBlank String startTime,
	String endTime,
	@NotEmpty Map<String, @Valid FuzzyValueInput> criteriaScores
) {
}