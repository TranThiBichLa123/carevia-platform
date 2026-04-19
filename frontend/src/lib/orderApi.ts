import apiClient from "@/services/apiClient";



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
  _id: String(o.id),
  userId: Number(o.accountId),
  total: o.totalAmount,
  // Đảm bảo status luôn đúng định dạng (vì DB của bạn lưu CHỮ HOA)
  status: o.status as OrderStatus,
  paymentStatus: o.paymentStatus as PaymentStatus,
  
  // Ánh xạ các trường từ DB vào các biến mà UI đang gọi để hết lỗi đỏ
  paymentIntentId: o.paymentTransactionId, // UI gọi paymentIntentId -> trả về Transaction ID
  stripeSessionId: o.paymentTransactionId, // Dự phòng cho UI
  paidAt: o.status === 'PAID' || o.paymentStatus === 'SUCCESS' ? o.updatedAt : undefined,

  createdAt: o.createdAt || new Date().toISOString(),
  updatedAt: o.updatedAt || o.createdAt || new Date().toISOString(),
  items: (o.items || []).map((item: any) => ({
    ...item,
    productId: String(item.deviceId),
    name: item.deviceName,
    price: item.unitPrice,
    image: item.deviceImage || ""
  })),
});




export const createOrderFromCart = async (
  _token: string,
  cartItems: CartItem[],
  shippingAddress: ShippingAddress
): Promise<CreateOrderResponse> => {
  try {
    const res = await apiClient.post("/orders/from-cart", {
      items: cartItems.map(item => ({ deviceId: Number(item._id), quantity: item.quantity })),
      shippingAddress: shippingAddress.street,
      shippingCity: shippingAddress.city,
      shippingCountry: shippingAddress.country,
      shippingPostalCode: shippingAddress.postalCode,
    }, { headers: authHeaders() });
    return { success: true, order: normalizeOrder(res.data) };
  } catch (error: any) {
    return { success: false, order: {} as Order, message: error?.response?.data?.message || "Failed to create order" };
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
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "Failed to delete order" };
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
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || "Failed to update order status" };
  }
};
