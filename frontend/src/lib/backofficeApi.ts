import apiClient from "@/services/apiClient";

export type BackofficePageResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type StaffBookingStatus =
  | "PENDING_CONFIRM"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "EXPIRED";

export type StaffBooking = {
  id: number;
  bookingCode: string;
  accountId: number;
  accountName: string;
  session: {
    id: number;
    branchName: string;
    locationDetail: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    maxSlots: number;
    availableSlots: number;
  };
  device: {
    id: number;
    name: string;
    image: string | null;
    bookingPrice: number | null;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: StaffBookingStatus;
  totalPrice: number;
  discountAmount: number;
  voucherCode: string | null;
  customerNote: string | null;
  staffNote: string | null;
  cancelReason: string | null;
  cancelledBy: string | null;
  createdAt: string;
};

export type BackofficeOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type BackofficePaymentStatus =
  | "INITIATED"
  | "SUCCESS"
  | "FAILED"
  | "TIMEOUT"
  | "CANCELLED";

export type BackofficeOrder = {
  id: number;
  orderCode: string;
  accountId: number;
  items: Array<{
    id: number;
    deviceId: number;
    deviceName: string;
    deviceImage: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  status: BackofficeOrderStatus;
  paymentStatus: BackofficePaymentStatus;
  paymentMethod: string;
  paymentTransactionId: string | null;
  voucherCode: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPostalCode: string;
  customerNote: string | null;
  cancelReason: string | null;
  refundStatus: string | null;
  createdAt: string;
};

export type BackofficeSessionStatus = "OPEN" | "CLOSED" | "FULL" | "CANCELLED";

export type BackofficeSession = {
  id: number;
  deviceId: number;
  deviceName: string;
  branchName: string;
  locationDetail: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  maxSlots: number;
  availableSlots: number;
  status: BackofficeSessionStatus;
  pricePerSlot: number | null;
  staffId: number | null;
  staffName: string | null;
};

export type BackofficeVoucherStatus = "ACTIVE" | "EXPIRED" | "USED_UP" | "DISABLED";
export type BackofficeVoucherType = "PERCENTAGE" | "FIXED_AMOUNT";

export type BackofficeVoucher = {
  id: number;
  code: string;
  description: string | null;
  voucherType: BackofficeVoucherType;
  discountValue: number;
  minOrderValue: number | null;
  maxDiscount: number | null;
  totalQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  startDate: string;
  endDate: string;
  status: BackofficeVoucherStatus;
  applicableDeviceId: number | null;
  applicableDeviceName: string | null;
  applicableCategoryId: number | null;
  createdAt: string;
};

export type AdminRole = "CLIENT" | "STAFF" | "ADMIN";
export type AdminAccountStatus =
  | "PENDING_EMAIL"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "REJECTED"
  | "SUSPENDED"
  | "DEACTIVATED";

export type AdminAccount = {
  accountId: number;
  username: string;
  email: string;
  role: AdminRole;
  status: AdminAccountStatus;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type AdminAccountProfile = {
  accountId: number;
  username: string;
  email: string;
  lastLoginAt: string | null;
  role: AdminRole;
  status: AdminAccountStatus;
  avatarUrl: string | null;
  profile?: {
    clientId?: number;
    staffId?: number;
    clientCode?: string;
    staffCode?: string;
    fullName?: string;
    phone?: string;
    birthDate?: string;
    bio?: string;
    gender?: string;
    specialty?: string;
    degree?: string;
    approved?: boolean;
    approvedBy?: number;
    approvedAt?: string;
    rejectionReason?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

type WrappedResponse<T> = {
  data: T;
};

const getToken = (): string | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

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

export const backofficeApi = {
  async getStaffBookings(params?: {
    status?: StaffBookingStatus;
    page?: number;
    size?: number;
  }): Promise<BackofficePageResponse<StaffBooking>> {
    const searchParams = new URLSearchParams();

    if (params?.status) {
      searchParams.append("status", params.status);
    }

    searchParams.append("page", String(params?.page ?? 0));
    searchParams.append("size", String(params?.size ?? 20));

    const res = await apiClient.get(`/bookings/all?${searchParams.toString()}`, {
      headers: authHeaders(),
    });

    return res.data;
  },

  async confirmStaffBooking(id: number, staffNote?: string): Promise<StaffBooking> {
    const query = staffNote
      ? `?staffNote=${encodeURIComponent(staffNote)}`
      : "";
    const res = await apiClient.put(`/bookings/${id}/confirm${query}`, null, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async cancelStaffBooking(id: number, reason: string): Promise<StaffBooking> {
    const res = await apiClient.put(
      `/bookings/${id}/staff-cancel?reason=${encodeURIComponent(reason)}`,
      null,
      {
        headers: authHeaders(),
      }
    );
    return res.data;
  },

  async completeStaffBooking(id: number): Promise<StaffBooking> {
    const res = await apiClient.put(`/bookings/${id}/complete`, null, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getAllOrders(params?: {
    page?: number;
    size?: number;
  }): Promise<BackofficePageResponse<BackofficeOrder>> {
    const searchParams = new URLSearchParams();
    searchParams.append("page", String(params?.page ?? 0));
    searchParams.append("size", String(params?.size ?? 50));

    const res = await apiClient.get(`/orders/all?${searchParams.toString()}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getOrderById(id: number): Promise<BackofficeOrder> {
    const res = await apiClient.get(`/orders/${id}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async updateOrderStatus(
    id: number,
    status: BackofficeOrderStatus
  ): Promise<BackofficeOrder> {
    const res = await apiClient.put(`/orders/${id}/status?status=${status}`, null, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getSessionsByDate(date: string): Promise<BackofficeSession[]> {
    const res = await apiClient.get(`/bookings/sessions?date=${date}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getSessionById(id: number): Promise<BackofficeSession> {
    const res = await apiClient.get(`/bookings/sessions/${id}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async createSession(payload: {
    deviceId: number;
    branchName: string;
    locationDetail: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    maxSlots: number;
    pricePerSlot: number;
  }): Promise<BackofficeSession> {
    const res = await apiClient.post("/bookings/sessions", payload, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async updateSessionStatus(
    id: number,
    status: Extract<BackofficeSessionStatus, "CLOSED" | "CANCELLED">
  ): Promise<BackofficeSession> {
    const res = await apiClient.put(
      `/bookings/sessions/${id}/status?status=${status}`,
      null,
      {
        headers: authHeaders(),
      }
    );
    return res.data;
  },

  async getAllVouchers(): Promise<BackofficeVoucher[]> {
    const res = await apiClient.get("/vouchers", {
      headers: authHeaders(),
    });
    return res.data;
  },

  async createVoucher(payload: {
    code: string;
    description?: string;
    voucherType: BackofficeVoucherType;
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    totalQuantity: number;
    startDate: string;
    endDate: string;
    applicableDeviceId?: number;
  }): Promise<BackofficeVoucher> {
    const res = await apiClient.post("/vouchers", payload, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async updateVoucherStatus(
    id: number,
    status: BackofficeVoucherStatus
  ): Promise<BackofficeVoucher> {
    const res = await apiClient.put(`/vouchers/${id}/status?status=${status}`, null, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getAdminAccounts(params?: {
    page?: number;
    size?: number;
  }): Promise<BackofficePageResponse<AdminAccount>> {
    const searchParams = new URLSearchParams();
    searchParams.append("page", String(params?.page ?? 0));
    searchParams.append("size", String(params?.size ?? 100));

    const res = await apiClient.get(`/admin/accounts?${searchParams.toString()}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getAdminAccountById(id: number): Promise<AdminAccountProfile> {
    const res = await apiClient.get<WrappedResponse<AdminAccountProfile>>(
      `/admin/accounts/${id}`,
      {
        headers: authHeaders(),
      }
    );
    return res.data.data;
  },

  async changeAdminAccountStatus(
    id: number,
    status: AdminAccountStatus,
    reason?: string
  ): Promise<AdminAccountProfile> {
    const res = await apiClient.patch<WrappedResponse<AdminAccountProfile>>(
      `/admin/accounts/${id}/status`,
      { status, reason },
      {
        headers: authHeaders(),
      }
    );
    return res.data.data;
  },

  async approveStaffAccount(id: number): Promise<AdminAccountProfile> {
    const res = await apiClient.patch<WrappedResponse<AdminAccountProfile>>(
      `/admin/accounts/${id}/approve`,
      {},
      {
        headers: authHeaders(),
      }
    );
    return res.data.data;
  },

  async rejectStaffAccount(
    id: number,
    reason: string
  ): Promise<AdminAccountProfile> {
    const res = await apiClient.patch<WrappedResponse<AdminAccountProfile>>(
      `/admin/accounts/${id}/reject`,
      { reason },
      {
        headers: authHeaders(),
      }
    );
    return res.data.data;
  },
};