"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, Users2 } from "lucide-react";
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
				<Button variant="outline" onClick={() => void loadDashboard()} disabled={loading}>Làm mới</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card><CardHeader><CardDescription>Tài khoản hoạt động</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><Users2 className="size-6 text-sky-500" />{activeUsers}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Staff chờ duyệt</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><Users2 className="size-6 text-amber-500" />{pendingApprovals}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Booking hoàn tất</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><CalendarDays className="size-6 text-emerald-500" />{completedBookings}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Doanh thu ghi nhận</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><BarChart3 className="size-6 text-indigo-500" />{formatCurrency(totalRevenue)}</CardTitle></CardHeader></Card>
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
				<Card>
					<CardHeader>
						<CardTitle>Thiết bị nổi bật</CardTitle>
						<CardDescription>Top thiết bị theo mức độ quan tâm tổng hợp từ hành vi và bán hàng.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{popularDevices.map((device, index) => (
							<Link key={device.id} href={`/admin/statistics/${device.id}`} className="block rounded-2xl border p-4 transition hover:border-sky-300 hover:bg-sky-50/50">
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="text-sm text-muted-foreground">Top {index + 1}</p>
										<p className="font-medium">{device.name}</p>
										<p className="text-sm text-muted-foreground">Đã bán {device.sold} | Lượt xem {device.viewCount}</p>
									</div>
									<div className="text-right">
										<p className="font-medium">{formatCurrency(device.price)}</p>
										<Badge variant="outline">{device.status}</Badge>
									</div>
								</div>
							</Link>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Tổng quan vận hành</CardTitle>
						<CardDescription>Phân bổ nhanh của booking và đơn hàng hiện tại.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-2xl border p-4">
							<p className="text-sm text-muted-foreground">Booking</p>
							<div className="mt-2 flex flex-wrap gap-2">
								{Object.entries(
									bookings.reduce<Record<string, number>>((acc, booking) => {
										acc[booking.status] = (acc[booking.status] || 0) + 1;
										return acc;
									}, {})
								).map(([status, count]) => (
									<Badge key={status} variant="outline">{status}: {count}</Badge>
								))}
							</div>
						</div>
						<div className="rounded-2xl border p-4">
							<p className="text-sm text-muted-foreground">Orders</p>
							<div className="mt-2 flex flex-wrap gap-2">
								{Object.entries(
									orders.reduce<Record<string, number>>((acc, order) => {
										acc[order.status] = (acc[order.status] || 0) + 1;
										return acc;
									}, {})
								).map(([status, count]) => (
									<Badge key={status} variant="outline">{status}: {count}</Badge>
								))}
							</div>
						</div>
					</CardContent>
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
