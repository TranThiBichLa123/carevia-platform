import apiClient from "@/services/apiClient";

export interface WishlistResponse {
  success: boolean;
  wishlist: string[];
  message?: string;
}

export interface WishlistProductsResponse {
  success: boolean;
  products: any[];
  message?: string;
}

const getToken = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const cookies = document.cookie.split(";").reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split("=");
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
  return cookies.auth_token;
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const addToWishlist = async (
  productId: string,
  _token: string
): Promise<WishlistResponse> => {
  try {
    await apiClient.post(`/wishlist/${productId}`, null, { headers: authHeaders() });
    const updated = await getUserWishlist(_token);
    return updated;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to add to wishlist");
  }
};

export const removeFromWishlist = async (
  productId: string,
  _token: string
): Promise<WishlistResponse> => {
  try {
    await apiClient.delete(`/wishlist/${productId}`, { headers: authHeaders() });
    const updated = await getUserWishlist(_token);
    return updated;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to remove from wishlist");
  }
};

export const getUserWishlist = async (
  _token: string
): Promise<WishlistResponse> => {
  try {
    const res = await apiClient.get("/wishlist/ids", { headers: authHeaders() });
    const ids: number[] = res.data || [];
    return {
      success: true,
      wishlist: ids.map(String),
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to get wishlist");
  }
};

export const getWishlistProducts = async (
  _productIds: string[],
  _token: string
): Promise<WishlistProductsResponse> => {
  try {
    const res = await apiClient.get("/wishlist", { headers: authHeaders() });
    return {
      success: true,
      products: res.data || [],
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to get wishlist products");
  }
};

export const clearWishlist = async (
  _token: string
): Promise<WishlistResponse> => {
  // Java backend doesn't have a clear-all endpoint, remove individually
  try {
    const current = await getUserWishlist(_token);
    for (const id of current.wishlist) {
      await apiClient.delete(`/wishlist/${id}`, { headers: authHeaders() });
    }
    return { success: true, wishlist: [] };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to clear wishlist");
  }
};
