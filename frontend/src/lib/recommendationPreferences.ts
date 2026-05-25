import { DeviceData, ReviewData, reviewApi } from "@/lib/deviceApi";
import { fetchWithConfig } from "@/lib/config";
import {
  createUpdatedPreferences,
  DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES,
  DEVICE_RECOMMENDATION_CRITERIA,
  DEVICE_RECOMMENDATION_STORAGE_KEY,
  getWeightOption,
  loadDeviceRecommendationPreferences,
  saveDeviceRecommendationPreferences,
  type CriterionPreference,
  type DeviceRecommendationPreferences,
  type LinguisticTerm,
  type RecommendationCriterionKey,
} from "@/lib/recommendationPreferencesShared";

export {
  createUpdatedPreferences,
  DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES,
  DEVICE_RECOMMENDATION_CRITERIA,
  DEVICE_RECOMMENDATION_STORAGE_KEY,
  getWeightOption,
  loadDeviceRecommendationPreferences,
  saveDeviceRecommendationPreferences,
};
export type {
  CriterionPreference,
  DeviceRecommendationPreferences,
  LinguisticTerm,
  RecommendationCriterionKey,
};

type RecommendationCriterion = {
  id: RecommendationCriterionKey;
  name: string;
  preference: CriterionPreference;
  weight: { linguisticTerm: LinguisticTerm };
};

type FuzzyValueInput = {
  value?: number;
  lower?: number;
  middle?: number;
  upper?: number;
};

type RecommendationAspectKey = "effectiveness" | "safety" | "ergonomics" | "durability";

type ReviewAspectKey = "effectivenessRating" | "safetyRating" | "ergonomicsRating" | "durabilityRating";

type FuzzyTriangle = {
  lower: number;
  middle: number;
  upper: number;
};

type DeviceReviewSignalProfile = Record<RecommendationAspectKey, FuzzyTriangle>;

type DeviceRecommendationRequest = {
  scenarioName: string;
  criteria: RecommendationCriterion[];
  alternatives: Array<{
    optionId: string;
    deviceId: string;
    name: string;
    criteriaScores: Record<string, FuzzyValueInput>;
  }>;
};

type RankedDevice = {
  rank: number;
  deviceId: string;
  closenessCoefficient: number;
  recommended: boolean;
};

type DeviceRankResponse = {
  rankings: RankedDevice[];
};
export const DEVICE_RECOMMENDATION_REVIEW_EVENT = "carevia:device-review-updated";

const REVIEW_SIGNAL_CACHE_TTL_MS = 30_000;
const reviewSignalCache = new Map<string, { expiresAt: number; profile: DeviceReviewSignalProfile | null }>();
const inFlightReviewSignalRequests = new Map<string, Promise<DeviceReviewSignalProfile | null>>();

const REVIEW_ASPECT_ANALYSIS: Array<{
  criterionKey: RecommendationAspectKey;
  reviewKey: ReviewAspectKey;
  sectionLabel: string;
  positiveKeywords: string[];
  cautionKeywords: string[];
}> = [
  {
    criterionKey: "effectiveness",
    reviewKey: "effectivenessRating",
    sectionLabel: "hiệu quả sử dụng",
    positiveKeywords: [
      "hiệu quả thấy rõ",
      "kết quả nhanh",
      "da sạch",
      "da mịn",
      "ổn định",
      "cải thiện rõ",
      "rõ rệt",
      "nâng cơ",
      "săn chắc",
    ],
    cautionKeywords: [
      "cần kiên trì",
      "khó thấy rõ",
      "chưa rõ",
      "hiệu quả chậm",
      "không hiệu quả",
    ],
  },
  {
    criterionKey: "safety",
    reviewKey: "safetyRating",
    sectionLabel: "độ an toàn / dịu nhẹ",
    positiveKeywords: [
      "êm da",
      "không rát",
      "da nhạy cảm",
      "không gây đỏ",
      "dịu nhẹ",
      "an toàn",
      "không kích ứng",
    ],
    cautionKeywords: [
      "cần test",
      "kích ứng",
      "đỏ da",
      "rát",
      "châm chích",
    ],
  },
  {
    criterionKey: "ergonomics",
    reviewKey: "ergonomicsRating",
    sectionLabel: "thiết kế & độ tiện dụng",
    positiveKeywords: [
      "dễ cầm",
      "dễ thao tác",
      "nút bấm trực quan",
      "thiết kế đẹp",
      "mang đi tiện",
      "tiện dụng",
      "gọn nhẹ",
    ],
    cautionKeywords: [
      "khó cầm",
      "nặng tay",
      "khó thao tác",
      "cồng kềnh",
      "bất tiện",
    ],
  },
  {
    criterionKey: "durability",
    reviewKey: "durabilityRating",
    sectionLabel: "độ bền / chất liệu",
    positiveKeywords: [
      "chắc chắn",
      "cứng cáp",
      "hoàn thiện tốt",
      "dùng lâu",
      "ổn định",
      "bền",
      "chất liệu tốt",
    ],
    cautionKeywords: [
      "lỏng lẻo",
      "mong manh",
      "nhanh hỏng",
      "kém bền",
      "không chắc chắn",
    ],
  },
];

export function invalidateDeviceRecommendationReviewSignals(deviceId?: number | string) {
  if (deviceId === undefined) {
    reviewSignalCache.clear();
    return;
  }

  reviewSignalCache.delete(String(deviceId));
}

export function notifyDeviceRecommendationReviewUpdated(deviceId?: number | string) {
  invalidateDeviceRecommendationReviewSignals(deviceId);

  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(DEVICE_RECOMMENDATION_REVIEW_EVENT, {
    detail: {
      deviceId: deviceId == null ? null : String(deviceId),
    },
  }));
}

function matchesSkinType(deviceSkinType: string | undefined, selectedSkinType: string) {
  if (!selectedSkinType.trim()) {
    return 3;
  }

  if (!deviceSkinType?.trim()) {
    return 2;
  }

  const normalizedDeviceSkinType = deviceSkinType.toLowerCase();
  const normalizedSelectedSkinType = selectedSkinType.toLowerCase();
  return normalizedDeviceSkinType.includes(normalizedSelectedSkinType)
    || normalizedSelectedSkinType.includes(normalizedDeviceSkinType)
    ? 5
    : 1;
}

function getAspectScore(device: DeviceData, key: RecommendationCriterionKey) {
  switch (key) {
    case "effectiveness":
      return device.effectivenessScore ?? device.averageRating ?? 0;
    case "safety":
      return device.safetyScore ?? device.averageRating ?? 0;
    case "ergonomics":
      return device.ergonomicsScore ?? device.averageRating ?? 0;
    case "durability":
      return device.durabilityScore ?? device.averageRating ?? 0;
    default:
      return 0;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundFuzzyValue(value: number) {
  return Math.round(value * 1_000) / 1_000;
}

function createTriangle(lower: number, middle: number, upper: number): FuzzyTriangle {
  return {
    lower: roundFuzzyValue(clamp(lower, 0, 1)),
    middle: roundFuzzyValue(clamp(middle, 0, 1)),
    upper: roundFuzzyValue(clamp(upper, 0, 1)),
  };
}

function getRatingTriangle(rating: number): FuzzyTriangle {
  const normalized = clamp(rating / 5, 0, 1);
  const spread = rating >= 5 ? 0.08 : rating === 4 ? 0.1 : rating === 3 ? 0.12 : 0.15;
  return createTriangle(normalized - spread, normalized, normalized + spread);
}

function countMatches(text: string, keywords: string[]) {
  return keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
}

function getTextSignalTriangle(comment: string | null | undefined, config: (typeof REVIEW_ASPECT_ANALYSIS)[number]) {
  const normalizedComment = comment?.trim().toLowerCase();
  if (!normalizedComment) {
    return null;
  }

  const positiveMatches = countMatches(normalizedComment, config.positiveKeywords);
  const cautionMatches = countMatches(normalizedComment, config.cautionKeywords);
  const hasSectionMention = normalizedComment.includes(config.sectionLabel);
  const totalSignals = positiveMatches + cautionMatches + (hasSectionMention ? 1 : 0);

  if (totalSignals === 0) {
    return null;
  }

  const middle = clamp(0.58 + positiveMatches * 0.12 - cautionMatches * 0.12 + (hasSectionMention ? 0.04 : 0), 0.15, 1);
  const spread = totalSignals >= 3 ? 0.09 : 0.12;
  return createTriangle(middle - spread, middle, middle + spread);
}

function blendTriangles(primary: FuzzyTriangle, secondary: FuzzyTriangle | null, secondaryWeight = 0.35): FuzzyTriangle {
  if (!secondary) {
    return primary;
  }

  const primaryWeight = 1 - secondaryWeight;
  return createTriangle(
    primary.lower * primaryWeight + secondary.lower * secondaryWeight,
    primary.middle * primaryWeight + secondary.middle * secondaryWeight,
    primary.upper * primaryWeight + secondary.upper * secondaryWeight,
  );
}

function averageTriangles(triangles: FuzzyTriangle[]) {
  const totals = triangles.reduce((accumulator, triangle) => ({
    lower: accumulator.lower + triangle.lower,
    middle: accumulator.middle + triangle.middle,
    upper: accumulator.upper + triangle.upper,
  }), { lower: 0, middle: 0, upper: 0 });

  return createTriangle(
    totals.lower / triangles.length,
    totals.middle / triangles.length,
    totals.upper / triangles.length,
  );
}

function buildReviewSignalProfile(reviews: ReviewData[]): DeviceReviewSignalProfile | null {
  if (!reviews.length) {
    return null;
  }

  const profileEntries = REVIEW_ASPECT_ANALYSIS.map((config) => {
    const triangles = reviews.map((review) => {
      const ratingTriangle = getRatingTriangle(review[config.reviewKey]);
      const textTriangle = getTextSignalTriangle(review.comment, config);
      return blendTriangles(ratingTriangle, textTriangle);
    });

    return [config.criterionKey, averageTriangles(triangles)] as const;
  });

  return Object.fromEntries(profileEntries) as DeviceReviewSignalProfile;
}

async function loadDeviceReviewSignalProfile(deviceId: number | string) {
  const cacheKey = String(deviceId);
  const cached = reviewSignalCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.profile;
  }

  const pendingRequest = inFlightReviewSignalRequests.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = (async () => {
    try {
      const response = await reviewApi.getByDevice(deviceId, { page: 0, size: 20 });
      const profile = buildReviewSignalProfile(response.items);
      reviewSignalCache.set(cacheKey, {
        expiresAt: Date.now() + REVIEW_SIGNAL_CACHE_TTL_MS,
        profile,
      });
      return profile;
    } catch {
      reviewSignalCache.set(cacheKey, {
        expiresAt: Date.now() + REVIEW_SIGNAL_CACHE_TTL_MS,
        profile: null,
      });
      return null;
    } finally {
      inFlightReviewSignalRequests.delete(cacheKey);
    }
  })();

  inFlightReviewSignalRequests.set(cacheKey, request);
  return request;
}

function toFuzzyValueInput(triangle: FuzzyTriangle): FuzzyValueInput {
  return {
    lower: triangle.lower,
    middle: triangle.middle,
    upper: triangle.upper,
  };
}

export function buildDeviceRecommendationRequest(
  devices: DeviceData[],
  preferences: DeviceRecommendationPreferences,
  scenarioName: string,
  reviewSignals?: Map<string, DeviceReviewSignalProfile | null>
): DeviceRecommendationRequest {
  const criteria = DEVICE_RECOMMENDATION_CRITERIA.map((criterion) => ({
    id: criterion.key,
    name: criterion.title,
    preference: criterion.preference,
    weight: { linguisticTerm: getWeightOption(preferences.criteriaWeights[criterion.key]).term },
  }));

  return {
    scenarioName,
    criteria,
    alternatives: devices.map((device) => ({
      optionId: String(device.id),
      deviceId: String(device.id),
      name: device.name,
      criteriaScores: {
        price: { value: device.price ?? 0 },
        averageRating: { value: device.averageRating ?? 0 },
        sold: { value: device.sold ?? 0 },
        reviewCount: { value: device.reviewCount ?? 0 },
        effectiveness: reviewSignals?.get(String(device.id))?.effectiveness
          ? toFuzzyValueInput(reviewSignals.get(String(device.id))!.effectiveness)
          : { value: getAspectScore(device, "effectiveness") },
        safety: reviewSignals?.get(String(device.id))?.safety
          ? toFuzzyValueInput(reviewSignals.get(String(device.id))!.safety)
          : { value: getAspectScore(device, "safety") },
        ergonomics: reviewSignals?.get(String(device.id))?.ergonomics
          ? toFuzzyValueInput(reviewSignals.get(String(device.id))!.ergonomics)
          : { value: getAspectScore(device, "ergonomics") },
        durability: reviewSignals?.get(String(device.id))?.durability
          ? toFuzzyValueInput(reviewSignals.get(String(device.id))!.durability)
          : { value: getAspectScore(device, "durability") },
        skinCompatibility: { value: matchesSkinType(device.skinType, preferences.skinType) },
      },
    })),
  };
}

export async function rankDevicesByPreferences(
  devices: DeviceData[],
  preferences: DeviceRecommendationPreferences,
  scenarioName: string,
  options?: {
    includeReviewSignals?: boolean;
  }
) {
  if (devices.length < 2) {
    return {
      rankedDevices: devices,
      rankings: [] as RankedDevice[],
    };
  }

  const includeReviewSignals = options?.includeReviewSignals ?? false;
  const reviewSignals = includeReviewSignals
    ? new Map<string, DeviceReviewSignalProfile | null>(
      await Promise.all(
        devices
          .filter((device) => (device.reviewCount ?? 0) > 0)
          .map(async (device) => [String(device.id), await loadDeviceReviewSignalProfile(device.id)] as const)
      )
    )
    : undefined;

  const response = await fetchWithConfig<DeviceRankResponse>(
    "/api/v1/recommendations/devices/fuzzy-topsis/rank",
    {
      method: "POST",
      body: JSON.stringify(buildDeviceRecommendationRequest(devices, preferences, scenarioName, reviewSignals)),
      next: { revalidate: 0 },
    }
  );

  if (!response?.rankings?.length) {
    return {
      rankedDevices: devices,
      rankings: [] as RankedDevice[],
    };
  }

  const deviceMap = new Map(devices.map((device) => [String(device.id), device]));
  const rankedDevices = response.rankings
    .map((ranking) => deviceMap.get(ranking.deviceId))
    .filter(Boolean) as DeviceData[];

  return {
    rankedDevices,
    rankings: response.rankings,
  };
}