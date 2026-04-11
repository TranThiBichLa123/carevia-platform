package com.carevia.service.recommendation;

import com.carevia.shared.dto.recommendation.BookingOptionRequest;
import com.carevia.shared.dto.recommendation.BookingRecommendationRequest;
import com.carevia.shared.dto.recommendation.BookingRecommendationResponse;
import com.carevia.shared.dto.recommendation.CriterionPreference;
import com.carevia.shared.dto.recommendation.FuzzyValueInput;
import com.carevia.shared.dto.recommendation.LinguisticTerm;
import com.carevia.shared.dto.recommendation.RecommendationCriterionRequest;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FuzzyTopsisServiceTest {

	private final FuzzyTopsisService fuzzyTopsisService = new FuzzyTopsisService();

	@Test
	void shouldRankDemoScenarioAndMarkFirstOptionAsRecommended() {
		BookingRecommendationResponse response = fuzzyTopsisService.rankBookingOptions(fuzzyTopsisService.buildDemoRequest());

		assertEquals("Fuzzy TOPSIS", response.algorithm());
		assertEquals(3, response.rankings().size());
		assertEquals(1, response.rankings().get(0).rank());
		assertTrue(response.rankings().get(0).recommended());
		assertTrue(response.rankings().get(0).closenessCoefficient() >= response.rankings().get(response.rankings().size() - 1).closenessCoefficient());
	}

	@Test
	void shouldRejectAlternativeMissingCriterionScore() {
		BookingRecommendationRequest invalidRequest = new BookingRecommendationRequest(
			"Invalid request",
			"svc-1",
			List.of(
				new RecommendationCriterionRequest("quality", "Quality", CriterionPreference.BENEFIT, fuzzyValue(LinguisticTerm.VERY_HIGH)),
				new RecommendationCriterionRequest("price", "Price", CriterionPreference.COST, fuzzyValue(0.6))
			),
			List.of(
				new BookingOptionRequest(
					"option-1",
					"sess-1",
					"CareVia Quan 1",
					"Room A",
					"2026-04-15T09:00:00Z",
					"2026-04-15T10:00:00Z",
					Map.of("quality", fuzzyValue(LinguisticTerm.HIGH))
				),
				new BookingOptionRequest(
					"option-2",
					"sess-2",
					"CareVia Phu Nhuan",
					"Room B",
					"2026-04-15T11:00:00Z",
					"2026-04-15T12:00:00Z",
					Map.of(
						"quality", fuzzyValue(LinguisticTerm.MEDIUM),
						"price", fuzzyValue(10.0)
					)
				)
			)
		);

		ResponseStatusException exception = assertThrows(
			ResponseStatusException.class,
			() -> fuzzyTopsisService.rankBookingOptions(invalidRequest)
		);

		assertTrue(exception.getReason().contains("missing score"));
	}

	private static FuzzyValueInput fuzzyValue(double value) {
		return new FuzzyValueInput(value, null, null, null, null);
	}

	private static FuzzyValueInput fuzzyValue(LinguisticTerm term) {
		return new FuzzyValueInput(null, null, null, null, term);
	}
}