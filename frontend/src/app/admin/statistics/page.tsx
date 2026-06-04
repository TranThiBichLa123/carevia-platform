"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3, CalendarCheck, CalendarDays, RefreshCcw, ShoppingBag, Users2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { backofficeApi, type AdminAccount, type BackofficeOrder, type StaffBooking } from "@/lib/backofficeApi";
import { deviceApi, type DeviceData } from "@/lib/deviceApi";
import { useUserStore } from "@/lib/store";
import { formatCurrency, formatDate, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { cn } from "@/components/pages/OrdersPage";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const RADIAN = Math.PI / 180;
const buildDailyCounts = (dates: string[]) => {
	const map = new Map<string, number>();
	dates.forEach((value) => {
		if (!value) return;
		const key = value.slice(0, 10);
		map.set(key, (map.get(key) || 0) + 1);
	});
	return Array.from(map.entries())
		.sort((left, right) => left[0].localeCompare(right[0]))
		.slice(-7);
};

// 1. Hàm helper để chuyển đổi tên trạng thái Booking sang tiếng Việt và màu sắc (Tùy biến theo hệ thống của bạn)
const getBookingStatusStyle = (status: string) => {
	const configs: Record<string, { label: string; color: string; bg: string }> = {
		PENDING: { label: "Chờ duyệt", color: "text-amber-600", bg: "bg-amber-50" },
		CONFIRMED: { label: "Đã xác nhận", color: "text-blue-600", bg: "bg-blue-50" },
		COMPLETED: { label: "Hoàn thành", color: "text-emerald-600", bg: "bg-emerald-50" },
		CANCELLED: { label: "Đã hủy", color: "text-rose-600", bg: "bg-rose-50" },
	};
	return configs[status] || { label: status, color: "text-gray-600", bg: "bg-gray-50" };
};

// 2. Hàm helper để chuyển đổi tên trạng thái Order sang tiếng Việt và màu sắc
const getOrderStatusStyle = (status: string) => {
	const configs: Record<string, { label: string; color: string; bg: string }> = {
		PENDING: { label: "Chờ thanh toán", color: "text-amber-600", bg: "bg-amber-50" },
		PROCESSING: { label: "Đang vận chuyển", color: "text-indigo-600", bg: "bg-indigo-50" },
		SHIPPED: { label: "Đang giao", color: "text-sky-600", bg: "bg-sky-50" },
		DELIVERED: { label: "Đã giao", color: "text-emerald-600", bg: "bg-emerald-50" },
		CANCELLED: { label: "Đã hủy", color: "text-rose-600", bg: "bg-rose-50" },
	};
	return configs[status] || { label: status, color: "text-gray-600", bg: "bg-gray-50" };
};


export default function AdminStatisticsPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [accounts, setAccounts] = useState<AdminAccount[]>([]);
	const [bookings, setBookings] = useState<StaffBooking[]>([]);
	const [orders, setOrders] = useState<BackofficeOrder[]>([]);
	const [popularDevices, setPopularDevices] = useState<DeviceData[]>([]);
	const [loading, setLoading] = useState(true);

	const loadDashboard = useCallback(async () => {
		try {
			setLoading(true);
			const [accountsRes, bookingsRes, ordersRes, devicesRes] = await Promise.all([
				backofficeApi.getAdminAccounts({ page: 0, size: 200 }),
				backofficeApi.getStaffBookings({ page: 0, size: 200 }),
				backofficeApi.getAllOrders({ page: 0, size: 200 }),
				deviceApi.getPopular(8),
			]);

			setAccounts(accountsRes.items || []);
			setBookings(bookingsRes.items || []);
			setOrders(ordersRes.items || []);
			setPopularDevices(devicesRes || []);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải số liệu quản trị."));
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

	const activeUsers = accounts.filter((account) => account.status === "ACTIVE").length;
	const totalRevenue = orders
		.filter((order) => order.status === "COMPLETED" || order.status === "PAID" || order.status === "PROCESSING")
		.reduce((sum, order) => sum + order.totalAmount, 0);
	const completedBookings = bookings.filter((booking) => booking.status === "COMPLETED").length;
	const pendingApprovals = accounts.filter(
		(account) => account.role === "STAFF" && account.status === "PENDING_APPROVAL"
	).length;
	const bookingTrend = buildDailyCounts(bookings.map((booking) => booking.appointmentDate));
	const orderTrend = buildDailyCounts(orders.map((order) => order.createdAt));
	const maxBookingCount = Math.max(...bookingTrend.map(([, count]) => count), 1);
	const maxOrderCount = Math.max(...orderTrend.map(([, count]) => count), 1);

	// 1. CHUYỂN ĐỔI DỮ LIỆU BOOKINGS THÀNH ĐẠNG BIỂU ĐỒ
	const bookingData = Object.entries(
		bookings.reduce<Record<string, number>>((acc, booking) => {
			acc[booking.status] = (acc[booking.status] || 0) + 1;
			return acc;
		}, {})
	).map(([status, count]) => {
		const config = getBookingStatusStyle(status);

		// Đã sửa logic so sánh để ăn khớp chuẩn xác với chữ "PENDING_CONFIRM" và "CONFIRMED"
		let statusColor = '#64748b'; // Màu xám mặc định
		if (status === 'COMPLETED') statusColor = '#10b981';         // Xanh lá (Hoàn thành)
		else if (status === 'CONFIRMED') statusColor = '#3b82f6';     // Xanh dương (Đã xác nhận)
		else if (status === 'PENDING_CONFIRM') statusColor = '#f59e0b'; // Vàng cam (Chờ xác nhận)
		else if (status === 'CANCELLED' || status === 'CANCELED') statusColor = '#ef4444'; // Đỏ (Đã hủy)

		return {
			name: config.label,
			value: count,
			color: statusColor
		};
	});

	// 2. CHUYỂN ĐỔI DỮ LIỆU ORDERS THÀNH ĐẠNG BIỂU ĐỒ
	const orderData = Object.entries(
		orders.reduce<Record<string, number>>((acc, order) => {
			acc[order.status] = (acc[order.status] || 0) + 1;
			return acc;
		}, {})
	).map(([status, count]) => {
		const config = getOrderStatusStyle(status);

		// Đã cấu hình lại chuẩn đét theo các từ khóa trạng thái thực tế trong ảnh của bạn
		let statusColor = '#64748b'; // Màu mặc định phòng trường hợp sót

		if (status === 'COMPLETED') {
			statusColor = '#10b981'; // Xanh lá (Hoàn thành)
		} else if (status === 'PAID') {
			statusColor = '#06b6d4'; // Xanh ngọc - Cyan (Đã thanh toán)
		} else if (status === 'SHIPPING' || status === 'Đang vận chuyển') {
			statusColor = '#3b82f6'; // Xanh dương (Đang vận chuyển)
		} else if (status === 'PENDING_PAYMENT') {
			statusColor = '#f59e0b'; // Vàng cam (Chờ thanh toán)
		} else if (status === 'CANCELLED' || status === 'CANCELED' || status === 'Đã hủy') {
			statusColor = '#ef4444'; // Đỏ (Đã hủy)
		}

		return {
			name: config.label,
			value: count,
			color: statusColor
		};
	});



	const totalBookings = bookingData.reduce((sum, item) => sum + item.value, 0);
	const totalOrders = orderData.reduce((sum, item) => sum + item.value, 0);

	// Chuyển đổi dữ liệu xu hướng thành mảng Object cho Recharts
	const formattedBookingTrend = bookingTrend.map(([date, count]) => ({
		date: formatDate(date),
		"Lịch hẹn": count
	}));

	const formattedOrderTrend = orderTrend.map(([date, count]) => ({
		date: formatDate(date),
		"Đơn hàng": count
	}));



	if (!isAuthenticated) {
		return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản admin để xem thống kê.</div>;
	}

	if (authUser?.role !== "ADMIN") {
		return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ admin mới truy cập được trang thống kê.</div>;
	}

	return (
		<div className="space-y-6 px-4 py-6 md:px-8">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Thống kê hệ thống</h1>
					<p className="text-sm text-muted-foreground">Tổng hợp nhanh tài khoản, booking, doanh thu và thiết bị đang được quan tâm.</p>
				</div>
				<Button
					onClick={() => void loadDashboard()}
					disabled={loading}
					variant="outline"
					className={cn(
						"group relative overflow-hidden self-start sm:self-auto",
						"font-vietnam text-[13px] font-medium tracking-tight",
						"border-gray-200 bg-white text-gray-700",
						"hover:border-admin-primary transition-all duration-500",
						"active:scale-95",
						"rounded-md px-4 h-[38px] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
					)}
				>
					{/* Lớp nền trượt màu xanh dương: Trượt ra khi hover và giữ nguyên vị trí khi chuột ở đó */}
					<span className="absolute inset-y-0 left-0 w-0 bg-admin-primary transition-all duration-500 ease-out group-hover:w-full" />

					{/* Nội dung chữ và Icon: Chuyển hẳn sang màu trắng mượt mà khi hover */}
					<div className="relative z-10 flex items-center text-gray-700 group-hover:text-white transition-colors duration-500">
						<RefreshCcw
							className={cn(
								"w-3.5 h-3.5 mr-2 transition-transform duration-700 ease-in-out text-gray-400 group-hover:text-white",
								loading ? "animate-spin" : "group-hover:rotate-180"
							)}
						/>
						<span className="relative">Làm mới</span>
					</div>
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card><CardHeader><CardDescription>Tài khoản hoạt động</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><Users2 className="size-6 text-sky-500" />{activeUsers}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Staff chờ duyệt</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><Users2 className="size-6 text-amber-500" />{pendingApprovals}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Booking hoàn tất</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><CalendarDays className="size-6 text-emerald-500" />{completedBookings}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Doanh thu ghi nhận</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><BarChart3 className="size-6 text-indigo-500" />{formatCurrency(totalRevenue)}</CardTitle></CardHeader></Card>
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
				<Card className="overflow-hidden border-none shadow-sm bg-white rounded-xl">
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="font-vietnam text-base font-bold text-gray-800 tracking-tight">
									Thiết bị nổi bật
								</CardTitle>
								<CardDescription className="font-vietnam text-[13px] text-gray-400 mt-1">
									Top thiết bị dựa trên lượt xem và hiệu suất bán hàng tổng hợp.
								</CardDescription>
							</div>
							{/* Huy hiệu trang trí nhỏ góc phải */}
							<span className="text-[11px] font-bold font-vietnam uppercase tracking-wider text-primary bg-primary/5 px-2.5 py-1 rounded-full">
								Realtime
							</span>
						</div>
					</CardHeader>

					<CardContent className="">
						<div className="divide-y divide-gray-50 flex flex-col">
							{popularDevices.map((device, index) => {
								const isTop3 = index < 3;

								// ĐỊNH NGHĨA STYLE HIỆN ĐẠI CHO TOP 3 (KHÔNG DÙNG EMOJI THÔ)
								const rankStyles = [
									{
										// TOP 1: Vàng hoàng gia phát sáng
										bg: "bg-gradient-to-br from-amber-400 to-amber-600 text-white border-transparent shadow-amber-200 animate-pulse [animation-duration:3s]",
										dotBg: "bg-amber-200"
									},
									{
										// TOP 2: Bạc titan sang trọng
										bg: "bg-gradient-to-br from-slate-300 to-slate-500 text-white border-transparent shadow-slate-200",
										dotBg: "bg-slate-200"
									},
									{
										// TOP 3: Đồng cổ điển tinh tế
										bg: "bg-gradient-to-br from-orange-600 to-orange-800 text-white border-transparent shadow-orange-100",
										dotBg: "bg-orange-200"
									},
								][index] || {
									// CÁC THỨ HẠNG CÒN LẠI: Tối giản, thanh thoát
									bg: "bg-slate-50 text-slate-400 border-slate-200 shadow-none",
									dotBg: "hidden"
								};

								return (
									<Link
										key={device.id}
										href={`/admin/statistics/${device.id}`}
										className="group relative flex items-center justify-between gap-4 p-4 transition-all duration-300 hover:bg-slate-50/60"
									>
										{/* Vùng bên trái: Số thứ hạng + Ảnh + Thông tin */}
										<div className="flex items-center gap-4 min-w-0">

											{/* 1. Huy hiệu xếp hạng thiết kế mới có hiệu ứng động */}
											<div className="relative shrink-0">
												<div className={cn(
													"flex items-center justify-center w-6 h-6 rounded-full font-vietnam text-[12px] font-black  transition-transform duration-300 group-hover:scale-110",
													rankStyles.bg
												)}>
													{index + 1}
												</div>

												{/* Chấm tròn hiệu ứng nhấp nháy (Ping) chỉ xuất hiện riêng cho TOP 1 */}
												{index === 0 && (
													<span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
														<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
														<span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
													</span>
												)}
											</div>

											{/* 2. Hình ảnh sản phẩm (Avatar Box) */}
											<div className={cn(
												"relative w-14 h-14 rounded-xl bg-white border overflow-hidden shrink-0 shadow-xs transition-all duration-300 group-hover:shadow-sm",
												index === 0 ? "border-amber-200 ring-2 ring-amber-500/5" : "border-slate-100"
											)}>
												<img
													src={device.image || "/placeholder-device.jpg"}
													alt={device.name}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
													onError={(e) => {
														e.currentTarget.src = "https://placehold.co";
													}}
												/>
											</div>

											{/* 3. Tên và chỉ số đo lường (Metrics) */}
											<div className="min-w-0">
												<p className="font-vietnam text-[14px] font-semibold text-slate-700 truncate group-hover:text-admin-primary transition-colors">
													{device.name}
												</p>
												<div className="flex items-center gap-3 mt-1 text-slate-400 text-[12px] font-vietnam font-medium">
													<span className="flex items-center gap-1">
														Đã bán <strong className="text-slate-600 font-bold">{device.sold}</strong>
													</span>
													<span className="w-1 h-1 rounded-full bg-slate-200" />
													<span className="flex items-center gap-1">
														Lượt xem <strong className="text-slate-600 font-bold">{device.viewCount}</strong>
													</span>
												</div>
											</div>
										</div>

										{/* Vùng bên phải: Giá bán + Trạng thái kho */}
										<div className="text-right shrink-0 flex flex-col items-end gap-1.5">
											<p className="font-vietnam text-[14px] font-bold text-slate-800 tracking-tight">
												{formatCurrency(device.price)}
											</p>

											<span className={cn(
												"font-vietnam text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
												device.status === "ACTIVE" || device.status === "AVAILABLE"
													? "bg-emerald-50 border-emerald-100 text-emerald-600"
													: "bg-neutral-50 border-neutral-200 text-neutral-500"
											)}>
												{device.status}
											</span>
										</div>
									</Link>
								);
							})}
						</div>

					</CardContent>
				</Card>

				<Card className="border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden font-vietnam">
					<CardHeader className="pb-4 border-b border-gray-50">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-base font-bold text-slate-800 tracking-tight">
									Tổng quan vận hành dữ liệu
								</CardTitle>
								<CardDescription className="text-[13px] text-slate-400 mt-0.5">
									Phân tích tỷ lệ trạng thái thời gian thực của hệ thống.
								</CardDescription>
							</div>
						</div>
					</CardHeader>

					<CardContent className="p-6 space-y-8">

						{/* --- KHỐI 1: BIỂU ĐỒ LỊCH HẸN --- */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-slate-800 font-bold text-[14px]">
									<div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
										<CalendarCheck className="w-4 h-4" />
									</div>
									<span>Trạng thái Lịch hẹn ({totalBookings})</span>
								</div>
								<span className="text-[12px] font-medium text-slate-400 flex items-center gap-0.5 hover:text-blue-600 cursor-pointer transition-colors">
									Chi tiết <ArrowUpRight className="w-3 h-3" />
								</span>
							</div>

							{totalBookings === 0 ? (
								<p className="text-[13px] text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl">Chưa có dữ liệu lịch hẹn...</p>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
									{/* Vùng chứa Biểu đồ Donut (Chiếm 2/5 cột) */}
									<div className="sm:col-span-2 h-32 relative flex items-center justify-center">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={bookingData}
													cx="50%"
													cy="50%"
													innerRadius={32} // Tạo khoảng rỗng ở giữa để biến thành hình Donut bánh xe
													outerRadius={48}
													paddingAngle={4}  // Khoảng hở nhỏ giữa các phân khúc trông rất tinh tế
													dataKey="value"
													isAnimationActive={true} // KÍCH HOẠT ANIMATION XOAY VẼ KHI LOAD
													animationDuration={800}
												>
													{bookingData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} className="focus:outline-none" />
													))}
												</Pie>
												<Tooltip
													contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
												/>
											</PieChart>
										</ResponsiveContainer>
										{/* Số tổng số hiển thị ở tâm vòng tròn */}
										<div className="absolute flex flex-col items-center justify-center pointer-events-none">
											<span className="text-lg font-bold text-slate-800">{totalBookings}</span>
											<span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Tổng</span>
										</div>
									</div>

									{/* Vùng chứa Chú thích số liệu dạng danh sách (Chiếm 3/5 cột) */}
									<div className="sm:col-span-3 space-y-2">
										{bookingData.map((item, index) => (
											<div key={index} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 shadow-2xs hover:scale-[1.02] transition-transform duration-200">
												<div className="flex items-center gap-2 min-w-0">
													{/* Chấm tròn chỉ định màu sắc */}
													<span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
													<span className="text-[12px] text-slate-600 font-medium truncate">{item.name}</span>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-[13px] font-bold text-slate-800">{item.value}</span>
													<span className="text-[10px] font-medium text-slate-400">
														({totalBookings > 0 ? ((item.value / totalBookings) * 100).toFixed(0) : 0}%)
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						{/* ĐƯỜNG KẺ CHIA PHÂN KHU */}
						<div className="h-px bg-slate-100" />

						{/* --- KHỐI 2: BIỂU ĐỒ ĐƠN HÀNG --- */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-slate-800 font-bold text-[14px]">
									<div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
										<ShoppingBag className="w-4 h-4" />
									</div>
									<span>Trạng thái Đơn hàng ({totalOrders})</span>
								</div>
								<span className="text-[12px] font-medium text-slate-400 flex items-center gap-0.5 hover:text-emerald-600 cursor-pointer transition-colors">
									Chi tiết <ArrowUpRight className="w-3 h-3" />
								</span>
							</div>

							{totalOrders === 0 ? (
								<p className="text-[13px] text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl">Chưa có dữ liệu đơn hàng...</p>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60">
									{/* Vùng chứa Biểu đồ Donut */}
									<div className="sm:col-span-2 h-32 relative flex items-center justify-center">
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Pie
													data={orderData}
													cx="50%"
													cy="50%"
													innerRadius={32}
													outerRadius={48}
													paddingAngle={4}
													dataKey="value"
													isAnimationActive={true}
													animationDuration={800}
												>
													{orderData.map((entry, index) => (
														<Cell key={`cell-${index}`} fill={entry.color} className="focus:outline-none" />
													))}
												</Pie>
												<Tooltip
													contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
												/>
											</PieChart>
										</ResponsiveContainer>
										<div className="absolute flex flex-col items-center justify-center pointer-events-none">
											<span className="text-lg font-bold text-slate-800">{totalOrders}</span>
											<span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Tổng</span>
										</div>
									</div>

									{/* Vùng chứa Chú thích số liệu */}
									<div className="sm:col-span-3 space-y-2">
										{orderData.map((item, index) => (
											<div key={index} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 shadow-2xs hover:scale-[1.02] transition-transform duration-200">
												<div className="flex items-center gap-2 min-w-0">
													<span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
													<span className="text-[12px] text-slate-600 font-medium truncate">{item.name}</span>
												</div>
												<div className="flex items-center gap-2">
													<span className="text-[13px] font-bold text-slate-800">{item.value}</span>

													<span className="text-[10px] font-medium text-slate-400">
														({totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(0) : 0}%)

													</span>
												</div>
											</div>
										))}

									</div>


								</div>
							)}
						</div>

					</CardContent>
				</Card>
			</div>


			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 font-vietnam">
				{/* BIỂU ĐỒ 1: XU HƯỚNG BOOKING (LINE CHART) */}
				<Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-bold text-slate-800">Xu hướng Lịch hẹn</CardTitle>
						<CardDescription className="text-[13px] text-slate-400">7 ngày gần nhất theo ngày hẹn.</CardDescription>
					</CardHeader>
					<CardContent className="h-64 pt-4">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={formattedBookingTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
								{/* Lưới ngang mờ tạo chiều sâu */}
								<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
								<XAxis
									dataKey="date"
									stroke="#94a3b8"
									fontSize={11}
									tickLine={false}
									axisLine={false}
								/>
								<YAxis
									stroke="#94a3b8"
									fontSize={11}
									tickLine={false}
									axisLine={false}
									allowDecimals={false} // Không hiển thị số thập phân khi đếm lượt booking
								/>
								<Tooltip
									contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
								/>
								{/* Đường Line mượt mà (type="monotone") có animation vẽ chạy tự động */}
								<Line
									type="monotone"
									dataKey="Lịch hẹn"
									stroke="#0ea5e9" // Màu sky-500 gốc của bạn
									strokeWidth={3}
									dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
									activeDot={{ r: 6, strokeWidth: 0 }}
									isAnimationActive={true}
									animationDuration={1000}
								/>
							</LineChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* BIỂU ĐỒ 2: XU HƯỚNG ĐƠN HÀNG (BAR CHART) */}
				<Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-bold text-slate-800">Xu hướng Đơn hàng</CardTitle>
						<CardDescription className="text-[13px] text-slate-400">7 ngày gần nhất theo thời điểm tạo đơn.</CardDescription>
					</CardHeader>

					<CardContent className="h-64 pt-4">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={formattedOrderTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
								<XAxis
									dataKey="date"
									stroke="#94a3b8"
									fontSize={11}
									tickLine={false}
									axisLine={false}
									tickFormatter={(value) => typeof value === 'string' ? value.substring(0, 5) : value}
								/>
								<YAxis
									stroke="#94a3b8"
									fontSize={11}
									tickLine={false}
									axisLine={false}
									allowDecimals={false}
								/>


								<Tooltip
									cursor={{ fill: '#f8fafc', opacity: 0.6 }}
									wrapperStyle={{
										backgroundColor: '#fff',
										borderRadius: '12px',
										border: '1px solid #e2e8f0',
										fontSize: '12px',
										boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
									} as any}
								/>

								<Bar
									dataKey="Đơn hàng"
									fill="#0ea5e9" // Màu sky-500 gốc của bạn
									radius={[6, 6, 0, 0]}
									maxBarSize={32}
									isAnimationActive={true}
									animationDuration={1000}
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>

				</Card>
			</div>
		</div>
	);
}



