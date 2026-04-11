package com.carevia.service.recommendation;

import com.carevia.shared.dto.recommendation.BookingOptionRequest;
import com.carevia.shared.dto.recommendation.BookingRecommendationRequest;
import com.carevia.shared.dto.recommendation.BookingRecommendationResponse;
import com.carevia.shared.dto.recommendation.CriterionBreakdownResponse;
import com.carevia.shared.dto.recommendation.CriterionConfigurationResponse;
import com.carevia.shared.dto.recommendation.CriterionPreference;
import com.carevia.shared.dto.recommendation.FuzzyValueInput;
import com.carevia.shared.dto.recommendation.LinguisticTerm;
import com.carevia.shared.dto.recommendation.RankedBookingOptionResponse;
import com.carevia.shared.dto.recommendation.RecommendationCriterionRequest;
import com.carevia.shared.model.recommendation.TriangularFuzzyNumber;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class FuzzyTopsisService {

	private static final TriangularFuzzyNumber POSITIVE_IDEAL = TriangularFuzzyNumber.one();
	private static final TriangularFuzzyNumber NEGATIVE_IDEAL = TriangularFuzzyNumber.zero();
	private static final String ALGORITHM_NAME = "Fuzzy TOPSIS";

	public BookingRecommendationResponse rankBookingOptions(BookingRecommendationRequest request) {
		validateRequest(request);

		List<ResolvedCriterion> criteria = resolveCriteria(request.criteria());
		List<ResolvedAlternative> alternatives = resolveAlternatives(request.alternatives(), criteria);
		Map<String, Double> benefitDenominators = resolveBenefitDenominators(criteria, alternatives);
		Map<String, Double> costDenominators = resolveCostDenominators(criteria, alternatives);

		List<ScoredAlternative> scoredAlternatives = new ArrayList<>();
		for (ResolvedAlternative alternative : alternatives) {
			List<CriterionBreakdownResponse> breakdown = new ArrayList<>();
			double distanceToPositiveIdeal = 0.0;
			double distanceToNegativeIdeal = 0.0;

			for (ResolvedCriterion criterion : criteria) {
				TriangularFuzzyNumber rawScore = alternative.rawScores().get(criterion.id());
				TriangularFuzzyNumber normalizedScore = normalizeScore(
					rawScore,
					criterion,
					benefitDenominators.get(criterion.id()),
					costDenominators.get(criterion.id())
				);
				TriangularFuzzyNumber weightedScore = normalizedScore.multiply(criterion.weight()).round(6);
				distanceToPositiveIdeal += weightedScore.distanceTo(POSITIVE_IDEAL);
				distanceToNegativeIdeal += weightedScore.distanceTo(NEGATIVE_IDEAL);

				breakdown.add(new CriterionBreakdownResponse(
					criterion.id(),
					criterion.name(),
					rawScore.round(6),
					normalizedScore.round(6),
					weightedScore
				));
			}

			double closenessCoefficient = distanceToNegativeIdeal / (distanceToPositiveIdeal + distanceToNegativeIdeal);
			scoredAlternatives.add(new ScoredAlternative(
				alternative,
				round(distanceToPositiveIdeal),
				round(distanceToNegativeIdeal),
				round(closenessCoefficient),
				breakdown
			));
		}

		scoredAlternatives.sort(Comparator
			.comparingDouble(ScoredAlternative::closenessCoefficient).reversed()
			.thenComparing(Comparator.comparingDouble(ScoredAlternative::distanceToNegativeIdeal).reversed())
			.thenComparing(scored -> scored.alternative().optionId()));

		List<RankedBookingOptionResponse> rankings = new ArrayList<>();
		for (int index = 0; index < scoredAlternatives.size(); index++) {
			ScoredAlternative scored = scoredAlternatives.get(index);
			ResolvedAlternative alternative = scored.alternative();
			rankings.add(new RankedBookingOptionResponse(
				index + 1,
				alternative.optionId(),
				alternative.sessionId(),
				alternative.branchName(),
				alternative.locationDetail(),
				alternative.startTime(),
				alternative.endTime(),
				scored.closenessCoefficient(),
				scored.distanceToPositiveIdeal(),
				scored.distanceToNegativeIdeal(),
				index == 0,
				scored.breakdown()
			));
		}

		List<CriterionConfigurationResponse> criterionResponses = criteria.stream()
			.map(criterion -> new CriterionConfigurationResponse(
				criterion.id(),
				criterion.name(),
				criterion.preference(),
				criterion.weight().round(6)
			))
			.toList();

		return new BookingRecommendationResponse(
			ALGORITHM_NAME,
			request.scenarioName(),
			request.serviceId(),
			POSITIVE_IDEAL,
			NEGATIVE_IDEAL,
			criterionResponses,
			rankings
		);
	}

	public BookingRecommendationRequest buildDemoRequest() {
		List<RecommendationCriterionRequest> criteria = List.of(
			new RecommendationCriterionRequest("distanceKm", "Distance to branch", CriterionPreference.COST, fuzzyValue(0.95)),
			new RecommendationCriterionRequest("bookingPrice", "Booking price", CriterionPreference.COST, fuzzyValue(0.8)),
			new RecommendationCriterionRequest("availableSlots", "Available slots", CriterionPreference.BENEFIT, fuzzyValue(LinguisticTerm.HIGH)),
			new RecommendationCriterionRequest("serviceQuality", "Service quality", CriterionPreference.BENEFIT, fuzzyValue(LinguisticTerm.VERY_HIGH)),
			new RecommendationCriterionRequest("supportResponsiveness", "Support responsiveness", CriterionPreference.BENEFIT, fuzzyValue(LinguisticTerm.HIGH))
		);

		Map<String, FuzzyValueInput> optionOneScores = new LinkedHashMap<>();
		optionOneScores.put("distanceKm", fuzzyValue(2.0));
		optionOneScores.put("bookingPrice", fuzzyValue(15.0));
		optionOneScores.put("availableSlots", fuzzyValue(4.0));
		optionOneScores.put("serviceQuality", fuzzyValue(LinguisticTerm.HIGH));
		optionOneScores.put("supportResponsiveness", fuzzyValue(LinguisticTerm.HIGH));

		Map<String, FuzzyValueInput> optionTwoScores = new LinkedHashMap<>();
		optionTwoScores.put("distanceKm", fuzzyValue(3.5));
		optionTwoScores.put("bookingPrice", fuzzyValue(12.0));
		optionTwoScores.put("availableSlots", fuzzyValue(7.0));
		optionTwoScores.put("serviceQuality", fuzzyValue(LinguisticTerm.VERY_HIGH));
		optionTwoScores.put("supportResponsiveness", fuzzyValue(LinguisticTerm.VERY_HIGH));

		Map<String, FuzzyValueInput> optionThreeScores = new LinkedHashMap<>();
		optionThreeScores.put("distanceKm", fuzzyValue(7.0));
		optionThreeScores.put("bookingPrice", fuzzyValue(10.0));
		optionThreeScores.put("availableSlots", fuzzyValue(9.0));
		optionThreeScores.put("serviceQuality", fuzzyValue(LinguisticTerm.MEDIUM_HIGH));
		optionThreeScores.put("supportResponsiveness", fuzzyValue(LinguisticTerm.MEDIUM));

		return new BookingRecommendationRequest(
			"Recommend the best Carevia booking option for a premium skin-treatment session",
			"svc-hifu-premium",
			criteria,
			List.of(
				new BookingOptionRequest(
					"booking-option-1",
					"sess-01",
					"CareVia Quan 1",
					"Phong Trai Nghiem Tang 2",
					"2026-04-15T09:00:00Z",
					"2026-04-15T10:30:00Z",
					optionOneScores
				),
				new BookingOptionRequest(
					"booking-option-2",
					"sess-03",
					"CareVia Phu Nhuan",
					"Studio Skin Lab Room 03",
					"2026-04-16T10:00:00Z",
					"2026-04-16T11:00:00Z",
					optionTwoScores
				),
				new BookingOptionRequest(
					"booking-option-3",
					"sess-06",
					"CareVia Thu Duc",
					"Beauty Corner Tang 1",
					"2026-04-17T13:30:00Z",
					"2026-04-17T14:30:00Z",
					optionThreeScores
				)
			)
		);
	}

	private void validateRequest(BookingRecommendationRequest request) {
		if (request.criteria().size() < 1) {
			throw badRequest("At least one criterion is required.");
		}
		if (request.alternatives().size() < 2) {
			throw badRequest("At least two booking options are required for Fuzzy TOPSIS ranking.");
		}
	}

	private List<ResolvedCriterion> resolveCriteria(List<RecommendationCriterionRequest> criteria) {
		Set<String> seenCriterionIds = new HashSet<>();
		List<ResolvedCriterion> resolved = new ArrayList<>();
		for (RecommendationCriterionRequest criterion : criteria) {
			if (!seenCriterionIds.add(criterion.id())) {
				throw badRequest("Duplicate criterion id: " + criterion.id());
			}
			TriangularFuzzyNumber rawWeight = toFuzzyNumber(criterion.weight(), "Weight for criterion " + criterion.id());
			resolved.add(new ResolvedCriterion(
				criterion.id(),
				criterion.name(),
				criterion.preference(),
				rawWeight
			));
		}

		double maxUpperWeight = resolved.stream()
			.map(ResolvedCriterion::weight)
			.mapToDouble(TriangularFuzzyNumber::upper)
			.max()
			.orElse(1.0);

		return resolved.stream()
			.map(criterion -> new ResolvedCriterion(
				criterion.id(),
				criterion.name(),
				criterion.preference(),
				criterion.weight().divideBy(maxUpperWeight)
			))
			.toList();
	}

	private List<ResolvedAlternative> resolveAlternatives(List<BookingOptionRequest> alternatives, List<ResolvedCriterion> criteria) {
		Set<String> seenAlternativeIds = new HashSet<>();
		List<ResolvedAlternative> resolved = new ArrayList<>();
		for (BookingOptionRequest alternative : alternatives) {
			if (!seenAlternativeIds.add(alternative.optionId())) {
				throw badRequest("Duplicate booking option id: " + alternative.optionId());
			}

			Map<String, TriangularFuzzyNumber> rawScores = new HashMap<>();
			for (ResolvedCriterion criterion : criteria) {
				FuzzyValueInput scoreInput = alternative.criteriaScores().get(criterion.id());
				if (scoreInput == null) {
					throw badRequest("Booking option " + alternative.optionId() + " is missing score for criterion " + criterion.id());
				}
				rawScores.put(criterion.id(), toFuzzyNumber(scoreInput, "Score for " + criterion.id() + " in booking option " + alternative.optionId()));
			}

			for (String criterionId : alternative.criteriaScores().keySet()) {
				boolean knownCriterion = criteria.stream().anyMatch(criterion -> Objects.equals(criterion.id(), criterionId));
				if (!knownCriterion) {
					throw badRequest("Booking option " + alternative.optionId() + " contains unknown criterion score: " + criterionId);
				}
			}

			resolved.add(new ResolvedAlternative(
				alternative.optionId(),
				alternative.sessionId(),
				alternative.branchName(),
				alternative.locationDetail(),
				alternative.startTime(),
				alternative.endTime(),
				rawScores
			));
		}
		return resolved;
	}

	private Map<String, Double> resolveBenefitDenominators(List<ResolvedCriterion> criteria, List<ResolvedAlternative> alternatives) {
		Map<String, Double> denominators = new HashMap<>();
		for (ResolvedCriterion criterion : criteria) {
			if (criterion.preference() == CriterionPreference.BENEFIT) {
				double maxUpper = alternatives.stream()
					.map(alternative -> alternative.rawScores().get(criterion.id()))
					.mapToDouble(TriangularFuzzyNumber::upper)
					.max()
					.orElse(0.0);
				denominators.put(criterion.id(), maxUpper);
			}
		}
		return denominators;
	}

	private Map<String, Double> resolveCostDenominators(List<ResolvedCriterion> criteria, List<ResolvedAlternative> alternatives) {
		Map<String, Double> denominators = new HashMap<>();
		for (ResolvedCriterion criterion : criteria) {
			if (criterion.preference() == CriterionPreference.COST) {
				double minLower = alternatives.stream()
					.map(alternative -> alternative.rawScores().get(criterion.id()))
					.mapToDouble(TriangularFuzzyNumber::lower)
					.min()
					.orElse(0.0);
				denominators.put(criterion.id(), minLower);
			}
		}
		return denominators;
	}

	private TriangularFuzzyNumber normalizeScore(
		TriangularFuzzyNumber rawScore,
		ResolvedCriterion criterion,
		Double benefitDenominator,
		Double costDenominator
	) {
		return switch (criterion.preference()) {
			case BENEFIT -> rawScore.divideBy(benefitDenominator == null ? 0.0 : benefitDenominator).round(6);
			case COST -> rawScore.normalizeCost(costDenominator == null ? 0.0 : costDenominator).round(6);
		};
	}

	private TriangularFuzzyNumber toFuzzyNumber(FuzzyValueInput input, String fieldName) {
		try {
			return input.toFuzzyNumber(fieldName);
		} catch (IllegalArgumentException exception) {
			throw badRequest(exception.getMessage());
		}
	}

	private ResponseStatusException badRequest(String message) {
		return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
	}

	private static FuzzyValueInput fuzzyValue(double value) {
		return new FuzzyValueInput(value, null, null, null, null);
	}

	private static FuzzyValueInput fuzzyValue(LinguisticTerm term) {
		return new FuzzyValueInput(null, null, null, null, term);
	}

	private double round(double value) {
		return Math.round(value * 1_000_000d) / 1_000_000d;
	}

	private record ResolvedCriterion(
		String id,
		String name,
		CriterionPreference preference,
		TriangularFuzzyNumber weight
	) {
	}

	private record ResolvedAlternative(
		String optionId,
		String sessionId,
		String branchName,
		String locationDetail,
		String startTime,
		String endTime,
		Map<String, TriangularFuzzyNumber> rawScores
	) {
	}

	private record ScoredAlternative(
		ResolvedAlternative alternative,
		double distanceToPositiveIdeal,
		double distanceToNegativeIdeal,
		double closenessCoefficient,
		List<CriterionBreakdownResponse> breakdown
	) {
	}
}