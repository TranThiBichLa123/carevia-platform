import apiClient from "@/services/apiClient";
import authApi from "@/lib/authApi";

export interface DeviceData {
  id: number;
  name: string;
  slug: string;
  description: string;
  content: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  averageRating: number;
  ratingCount?: number;
  reviewCount?: number;
  image: string;
  images: string[];
  status: string;
  skinType: string;
  skinConcerns: string | string[];
  tags: string[];
  isBookingAvailable: boolean;
  bookingPrice: number;
  viewCount: number;
  sold: number;
  effectivenessScore?: number;
  safetyScore?: number;
  ergonomicsScore?: number;
  durabilityScore?: number;
  origin: string;
  deviceCondition: string;
  videoUrl?: string;
  category: {
    id: number;
    name: string;
    slug: string;
    image: string;
    categoryType: string;
  } | null;
  brand: {
    id: number;
    name: string;
    slug: string;
    image: string;
  } | null;
  warranty: {
    period: number;
    policy: string;
  } | null;
  specifications: Array<{ label: string; value: string }>;
  createdAt: string;
}

export interface DevicePageResponse {
  items: DeviceData[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CategoryData {
  id: number;
  name: string;
  slug: string;
  image: string;
  categoryType: string;
  description: string;
  isActive: boolean;
}

export interface BrandData {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  isFeatured: boolean;
  isActive: boolean;
  maxDiscountPercentage?: number;
}

export interface SpecificationData {
  label: string;
  value: string;
}

export interface ExperienceStepData {
  id: number;
  stepNumber: number;
  stepTitle: string;
  stepContent: string;
  iconUrl?: string;
  durationMinutes?: number;
}

export const deviceApi = {
  getAll: async (params?: {
    search?: string;
    categoryId?: number;
    brandId?: number;
    skinType?: string;
    minPrice?: number;
    maxPrice?: number;
    bookingAvailable?: boolean;
    onlyDiscounted?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<DevicePageResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.categoryId) searchParams.append("categoryId", String(params.categoryId));
    if (params?.brandId) searchParams.append("brandId", String(params.brandId));
    if (params?.skinType) searchParams.append("skinType", params.skinType);
    if (params?.minPrice !== undefined) searchParams.append("minPrice", String(params.minPrice));
    if (params?.maxPrice !== undefined) searchParams.append("maxPrice", String(params.maxPrice));
    if (params?.bookingAvailable !== undefined) searchParams.append("bookingAvailable", String(params.bookingAvailable));
    if (params?.onlyDiscounted !== undefined) searchParams.append("onlyDiscounted", String(params.onlyDiscounted));
    if (params?.page !== undefined) searchParams.append("page", String(params.page));
    if (params?.size) searchParams.append("size", String(params.size));
    if (params?.sort) searchParams.append("sort", params.sort);
    
    const res = await apiClient.get(`/devices?${searchParams}`);
    return res.data;
  },

  getById: async (id: number | string): Promise<DeviceData> => {
    const res = await apiClient.get(`/devices/${id}`);
    return res.data;
  },

  getBySlug: async (slug: string): Promise<DeviceData> => {
    const res = await apiClient.get(`/devices/slug/${slug}`);
    return res.data;
  },

  getPopular: async (limit = 8): Promise<DeviceData[]> => {
    const res = await apiClient.get(`/devices/popular?limit=${limit}`);
    return res.data;
  },

  getSimilar: async (id: number | string, limit = 4): Promise<DeviceData[]> => {
    const res = await apiClient.get(`/devices/${id}/similar?limit=${limit}`);
    return res.data;
  },

  getExperienceSteps: async (id: number | string): Promise<ExperienceStepData[]> => {
    const res = await apiClient.get(`/devices/${id}/experience-steps`);
    return res.data;
  },

  getSpecifications: async (id: number | string): Promise<SpecificationData[]> => {
    const res = await apiClient.get(`/devices/${id}/specifications`);
    return res.data;
  },

  getCategories: async (): Promise<CategoryData[]> => {
    const res = await apiClient.get("/devices/categories");
    return res.data;
  },

  getBrands: async (): Promise<BrandData[]> => {
    const res = await apiClient.get("/devices/brands");
    return res.data;
  },

  getFeaturedBrands: async (): Promise<BrandData[]> => {
    const res = await apiClient.get("/devices/brands/featured");
    return res.data;
  },

  getSkinTypes: async (): Promise<string[]> => {
    const res = await apiClient.get("/devices/skin-types");
    return res.data;
  },
};

export interface ReviewData {
  id: number;
  accountId: number;
  accountName: string;
  accountAvatar: string | null;
  rating: number;
  effectivenessRating: number;
  safetyRating: number;
  ergonomicsRating: number;
  durabilityRating: number;
  mediaUrls: string[];
  comment: string | null;
  isVerifiedPurchase: boolean;
  adminReply: string | null;
  createdAt: string;
}

export interface ReviewImageUploadResult {
  imageUrl: string;
  imagePublicId: string;
}

export interface ReviewEligibilityData {
  canReview: boolean;
  alreadyReviewed: boolean;
  hasCompletedOrder: boolean;
  completedOrderId: number | null;
  completedOrderCode: string | null;
  message: string;
}

export interface ReviewPageResponse {
  items: ReviewData[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const reviewApi = {
  getByDevice: async (deviceId: number | string, params?: { page?: number; size?: number }): Promise<ReviewPageResponse> => {
    const sp = new URLSearchParams();
    if (params?.page !== undefined) sp.append("page", String(params.page));
    if (params?.size) sp.append("size", String(params.size));
    const res = await apiClient.get(`/devices/${deviceId}/reviews?${sp}`);
    return res.data;
  },

  getEligibility: async (deviceId: number | string): Promise<ReviewEligibilityData> => {
    const response = await authApi.get<ReviewEligibilityData>(`/devices/${deviceId}/reviews/eligibility`);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Không thể kiểm tra điều kiện viết đánh giá.");
    }

    return response.data;
  },

  create: async (
    deviceId: number | string,
    data: {
      rating: number;
      effectivenessRating: number;
      safetyRating: number;
      ergonomicsRating: number;
      durabilityRating: number;
      comment: string;
      mediaUrls?: string[];
    }
  ): Promise<ReviewData> => {
    const res = await apiClient.post(`/devices/${deviceId}/reviews`, data);
    return res.data;
  },

  uploadImage: async (deviceId: number | string, file: File): Promise<ReviewImageUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await authApi.upload<ReviewImageUploadResult>(`/devices/${deviceId}/reviews/images`, formData);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Không thể tải ảnh đánh giá lên.");
    }

    return response.data;
  },
};
