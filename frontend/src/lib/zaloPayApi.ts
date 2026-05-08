import apiClient from "@/services/apiClient";

export interface ZaloPayCreateOrderResponse {
  orderUrl: string;
  appTransId: string;
  returnCode: number;
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
    // Extract the actual error message from the backend response
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      "Không thể tạo đơn thanh toán ZaloPay";
    throw new Error(String(backendMessage));
  }
};
