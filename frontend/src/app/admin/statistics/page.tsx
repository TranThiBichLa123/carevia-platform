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
					<h1 className="text-3xl font-bold tracking-tight">Thống kê quản trị</h1>
					<p className="text-sm text-muted-foreground">Tổng hợp nhanh tài khoản, booking, doanh thu và thiết bị đang được quan tâm.</p>
				</div>
				<Button
					onClick={() => void loadDashboard()}
					disabled={loading}
					className={cn(
						"group relative overflow-hidden self-start sm:self-auto",
						"font-vietnam text-[13px] font-medium tracking-tight",
						"border-gray-200 bg-white text-gray-700",
						"hover:border-primary transition-all duration-500",
						"active:scale-95",
						"rounded-md px-4 h-[38px] shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
					)}
				>
					{/* Lớp nền trượt màu xanh dương: Trượt ra khi hover và giữ nguyên vị trí khi chuột ở đó */}
					<span className="absolute inset-y-0 left-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />

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

					<CardContent className="p-0">
						<div className="divide-y divide-gray-50 flex flex-col">
							{popularDevices.map((device, index) => {
								// Cấu hình màu sắc cao cấp cho Top 3 vị trí đầu tiên
								const isTop3 = index < 3;
								const rankStyles = [
									{ bg: "bg-amber-500/10 text-amber-600", border: "border-amber-500/20", text: "🥇" },
									{ bg: "bg-slate-400/10 text-slate-600", border: "border-slate-400/20", text: "🥈" },
									{ bg: "bg-amber-700/10 text-amber-800", border: "border-amber-700/20", text: "🥉" },
								][index] || { bg: "bg-gray-50 text-gray-400", border: "border-gray-100", text: String(index + 1) };

								return (
									<Link
										key={device.id}
										href={`/admin/statistics/${device.id}`}
										className="group relative flex items-center justify-between gap-4 p-4 transition-all duration-300 hover:bg-gray-50/70"
									>
										{/* Vùng bên trái: Số thứ hạng + Ảnh + Thông tin */}
										<div className="flex items-center gap-4 min-w-0">

											{/* 1. Huy hiệu xếp hạng (Rank Badge) */}
											<div className={cn(
												"flex items-center justify-center w-7 h-7 rounded-lg font-vietnam text-[13px] font-bold border shrink-0 shadow-sm",
												rankStyles.bg, rankStyles.border
											)}>
												{isTop3 ? rankStyles.text : rankStyles.text}
											</div>

											{/* 2. Hình ảnh sản phẩm (Avatar Box) */}
											<div className="relative w-14 h-14 rounded-xl bg-gray-50 border border-gray-100/70 overflow-hidden shrink-0 shadow-inner">
												<img
													src={device.image || "/placeholder-device.jpg"} // Hãy thay bằng property ảnh chuẩn từ DB của bạn (vd: device.imageUrl, device.thumbnail)
													alt={device.name}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
													onError={(e) => {
														// Xử lý fallback ảnh lỗi ẩn danh
														(e.currentTarget as HTMLImageElement).src = "https://unsplash.com";
													}}
												/>
											</div>

											{/* 3. Tên và chỉ số đo lường (Metrics) */}
											<div className="min-w-0">
												<p className="font-vietnam text-[14px] font-semibold text-gray-700 truncate group-hover:text-primary transition-colors">
													{device.name}
												</p>
												<div className="flex items-center gap-3 mt-1 text-gray-400 text-[12px] font-vietnam font-medium">
													<span className="flex items-center gap-1">
														Đã bán <strong className="text-gray-600 font-bold">{device.sold}</strong>
													</span>
													<span className="w-1 h-1 rounded-full bg-gray-200" />
													<span className="flex items-center gap-1">
														Lượt xem <strong className="text-gray-600 font-bold">{device.viewCount}</strong>
													</span>
												</div>
											</div>
										</div>

										{/* Vùng bên phải: Giá bán + Trạng thái kho */}
										<div className="text-right shrink-0 flex flex-col items-end gap-1.5">
											<p className="font-vietnam text-[14px] font-bold text-gray-800 tracking-tight">
												{formatCurrency(device.price)}
											</p>

											{/* Custom lại Badge trạng thái nhỏ gọn và sạch sẽ hơn */}
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




				<Card className="border-none shadow-sm bg-white rounded-xl overflow-hidden">
					<CardHeader className="pb-5">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="font-vietnam text-base font-bold text-gray-800 tracking-tight">
									Tổng quan vận hành
								</CardTitle>
								<CardDescription className="font-vietnam text-[13px] text-gray-400 mt-1">
									Tình trạng xử lý thời gian thực của lịch hẹn và đơn hàng.
								</CardDescription>
							</div>
						</div>
					</CardHeader>

					<Card className="border border-gray-100 shadow-sm bg-white rounded-xl overflow-hidden">
						<CardHeader className="pb-5">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="font-vietnam text-base font-bold text-gray-800 tracking-tight">
										Tổng quan vận hành
									</CardTitle>
									<CardDescription className="font-vietnam text-[13px] text-gray-400 mt-1">
										Tình trạng xử lý thời gian thực của lịch hẹn và đơn hàng.
									</CardDescription>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-8 font-vietnam">

							{/* KHỐI 1: TỔNG QUAN BOOKING */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-gray-800 font-bold text-[14px]">
										<div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
											<CalendarCheck className="w-4 h-4" />
										</div>
										<span>Lịch hẹn (Bookings)</span>
									</div>
									<span className="text-[12px] font-medium text-gray-400 flex items-center gap-0.5 hover:text-primary cursor-pointer transition-colors">
										Chi tiết <ArrowUpRight className="w-3 h-3" />
									</span>
								</div>

								{/* Thay đổi mấu chốt: Dùng flex-wrap và dữ liệu tự co giãn theo nội dung chữ */}
								<div className="flex flex-wrap gap-3">
									{bookings.length === 0 ? (
										<p className="text-[13px] text-gray-400 italic pl-2">Chưa có dữ liệu lịch hẹn nào...</p>
									) : (
										Object.entries(
											bookings.reduce<Record<string, number>>((acc, booking) => {
												acc[booking.status] = (acc[booking.status] || 0) + 1;
												return acc;
											}, {})
										).map(([status, count]) => {
											const config = getBookingStatusStyle(status);
											return (
												<div key={status} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-100/70 transition-all hover:shadow-sm shrink-0", config.bg)}>
													<span className="text-[13px] font-medium text-gray-600 whitespace-nowrap">{config.label}</span>
													<span className={cn("text-base font-bold min-w-[16px] text-center", config.color)}>{count}</span>
												</div>
											)
										})
									)}
								</div>
							</div>

							{/* ĐƯỜNG KẺ CHIA PHÂN KHU */}
							<div className="h-px bg-gray-100/60" />

							{/* KHỐI 2: TỔNG QUAN ORDERS */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-gray-800 font-bold text-[14px]">
										<div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
											<ShoppingBag className="w-4 h-4" />
										</div>
										<span>Đơn hàng (Orders)</span>
									</div>
									<span className="text-[12px] font-medium text-gray-400 flex items-center gap-0.5 hover:text-primary cursor-pointer transition-colors">
										Chi tiết <ArrowUpRight className="w-3 h-3" />
									</span>
								</div>

								{/* Khối hiển thị dạng hàng ngang, chữ nằm cạnh số cực kỳ thoáng đãng */}
								<div className="flex flex-wrap gap-3">
									{Object.entries(
										orders.reduce<Record<string, number>>((acc, order) => {
											acc[order.status] = (acc[order.status] || 0) + 1;
											return acc;
										}, {})
									).map(([status, count]) => {
										const config = getOrderStatusStyle(status);
										return (
											<div key={status} className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-100/70 transition-all hover:shadow-sm shrink-0", config.bg)}>
												<span className="text-[13px] font-medium text-gray-600 whitespace-nowrap">{config.label}</span>
												<span className={cn("text-base font-bold min-w-[16px] text-center", config.color)}>{count}</span>
											</div>
										);
									})}
								</div>
							</div>

						</CardContent>
					</Card>
				</Card>

			</div>

			<div className="grid gap-6 xl:grid-cols-2">
				<Card>
					<CardHeader><CardTitle>Booking theo ngày</CardTitle><CardDescription>7 ngày gần nhất theo ngày hẹn.</CardDescription></CardHeader>
					<CardContent className="space-y-3">
						{bookingTrend.map(([date, count]) => (
							<div key={date} className="space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span>{formatDate(date)}</span>
									<span>{count} booking</span>
								</div>
								<div className="h-2 rounded-full bg-muted">
									<div className="h-2 rounded-full bg-sky-500" style={{ width: `${(count / maxBookingCount) * 100}%` }} />
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader><CardTitle>Đơn hàng theo ngày</CardTitle><CardDescription>7 ngày gần nhất theo thời điểm tạo đơn.</CardDescription></CardHeader>
					<CardContent className="space-y-3">
						{orderTrend.map(([date, count]) => (
							<div key={date} className="space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span>{formatDate(date)}</span>
									<span>{count} đơn</span>
								</div>
								<div className="h-2 rounded-full bg-muted">
									<div className="h-2 rounded-full bg-emerald-500" style={{ width: `${(count / maxOrderCount) * 100}%` }} />
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
