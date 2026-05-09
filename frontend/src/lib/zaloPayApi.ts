import apiClient from "@/services/apiClient";

export interface ZaloPayCreateOrderResponse {
  orderUrl: string;
  appTransId: string;
  returnCode: number;
}

export interface ZaloPayVerifyResponse {
  status: "PAID" | "PENDING" | "FAILED" | "NO_TRANSACTION" | "ERROR";
  message: string;
}

/**
 * Calls the backend to create a ZaloPay payment order.
 * Returns the ZaloPay payment URL to redirect the user to.
 */
export const createZaloPayOrder = async (
  orderId: string | number,
  token: string,
  redirectUrl?: string
): Promise<ZaloPayCreateOrderResponse> => {
  try {
    const response = await apiClient.post<ZaloPayCreateOrderResponse>(
      "/payments/zalopay/create",
      {
        orderId: Number(orderId),
        redirectUrl:
          redirectUrl ??
          `${window.location.origin}/client/success?orderId=${orderId}`,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      "Không thể tạo đơn thanh toán ZaloPay";
    throw new Error(String(backendMessage));
  }
};

/**
 * Verify ZaloPay payment status by querying ZaloPay API via backend.
 * Used as fallback when server-to-server callback cannot reach the server.
 */
export const verifyZaloPayPayment = async (
  orderId: string | number,
  token: string
): Promise<ZaloPayVerifyResponse> => {
  try {
    const response = await apiClient.get<ZaloPayVerifyResponse>(
      `/payments/zalopay/verify/${orderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    const backendMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Không thể xác minh thanh toán";
    throw new Error(String(backendMessage));
  }
};
