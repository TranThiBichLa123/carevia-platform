package com.carevia.service.recommendation;

import com.carevia.shared.dto.recommendation.CriterionPreference;
import com.carevia.shared.dto.recommendation.DeviceOptionRequest;
import com.carevia.shared.dto.recommendation.DeviceRecommendationRequest;
import com.carevia.shared.dto.recommendation.DeviceRecommendationResponse;
import com.carevia.shared.dto.recommendation.FuzzyValueInput;
import com.carevia.shared.dto.recommendation.LinguisticTerm;
import com.carevia.shared.dto.recommendation.RecommendationCriterionRequest;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FuzzyTopsisServiceTest {

	private final FuzzyTopsisService fuzzyTopsisService = new FuzzyTopsisService();

	@Test
	void shouldRankDeviceOptionsAndMarkTopDeviceAsRecommended() {
		DeviceRecommendationResponse response = fuzzyTopsisService.rankDeviceOptions(new DeviceRecommendationRequest(
			"Recommend best skin device",
			List.of(
				new RecommendationCriterionRequest("price", "Price", CriterionPreference.COST, fuzzyValue(LinguisticTerm.VERY_HIGH)),
				new RecommendationCriterionRequest("safety", "Safety", CriterionPreference.BENEFIT, fuzzyValue(LinguisticTerm.HIGH))
			),
			List.of(
				new DeviceOptionRequest(
					"device-best",
					"device-best",
					"Budget Safe Device",
					Map.of(
						"price", fuzzyValue(10.0),
						"safety", fuzzyTriangle(0.8, 0.9, 1.0)
					)
				),
				new DeviceOptionRequest(
					"device-balanced",
					"device-balanced",
					"Balanced Device",
					Map.of(
						"price", fuzzyValue(20.0),
						"safety", fuzzyTriangle(0.6, 0.7, 0.8)
					)
				),
				new DeviceOptionRequest(
					"device-expensive",
					"device-expensive",
					"Premium Device",
					Map.of(
						"price", fuzzyValue(50.0),
						"safety", fuzzyTriangle(0.5, 0.6, 0.7)
					)
				)
			)
		));

		assertEquals("Fuzzy TOPSIS", response.algorithm());
		assertEquals(2, response.criteria().size());
		assertEquals(3, response.rankings().size());
		assertEquals("device-best", response.rankings().get(0).deviceId());
		assertEquals(1, response.rankings().get(0).rank());
		assertTrue(response.rankings().get(0).recommended());
		assertEquals(2, response.rankings().get(0).criteriaBreakdown().size());
		assertTrue(response.rankings().get(0).closenessCoefficient() > response.rankings().get(1).closenessCoefficient());
		assertTrue(response.rankings().get(1).closenessCoefficient() > response.rankings().get(2).closenessCoefficient());
	}

	@Test
	void shouldRejectDeviceRequestWithLessThanTwoAlternatives() {
		DeviceRecommendationRequest invalidRequest = new DeviceRecommendationRequest(
			"Invalid request",
			List.of(new RecommendationCriterionRequest("price", "Price", CriterionPreference.COST, fuzzyValue(1.0))),
			List.of(new DeviceOptionRequest(
				"device-only",
				"device-only",
				"Only Device",
				Map.of("price", fuzzyValue(10.0))
			))
		);

		ResponseStatusException exception = assertThrows(
			ResponseStatusException.class,
			() -> fuzzyTopsisService.rankDeviceOptions(invalidRequest)
		);

		assertTrue(exception.getReason().contains("At least two device options"));
	}

	@Test
	void shouldRejectDeviceOptionMissingCriterionScore() {
		DeviceRecommendationRequest invalidRequest = new DeviceRecommendationRequest(
			"Invalid request",
			List.of(
				new RecommendationCriterionRequest("price", "Price", CriterionPreference.COST, fuzzyValue(LinguisticTerm.HIGH)),
				new RecommendationCriterionRequest("safety", "Safety", CriterionPreference.BENEFIT, fuzzyValue(LinguisticTerm.HIGH))
			),
			List.of(
				new DeviceOptionRequest(
					"device-1",
					"device-1",
					"Incomplete Device",
					Map.of("price", fuzzyValue(10.0))
				),
				new DeviceOptionRequest(
					"device-2",
					"device-2",
					"Complete Device",
					Map.of(
						"price", fuzzyValue(15.0),
						"safety", fuzzyValue(4.0)
					)
				)
			)
		);

		ResponseStatusException exception = assertThrows(
			ResponseStatusException.class,
			() -> fuzzyTopsisService.rankDeviceOptions(invalidRequest)
		);

		assertTrue(exception.getReason().contains("missing score"));
	}

	@Test
	void shouldRejectDuplicateDeviceOptionId() {
		DeviceRecommendationRequest invalidRequest = new DeviceRecommendationRequest(
			"Duplicate ids",
			List.of(new RecommendationCriterionRequest("price", "Price", CriterionPreference.COST, fuzzyValue(LinguisticTerm.HIGH))),
			List.of(
				new DeviceOptionRequest("device-1", "device-1", "First Device", Map.of("price", fuzzyValue(10.0))),
				new DeviceOptionRequest("device-1", "device-2", "Second Device", Map.of("price", fuzzyValue(20.0)))
			)
		);

		ResponseStatusException exception = assertThrows(
			ResponseStatusException.class,
			() -> fuzzyTopsisService.rankDeviceOptions(invalidRequest)
		);

		assertTrue(exception.getReason().contains("Duplicate device option id"));
	}

	private static FuzzyValueInput fuzzyValue(double value) {
		return new FuzzyValueInput(value, null, null, null, null);
	}

	private static FuzzyValueInput fuzzyValue(LinguisticTerm term) {
		return new FuzzyValueInput(null, null, null, null, term);
	}

	private static FuzzyValueInput fuzzyTriangle(double lower, double middle, double upper) {
		return new FuzzyValueInput(null, lower, middle, upper, null);
	}
}