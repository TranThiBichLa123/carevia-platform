package com.carevia.controller.recommendation;

import com.carevia.service.recommendation.FuzzyTopsisService;
import com.carevia.shared.dto.recommendation.BookingRecommendationRequest;
import com.carevia.shared.dto.recommendation.BookingRecommendationResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recommendations/bookings/fuzzy-topsis")
public class BookingRecommendationController {

	private final FuzzyTopsisService fuzzyTopsisService;

	public BookingRecommendationController(FuzzyTopsisService fuzzyTopsisService) {
		this.fuzzyTopsisService = fuzzyTopsisService;
	}

	@PostMapping("/rank")
	public ResponseEntity<BookingRecommendationResponse> rankBookingOptions(
		@Valid @RequestBody BookingRecommendationRequest request
	) {
		return ResponseEntity.ok(fuzzyTopsisService.rankBookingOptions(request));
	}

	@GetMapping("/demo")
	public ResponseEntity<BookingRecommendationResponse> getDemoRanking() {
		BookingRecommendationRequest demoRequest = fuzzyTopsisService.buildDemoRequest();
		return ResponseEntity.ok(fuzzyTopsisService.rankBookingOptions(demoRequest));
	}
}