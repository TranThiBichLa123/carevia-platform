import apiClient from "@/services/apiClient";

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
}

export const deviceApi = {
  getAll: async (params?: {
    search?: string;
    categoryId?: number;
    brandId?: number;
    skinType?: string;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<DevicePageResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append("search", params.search);
    if (params?.categoryId) searchParams.append("categoryId", String(params.categoryId));
    if (params?.brandId) searchParams.append("brandId", String(params.brandId));
    if (params?.skinType) searchParams.append("skinType", params.skinType);
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
};
