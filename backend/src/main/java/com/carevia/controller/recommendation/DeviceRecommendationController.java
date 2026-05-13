package com.carevia.controller.recommendation;

import com.carevia.service.recommendation.FuzzyTopsisService;
import com.carevia.shared.dto.recommendation.DeviceRecommendationRequest;
import com.carevia.shared.dto.recommendation.DeviceRecommendationResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recommendations/devices/fuzzy-topsis")
public class DeviceRecommendationController {

	private final FuzzyTopsisService fuzzyTopsisService;

	public DeviceRecommendationController(FuzzyTopsisService fuzzyTopsisService) {
		this.fuzzyTopsisService = fuzzyTopsisService;
	}

	@PostMapping("/rank")
	public ResponseEntity<DeviceRecommendationResponse> rankDeviceOptions(
		@Valid @RequestBody DeviceRecommendationRequest request
	) {
		return ResponseEntity.ok(fuzzyTopsisService.rankDeviceOptions(request));
	}
}
