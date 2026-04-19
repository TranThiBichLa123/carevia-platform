/**
 * Configuration utility for API endpoints
 * Handles both development and production environments
 */
interface ApiConfig {
  baseUrl: string;
  isProduction: boolean;
}

export const getApiConfig = (): ApiConfig => {
  const isClient = typeof window !== "undefined";

  // 1. Lấy URL và làm sạch: Xóa dấu / ở cuối nếu có
  const rawBaseUrl = isClient
    ? process.env.NEXT_PUBLIC_API_URL
    : process.env.API_ENDPOINT;

  const baseUrl = (rawBaseUrl || "http://localhost:8081").replace(/\/$/, "");

  const isProduction = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_APP_ENV === "production";

  return { baseUrl, isProduction };
};

export const hasExplicitApiEndpoint = (): boolean => {
  const isClient = typeof window !== "undefined";
  // Ở client không truy cập được process.env.API_ENDPOINT (undefined)
  return isClient ? Boolean(process.env.NEXT_PUBLIC_API_URL) : Boolean(process.env.API_ENDPOINT);
};

export async function fetchWithConfig<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const { baseUrl } = getApiConfig();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers({
    "Content-Type": "application/json",
    ...Object.fromEntries(new Headers(options?.headers || {}).entries()),
  });

  const mergedOptions: RequestInit = {
    ...options,
    headers,
    next: { revalidate: 100, ...options?.next },
  };

  try {
    const response = await fetch(url, mergedOptions);

    // Thay vì throw Error (làm sập server), ta trả về object rỗng hoặc null
    if (!response.ok) {
      console.error(`❌ API Error ${response.status}: ${url}`);
      return [] as any;
    }

    return await response.json();
  } catch (error) {
    // Trình duyệt hoặc Server Next.js sẽ không bị lỗi 500 nữa
    console.error(`❌ Network Error at ${url}:`, error);
    return [] as any;
  }
}


// ... các hàm getAuthHeaders, buildQueryString và API_ENDPOINTS giữ nguyên



/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // CHỈ THÊM nếu token có thật và không phải chuỗi "undefined"
  if (token && token !== "undefined" && token !== "null") {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};


/**
 * Build query string from parameters
 */
export const buildQueryString = (
  params: Record<string, string | number | boolean>
): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
/**
 * Common API endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/v1/auth/signin",
  REGISTER: "/api/v1/auth/signup",
  REFRESH: "/api/v1/auth/refresh",

  // Products
  PRODUCTS: "/api/v1/devices", // Thêm /api/v1
  PRODUCT_BY_ID: (id: string) => `/api/v1/devices/${id}`,

  // Categories
  CATEGORIES: "/api/v1/categories",
  CATEGORY_BY_ID: (id: string) => `/api/v1/categories/${id}`,

  // Brands
  BRANDS: "/api/v1/brands",
  BRAND_BY_ID: (id: string) => `/api/v1/brands/${id}`,

  // Users
  USERS: "/api/v1/users",
  USER_BY_ID: (id: string) => `/api/v1/users/${id}`,
  USER_PROFILE: "/api/v1/users/profile",

  // Orders
  ORDERS: "/api/v1/orders",
  ORDER_BY_ID: (id: string) => `/api/v1/orders/${id}`,
  USER_ORDERS: (userId: string) => `/api/v1/orders/user/${userId}`,

  // Cart
  CART: "/api/v1/cart",
  ADD_TO_CART: "/api/v1/cart/add",
  REMOVE_FROM_CART: "/api/v1/cart/remove",

  // Stats & Analytics
  STATS: "/api/v1/stats",
  ANALYTICS: "/api/v1/analytics",
} as const;
