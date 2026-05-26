package com.carevia.service.recommendation;

import com.carevia.shared.dto.recommendation.BookingOptionRequest;
import com.carevia.shared.dto.recommendation.BookingRecommendationRequest;
import com.carevia.shared.dto.recommendation.BookingRecommendationResponse;
import com.carevia.shared.dto.recommendation.CriterionBreakdownResponse;
import com.carevia.shared.dto.recommendation.CriterionConfigurationResponse;
import com.carevia.shared.dto.recommendation.CriterionPreference;
import com.carevia.shared.dto.recommendation.DeviceOptionRequest;
import com.carevia.shared.dto.recommendation.DeviceRecommendationRequest;
import com.carevia.shared.dto.recommendation.DeviceRecommendationResponse;
import com.carevia.shared.dto.recommendation.FuzzyValueInput;
import com.carevia.shared.dto.recommendation.LinguisticTerm;
import com.carevia.shared.dto.recommendation.RankedBookingOptionResponse;
import com.carevia.shared.dto.recommendation.RankedDeviceOptionResponse;
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
		// Step 0: validate the request before running Fuzzy TOPSIS.
		validateRequest(request);

		// Step 1: determine the fuzzy weightage of criteria.
		List<ResolvedCriterion> criteria = resolveCriteria(request.criteria());
		// Step 2: construct the fuzzy decision matrix for all booking options.
		List<ResolvedAlternative> alternatives = resolveAlternatives(request.alternatives(), criteria);
		// Step 3: prepare normalization denominators for benefit and cost criteria.
		Map<String, Double> benefitDenominators = resolveBenefitDenominators(criteria, alternatives);
		Map<String, Double> costDenominators = resolveCostDenominators(criteria, alternatives);

		List<ScoredAlternative> scoredAlternatives = new ArrayList<>();
		for (ResolvedAlternative alternative : alternatives) {
			List<CriterionBreakdownResponse> breakdown = new ArrayList<>();
			double distanceToPositiveIdeal = 0.0;
			double distanceToNegativeIdeal = 0.0;

			for (ResolvedCriterion criterion : criteria) {
				TriangularFuzzyNumber rawScore = alternative.rawScores().get(criterion.id());
				// Step 4: normalize each criterion score into the comparable fuzzy scale.
				TriangularFuzzyNumber normalizedScore = normalizeScore(
						rawScore,
						criterion,
						benefitDenominators.get(criterion.id()),
						costDenominators.get(criterion.id()));
				// Step 5: apply the criterion weight and accumulate distances to FPIS/FNIS.
				TriangularFuzzyNumber weightedScore = normalizedScore.multiply(criterion.weight()).round(6);
				distanceToPositiveIdeal += weightedScore.distanceTo(POSITIVE_IDEAL);
				distanceToNegativeIdeal += weightedScore.distanceTo(NEGATIVE_IDEAL);

				breakdown.add(new CriterionBreakdownResponse(
						criterion.id(),
						criterion.name(),
						rawScore.round(6),
						normalizedScore.round(6),
						weightedScore));
			}

			// Step 6: compute the closeness coefficient for the current alternative.
			double closenessCoefficient = distanceToNegativeIdeal / (distanceToPositiveIdeal + distanceToNegativeIdeal);
			scoredAlternatives.add(new ScoredAlternative(
					alternative,
					round(distanceToPositiveIdeal),
					round(distanceToNegativeIdeal),
					round(closenessCoefficient),
					breakdown));
		}

		// Step 7: sort alternatives by closeness coefficient to obtain the final ranking.
		scoredAlternatives.sort(Comparator
				.comparingDouble(ScoredAlternative::closenessCoefficient).reversed()
				.thenComparing(Comparator.comparingDouble(ScoredAlternative::distanceToNegativeIdeal).reversed())
				.thenComparing(scored -> scored.alternative().optionId()));

		// Step 8: build the API response with rankings and criterion breakdown.
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
					scored.breakdown()));
		}

		List<CriterionConfigurationResponse> criterionResponses = criteria.stream()
				.map(criterion -> new CriterionConfigurationResponse(
						criterion.id(),
						criterion.name(),
						criterion.preference(),
						criterion.weight().round(6)))
				.toList();

		return new BookingRecommendationResponse(
				ALGORITHM_NAME,
				request.scenarioName(),
				request.serviceId(),
				POSITIVE_IDEAL,
				NEGATIVE_IDEAL,
				criterionResponses,
				rankings);
	}

	
	private void validateRequest(BookingRecommendationRequest request) {
		if (request.criteria().size() < 1) {
			throw badRequest("At least one criterion is required.");
		}
		if (request.alternatives().size() < 2) {
			throw badRequest("At least two booking options are required for Fuzzy TOPSIS ranking.");
		}
	}

	// Step 1: convert request weights into resolved fuzzy criterion weights.
	private List<ResolvedCriterion> resolveCriteria(List<RecommendationCriterionRequest> criteria) {
		Set<String> seenCriterionIds = new HashSet<>();
		List<ResolvedCriterion> resolved = new ArrayList<>();
		for (RecommendationCriterionRequest criterion : criteria) {
			if (!seenCriterionIds.add(criterion.id())) {
				throw badRequest("Duplicate criterion id: " + criterion.id());
			}
			TriangularFuzzyNumber rawWeight = toFuzzyNumber(criterion.weight(),
					"Weight for criterion " + criterion.id());
			resolved.add(new ResolvedCriterion(
					criterion.id(),
					criterion.name(),
					criterion.preference(),
					rawWeight));
		}

		double maxUpperWeight = resolved.stream()
				.map(ResolvedCriterion::weight)
				.mapToDouble(TriangularFuzzyNumber::upper)
				.max()
				.orElse(1.0);

		// Normalize all criterion weights by the largest upper bound.
		return resolved.stream()
				.map(criterion -> new ResolvedCriterion(
						criterion.id(),
						criterion.name(),
						criterion.preference(),
						criterion.weight().divideBy(maxUpperWeight)))
				.toList();
	}

	// Step 2: assemble the fuzzy decision matrix for booking alternatives.
	private List<ResolvedAlternative> resolveAlternatives(List<BookingOptionRequest> alternatives,
			List<ResolvedCriterion> criteria) {
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
					throw badRequest("Booking option " + alternative.optionId() + " is missing score for criterion "
							+ criterion.id());
				}
				rawScores.put(criterion.id(), toFuzzyNumber(scoreInput,
						"Score for " + criterion.id() + " in booking option " + alternative.optionId()));
			}

			for (String criterionId : alternative.criteriaScores().keySet()) {
				boolean knownCriterion = criteria.stream()
						.anyMatch(criterion -> Objects.equals(criterion.id(), criterionId));
				if (!knownCriterion) {
					throw badRequest("Booking option " + alternative.optionId() + " contains unknown criterion score: "
							+ criterionId);
				}
			}

			resolved.add(new ResolvedAlternative(
					alternative.optionId(),
					alternative.sessionId(),
					alternative.branchName(),
					alternative.locationDetail(),
					alternative.startTime(),
					alternative.endTime(),
					rawScores));
		}
		return resolved;
	}

	// Step 3a: find normalization denominators for benefit criteria.
	private Map<String, Double> resolveBenefitDenominators(List<ResolvedCriterion> criteria,
			List<ResolvedAlternative> alternatives) {
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

	// Step 3b: find normalization denominators for cost criteria.
	private Map<String, Double> resolveCostDenominators(List<ResolvedCriterion> criteria,
			List<ResolvedAlternative> alternatives) {
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

	// Step 4: normalize a fuzzy score based on whether the criterion is benefit or cost.
	private TriangularFuzzyNumber normalizeScore(
			TriangularFuzzyNumber rawScore,
			ResolvedCriterion criterion,
			Double benefitDenominator,
			Double costDenominator) {
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
			TriangularFuzzyNumber weight) {
	}

	private record ResolvedAlternative(
			String optionId,
			String sessionId,
			String branchName,
			String locationDetail,
			String startTime,
			String endTime,
			Map<String, TriangularFuzzyNumber> rawScores) {
	}

	private record ScoredAlternative(
			ResolvedAlternative alternative,
			double distanceToPositiveIdeal,
			double distanceToNegativeIdeal,
			double closenessCoefficient,
			List<CriterionBreakdownResponse> breakdown) {
	}

	// ─── Device Recommendation ────────────────────────────────────────────────

	public DeviceRecommendationResponse rankDeviceOptions(DeviceRecommendationRequest request) {
		// Step 0: validate the minimum number of device alternatives.
		if (request.alternatives().size() < 2) {
			throw badRequest("At least two device options are required for Fuzzy TOPSIS ranking.");
		}

		// Step 1: Xác định trọng số mờ của các tiêu chí từ yêu cầu đầu vào.
		List<ResolvedCriterion> criteria = resolveCriteria(request.criteria());
		// Step 2: Xây dựng ma trận mờ
		List<ResolvedDeviceAlternative> alternatives = resolveDeviceAlternatives(request.alternatives(), criteria);
		// Step 3: 
		Map<String, Double> benefitDenominators = resolveDeviceBenefitDenominators(criteria, alternatives);
		Map<String, Double> costDenominators = resolveDeviceCostDenominators(criteria, alternatives);

		List<ScoredDeviceAlternative> scoredAlternatives = new ArrayList<>();
		for (ResolvedDeviceAlternative alternative : alternatives) {
			List<CriterionBreakdownResponse> breakdown = new ArrayList<>();
			double distanceToPositiveIdeal = 0.0;
			double distanceToNegativeIdeal = 0.0;

			for (ResolvedCriterion criterion : criteria) {
				TriangularFuzzyNumber rawScore = alternative.rawScores().get(criterion.id());
				// Step 4: normalize each criterion score into the comparable fuzzy scale.
				TriangularFuzzyNumber normalizedScore = normalizeScore(
						rawScore, criterion,
						benefitDenominators.get(criterion.id()),
						costDenominators.get(criterion.id()));
				// Step 5: apply the criterion weight and accumulate distances to FPIS/FNIS.
				TriangularFuzzyNumber weightedScore = normalizedScore.multiply(criterion.weight()).round(6);
				distanceToPositiveIdeal += weightedScore.distanceTo(POSITIVE_IDEAL);
				distanceToNegativeIdeal += weightedScore.distanceTo(NEGATIVE_IDEAL);
				breakdown.add(new CriterionBreakdownResponse(
						criterion.id(), criterion.name(),
						rawScore.round(6), normalizedScore.round(6), weightedScore));
			}

			// Step 6: compute the closeness coefficient for the current device.
			double closenessCoefficient = distanceToNegativeIdeal / (distanceToPositiveIdeal + distanceToNegativeIdeal);
			scoredAlternatives.add(new ScoredDeviceAlternative(
					alternative,
					round(distanceToPositiveIdeal),
					round(distanceToNegativeIdeal),
					round(closenessCoefficient),
					breakdown));
		}

		// Step 7: sort alternatives by closeness coefficient to obtain the final ranking.
		scoredAlternatives.sort(Comparator
				.comparingDouble(ScoredDeviceAlternative::closenessCoefficient).reversed()
				.thenComparing(Comparator.comparingDouble(ScoredDeviceAlternative::distanceToNegativeIdeal).reversed())
				.thenComparing(scored -> scored.alternative().optionId()));

		// Step 8: build the API response with rankings and criterion breakdown.
		List<RankedDeviceOptionResponse> rankings = new ArrayList<>();
		for (int index = 0; index < scoredAlternatives.size(); index++) {
			ScoredDeviceAlternative scored = scoredAlternatives.get(index);
			ResolvedDeviceAlternative alt = scored.alternative();
			rankings.add(new RankedDeviceOptionResponse(
					index + 1,
					alt.optionId(),
					alt.deviceId(),
					alt.name(),
					scored.closenessCoefficient(),
					scored.distanceToPositiveIdeal(),
					scored.distanceToNegativeIdeal(),
					index == 0,
					scored.breakdown()));
		}

		List<CriterionConfigurationResponse> criterionResponses = criteria.stream()
				.map(c -> new CriterionConfigurationResponse(c.id(), c.name(), c.preference(), c.weight().round(6)))
				.toList();

		return new DeviceRecommendationResponse(
				ALGORITHM_NAME, request.scenarioName(),
				POSITIVE_IDEAL, NEGATIVE_IDEAL,
				criterionResponses, rankings);
	}

	// Step 2: assemble the fuzzy decision matrix for device alternatives.
	private List<ResolvedDeviceAlternative> resolveDeviceAlternatives(
			List<DeviceOptionRequest> alternatives, List<ResolvedCriterion> criteria) {
		Set<String> seenIds = new HashSet<>();
		List<ResolvedDeviceAlternative> resolved = new ArrayList<>();
		for (DeviceOptionRequest alt : alternatives) {
			if (!seenIds.add(alt.optionId())) {
				throw badRequest("Duplicate device option id: " + alt.optionId());
			}
			Map<String, TriangularFuzzyNumber> rawScores = new HashMap<>();
			for (ResolvedCriterion criterion : criteria) {
				FuzzyValueInput scoreInput = alt.criteriaScores().get(criterion.id());
				if (scoreInput == null) {
					throw badRequest(
							"Device option " + alt.optionId() + " is missing score for criterion " + criterion.id());
				}
				rawScores.put(criterion.id(),
						toFuzzyNumber(scoreInput, "Score for " + criterion.id() + " in device " + alt.optionId()));
			}
			resolved.add(new ResolvedDeviceAlternative(alt.optionId(), alt.deviceId(), alt.name(), rawScores));
		}
		return resolved;
	}

	// Step 3a: find normalization denominators for benefit criteria.
	private Map<String, Double> resolveDeviceBenefitDenominators(
			List<ResolvedCriterion> criteria, List<ResolvedDeviceAlternative> alternatives) {
		Map<String, Double> denominators = new HashMap<>();
		for (ResolvedCriterion criterion : criteria) {
			if (criterion.preference() == CriterionPreference.BENEFIT) {
				double maxUpper = alternatives.stream()
						.map(alt -> alt.rawScores().get(criterion.id()))
						.mapToDouble(TriangularFuzzyNumber::upper)
						.max().orElse(0.0);
				denominators.put(criterion.id(), maxUpper);
			}
		}
		return denominators;
	}

	// Step 3b: find normalization denominators for cost criteria.
	private Map<String, Double> resolveDeviceCostDenominators(
			List<ResolvedCriterion> criteria, List<ResolvedDeviceAlternative> alternatives) {
		Map<String, Double> denominators = new HashMap<>();
		for (ResolvedCriterion criterion : criteria) {
			if (criterion.preference() == CriterionPreference.COST) {
				double minLower = alternatives.stream()
						.map(alt -> alt.rawScores().get(criterion.id()))
						.mapToDouble(TriangularFuzzyNumber::lower)
						.min().orElse(0.0);
				denominators.put(criterion.id(), minLower);
			}
		}
		return denominators;
	}

	private record ResolvedDeviceAlternative(
			String optionId,
			String deviceId,
			String name,
			Map<String, TriangularFuzzyNumber> rawScores) {
	}

	private record ScoredDeviceAlternative(
			ResolvedDeviceAlternative alternative,
			double distanceToPositiveIdeal,
			double distanceToNegativeIdeal,
			double closenessCoefficient,
			List<CriterionBreakdownResponse> breakdown) {
	}
}