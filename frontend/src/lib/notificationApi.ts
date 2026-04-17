import apiClient from "@/services/apiClient";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notificationType: string;
  status: "UNREAD" | "READ" | "DISABLED";
  referenceId: number | null;
  referenceType: string | null;
  actionUrl: string | null;
  createdAt: string;
}

export interface NotificationPageResponse {
  items: NotificationItem[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
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

export const notificationApi = {
  getAll: async (page = 0, size = 20): Promise<NotificationPageResponse> => {
    const res = await apiClient.get(`/notifications?page=${page}&size=${size}`, { headers: authHeaders() });
    return res.data;
  },

  getUnread: async (page = 0, size = 20): Promise<NotificationPageResponse> => {
    const res = await apiClient.get(`/notifications/unread?page=${page}&size=${size}`, { headers: authHeaders() });
    return res.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get("/notifications/unread-count", { headers: authHeaders() });
    return res.data;
  },

  markAsRead: async (id: number): Promise<NotificationItem> => {
    const res = await apiClient.put(`/notifications/${id}/read`, null, { headers: authHeaders() });
    return res.data;
  },

  markAllAsRead: async (): Promise<{ markedCount: number }> => {
    const res = await apiClient.put("/notifications/read-all", null, { headers: authHeaders() });
    return res.data;
  },
};
