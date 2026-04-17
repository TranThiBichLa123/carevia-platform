import apiClient from "@/services/apiClient";

export interface CartItemInfo {
  id: number;
  deviceId: number;
  deviceName: string;
  deviceImage: string;
  devicePrice: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponseData {
  id: number;
  items: CartItemInfo[];
  totalAmount: number;
  totalItems: number;
}

export interface CartResponse {
  success: boolean;
  cart: CartItemInfo[];
  data?: CartResponseData;
  message: string;
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

export const getUserCart = async (): Promise<CartResponse> => {
  try {
    const res = await apiClient.get("/cart", { headers: authHeaders() });
    const data: CartResponseData = res.data;
    return { success: true, cart: data.items || [], data, message: "Cart retrieved" };
  } catch (error: any) {
    return { success: false, cart: [], message: error?.response?.data?.message || "Failed to get cart" };
  }
};

export const addToCart = async (
  _token: string,
  deviceId: string | number,
  quantity: number = 1
): Promise<CartResponse> => {
  try {
    const res = await apiClient.post(`/cart/items?deviceId=${deviceId}&quantity=${quantity}`, null, { headers: authHeaders() });
    const data: CartResponseData = res.data;
    return { success: true, cart: data.items || [], data, message: "Added to cart" };
  } catch (error: any) {
    return { success: false, cart: [], message: error?.response?.data?.message || "Failed to add to cart" };
  }
};

export const updateCartItem = async (
  _token: string,
  deviceId: string | number,
  quantity: number
): Promise<CartResponse> => {
  try {
    const res = await apiClient.put(`/cart/items/${deviceId}?quantity=${quantity}`, null, { headers: authHeaders() });
    const data: CartResponseData = res.data;
    return { success: true, cart: data.items || [], data, message: "Cart updated" };
  } catch (error: any) {
    return { success: false, cart: [], message: error?.response?.data?.message || "Failed to update cart" };
  }
};

export const removeFromCart = async (
  _token: string,
  deviceId: string | number
): Promise<CartResponse> => {
  try {
    const res = await apiClient.delete(`/cart/items/${deviceId}`, { headers: authHeaders() });
    const data: CartResponseData = res.data;
    return { success: true, cart: data.items || [], data, message: "Removed from cart" };
  } catch (error: any) {
    return { success: false, cart: [], message: error?.response?.data?.message || "Failed to remove from cart" };
  }
};

export const clearCart = async (): Promise<CartResponse> => {
  try {
    await apiClient.delete("/cart/clear", { headers: authHeaders() });
    return { success: true, cart: [], message: "Cart cleared" };
  } catch (error: any) {
    return { success: false, cart: [], message: error?.response?.data?.message || "Failed to clear cart" };
  }
};
