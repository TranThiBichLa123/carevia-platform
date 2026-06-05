"use client";

import { Database, History, RefreshCcw, Search, ShieldAlert, ChevronUp, ChevronDown, Terminal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  backofficeApi,
  type AdminRole,
  type AuditLogEntry,
} from "@/lib/backofficeApi";
import { formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";
import { cn } from "@/components/pages/OrdersPage";

type ActionFilter = "ALL" | "INSERT" | "UPDATE" | "DELETE" | "RESTORE";
type RoleFilter = "ALL" | Extract<AdminRole, "CLIENT" | "STAFF">;

const ACTION_CONFIGS: Record<string, { label: string; className: string }> = {
  INSERT: {
    label: "Tạo mới",
    className: "bg-emerald-50 border-emerald-100 text-emerald-700",
  },
  UPDATE: {
    label: "Cập nhật",
    className: "bg-blue-50 border-blue-100 text-blue-700",
  },
  DELETE: {
    label: "Xóa",
    className: "bg-rose-50 border-rose-100 text-rose-700",
  },
  RESTORE: {
    label: "Khôi phục",
    className: "bg-purple-50 border-purple-100 text-purple-700",
  },
};

const ACTION_FILTER_OPTIONS: { value: ActionFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả hành động" },
  { value: "INSERT", label: ACTION_CONFIGS.INSERT.label },
  { value: "UPDATE", label: ACTION_CONFIGS.UPDATE.label },
  { value: "DELETE", label: ACTION_CONFIGS.DELETE.label },
  { value: "RESTORE", label: ACTION_CONFIGS.RESTORE.label },
];

const ROLE_LABELS: Record<AdminRole, string> = {
  CLIENT: "Client",
  STAFF: "Brand Staff",
  ADMIN: "Platform Admin",
};

const ROLE_FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả vai trò" },
  { value: "CLIENT", label: ROLE_LABELS.CLIENT },
  { value: "STAFF", label: ROLE_LABELS.STAFF },
];

const TABLE_LABELS: Record<string, string> = {
  accounts: "Tài khoản",
  orders: "Đơn hàng",
  bookings: "Lịch hẹn",
  notifications: "Thông báo",
  devices: "Thiết bị",
  carts: "Giỏ hàng",
  reviews: "Đánh giá",
  wishlists: "Yêu thích",
  payments: "Thanh toán",
};

const EVENT_LABELS: Record<string, string> = {
  account_created: "Tạo tài khoản mới",
  account_updated: "Cập nhật tài khoản",
  account_deleted: "Xóa tài khoản",
  order_created: "Tạo đơn hàng",
  order_completed: "Hoàn tất đơn hàng",
  booking_created: "Tạo lịch hẹn",
  booking_confirmed: "Xác nhận lịch hẹn",
  booking_cancelled: "Hủy lịch hẹn",
  payment_created: "Tạo giao dịch thanh toán",
  payment_completed: "Hoàn tất thanh toán",
};

type AuditPayload = Record<string, unknown>;

const humanizeText = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getTableLabel = (tableName: string) => TABLE_LABELS[tableName] || humanizeText(tableName);

const parseAuditPayload = (changedData: string | null): AuditPayload | null => {
  if (!changedData) {
    return null;
  }

  try {
    const parsed = JSON.parse(changedData);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as AuditPayload;
    }
  } catch {
    return null;
  }

  return null;
};

const formatPayloadValue = (value: unknown): string => {
  if (value == null || value === "") {
    return "trống";
  }

  if (typeof value === "string") {
    return humanizeText(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
};

const getEventLabel = (eventName: string) => EVENT_LABELS[eventName] || humanizeText(eventName);

const getPayloadHighlights = (payload: AuditPayload | null) => {
  if (!payload) {
    return [];
  }

  const priorityKeys = ["event", "role", "status", "old_status", "total"];
  const keys = [
    ...priorityKeys.filter((key) => key in payload),
    ...Object.keys(payload).filter((key) => !priorityKeys.includes(key)),
  ].slice(0, 3);

  return keys.map((key) => ({
    key,
    label: humanizeText(key),
    value: formatPayloadValue(payload[key]),
  }));
};

const getLogSummary = (log: AuditLogEntry, payload: AuditPayload | null) => {
  const actionLabel = ACTION_CONFIGS[log.action]?.label || humanizeText(log.action);
  const tableLabel = getTableLabel(log.tableName).toLowerCase();

  if (!payload) {
    return `${actionLabel} trên ${tableLabel}`;
  }

  const eventName = typeof payload.event === "string" ? getEventLabel(payload.event) : `${actionLabel} ${tableLabel}`;
  const role = typeof payload.role === "string" ? formatPayloadValue(payload.role) : null;
  const status = typeof payload.status === "string" ? formatPayloadValue(payload.status) : null;
  const oldStatus = typeof payload.old_status === "string" ? formatPayloadValue(payload.old_status) : null;

  if (oldStatus && status) {
    return `${eventName} | ${oldStatus} -> ${status}`;
  }

  if (oldStatus) {
    return `${eventName} | từ ${oldStatus}`;
  }

  if (status) {
    return `${eventName} | trạng thái ${status}`;
  }

  if (role) {
    return `${eventName} | vai trò ${role}`;
  }

  return eventName;
};

export default function AdminAuditLogsPage() {
  const { authUser, isAuthenticated } = useUserStore();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("ALL");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [tableName, setTableName] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [tableSuggestions, setTableSuggestions] = useState<string[]>([]);

  const loadLogs = useCallback(async (filters?: {
    search?: string;
    action?: ActionFilter;
    role?: RoleFilter;
    tableName?: string;
  }) => {
    const nextSearch = filters?.search ?? search;
    const nextAction = filters?.action ?? actionFilter;
    const nextRole = filters?.role ?? roleFilter;
    const nextTableName = filters?.tableName ?? tableName;

    try {
      setLoading(true);
      const response = await backofficeApi.getAuditLogs({
        search: nextSearch.trim() || undefined,
        action: nextAction === "ALL" ? undefined : nextAction,
        role: nextRole === "ALL" ? undefined : nextRole,
        tableName: nextTableName.trim() || undefined,
        page: 0,
        size: 100,
      });
      setLogs(response.items || []);
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải lịch sử thao tác."));
    } finally {
      setLoading(false);
    }
  }, [actionFilter, roleFilter, search, tableName]);

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await backofficeApi.getAuditLogSuggestions();
      setSearchSuggestions(response.searchTerms || []);
      setTableSuggestions(response.tableNames || []);
    } catch {
      setSearchSuggestions([]);
      setTableSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadLogs();
  }, [isAuthenticated, loadLogs]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSearchSuggestions([]);
      setTableSuggestions([]);
      return;
    }
    void loadSuggestions();
  }, [isAuthenticated, loadSuggestions]);

  if (!isAuthenticated) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản admin để xem audit logs.</div>;
  }

  if (authUser?.role !== "ADMIN") {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ admin mới truy cập được trang này.</div>;
  }

  const uniqueTables = Array.from(new Set(logs.map((log) => log.tableName))).sort();

  // Hook quản lý việc mở rộng khối JSON Payload cho từng dòng log
  const [expandedPayloads, setExpandedPayloads] = useState<Record<number, boolean>>({});

  const togglePayload = (id: number) => {
    setExpandedPayloads((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Hàm Reset bộ lọc tổng hợp (nhớ khai báo thêm setTableName)
  const handleResetFilters = async () => {
    setSearch("");
    setActionFilter("ALL");
    setRoleFilter("ALL");
    setTableName("");
    setExpandedPayloads({});
    await loadLogs({ search: "", action: "ALL", role: "ALL", tableName: "" });
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6 px-4 py-6 md:px-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full font-vietnam">

        {/* Khối bên trái: Tiêu đề + Mô tả */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Lịch sử thao tác
          </h1>
          <p className="text-sm text-muted-foreground">
            Theo dõi tài khoản nào đã thay đổi dữ liệu, trên bảng nào, tại thời điểm nào và payload thao tác tương ứng.
          </p>
        </div>

        {/* Khối bên phải: Nút Làm mới (Tự động dạt sang phải nhờ flex-row & justify-between) */}
        <button
          onClick={() => void handleResetFilters()}
          disabled={loading}
          className={cn(
            "group relative overflow-hidden w-full shrink-0 sm:w-auto", // Đổi xl:w-auto thành sm:w-auto để nút gọn lại sớm hơn
            "text-[13px] font-medium whitespace-nowrap",
            "border border-slate-200 bg-white text-slate-700",
            "hover:border-admin-primary transition-all duration-500",
            "h-[38px] rounded-md px-4 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          )}
        >
          <span className="absolute inset-y-0 left-0 w-0 bg-admin-primary transition-all duration-500 ease-out group-hover:w-full" />
          <div className="relative z-10 flex items-center justify-center text-gray-700 group-hover:text-white transition-colors duration-500">
            <RefreshCcw className={cn("w-3.5 h-3.5 mr-2 transition-transform duration-700 ease-in-out text-gray-400 group-hover:text-white", loading ? "animate-spin" : "group-hover:rotate-180")} />
            <span>Làm mới</span>
          </div>
        </button>

      </div>



      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Tổng log trong bộ lọc</CardDescription>
            <CardTitle className="flex items-center gap-3 text-3xl"><History className="size-6 text-sky-500" />{logs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Người thao tác khác nhau</CardDescription>
            <CardTitle className="text-3xl">{new Set(logs.map((log) => log.username).filter(Boolean)).size}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Bảng dữ liệu khác nhau</CardDescription>
            <CardTitle className="text-3xl">{uniqueTables.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden font-vietnam">
        {/* ================= KHỐI HEADER + BỘ LỌC TÌM KIẾM ================= */}
        <CardHeader className="border-b border-gray-50  py-7">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-6">
            <div className="xl:max-w-60 shrink-0">
              <CardTitle className="text-base font-bold text-gray-800 tracking-tight flex items-center gap-2">
                Nhật ký vận hành
              </CardTitle>
              <CardDescription className="text-[13px] text-gray-400 mt-1">
                Theo dõi thay đổi dữ liệu gần đây.
              </CardDescription>
            </div>

            {/* Cụm thanh bộ lọc đồng bộ cao cấp */}
            <div className="flex flex-wrap items-center justify-end gap-3 w-full flex-1">
              {/* 1. Ô tìm kiếm tích hợp kính lúp */}
              <div className="relative w-full sm:w-[300px] shrink-0 group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400 group-focus-within:text-admin-primary transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full h-9.5 pl-9 pr-3 rounded-md border border-gray-100 text-[13px] bg-white shadow-sm focus-visible:outline-none focus-visible:border-admin-primary focus-visible:ring-1 focus-visible:ring-admin-primary/20 transition-all"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  list="audit-log-search-suggestions"
                  placeholder="Tìm user, email, record id, payload..."
                />
              </div>

              {/* 2. Custom Dropdown Hành động (Hover hiển thị) */}
              <div className="relative group w-fit xl:min-w-fit">
                <div className="flex h-9.5 items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm transition-all hover:border-gray-200 cursor-pointer">
                  <span className="text-[13px] font-medium text-gray-700 whitespace-nowrap">
                    {ACTION_FILTER_OPTIONS.find((item) => item.value === actionFilter)?.label}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="flex flex-col whitespace-nowrap">
                    {ACTION_FILTER_OPTIONS.map((item) => (
                      <div
                        key={item.value}
                        onClick={() => setActionFilter(item.value)}
                        className={`px-3 py-2.5 text-[13px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${actionFilter === item.value ? 'text-admin-primary font-bold bg-gray-50' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Dropdown Vai trò - thêm filter mà không cần thêm nút */}
              <div className="relative group w-fit xl:min-w-fit">
                <div className="flex h-9.5 items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm transition-all hover:border-gray-200 cursor-pointer">
                  <span className="text-[13px] font-medium text-gray-700 whitespace-nowrap">
                    {ROLE_FILTER_OPTIONS.find((item) => item.value === roleFilter)?.label}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible 
                group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="flex flex-col whitespace-nowrap">
                    {ROLE_FILTER_OPTIONS.map((item) => (
                      <div
                        key={item.value}
                        onClick={() => setRoleFilter(item.value)}
                        className={`px-3 py-2.5 text-[13px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${roleFilter === item.value ? 'text-admin-primary font-bold bg-gray-50' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Ô nhập tên bảng */}
              <div className="relative w-full sm:w-[160px] shrink-0 group">
                <input
                  type="text"
                  className="w-full h-9.5 px-3 rounded-md border border-gray-100 text-[13px] bg-white shadow-sm focus-visible:outline-none focus-visible:border-admin-primary transition-all"

                  value={tableName}
                  onChange={(event) => setTableName(event.target.value)}
                  list="audit-log-table-suggestions"
                  placeholder="Tên bảng: accounts"
                />
              </div>

            </div>




            <datalist id="audit-log-search-suggestions">
              {searchSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>

            <datalist id="audit-log-table-suggestions">
              {tableSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>
        </CardHeader>

        {/* ================= KHỐI BẢNG AUDIT LOGS DỮ LIỆU ================= */}
        <CardContent className="px-8 ">
          {loading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-admin-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[13px] font-medium text-gray-400">Đang đồng bộ dữ liệu nhật ký...</p>
            </div>
          ) : (
            < div className="w-full overflow-hidden  rounded-xl border border-gray-100 bg-white shadow-sm font-vietnam">

              <div className="w-full overflow-x-auto">

                <Table className="w-full min-w-250 border-collapse ">
                  <TableHeader className="bg-admin-primary border-b border-gray-100 ">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[12px] font-bold font-vietnam text-[#FFE500] py-3.5 pl-6">NGƯỜI THAO TÁC</TableHead>
                      <TableHead className="text-[12px] font-bold font-vietnam text-white py-3.5">HÀNH ĐỘNG</TableHead>
                      <TableHead className="text-[12px] font-bold font-vietnam text-white py-3.5">BẢNG DỮ LIỆU / ID</TableHead>
                      <TableHead className="text-[12px] font-bold font-vietnam text-white py-3.5 min-w-[320px]">PAYLOAD THAY ĐỔI (JSON)</TableHead>
                      <TableHead className="text-[12px] font-bold font-vietnam text-white py-3.5">ĐỊA CHỈ IP</TableHead>
                      <TableHead className="text-[12px] font-bold font-vietnam text-[#FFE500] py-3.5 pr-9.5 text-right">THỜI GIAN</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-50">
                    {logs.map((log) => {
                      const isSystem = !log.username;
                      const isPayloadExpanded = !!expandedPayloads[log.id];
                      const payload = parseAuditPayload(log.changedData);
                      const payloadHighlights = getPayloadHighlights(payload);
                      const actionConfig = ACTION_CONFIGS[log.action];
                      const roleLabel = log.role ? ROLE_LABELS[log.role] : null;

                      return (
                        <TableRow key={log.id} className="hover:bg-gray-50/30 transition-colors group">

                          {/* Cột 1: Người thao tác kèm Avatar đại diện thông minh */}
                          <TableCell className="py-3.5 pl-6 align-top">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 border shadow-inner relative overflow-hidden",
                                isSystem ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-linear-to-br from-gray-100 to-gray-200/60 border-gray-200/40 text-gray-600"
                              )}>
                                {isSystem ? <ShieldAlert className="w-4 h-4" /> : log.username?.charAt(0).toUpperCase() || "S"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[13px] font-semibold text-gray-700 group-hover:text-admin-primary transition-colors truncate">
                                  {log.username || "Hệ thống (System)"}
                                </p>
                                <p className="text-[12px] text-gray-400 truncate mt-0.5">
                                  {isSystem
                                    ? "system@internal.api"
                                    : [roleLabel, log.email].filter(Boolean).join(" · ")}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Cột 2: Badge Hành động */}
                          <TableCell className="py-3.5 align-top pt-4">
                            <div className="space-y-1.5">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider font-vietnam shadow-sm",
                                actionConfig?.className || "bg-gray-50 border-gray-200 text-gray-600"
                              )}>
                                {actionConfig?.label || humanizeText(log.action)}
                              </span>
                              <p className="max-w-55 text-[12px] leading-relaxed text-gray-500">
                                {getLogSummary(log, payload)}
                              </p>
                            </div>
                          </TableCell>

                          {/* Cột 3: Tên bảng & Record ID */}
                          <TableCell className="py-3.5 align-top pt-3.5">
                            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700">
                              <Database className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{getTableLabel(log.tableName)}</span>
                            </div>
                            <p className="mt-1 text-[11px] text-gray-400">{log.tableName}</p>
                            <div className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide bg-gray-50 border border-gray-100 w-fit px-1.5 py-0.5 rounded">
                              ID: #{log.recordId}
                            </div>
                          </TableCell>

                          {/* Cột 4: Payload thay đổi (BẤM VÀO ĐỂ THU PHÓNG THÔNG MINH) */}
                          <TableCell className="py-3.5 align-top max-w-xl">
                            <div
                              onClick={() => togglePayload(log.id)}
                              className={cn(
                                "relative rounded-lg border border-gray-100 bg-gray-50/50 p-2.5 hover:bg-white hover:border-gray-200 cursor-pointer transition-all overflow-hidden group/box font-mono text-[11px]",
                                isPayloadExpanded ? "max-h-none pb-7" : "max-h-16"
                              )}
                            >
                              {payloadHighlights.length > 0 && (
                                <div className="mb-2 flex flex-wrap gap-1.5 font-vietnam">
                                  {payloadHighlights.map((item) => (
                                    <span
                                      key={`${log.id}-${item.key}`}
                                      className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500"
                                    >
                                      {item.label}: {item.value}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <pre className={cn(
                                "text-gray-600 whitespace-pre-wrap break-all leading-relaxed",
                                !isPayloadExpanded && "line-clamp-2"
                              )}>
                                {log.changedData || "Không có dữ liệu payload"}
                              </pre>

                              {log.changedData && (
                                <div className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[10px] font-bold font-vietnam text-gray-400 group-hover/box:text-admin-primary transition-colors">
                                  {isPayloadExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* Cột 5: IP Address */}
                          <TableCell className="py-3.5 align-top text-[13px] text-gray-500 font-medium pt-4">
                            <span className="bg-neutral-50 px-2 py-0.5 border border-neutral-100 rounded text-gray-600 text-[12px]">
                              {log.ipAddress || "::1"}
                            </span>
                          </TableCell>

                          {/* Cột 6: Thời gian tạo */}
                          <TableCell className="py-3.5 pr-6 align-top text-[13px] text-gray-600 font-semibold pt-4 whitespace-nowrap">
                            {formatDateTime(log.createdAt)}
                          </TableCell>

                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
}