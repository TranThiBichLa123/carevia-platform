"use client";

import { AlertTriangle, Boxes, CalendarCheck2, ClipboardList, Loader2, RefreshCw, TicketPercent } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backofficeApi, type StaffDashboard } from "@/lib/backofficeApi";
import { formatDate, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";

const statCards = [
  { key: "bookingsToday", label: "Booking hôm nay", icon: CalendarCheck2, color: "text-sky-600" },
  { key: "pendingBookings", label: "Booking chờ xác nhận", icon: CalendarCheck2, color: "text-amber-600" },
  { key: "checkedInToday", label: "Khách đã check-in", icon: CalendarCheck2, color: "text-emerald-600" },
  { key: "pendingOrders", label: "Đơn chờ xử lý", icon: ClipboardList, color: "text-indigo-600" },
  { key: "lowStockDevices", label: "Sản phẩm sắp hết", icon: Boxes, color: "text-rose-600" },
  { key: "maintenanceDevices", label: "Thiết bị bảo trì", icon: AlertTriangle, color: "text-orange-600" },
  { key: "vouchersExpiringSoon", label: "Voucher sắp hết hạn", icon: TicketPercent, color: "text-violet-600" },
] as const;

export default function StaffStatisticsPage() {
  const { authUser, isAuthenticated } = useUserStore();
  const [dashboard, setDashboard] = useState<StaffDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backofficeApi.getStaffDashboard();
      setDashboard(response);
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải thống kê brand."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadDashboard();
  }, [isAuthenticated, loadDashboard]);

  if (!isAuthenticated) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản Brand Staff để xem thống kê.</div>;
  }

  if (authUser?.role !== "STAFF") {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ Brand Staff mới truy cập được trang này.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thống kê brand</h1>
          <p className="text-sm text-muted-foreground">Tổng hợp KPI vận hành trong workspace seller để tách brand-level metrics khỏi dashboard platform.</p>
        </div>
        <Button variant="outline" onClick={() => void loadDashboard()} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Làm mới số liệu
        </Button>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Phần hiển thị đã tách theo tư duy brand workspace. Khi backend áp dụng ràng buộc dữ liệu theo <span className="font-semibold">brand_id</span>, toàn bộ KPI ở đây sẽ trở thành số liệu brand-level hoàn chỉnh.
      </div>

      <Card>
        <CardHeader>
          <CardDescription>Ngày vận hành</CardDescription>
          <CardTitle>{dashboard ? formatDate(dashboard.date) : "--/--/----"}</CardTitle>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon;
              const value = dashboard ? dashboard[item.key] : 0;

              return (
                <Card key={item.key}>
                  <CardHeader>
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="flex items-center gap-3 text-3xl">
                      <Icon className={`size-6 ${item.color}`} />
                      {value}
                    </CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Cần bổ sung tồn kho</CardTitle>
                <CardDescription>Các sản phẩm đang ở ngưỡng cảnh báo.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {dashboard?.lowStockAlerts.length ? dashboard.lowStockAlerts.map((item) => (
                  <div key={item.deviceId} className="rounded-xl border p-3">
                    <div className="font-semibold text-slate-900">{item.deviceName}</div>
                    <div className="text-muted-foreground">Tồn kho: {item.stock}</div>
                  </div>
                )) : <div className="text-muted-foreground">Không có sản phẩm nào đang ở ngưỡng cảnh báo.</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thiết bị bảo trì</CardTitle>
                <CardDescription>Những mục đang tạm khóa trong vận hành.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {dashboard?.maintenanceAlerts.length ? dashboard.maintenanceAlerts.map((item) => (
                  <div key={item.deviceId} className="rounded-xl border p-3">
                    <div className="font-semibold text-slate-900">{item.deviceName}</div>
                    <div className="text-muted-foreground">{item.maintenanceReason || "Đang bảo trì định kỳ"}</div>
                  </div>
                )) : <div className="text-muted-foreground">Không có thiết bị nào đang bảo trì.</div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voucher sắp hết hạn</CardTitle>
                <CardDescription>Các voucher cần gia hạn hoặc dừng phát hành.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {dashboard?.voucherAlerts.length ? dashboard.voucherAlerts.map((item) => (
                  <div key={item.voucherId} className="rounded-xl border p-3">
                    <div className="font-semibold text-slate-900">{item.code}</div>
                    <div className="text-muted-foreground">Hết hạn: {formatDate(item.endDate)}</div>
                    <div className="text-muted-foreground">Còn lại: {item.remainingQuantity}</div>
                  </div>
                )) : <div className="text-muted-foreground">Không có voucher nào sắp hết hạn.</div>}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}