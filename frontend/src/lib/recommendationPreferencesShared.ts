export type RecommendationCriterionKey =
  | "price"
  | "averageRating"
  | "sold"
  | "reviewCount"
  | "effectiveness"
  | "safety"
  | "ergonomics"
  | "durability"
  | "skinCompatibility";

export type LinguisticTerm = "LOW" | "MEDIUM_LOW" | "MEDIUM" | "MEDIUM_HIGH" | "HIGH" | "VERY_HIGH";

export type CriterionPreference = "BENEFIT" | "COST";

export type DeviceRecommendationPreferences = {
  version: number;
  skinType: string;
  criteriaWeights: Record<RecommendationCriterionKey, number>;
  updatedAt: string;
};

export const DEVICE_RECOMMENDATION_STORAGE_KEY = "carevia.deviceRecommendationPreferences";

export const WEIGHT_LEVELS: Array<{ value: number; label: string; term: LinguisticTerm }> = [
  { value: 1, label: "Ít ưu tiên", term: "LOW" },
  { value: 2, label: "Ưu tiên thấp", term: "MEDIUM_LOW" },
  { value: 3, label: "Cân bằng", term: "MEDIUM" },
  { value: 4, label: "Ưu tiên cao", term: "MEDIUM_HIGH" },
  { value: 5, label: "Rất quan trọng", term: "HIGH" },
  { value: 6, label: "Quan trọng nhất", term: "VERY_HIGH" },
];

export const DEVICE_RECOMMENDATION_CRITERIA: Array<{
  key: RecommendationCriterionKey;
  title: string;
  description: string;
  preference: CriterionPreference;
}> = [
  {
    key: "price",
    title: "Giá cả sản phẩm",
    description: "Ưu tiên thiết bị có giá phù hợp hơn với ngân sách.",
    preference: "COST",
  },
  {
    key: "effectiveness",
    title: "Hiệu quả sử dụng",
    description: "Ưu tiên thiết bị cho hiệu quả rõ rệt và nhanh.",
    preference: "BENEFIT",
  },
  {
    key: "safety",
    title: "Độ an toàn / Dịu nhẹ",
    description: "Ưu tiên thiết bị êm, ít kích ứng và an toàn cho da.",
    preference: "BENEFIT",
  },
  {
    key: "ergonomics",
    title: "Thiết kế & Độ tiện dụng",
    description: "Ưu tiên máy dễ cầm nắm, dễ dùng, thẩm mỹ tốt.",
    preference: "BENEFIT",
  },
  {
    key: "durability",
    title: "Độ bền / Chất liệu",
    description: "Ưu tiên thiết bị bền, hoàn thiện tốt, dùng lâu dài.",
    preference: "BENEFIT",
  },
  {
    key: "averageRating",
    title: "Đánh giá tổng thể",
    description: "Ưu tiên sản phẩm có điểm đánh giá chung cao.",
    preference: "BENEFIT",
  },
  {
    key: "sold",
    title: "Lượt bán",
    description: "Ưu tiên sản phẩm phổ biến và bán chạy.",
    preference: "BENEFIT",
  },
  {
    key: "reviewCount",
    title: "Số lượng review",
    description: "Ưu tiên thiết bị có nhiều phản hồi thực tế hơn.",
    preference: "BENEFIT",
  },
  {
    key: "skinCompatibility",
    title: "Mức phù hợp với loại da",
    description: "Ưu tiên sản phẩm hợp với loại da bạn đang chọn.",
    preference: "BENEFIT",
  },
];

export const DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES: DeviceRecommendationPreferences = {
  version: 1,
  skinType: "",
  criteriaWeights: {
    price: 5,
    averageRating: 4,
    sold: 3,
    reviewCount: 3,
    effectiveness: 5,
    safety: 5,
    ergonomics: 4,
    durability: 4,
    skinCompatibility: 6,
  },
  updatedAt: new Date(0).toISOString(),
};

export function getWeightOption(level: number) {
  return WEIGHT_LEVELS.find((item) => item.value === level) ?? WEIGHT_LEVELS[2];
}

export function loadDeviceRecommendationPreferences(): DeviceRecommendationPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(DEVICE_RECOMMENDATION_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<DeviceRecommendationPreferences>;
    return {
      version: 1,
      skinType: parsed.skinType ?? DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES.skinType,
      updatedAt: parsed.updatedAt ?? DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES.updatedAt,
      criteriaWeights: {
        ...DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES.criteriaWeights,
        ...(parsed.criteriaWeights ?? {}),
      },
    };
  } catch {
    return DEFAULT_DEVICE_RECOMMENDATION_PREFERENCES;
  }
}

export function saveDeviceRecommendationPreferences(preferences: DeviceRecommendationPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEVICE_RECOMMENDATION_STORAGE_KEY, JSON.stringify(preferences));
}

export function createUpdatedPreferences(
  partial: Partial<DeviceRecommendationPreferences>
): DeviceRecommendationPreferences {
  const current = loadDeviceRecommendationPreferences();
  return {
    version: 1,
    skinType: partial.skinType ?? current.skinType,
    updatedAt: new Date().toISOString(),
    criteriaWeights: {
      ...current.criteriaWeights,
      ...(partial.criteriaWeights ?? {}),
    },
  };
}