"use client";

import Link from "next/link";
import {
	CalendarCheck,
	CheckCircle2,
	CircleSlash,
	Loader2,
	RefreshCw,
} from "lucide-react";
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
	type StaffBooking,
	type StaffBookingStatus,
} from "@/lib/backofficeApi";
import { useUserStore } from "@/lib/store";

type BookingFilterValue = "ALL" | StaffBookingStatus;

const STATUS_OPTIONS: Array<{
	value: BookingFilterValue;
	label: string;
}> = [
	{ value: "ALL", label: "Tất cả trạng thái" },
	{ value: "PENDING_CONFIRM", label: "Chờ xác nhận" },
	{ value: "CONFIRMED", label: "Đã xác nhận" },
	{ value: "CHECKED_IN", label: "Đã check-in" },
	{ value: "COMPLETED", label: "Hoàn tất" },
	{ value: "NO_SHOW", label: "Không đến" },
	{ value: "CANCELLED", label: "Đã hủy" },
	{ value: "EXPIRED", label: "Hết hạn" },
];

const STATUS_LABELS: Record<StaffBookingStatus, string> = {
	PENDING_CONFIRM: "Chờ xác nhận",
	CONFIRMED: "Đã xác nhận",
	CHECKED_IN: "Đã check-in",
	COMPLETED: "Hoàn tất",
	CANCELLED: "Đã hủy",
	NO_SHOW: "Không đến",
	EXPIRED: "Hết hạn",
};

const STATUS_BADGE_VARIANTS: Record<
	StaffBookingStatus,
	"default" | "secondary" | "destructive" | "outline"
> = {
	PENDING_CONFIRM: "outline",
	CONFIRMED: "default",
	CHECKED_IN: "secondary",
	COMPLETED: "secondary",
	CANCELLED: "destructive",
	NO_SHOW: "destructive",
	EXPIRED: "outline",
};

const formatCurrency = (value: number) =>
	new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
		maximumFractionDigits: 0,
	}).format(value || 0);

const formatDate = (date: string) =>
	new Intl.DateTimeFormat("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(date));

const formatTime = (time: string) => time.slice(0, 5);

const getErrorMessage = (error: unknown, fallback: string) => {
	if (
		error &&
		typeof error === "object" &&
		"response" in error &&
		error.response &&
		typeof error.response === "object" &&
		"data" in error.response &&
		error.response.data &&
		typeof error.response.data === "object" &&
		"message" in error.response.data &&
		typeof error.response.data.message === "string"
	) {
		return error.response.data.message;
	}

	return fallback;
};

export default function StaffBookingsPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [bookings, setBookings] = useState<StaffBooking[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionBookingId, setActionBookingId] = useState<number | null>(null);
	const [statusFilter, setStatusFilter] = useState<BookingFilterValue>("ALL");

	const loadBookings = useCallback(async () => {
		try {
			setLoading(true);
			const response = await backofficeApi.getStaffBookings({
				status: statusFilter === "ALL" ? undefined : statusFilter,
				page: 0,
				size: 50,
			});
			setBookings(response.items || []);
		} catch (error) {
			toast.error(getErrorMessage(error, "Không thể tải danh sách booking."));
		} finally {
			setLoading(false);
		}
	}, [statusFilter]);

	useEffect(() => {
		if (!isAuthenticated) {
			setLoading(false);
			return;
		}

		void loadBookings();
	}, [isAuthenticated, statusFilter, loadBookings]);

	const pendingCount = bookings.filter(
		(booking) => booking.status === "PENDING_CONFIRM"
	).length;
	const confirmedCount = bookings.filter(
		(booking) => booking.status === "CONFIRMED"
	).length;
	const checkedInCount = bookings.filter(
		(booking) => booking.status === "CHECKED_IN"
	).length;
	const issueCount = bookings.filter((booking) =>
		["CANCELLED", "NO_SHOW", "EXPIRED"].includes(booking.status)
	).length;

	const handleConfirm = async (bookingId: number) => {
		const staffNote = window.prompt(
			"Ghi chú xác nhận cho booking này (có thể bỏ trống)",
			""
		);

		try {
			setActionBookingId(bookingId);
			await backofficeApi.confirmStaffBooking(bookingId, staffNote ?? undefined);
			toast.success("Đã xác nhận booking.");
			await loadBookings();
		} catch (error) {
			toast.error(getErrorMessage(error, "Không thể xác nhận booking."));
		} finally {
			setActionBookingId(null);
		}
	};

	const handleComplete = async (bookingId: number) => {
		try {
			setActionBookingId(bookingId);
			await backofficeApi.completeStaffBooking(bookingId);
			toast.success("Đã cập nhật booking sang hoàn tất.");
			await loadBookings();
		} catch (error) {
			toast.error(getErrorMessage(error, "Không thể hoàn tất booking."));
		} finally {
			setActionBookingId(null);
		}
	};

	const handleCheckIn = async (bookingId: number) => {
		const staffNote = window.prompt(
			"Ghi chú check-in cho booking này (có thể bỏ trống)",
			""
		);

		try {
			setActionBookingId(bookingId);
			await backofficeApi.checkInStaffBooking(bookingId, staffNote ?? undefined);
			toast.success("Đã check-in booking.");
			await loadBookings();
		} catch (error) {
			toast.error(getErrorMessage(error, "Không thể check-in booking."));
		} finally {
			setActionBookingId(null);
		}
	};

	const handleNoShow = async (bookingId: number) => {
		const staffNote = window.prompt(
			"Nhập ghi chú hoặc lý do no-show",
			""
		);

		try {
			setActionBookingId(bookingId);
			await backofficeApi.markStaffBookingNoShow(bookingId, staffNote ?? undefined);
			toast.success("Đã cập nhật booking thành không đến.");
			await loadBookings();
		} catch (error) {
			toast.error(getErrorMessage(error, "Không thể cập nhật no-show."));
		} finally {
			setActionBookingId(null);
		}
	};

	const handleCancel = async (bookingId: number) => {
		const reason = window.prompt("Nhập lý do hủy booking", "");

		if (!reason || !reason.trim()) {
			toast.error("Cần nhập lý do hủy booking.");
			return;
		}

		try {
			setActionBookingId(bookingId);
			await backofficeApi.cancelStaffBooking(bookingId, reason.trim());
			toast.success("Đã hủy booking.");
			await loadBookings();
		} catch (error) {
			toast.error(getErrorMessage(error, "Không thể hủy booking."));
		} finally {
			setActionBookingId(null);
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-muted-foreground">
				Đăng nhập bằng tài khoản staff để quản lý booking.
			</div>
		);
	}

	if (authUser?.role !== "STAFF") {
		return (
			<div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-muted-foreground">
				Bạn không có quyền truy cập màn quản lý booking của staff.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Quản lý booking</h1>
					<p className="text-sm text-muted-foreground">
						Xử lý yêu cầu đặt lịch, theo dõi slot và cập nhật trạng thái trải nghiệm từ các phiên do staff tạo.
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row">
					<Button asChild variant="outline">
						<Link href="/staff/sessions">Quản lý phiên trải nghiệm</Link>
					</Button>
					<Select
						value={statusFilter}
						onValueChange={(value) => setStatusFilter(value as BookingFilterValue)}
					>
						<SelectTrigger className="w-full min-w-52 bg-white sm:w-52">
							<SelectValue placeholder="Lọc trạng thái" />
						</SelectTrigger>
						<SelectContent>
							{STATUS_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<Button
						variant="outline"
						onClick={() => void loadBookings()}
						disabled={loading}
					>
						<RefreshCw className={loading ? "animate-spin" : ""} />
						Làm mới
					</Button>
				</div>
			</div>

			<Card className="border-l-4 border-l-[#052962] bg-slate-50/70">
				<CardContent className="flex flex-col gap-3 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
					<div>
						<div className="font-semibold text-foreground">Booking chỉ xuất hiện sau khi staff mở phiên trải nghiệm.</div>
						<div>
							Nếu khách chưa có lịch để chọn, staff cần vào phân hệ phiên để tạo khung giờ, số slot và chi nhánh trước.
						</div>
					</div>
					<Button asChild>
						<Link href="/staff/sessions">Tạo phiên mới</Link>
					</Button>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card>
					<CardHeader>
						<CardDescription>Đang chờ staff xử lý</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl">
							<CalendarCheck className="size-6 text-sky-500" />
							{pendingCount}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Đã xác nhận lịch</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl">
							<CheckCircle2 className="size-6 text-emerald-500" />
							{confirmedCount}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Khách đã check-in</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl">
							<CheckCircle2 className="size-6 text-indigo-500" />
							{checkedInCount}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>No-show, hủy hoặc hết hạn</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl">
							<CircleSlash className="size-6 text-rose-500" />
							{issueCount}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Danh sách booking</CardTitle>
					<CardDescription>
						{bookings.length} booking trong bộ lọc hiện tại.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex min-h-56 items-center justify-center text-muted-foreground">
							<Loader2 className="size-5 animate-spin" />
						</div>
					) : bookings.length === 0 ? (
						<div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
							Không có booking phù hợp với bộ lọc hiện tại.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Mã booking</TableHead>
									<TableHead>Khách hàng</TableHead>
									<TableHead>Thiết bị</TableHead>
									<TableHead>Lịch hẹn</TableHead>
									<TableHead>Thanh toán</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{bookings.map((booking) => {
									const isActing = actionBookingId === booking.id;
									return (
										<TableRow key={booking.id}>
											<TableCell>
												<div className="font-medium">{booking.bookingCode}</div>
												<div className="text-xs text-muted-foreground">
													Tạo lúc {formatDate(booking.createdAt)}
												</div>
											</TableCell>
											<TableCell>
												<div className="font-medium">{booking.accountName}</div>
												<div className="text-xs text-muted-foreground">
													Account #{booking.accountId}
												</div>
											</TableCell>
											<TableCell>
												<div className="font-medium">{booking.device.name}</div>
												<div className="text-xs text-muted-foreground">
													{booking.session.branchName}
												</div>
											</TableCell>
											<TableCell>
												<div className="font-medium">
													{formatDate(booking.appointmentDate)}
												</div>
												<div className="text-xs text-muted-foreground">
													{formatTime(booking.startTime)} - {formatTime(booking.endTime)}
												</div>
												<div className="text-xs text-muted-foreground">
													Còn {booking.session.availableSlots}/{booking.session.maxSlots} slot
												</div>
											</TableCell>
											<TableCell>
												<div className="font-medium">
													{formatCurrency(booking.totalPrice)}
												</div>
												<div className="text-xs text-muted-foreground">
													Voucher: {booking.voucherCode || "Không dùng"}
												</div>
											</TableCell>
											<TableCell>
												<Badge variant={STATUS_BADGE_VARIANTS[booking.status]}>
													{STATUS_LABELS[booking.status]}
												</Badge>
												{booking.cancelReason ? (
													<div className="mt-2 max-w-52 text-xs text-muted-foreground">
														Lý do: {booking.cancelReason}
													</div>
												) : null}
											</TableCell>
											<TableCell>
												<div className="flex justify-end gap-2">
													{booking.status === "PENDING_CONFIRM" ? (
														<Button
															size="sm"
															onClick={() => void handleConfirm(booking.id)}
															disabled={isActing}
														>
															{isActing ? <Loader2 className="animate-spin" /> : null}
															Xác nhận
														</Button>
													) : null}

													{booking.status === "CONFIRMED" ? (
														<>
															<Button
																size="sm"
																variant="outline"
																onClick={() => void handleCheckIn(booking.id)}
																disabled={isActing}
															>
																{isActing ? <Loader2 className="animate-spin" /> : null}
																Check-in
															</Button>
															<Button
																size="sm"
																variant="outline"
																onClick={() => void handleNoShow(booking.id)}
																disabled={isActing}
															>
																{isActing ? <Loader2 className="animate-spin" /> : null}
																No-show
															</Button>
														</>
													) : null}

													{booking.status === "CHECKED_IN" ? (
														<Button
															size="sm"
															variant="outline"
															onClick={() => void handleComplete(booking.id)}
															disabled={isActing}
														>
															{isActing ? <Loader2 className="animate-spin" /> : null}
															Hoàn tất
														</Button>
													) : null}

													{["PENDING_CONFIRM", "CONFIRMED"].includes(
														booking.status
													) ? (
														<Button
															size="sm"
															variant="destructive"
															onClick={() => void handleCancel(booking.id)}
															disabled={isActing}
														>
															{isActing ? <Loader2 className="animate-spin" /> : null}
															Hủy
														</Button>
													) : null}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
