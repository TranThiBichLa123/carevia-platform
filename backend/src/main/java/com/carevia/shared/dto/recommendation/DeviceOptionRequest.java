package com.carevia.shared.dto.recommendation;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.Map;

public record DeviceOptionRequest(
	@NotBlank String optionId,
	@NotBlank String deviceId,
	@NotBlank String name,
	@NotEmpty Map<String, @Valid FuzzyValueInput> criteriaScores
) {
}
