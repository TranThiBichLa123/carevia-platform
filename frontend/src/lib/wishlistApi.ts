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
  _token: string // Sử dụng tham số này
): Promise<WishlistResponse> => {
  try {
    await apiClient.post(`/wishlist/${productId}`, null, {
      headers: { Authorization: `Bearer ${_token}` } // Gửi trực tiếp ở đây
    });
    const updated = await getUserWishlist(_token);
    return updated;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to add to wishlist");
  }
};

export const removeFromWishlist = async (
  productId: string,
  _token: string
): Promise<any> => { // Đổi sang Promise<any> hoặc một interface Success đơn giản
  try {
    // 1. Chỉ thực hiện lệnh xóa
    const response = await apiClient.delete(`/wishlist/${productId}`, {
      headers: { Authorization: `Bearer ${_token}` },
    });

    // 2. Trả về data từ response (thường chứa message success)
    return response.data;

    // KHÔNG gọi lại getUserWishlist ở đây để tiết kiệm tài nguyên và thời gian
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Không thể xóa sản phẩm");
  }
};

export const getWishlistProducts = async (
  _productIds: string[],
  _token: string
): Promise<WishlistProductsResponse> => {
  try {
    const res = await apiClient.get("/wishlist", {
      headers: { Authorization: `Bearer ${_token}` }
    });
    return {
      success: true,
      products: res.data || [],
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to get wishlist products");
  }
};
// Thêm hàm helper kiểm tra token hợp lệ
const isValidToken = (t: string) => t && t !== "undefined" && t !== "null";

export const getUserWishlist = async (token: string): Promise<WishlistResponse> => {
  // Chặn ngay nếu không có token để đỡ tốn request lỗi 403
  if (!isValidToken(token)) {
    return { success: false, wishlist: [], message: "No valid token provided" };
  }

  try {
    const res = await apiClient.get("/wishlist/ids", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ids: number[] = res.data || [];
    return {
      success: true,
      wishlist: ids.map(String),
    };
  } catch (error: any) {
    console.error("Wishlist API Error:", error?.response?.status, error?.response?.data);
    return {
      success: false,
      wishlist: [],
      message: error?.response?.data?.message || "Forbidden access"
    };
  }
};

// Sửa hàm clearWishlist bị sai logic dùng authHeaders()
export const clearWishlist = async (_token: string): Promise<WishlistResponse> => {
  try {
    const current = await getUserWishlist(_token);
    if (!current.success) return current;

    // Sử dụng Promise.all để xóa nhanh hơn thay vì đợi từng cái (for await)
    await Promise.all(
      current.wishlist.map(id =>
        apiClient.delete(`/wishlist/${id}`, {
          headers: { Authorization: `Bearer ${_token}` }
        })
      )
    );

    return { success: true, wishlist: [] };
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to clear wishlist");
  }
};
