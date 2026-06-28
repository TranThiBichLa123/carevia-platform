"use client";

import { AlertTriangle, Boxes, CalendarCheck2, ClipboardList, Loader2, RefreshCw, TicketPercent, TrendingUp, BarChart3, PieChart, DollarSign, TrendingDown, ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell, Pie, PieChart as RechartsPieChart, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backofficeApi, type StaffDashboard } from "@/lib/backofficeApi";
import { formatDate, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";
import PriceFormatter from "@/components/common/PriceFormatter";

const bookingStats = [
    { key: "pendingOrders", label: "Đơn chờ xử lý", icon: ClipboardList, color: "text-indigo-600", bg: "bg-indigo-50/50", border: "hover:border-indigo-200" },
    { key: "bookingsToday", label: "Booking hôm nay", icon: CalendarCheck2, color: "text-sky-600", bg: "bg-sky-50/50", border: "hover:border-sky-200" },
    { key: "pendingBookings", label: "Booking chờ duyệt", icon: CalendarCheck2, color: "text-amber-600", bg: "bg-amber-50/50", border: "hover:border-amber-200" },
    { key: "checkedInToday", label: "Khách đã check-in", icon: CalendarCheck2, color: "text-emerald-600", bg: "bg-emerald-50/50", border: "hover:border-emerald-200" },
] as const;

const alertStats = [
    { key: "lowStockDevices", label: "Sản phẩm sắp hết", icon: Boxes, color: "text-rose-600", bg: "bg-rose-50/50", border: "hover:border-rose-200" },
    { key: "maintenanceDevices", label: "Thiết bị bảo trì", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50/50", border: "hover:border-orange-200" },
    { key: "vouchersExpiringSoon", label: "Voucher sắp hết hạn", icon: TicketPercent, color: "text-violet-600", bg: "bg-violet-50/50", border: "hover:border-violet-200" },
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

    //  Chuẩn bị dữ liệu cho Biểu đồ Phễu Booking (Bar Chart)
    const bookingChartData = [
        {
            name: "Trạng thái Booking",
            "Tổng hôm nay": dashboard?.bookingsToday || 0,
            "Chờ xác nhận": dashboard?.pendingBookings || 0,
            "Đã check-in": dashboard?.checkedInToday || 0,
        }
    ];

    //  Chuẩn bị dữ liệu cho Biểu đồ Cảnh báo Vận hành (Donut Chart)
    const alertChartData = [
        { name: "Sản phẩm sắp hết", value: dashboard?.lowStockDevices || 0, color: "#f43f5e" },
        { name: "Thiết bị bảo trì", value: dashboard?.maintenanceDevices || 0, color: "#f97316" },
        { name: "Voucher sắp hết hạn", value: dashboard?.vouchersExpiringSoon || 0, color: "#8b5cf6" },
    ].filter(item => item.value > 0); // Chỉ hiển thị mục có số lượng > 0

    return (
        <div className="space-y-6 p-1 font-vietnam">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl flex flex-wrap items-baseline gap-x-2">
                        <span>Tổng quan thương hiệu</span>
                        {/* 🏪 Nếu có tên thương hiệu thì hiển thị động, dùng màu thương hiệu để tạo điểm nhấn */}
                        {authUser?.brand_name ? (
                            <span className="text-staff-primary font-extrabold">{authUser.brand_name}</span>
                        ) : (
                            <span className="text-gray-400 italic text-xl font-normal">(Chưa gán brand)</span>
                        )}
                    </h1>

                    <p className="text-sm text-muted-foreground mt-1.5">
                        Workspace kiểm soát KPI, dữ liệu đặt lịch và cảnh báo rủi ro hệ thống tại brand-level.
                    </p>
                </div>


                <div className="flex items-center gap-3">

                    <div className="hidden border-r border-gray-200 pr-4 text-right md:block">
                        <div className="text-xs text-muted-foreground">Ngày vận hành</div>
                        <div className="text-sm font-semibold text-gray-800">{dashboard ? formatDate(dashboard.date) : "--/--/----"}</div>
                    </div>

                    <Button
                        onClick={() => void loadDashboard()}
                        disabled={loading}
                        variant="none"
                        className="group relative h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-staff-primary active:scale-95 disabled:opacity-50"
                    >
                        <span className="absolute inset-y-0 left-0 w-0 bg-staff-primary transition-all duration-500 ease-out group-hover:w-full" />
                        <div className="relative z-10 flex items-center justify-center transition-colors duration-500 group-hover:text-white">
                            <RefreshCw className={`mr-2 h-4 w-4 text-gray-400 group-hover:text-white ${loading ? "animate-spin" : "group-hover:rotate-180"}`} />
                            <span>Làm mới số liệu</span>
                        </div>
                    </Button>
                </div>
            </div>


            {loading ? (
                <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
                    <Loader2 className="size-6 animate-spin text-staff-primary" />
                </div>
            ) : (
                <>
                    {/* Row 1: Hệ thống thẻ số liệu phân tầng */}
                    <div className="space-y-5">


                        {/* 🌟 THÊM MỚI: NHÓM SỐ LIỆU TÀI CHÍNH (DOANH THU & BIẾN ĐỘNG) */}
                        <div>
                            <div className="text-xs font-semibold text-emerald-600 mb-2.5 tracking-wide">Hiệu suất tài chính brand</div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Thẻ tổng doanh thu */}
                                <Card className="overflow-hidden border-gray-100/70 shadow-sm border-l-4 border-l-emerald-500 transition-all duration-300 hover:shadow-md">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-medium text-gray-500">Tổng doanh thu tích lũy</p>
                                            <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                                                <PriceFormatter amount={dashboard?.totalRevenue || 0} />
                                            </h3>
                                        </div>
                                        <div className="p-3 rounded-xl shrink-0 bg-emerald-50 text-emerald-600">
                                            <DollarSign className="size-5" />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Thẻ biến động tăng trưởng */}
                                <Card className="overflow-hidden border-gray-100/70 shadow-sm border-l-4 border-l-indigo-500 transition-all duration-300 hover:shadow-md">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-medium text-gray-500">Biến động doanh thu tháng này</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className={`text-2xl font-bold tracking-tight ${(dashboard?.revenueChangePercentage || 0) >= 0 ? 'text-green-600' : 'text-rose-600'}`}>
                                                    {(dashboard?.revenueChangePercentage || 0) >= 0 ? "+" : ""}
                                                    {dashboard?.revenueChangePercentage || 0}%
                                                </h3>
                                                <span className="text-xs text-muted-foreground">so với tháng trước</span>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-xl shrink-0 ${(dashboard?.revenueChangePercentage || 0) >= 0 ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {(dashboard?.revenueChangePercentage || 0) >= 0 ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>


                        {/* Nhóm 1: KPI Đặt lịch & Đơn hàng (Hàng 4 cột cân đối) */}
                        <div>
                            <div className="text-xs font-semibold text-gray-400 mb-2.5 tracking-wide">Hiệu suất vận hành ngày</div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {bookingStats.map((item) => {
                                    const Icon = item.icon;
                                    const value = dashboard ? dashboard[item.key] : 0;
                                    return (
                                        <Card key={item.key} className={`overflow-hidden border-gray-100/70 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${item.border}`}>
                                            <CardContent className="p-5 flex items-center justify-between">
                                                <div className="space-y-1.5 min-w-0">
                                                    {/* Đã bỏ uppercase để chữ mềm mại, sang hơn */}
                                                    <p className="text-[13px] font-medium text-gray-500 truncate">{item.label}</p>
                                                    <h3 className="text-2xl font-bold tracking-tight text-gray-900">{value}</h3>
                                                </div>
                                                <div className={`p-3 rounded-xl shrink-0 ${item.bg} ${item.color}`}>
                                                    <Icon className="size-5" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Nhóm 2: Chỉ số rủi ro & Hệ thống (Hàng 3 cột lấp đầy khoảng trống) */}
                        <div>
                            <div className="text-xs font-semibold text-rose-500/80 mb-2.5 tracking-wide">Giám sát rủi ro & Cảnh báo</div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {alertStats.map((item) => {
                                    const Icon = item.icon;
                                    const value = dashboard ? dashboard[item.key] : 0;

                                    // Tạo highlight đặc biệt nếu số lượng cảnh báo > 0 để gây chú ý cho Staff
                                    const isAlertActive = value > 0;

                                    return (
                                        <Card key={item.key} className={`overflow-hidden border-gray-100/70 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${isAlertActive ? 'ring-1 ring-rose-100/50 bg-rose-50/5' : ''} ${item.border}`}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="space-y-1.5 min-w-0">
                                                    <p className="text-[13px] font-medium text-gray-500 truncate">{item.label}</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <h3 className={`text-2xl font-bold tracking-tight ${isAlertActive ? 'text-rose-600' : 'text-gray-900'}`}>{value}</h3>
                                                        {isAlertActive && (
                                                            <span className="animate-pulse flex h-2 w-2 rounded-full bg-rose-500 mb-1" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`p-3 rounded-xl shrink-0 ${isAlertActive ? 'bg-rose-100/70 text-rose-600' : `${item.bg} ${item.color}`}`}>
                                                    <Icon className="size-5" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Row 2: Khu vực Biểu đồ Phân tích Đa dạng */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* 🌟 CẬP NHẬT: THAY BIỂU ĐỒ HOẶC BỔ SUNG ĐƯỜNG XU HƯỚNG BIẾN ĐỘNG DOANH THU */}
                        <Card className="lg:col-span-2 border-gray-100 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <ArrowUpRight className="size-4 text-emerald-600" /> Biến động doanh thu theo các tháng
                                    </CardTitle>
                                    <CardDescription>Báo cáo trực quan hóa đường xu hướng doanh thu phát sinh của Brand qua các mốc thời gian.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="h-72 w-full">
                                    {/* SỬA CHỖ NÀY: dashboard.monthlyRevenueList thay vì dashboard.monthlyRevenue */}
                                    {dashboard?.monthlyRevenue && dashboard.monthlyRevenue.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            {/* SỬA CHỖ NÀY: truyền data từ list mới */}
                                            <LineChart data={dashboard.monthlyRevenue}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                <YAxis
                                                    stroke="#94a3b8"
                                                    fontSize={12}
                                                    tickLine={false}
                                                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val}
                                                />
                                                <Tooltip formatter={(value: any) => [<PriceFormatter amount={value} />, ""]} />
                                                <Legend />
                                                {/* Các đường Line không cần sửa vì dataKey đã khớp với DTO */}
                                                <Line
                                                    type="monotone"
                                                    dataKey="equipmentRevenue"
                                                    name="Doanh thu thiết bị"
                                                    stroke="#059669"
                                                    strokeWidth={3}
                                                    activeDot={{ r: 6 }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="bookingRevenue"
                                                    name="Doanh thu booking"
                                                    stroke="#0284c7"
                                                    strokeWidth={3}
                                                    activeDot={{ r: 6 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        // Fallback giữ nguyên
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={bookingChartData} barGap={12}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" hide={true} />
                                                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                                                <Bar dataKey="Tổng hôm nay" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                                <Bar dataKey="Chờ xác nhận" fill="#d97706" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                                <Bar dataKey="Đã check-in" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Biểu đồ Cột tiến độ Booking */}
                        {/* <Card className="lg:col-span-2 border-gray-100 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <BarChart3 className="size-4 text-staff-primary" /> Tiến độ xử lý Booking hôm nay
                                    </CardTitle>
                                    <CardDescription>So sánh tương quan lượng khách đặt lịch, chờ duyệt và check-in thực tế.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <div className="h-70 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={bookingChartData} barGap={12}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" hide={true} />
                                            <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                                            <Bar dataKey="Tổng hôm nay" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                            <Bar dataKey="Chờ xác nhận" fill="#d97706" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                            <Bar dataKey="Đã check-in" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card> */}

                        {/* Biểu đồ tròn Cơ cấu cảnh báo rủi ro */}
                        {/* <Card className="border-gray-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <PieChart className="size-4 text-rose-500" /> Tỷ lệ Cảnh báo Hệ thống
                                </CardTitle>
                                <CardDescription>Phân phối các đầu việc cần xử lý gấp để tránh gián đoạn.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center">
                                {alertChartData.length > 0 ? (
                                    <>
                                        <div className="h-50 w-full relative flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsPieChart>
                                                    <Tooltip formatter={(value) => [`${value} mục`, "Số lượng"]} />
                                                    <Pie
                                                        data={alertChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={85}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {alertChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                </RechartsPieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold text-gray-800">
                                                    {alertChartData.reduce((acc, curr) => acc + curr.value, 0)}
                                                </span>
                                                <span className="text-xs text-muted-foreground">Tổng cảnh báo</span>
                                            </div>
                                        </div>
                                        <div className="w-full mt-4">
                                            {alertChartData.map((item, index) => (
                                                <div key={index} className="flex items-center gap-2 mb-2">
                                                    <span className="block w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                    <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertTriangle className="size-6 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Không có cảnh báo nào trong hệ thống.</span>
                                    </div>
                                )}

                            </CardContent>
                        </Card> */}
                    </div>

                    {/* Row 3: Danh sách các Alert Chi tiết */}
                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* Cột 1: Kho hàng (Sản phẩm sắp hết) */}
                        <Card className="flex flex-col border-rose-100/80 shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="border-b border-rose-50/50 bg-rose-50/20 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-md bg-rose-100 p-1.5 text-rose-600">
                                        <Boxes className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold text-gray-900">Cần bổ sung tồn kho</CardTitle>
                                        <CardDescription className="text-xs text-rose-600/80 font-medium mt-0.5">
                                            {dashboard?.lowStockAlerts?.length ?? 0} sản phẩm dưới ngưỡng an toàn                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-4">
                                <div className="space-y-2.5 max-h-90 overflow-y-auto pr-1 scrollbar-thin">
                                    {dashboard?.lowStockAlerts?.length ? (
                                        dashboard.lowStockAlerts.map((item) => (
                                            <div
                                                key={item.deviceId}
                                                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50/50"
                                            >
                                                <div className="space-y-1 min-w-0 flex-1 pr-2">
                                                    <div className="font-medium text-sm text-gray-800 truncate">{item.deviceName}</div>
                                                    <div className="text-xs text-gray-400">ID:{String(item.deviceId).substring(0, 8)}...</div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/10">
                                                        Còn {item.stock} máy
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-500 mb-2">
                                                <Boxes className="h-5 w-5" />
                                            </div>
                                            <p className="text-xs font-medium text-gray-500">Tồn kho vận hành an toàn</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cột 2: Trạng thái thiết bị bảo trì */}
                        <Card className="flex flex-col border-orange-100/80 shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="border-b border-orange-50/50 bg-orange-50/20 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-md bg-orange-100 p-1.5 text-orange-600">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold text-gray-900">Thiết bị bảo trì</CardTitle>
                                        <CardDescription className="text-xs text-orange-600/80 font-medium mt-0.5">
                                            Tạm khóa khỏi luồng đặt lịch vận hành
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-4">
                                <div className="space-y-2.5 max-h-90 overflow-y-auto pr-1 scrollbar-thin">
                                    {dashboard?.maintenanceAlerts?.length ? (
                                        dashboard.maintenanceAlerts.map((item) => (
                                            <div
                                                key={item.deviceId}
                                                className="rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50/50"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="font-medium text-sm text-gray-800 line-clamp-1 flex-1">{item.deviceName}</div>
                                                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-600/10 shrink-0">
                                                        Đang sửa
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 flex items-center justify-between text-xs">
                                                    <div className="text-gray-500 italic truncate max-w-[70%]">
                                                        🔧 {item.maintenanceReason || "Bảo trì định kỳ"}
                                                    </div>
                                                    <div className="text-gray-400 text-[11px]">ID: {String(item.deviceId).substring(0, 6)}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-500 mb-2">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            <p className="text-xs font-medium text-gray-500">Mọi thiết bị sẵn sàng vận hành</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cột 3: Quản lý ưu đãi (Voucher sắp hết hạn) */}
                        <Card className="flex flex-col border-violet-100/80 shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="border-b border-violet-50/50 bg-violet-50/20 pb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="rounded-md bg-violet-100 p-1.5 text-violet-600">
                                        <TicketPercent className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold text-gray-900">Voucher sắp hết hạn</CardTitle>
                                        <CardDescription className="text-xs text-violet-600/80 font-medium mt-0.5">
                                            Cần gia hạn hoặc dừng phát hành sớm
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-4">
                                <div className="space-y-2.5 max-h-90 overflow-y-auto pr-1 scrollbar-thin">
                                    {dashboard?.voucherAlerts?.length ? (
                                        dashboard.voucherAlerts.map((item) => (
                                            <div
                                                key={item.voucherId}
                                                className="rounded-lg border border-gray-100 bg-white p-3 transition-colors hover:bg-gray-50/50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono font-bold text-sm text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-100/60">
                                                        {item.code}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        Còn lại: <span className="text-gray-900 font-semibold">{item.remainingQuantity}</span>
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-xs border-t border-gray-50 pt-1.5 text-gray-400">
                                                    <div>Hạn dùng: <span className="text-gray-600 font-medium">{formatDate(item.endDate)}</span></div>
                                                    <div className="text-[10px]">ID: {String(item.voucherId).substring(0, 5)}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-500 mb-2">
                                                <TicketPercent className="h-5 w-5" />
                                            </div>
                                            <p className="text-xs font-medium text-gray-500">Không có voucher nào sắp hết hạn trong 7 ngày tới.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                </>
            )}
        </div>
    );
}
