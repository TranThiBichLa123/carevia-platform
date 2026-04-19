import apiClient from "@/services/apiClient";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || fallback;
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

export const bookingService = {
  getAll: async () => {
    try {
      const res = await apiClient.get("/bookings/my", { headers: authHeaders() });
      const data = res.data;
      return data.items || data.content || data || [];
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      return [];
    }
  },

  create: async (bookingData: {
    sessionId: number;
    deviceId: number;
    customerNote?: string;
    voucherCode?: string;
  }) => {
    try {
      const res = await apiClient.post("/bookings", bookingData, { headers: authHeaders() });
      return res.data;
    } catch (error: unknown) {
      console.error("Failed to create booking:", error);
      throw new Error(getErrorMessage(error, "Failed to create booking"));
    }
  },

  updateStatus: async (id: string | number, status: string, reason?: string) => {
    try {
      if (status === "CANCELLED") {
        const res = await apiClient.put(
          `/bookings/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`,
          null,
          { headers: authHeaders() }
        );
        return res.data;
      }
      // Staff operations
      const endpoint = status === "CONFIRMED" ? "confirm" : status === "COMPLETED" ? "complete" : "cancel";
      const res = await apiClient.put(`/bookings/${id}/${endpoint}`, null, { headers: authHeaders() });
      return res.data;
    } catch (error: unknown) {
      console.error("Failed to update booking status:", error);
      throw new Error(getErrorMessage(error, "Failed to update booking status"));
    }
  },

  getById: async (id: string | number) => {
    try {
      const res = await apiClient.get(`/bookings/${id}`, { headers: authHeaders() });
      return res.data;
    } catch (error) {
      console.error("Failed to fetch booking:", error);
      return null;
    }
  },

  getAvailableSessions: async (deviceId: number, fromDate?: string) => {
    try {
      const params = new URLSearchParams({ deviceId: String(deviceId) });
      if (fromDate) params.append("fromDate", fromDate);
      const res = await apiClient.get(`/bookings/sessions/available?${params}`, { headers: authHeaders() });
      return res.data || [];
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      return [];
    }
  },
};
