import apiClient from "@/services/apiClient";

export type RefundStatus = 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type RefundType = 'ORDER_CANCEL' | 'BOOKING_CANCEL' | 'ORDER_RETURN';

export interface Refund {
  id: number;
  refundType: RefundType;
  orderId?: number;
  orderCode?: string;
  bookingId?: number;
  bookingCode?: string;
  amount: number;
  reasonCode: string;
  reasonDetail?: string;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
}

type ApiError = {
  response?: { data?: { message?: string } };
};

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

/** Get current user's refund list */
export const getMyRefunds = async (): Promise<{ success: boolean; refunds: Refund[]; message?: string }> => {
  try {
    const res = await apiClient.get("/refunds/my", { headers: authHeaders() });
    return { success: true, refunds: res.data as Refund[] };
  } catch (error) {
    const apiError = error as ApiError;
    return { success: false, refunds: [], message: apiError.response?.data?.message || "Lấy danh sách hoàn tiền thất bại" };
  }
};

/** Get refunds for a specific order */
export const getRefundsByOrder = async (orderId: number): Promise<{ success: boolean; refunds: Refund[]; message?: string }> => {
  try {
    const res = await apiClient.get(`/refunds/order/${orderId}`, { headers: authHeaders() });
    return { success: true, refunds: res.data as Refund[] };
  } catch (error) {
    const apiError = error as ApiError;
    return { success: false, refunds: [], message: apiError.response?.data?.message || "Lấy thông tin hoàn tiền thất bại" };
  }
};

/** Get refunds for a specific booking */
export const getRefundsByBooking = async (bookingId: number): Promise<{ success: boolean; refunds: Refund[]; message?: string }> => {
  try {
    const res = await apiClient.get(`/refunds/booking/${bookingId}`, { headers: authHeaders() });
    return { success: true, refunds: res.data as Refund[] };
  } catch (error) {
    const apiError = error as ApiError;
    return { success: false, refunds: [], message: apiError.response?.data?.message || "Lấy thông tin hoàn tiền thất bại" };
  }
};

/** Request return for a completed order */
export const requestOrderReturn = async (orderId: number, reason: string): Promise<{ success: boolean; refund?: Refund; message?: string }> => {
  try {
    const res = await apiClient.post(`/refunds/order/${orderId}/return?reason=${encodeURIComponent(reason)}`, null, { headers: authHeaders() });
    return { success: true, refund: res.data as Refund };
  } catch (error) {
    const apiError = error as ApiError;
    return { success: false, message: apiError.response?.data?.message || "Gửi yêu cầu trả hàng thất bại" };
  }
};
