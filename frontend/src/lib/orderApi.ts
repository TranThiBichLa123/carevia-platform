import apiClient from "@/services/apiClient";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type RawOrderItem = Partial<OrderItemInfo> & {
  deviceId?: number | string;
  deviceName?: string;
  unitPrice?: number;
  deviceImage?: string;
};

type RawOrder = Partial<Order> & {
  id?: number | string;
  accountId?: number | string;
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  paymentTransactionId?: string;
  updatedAt?: string;
  createdAt?: string;
  items?: RawOrderItem[];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || fallback;
};



// Định nghĩa lại các Status khớp với ràng buộc CHECK của Database
export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type PaymentStatus = 'INITIATED' | 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'CANCELLED';

// 1. Cập nhật interface OrderItemInfo để chứa cả hai cách đặt tên (alias)
export interface OrderItemInfo {
  id: number;
  deviceId: number;
  productId: string; // Thêm alias này
  deviceName: string;
  name: string;      // Thêm alias này
  deviceImage: string;
  image: string;     // Thêm alias này
  quantity: number;
  unitPrice: number;
  price: number;     // Thêm alias này
  subtotal: number;
}

export interface Order {
  id: number;
  _id: string;
  orderCode: string;
  accountId: number;
  userId: number;
  items: OrderItemInfo[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  total: number;
  status: OrderStatus; // Dùng kiểu Enum vừa định nghĩa
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentTransactionId: string; // Đây là trường quan trọng từ DB của bạn
  // Các trường ảo (Alias) để không bị lỗi UI cũ
  paidAt?: string; 
  paymentIntentId?: string;
  stripeSessionId?: string;
  
  voucherCode: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
  customerNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  message?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface CartItem {
  _id: string;
  id?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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

const normalizeOrder = (o: any): Order => ({
  ...o,
  id: Number(o.id) || 0,
  orderCode: o.orderCode || "",
  _id: String(o.id || ""),
  userId: Number(o.accountId || 0),
  total: o.totalAmount || 0,
  
  // Ép kiểu các Enum/String
  status: o.status as OrderStatus,
  paymentStatus: o.paymentStatus as PaymentStatus,
  
  // Ánh xạ các trường từ DB
  paymentIntentId: o.paymentTransactionId,
  stripeSessionId: o.paymentTransactionId,
  
  paidAt: (o.status === 'PAID' || o.paymentStatus === 'SUCCESS') ? o.updatedAt : undefined,
  
  createdAt: o.createdAt || new Date().toISOString(),
  updatedAt: o.updatedAt || o.createdAt || new Date().toISOString(),
  
  items: (o.items || []).map((item: any) => ({
    ...item,
    productId: String(item.deviceId || ""),
    name: item.deviceName || "",
    price: item.unitPrice || 0,
    image: item.deviceImage || ""
  })),
} as Order); // <-- THÊM DÒNG NÀY ĐỂ XÓA LỖI ĐỎ





export const createOrderFromCart = async (
  _token: string,
  cartItems: CartItem[],
  shippingAddress: ShippingAddress
): Promise<CreateOrderResponse> => {
  try {
    const res = await apiClient.post("/orders/from-cart", {
      items: cartItems.map(item => ({ deviceId: Number(item._id ?? item.id), quantity: item.quantity })),
      shippingAddress: shippingAddress.street,
      shippingCity: shippingAddress.city,
      shippingCountry: shippingAddress.country,
      shippingPostalCode: shippingAddress.postalCode,
    }, { headers: authHeaders() });
    return { success: true, order: normalizeOrder(res.data) };
  } catch (error: unknown) {
    return { success: false, order: {} as Order, message: getErrorMessage(error, "Failed to create order") };
  }
};

export const getUserOrders = async (_token: string): Promise<Order[]> => {
  try {
    const res = await apiClient.get("/orders/my", { headers: authHeaders() });
    const data = res.data;
    const items = data.items || data.content || data || [];
    return Array.isArray(items) ? items.map(normalizeOrder) : [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const getOrderById = async (orderId: string, _token: string): Promise<Order | null> => {
  try {
    const res = await apiClient.get(`/orders/${orderId}`, { headers: authHeaders() });
    return normalizeOrder(res.data);
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
};

export const deleteOrder = async (orderId: string, _token: string): Promise<{ success: boolean; message?: string }> => {
  try {
    await apiClient.delete(`/orders/${orderId}`, { headers: authHeaders() });
    return { success: true, message: "Order deleted successfully" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to delete order") };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  _token: string
): Promise<{ success: boolean; order?: Order; message?: string }> => {
  try {
    const res = await apiClient.put(`/orders/${orderId}/status?status=${status}`, null, { headers: authHeaders() });
    return { success: true, order: normalizeOrder(res.data) };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to update order status") };
  }
};
