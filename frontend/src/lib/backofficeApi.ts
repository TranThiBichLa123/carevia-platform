import apiClient from "@/services/apiClient";
import type { ReviewData } from "@/lib/deviceApi";

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
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "EXPIRED";

export type StaffDeviceStatus =
  | "AVAILABLE"
  | "OUT_OF_STOCK"
  | "MAINTENANCE"
  | "INACTIVE";

export type InventoryTransactionType =
  | "IMPORT"
  | "EXPORT"
  | "AUDIT_ADJUSTMENT";

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

export type StaffDevice = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  skinType?: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  image: string | null;
  imagePublicId: string | null;
  sku: string | null;
  status: StaffDeviceStatus;
  sold: number;
  bookingPrice: number | null;
  maintenanceReason: string | null;
  maintenanceStartDate: string | null;
  maintenanceEndDate: string | null;
  maintenanceCost: number | null;
  category: {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    categoryType: string | null;
  } | null;
  brand: {
    id: number;
    name: string;
    slug: string;
    image: string | null;
  } | null;
  createdAt: string;
};

export type StaffInventoryTransaction = {
  id: number;
  deviceId: number;
  deviceName: string;
  transactionType: InventoryTransactionType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  reason: string;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
};

export type StaffDashboard = {
  date: string;
  bookingsToday: number;
  pendingBookings: number;
  checkedInToday: number;
  pendingOrders: number;
  lowStockDevices: number;
  maintenanceDevices: number;
  vouchersExpiringSoon: number;
  lowStockAlerts: Array<{
    deviceId: number;
    deviceName: string;
    stock: number;
    status: StaffDeviceStatus;
    maintenanceReason: string | null;
  }>;
  maintenanceAlerts: Array<{
    deviceId: number;
    deviceName: string;
    stock: number;
    status: StaffDeviceStatus;
    maintenanceReason: string | null;
  }>;
  voucherAlerts: Array<{
    voucherId: number;
    code: string;
    endDate: string;
    remainingQuantity: number;
  }>;
  totalRevenue?: number;              // Tổng doanh thu tích lũy
  revenueChangePercentage?: number;   // % Biến động tăng trưởng doanh thu
  monthlyRevenue?: Array<{
    month: string;
    bookingRevenue: number;   // Thêm trường này
    equipmentRevenue: number; // Thêm trường này
    revenue?: number;         // Tổng (tuỳ chọn giữ lại)
  }>;

};

export type StaffDeviceCategory = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  categoryType: string | null;
  description?: string | null;
};

export type StaffDeviceBrand = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  imagePublicId?: string | null;
  description?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  maxDiscountPercentage?: number | null;
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
  customerName: string | null;
  customerPhone: string | null;
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
  applicableDeviceImage: string | null;
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
  brandId?: number;
  brandName?: string;
  requestedBrandName?: string | null;
  requestedBrandDescription?: string | null;
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
    brandId?: number;
    brandName?: string;
    requestedBrandName?: string;
    requestedBrandDescription?: string;
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

export type AdminReview = {
  id: number;
  deviceId: number | null;
  deviceName: string | null;
  accountId: number;
  accountName: string;
  accountAvatar: string | null;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  adminReply: string | null;
  adminReplyCreatedAt: string | null;
  adminReplyEditedAt: string | null;
  adminReplyEditCount: number;
  adminReplyEdited: boolean;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BusinessSettings = {
  businessName: string;
  hotline: string;
  supportEmail: string;
  storeAddress: string;
  storeHours: string;
  supportNote: string;
};

export type AuditLogEntry = {
  id: number;
  tableName: string;
  recordId: string;
  action: string;
  changedData: string | null;
  userAccountId: number | null;
  username: string | null;
  email: string | null;
  role: AdminRole | null;
  ipAddress: string | null;
  createdAt: string;
};

export type AuditLogSuggestions = {
  searchTerms: string[];
  tableNames: string[];
};

export type DeviceImageUploadResult = {
  imageUrl: string;
  imagePublicId: string;
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

  async checkInStaffBooking(id: number, staffNote?: string): Promise<StaffBooking> {
    const query = staffNote
      ? `?staffNote=${encodeURIComponent(staffNote)}`
      : "";
    const res = await apiClient.put(`/bookings/${id}/check-in${query}`, null, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async markStaffBookingNoShow(id: number, staffNote?: string): Promise<StaffBooking> {
    const query = staffNote
      ? `?staffNote=${encodeURIComponent(staffNote)}`
      : "";
    const res = await apiClient.put(`/bookings/${id}/no-show${query}`, null, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getStaffDashboard(): Promise<StaffDashboard> {
    const res = await apiClient.get("/staff/dashboard", {
      headers: authHeaders(),
    });
    return res.data;
  },


  async getStaffBrand(): Promise<StaffDeviceBrand> {
    const res = await apiClient.get("/staff/brand", {
      headers: authHeaders(),
    });
    return res.data;
  },

  async updateStaffBrand(payload: {
    name: string;
    description?: string;
  }): Promise<StaffDeviceBrand> {
    const res = await apiClient.put("/staff/brand", payload, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async uploadStaffBrandImage(file: File): Promise<DeviceImageUploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post("/staff/brand/image-upload", formData, {
      headers: {
        ...authHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async getStaffDevices(params?: {
    search?: string;
    status?: StaffDeviceStatus;
    lowStockOnly?: boolean;
    maintenanceOnly?: boolean;
    page?: number;
    size?: number;
  }): Promise<BackofficePageResponse<StaffDevice>> {
    const searchParams = new URLSearchParams();

    if (params?.search) {
      searchParams.append("search", params.search);
    }
    if (params?.status) {
      searchParams.append("status", params.status);
    }
    if (params?.lowStockOnly !== undefined) {
      searchParams.append("lowStockOnly", String(params.lowStockOnly));
    }
    if (params?.maintenanceOnly !== undefined) {
      searchParams.append("maintenanceOnly", String(params.maintenanceOnly));
    }
    searchParams.append("page", String(params?.page ?? 0));
    searchParams.append("size", String(params?.size ?? 50));

    const res = await apiClient.get(`/staff/devices?${searchParams.toString()}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async createStaffDevice(payload: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    skinType?: string;
    categoryId?: number;
    brandId?: number;
    sku?: string;
    image?: string;
    imagePublicId?: string;
  }): Promise<StaffDevice> {
    const res = await apiClient.post("/staff/devices", payload, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async updateStaffDevice(
    deviceId: number,
    payload: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      skinType?: string;
      status?: StaffDeviceStatus;
      categoryId?: number;
      brandId?: number;
      sku?: string;
      image?: string;
      imagePublicId?: string;
    }
  ): Promise<StaffDevice> {
    const res = await apiClient.put(`/staff/devices/${deviceId}`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async uploadStaffDeviceImage(
    file: File,
    params?: {
      deviceId?: number;
      currentPublicId?: string;
    }
  ): Promise<DeviceImageUploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    if (params?.deviceId !== undefined) {
      formData.append("deviceId", String(params.deviceId));
    }
    if (params?.currentPublicId) {
      formData.append("currentPublicId", params.currentPublicId);
    }

    const res = await apiClient.post("/staff/devices/image-upload", formData, {
      headers: {
        ...authHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async deleteStaffDevice(deviceId: number): Promise<void> {
    await apiClient.delete(`/staff/devices/${deviceId}`, {
      headers: authHeaders(),
    });
  },

  async assignVoucherToStaffDevice(deviceId: number, voucherId: number): Promise<BackofficeVoucher> {
    const res = await apiClient.put(`/staff/devices/${deviceId}/vouchers/${voucherId}`, null, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async removeVoucherFromStaffDevice(deviceId: number, voucherId: number): Promise<BackofficeVoucher> {
    const res = await apiClient.delete(`/staff/devices/${deviceId}/vouchers/${voucherId}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getStaffDeviceCategories(): Promise<StaffDeviceCategory[]> {
    const res = await apiClient.get("/staff/device-categories", {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getStaffDeviceBrands(): Promise<StaffDeviceBrand[]> {
    const res = await apiClient.get("/staff/device-brands", {
      headers: authHeaders(),
    });
    return res.data;
  },

  async adjustStaffInventory(
    deviceId: number,
    payload: {
      transactionType: InventoryTransactionType;
      quantity: number;
      reason: string;
      note?: string;
    }
  ): Promise<StaffDevice> {
    const res = await apiClient.post(
      `/staff/devices/${deviceId}/inventory-adjustments`,
      payload,
      {
        headers: authHeaders(),
      }
    );
    return res.data;
  },

  async updateStaffDeviceMaintenance(
    deviceId: number,
    payload: {
      maintenanceReason?: string;
      maintenanceStartDate?: string;
      maintenanceEndDate?: string;
      maintenanceCost?: number;
      markCompleted?: boolean;
    }
  ): Promise<StaffDevice> {
    const res = await apiClient.put(`/staff/devices/${deviceId}/maintenance`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getInventoryTransactions(params?: {
    deviceId?: number;
    page?: number;
    size?: number;
  }): Promise<BackofficePageResponse<StaffInventoryTransaction>> {
    const searchParams = new URLSearchParams();
    if (params?.deviceId) {
      searchParams.append("deviceId", String(params.deviceId));
    }
    searchParams.append("page", String(params?.page ?? 0));
    searchParams.append("size", String(params?.size ?? 20));

    const res = await apiClient.get(
      `/staff/inventory-transactions?${searchParams.toString()}`,
      {
        headers: authHeaders(),
      }
    );
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
    const res = await apiClient.get("/staff/vouchers", {
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

  async approveStaffAccount(id: number, brandId?: number): Promise<AdminAccountProfile> {
    const res = await apiClient.patch<WrappedResponse<AdminAccountProfile>>(
      `/admin/accounts/${id}/approve`,
      brandId ? { brandId } : {},
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

  async getAdminReviews(params?: {
    search?: string;
    hidden?: boolean;
    deviceId?: number;
    page?: number;
    size?: number;
  }): Promise<BackofficePageResponse<AdminReview>> {
    const searchParams = new URLSearchParams();

    if (params?.search) {
      searchParams.append("search", params.search);
    }
    if (params?.hidden !== undefined) {
      searchParams.append("hidden", String(params.hidden));
    }
    if (params?.deviceId) {
      searchParams.append("deviceId", String(params.deviceId));
    }
    searchParams.append("page", String(params?.page ?? 0));
    searchParams.append("size", String(params?.size ?? 100));

    const res = await apiClient.get(`/admin/reviews?${searchParams.toString()}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async moderateAdminReview(
    reviewId: number,
    payload: {
      adminReply?: string;
      hidden?: boolean;
    }
  ): Promise<AdminReview> {
    const res = await apiClient.patch(`/admin/reviews/${reviewId}`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async replyToStaffReview(
    reviewId: number,
    payload: {
      adminReply: string;
    }
  ): Promise<ReviewData> {
    const res = await apiClient.patch(`/staff/reviews/${reviewId}`, payload, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getBusinessSettings(): Promise<BusinessSettings> {
    const res = await apiClient.get("/system-settings/business-info");
    return res.data;
  },

  async updateBusinessSettings(payload: BusinessSettings): Promise<BusinessSettings> {
    const res = await apiClient.put("/admin/system-settings/business-info", payload, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getAuditLogs(params?: {
    search?: string;
    action?: string;
    role?: string;
    tableName?: string;
    page?: number;
    size?: number;
  }): Promise<BackofficePageResponse<AuditLogEntry>> {
    const searchParams = new URLSearchParams();

    if (params?.search) {
      searchParams.append("search", params.search);
    }
    if (params?.action) {
      searchParams.append("action", params.action);
    }
    if (params?.role) {
      searchParams.append("role", params.role);
    }
    if (params?.tableName) {
      searchParams.append("tableName", params.tableName);
    }
    searchParams.append("page", String(params?.page ?? 0));
    searchParams.append("size", String(params?.size ?? 100));

    const res = await apiClient.get(`/admin/audit-logs?${searchParams.toString()}`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async getAuditLogSuggestions(): Promise<AuditLogSuggestions> {
    const res = await apiClient.get("/admin/audit-logs/suggestions", {
      headers: authHeaders(),
    });
    return res.data;
  },

  getBrandAnalytics: async (brandId: number | string): Promise<{
    totalRevenue: number;
    totalOrders: number;
    revenueChangePercentage: number; // Tỷ lệ biến động doanh thu (%)
    monthlyRevenue: Array<{ month: string; revenue: number }>; // Dữ liệu vẽ biểu đồ
  }> => {
    const res = await apiClient.get(`/staff/brands/${brandId}/analytics`, { headers: authHeaders() });
    return res.data;
  },
};