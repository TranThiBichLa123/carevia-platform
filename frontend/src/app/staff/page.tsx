"use client";

import Link from "next/link";
import { AlertTriangle, Boxes, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { backofficeApi, type StaffDashboard } from "@/lib/backofficeApi";
import { formatDate, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";

const staffSections = [
	{
        title: "Sản phẩm & tồn kho của brand",
        description: "Quản lý catalog, giá, tồn kho, bảo trì và tình trạng hiển thị của sản phẩm thuộc brand bạn phụ trách.",
		href: "/staff/inventory",
		tag: "Catalog"
	},
    {
        title: "Quản lý booking",
        description: "Xử lý booking trải nghiệm phát sinh trên sản phẩm và phiên thuộc brand đang vận hành.",
        href: "/staff/bookings",
        tag: "Operational"
    },
    {
        title: "Quản lý đơn hàng",
        description: "Theo dõi các đơn cần đóng gói, xử lý và hoàn tất trong phạm vi seller workspace.",
        href: "/staff/orders",
        tag: "Financial"
    },
    {
        title: "Phiên trải nghiệm",
        description: "Tạo lịch demo, kiểm soát slot và điều phối trải nghiệm cho khách hàng của brand.",
        href: "/staff/sessions",
        tag: "Configuration"
    },
    {
        title: "Voucher của brand",
        description: "Tạo mã khuyến mãi cho brand, gán voucher cho catalog phù hợp và theo dõi hạn dùng.",
        href: "/staff/vouchers",
        tag: "Marketing"
    },
    {
        title: "CRM & Đánh giá",
        description: "Theo dõi review thuộc catalog đang quản lý để chuẩn bị phản hồi và moderation theo brand.",
        href: "/staff/reviews",
        tag: "CRM"
    },
    {
        title: "Thống kê brand",
        description: "Tổng hợp KPI vận hành chính theo ngày để tách brand-level metrics khỏi dashboard platform.",
        href: "/staff/statistics",
        tag: "Analytics"
    },
];

const metricStyles = [
	"border-[#052962]",
	"border-[#0B6E4F]",
	"border-[#B45309]",
	"border-[#9F1239]",
	"border-[#1D4ED8]",
	"border-[#7C3AED]",
];

export default function StaffDashboardPage() {
    const { authUser } = useUserStore();
    const [dashboard, setDashboard] = useState<StaffDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const response = await backofficeApi.getStaffDashboard();
            setDashboard(response);
        } catch (error) {
            toast.error(getBackofficeErrorMessage(error, "Không thể tải dashboard vận hành."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    const metrics = dashboard
        ? [
              { label: "Booking hôm nay", value: dashboard.bookingsToday, hint: `${dashboard.pendingBookings} chờ xác nhận` },
              { label: "Khách đã check-in", value: dashboard.checkedInToday, hint: "Theo lịch hôm nay" },
              { label: "Đơn chờ xử lý", value: dashboard.pendingOrders, hint: "PENDING_PAYMENT, PAID, PROCESSING" },
                            { label: "Sản phẩm sắp hết", value: dashboard.lowStockDevices, hint: "Ngưỡng cảnh báo <= 5" },
                            { label: "Thiết bị bảo trì", value: dashboard.maintenanceDevices, hint: "Tạm khóa trong workspace" },
              { label: "Voucher sắp hết hạn", value: dashboard.vouchersExpiringSoon, hint: "Trong 7 ngày tới" },
          ]
        : [];

    return (
        <div className="space-y-8">
            <div className="border-b-4 border-[#111111] pb-2 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C70000] font-sans">
                    Carevia Marketplace / Brand Staff Workspace
                </div>
                <h1 className="mt-1 font-vietnam text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl md:text-5xl">
                    Dashboard brand
                </h1>
                {/* <p className="mt-3 text-sm md:text-base text-[#444444] font-vietnam max-w-3xl leading-relaxed">
                    Khu vực vận hành dành cho seller staff, tập trung vào catalog, booking, đơn hàng, voucher và trải nghiệm khách hàng của brand bạn đang phụ trách.
                </p> */}
            </div>

            {/* <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Workspace này đang chạy theo phạm vi brand hiện tại. Mọi sản phẩm, booking, đơn hàng, voucher và phiên trải nghiệm chỉ hiển thị trong <span className="font-semibold">brand_id = current_staff.brand_id</span>.
            </div> */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-[#DCDCDC] pb-6 mb-8 text-xs font-vietnam">
                <div className="border-l-2 border-[#052962] pl-2">
                    <span className="text-[#666666] block">Phiên làm việc</span>
                    <span className="font-bold text-[#111111]">Brand workspace</span>
                </div>
                <div className="border-l-2 border-[#052962] pl-2">
                    <span className="text-[#666666] block">Tài khoản brand staff</span>
                    <span className="font-bold text-[#111111]">{authUser?.email || "N/A"}</span>
                </div>
                <div className="border-l-2 border-[#052962] pl-2">
                    <span className="text-[#666666] block">Phạm vi truy cập</span>
                    <span className="font-bold text-[#111111]">Catalog và vận hành của brand</span>
                </div>
                <div className="border-l-2 border-[#052962] pl-2">
                    <span className="text-[#666666] block">Brand đang quản lý</span>
                    <span className="font-bold text-[#111111]">{authUser?.brand_name || "Chưa xác định"}</span>
                </div>
                <div className="border-l-2 border-[#052962] pl-2">
                    <span className="text-[#666666] block">Ngôn ngữ vận hành</span>
                    <span className="font-bold text-[#111111]">Tiếng Việt (VI)</span>
                </div>
                <div className="border-l-2 border-[#052962] pl-2 col-span-2 md:col-span-1">
                    <span className="text-[#666666] block">Trạng thái workspace</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 inline-block" /> Trực tuyến
                    </span>
                </div>
                <div className="border-l-2 border-[#052962] pl-2 col-span-2 md:col-span-1">
                    <span className="text-[#666666] block">Ngày vận hành</span>
                    <span className="font-bold text-[#111111]">{dashboard ? formatDate(dashboard.date) : "--/--/----"}</span>
                </div>
            </div>

            <div className="flex items-center justify-end">
                <Button variant="outline" onClick={() => void loadDashboard()} disabled={loading}>
                    <RefreshCw className={loading ? "animate-spin" : ""} />
                    Làm mới dashboard
                </Button>
            </div>

            {loading ? (
                <div className="flex min-h-40 items-center justify-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {metrics.map((metric, index) => (
                        <Card key={metric.label} className={`border-l-4 ${metricStyles[index % metricStyles.length]}`}>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">{metric.label}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-[#111111]">{metric.value}</div>
                                <p className="mt-2 text-sm text-muted-foreground">{metric.hint}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {staffSections.map((section) => {
                    return (
                        <div
                            key={section.href}
                            className="flex flex-col justify-between bg-white border-t-4 border-[#
                            ] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow"
                        >
                            <div>
                                {/* Meta Topic Tag */}
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C70000] font-vietnam">
                                    {section.tag}
                                </span>
                                {/* Card Title */}
                                <h2 className="mt-2 font-vietnam text-xl font-bold tracking-tight text-[#111111] hover:text-[#052962] transition-colors">
                                    <Link href={section.href}>{section.title}</Link>
                                </h2>
                                {/* Card Description */}
                                <p className="mt-2 text-sm leading-relaxed text-[#333333] font-vietnam">
                                    {section.description}
                                </p>
                            </div>

                            {/* Guardian Style CTA Link Button */}
                            <div className="mt-6 pt-4 border-t border-[#EDEDED] flex justify-end">
                                <Button asChild className="rounded-none bg-[#052962] hover:bg-[#031F4B] text-white text-xs font-bold px-4 py-2">
                                    <Link href={section.href} className="flex items-center gap-1.5">
                                        Xử lý phân hệ <ChevronRight className="size-3" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Boxes className="size-5 text-[#052962]" /> Tồn kho cần bổ sung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {dashboard?.lowStockAlerts.length ? dashboard.lowStockAlerts.map((item) => (
                            <div key={item.deviceId} className="rounded-xl border bg-muted/20 p-3">
                                <div className="font-semibold text-[#111111]">{item.deviceName}</div>
                                <div className="text-muted-foreground">Tồn kho còn {item.stock}</div>
                            </div>
                        )) : <div className="text-muted-foreground">Không có thiết bị nào đang ở ngưỡng cảnh báo.</div>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Boxes className="size-5 text-[#0B6E4F]" /> Catalog của brand</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="rounded-xl border bg-muted/20 p-3">
                            <div className="font-semibold text-[#111111]">Quản lý sản phẩm thuộc brand</div>
                            <div className="text-muted-foreground">Brand Staff thao tác catalog, tồn kho, bảo trì và voucher ngay trong một luồng làm việc thống nhất.</div>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="/staff/inventory">Mở catalog</Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><AlertTriangle className="size-5 text-[#B45309]" /> Thiết bị cần bảo trì</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {dashboard?.maintenanceAlerts.length ? dashboard.maintenanceAlerts.map((item) => (
                            <div key={item.deviceId} className="rounded-xl border bg-muted/20 p-3">
                                <div className="font-semibold text-[#111111]">{item.deviceName}</div>
                                <div className="text-muted-foreground">{item.maintenanceReason || "Đang bảo trì định kỳ"}</div>
                            </div>
                        )) : <div className="text-muted-foreground">Hiện không có thiết bị nào trong trạng thái bảo trì.</div>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Voucher Sắp Hết Hạn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {dashboard?.voucherAlerts.length ? dashboard.voucherAlerts.map((item) => (
                            <div key={item.voucherId} className="rounded-xl border bg-muted/20 p-3">
                                <div className="font-semibold text-[#111111]">{item.code}</div>
                                <div className="text-muted-foreground">Hết hạn: {formatDate(item.endDate)}</div>
                                <div className="text-muted-foreground">Còn lại: {item.remainingQuantity}</div>
                            </div>
                        )) : <div className="text-muted-foreground">Không có voucher nào sắp hết hạn trong 7 ngày tới.</div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
