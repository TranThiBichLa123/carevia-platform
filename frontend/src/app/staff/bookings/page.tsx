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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
	// Sửa định nghĩa hàm này trong component
	const openActionDialog = (
		title: string,
		actionFn: (id: number, note: string) => Promise<any>, // Sửa note? thành note
		bookingId: number
	) => {
		setDialogConfig({
			title,
			action: async (id, note) => {
				try {
					setActionBookingId(id);
					// Truyền trực tiếp note vào
					await actionFn(id, note);
					toast.success("Thao tác thành công.");
					await loadBookings();
				} catch (error) {
					toast.error(getErrorMessage(error, "Thao tác thất bại."));
				} finally {
					setActionBookingId(null);
				}
			},
			bookingId
		});
		setIsActionDialogOpen(true);
	};
	// Thêm vào trong component StaffBookingsPage
	const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
	const [dialogConfig, setDialogConfig] = useState<{
		title: string;
		action: (bookingId: number, note: string) => Promise<void>;
		bookingId: number | null;
	}>({ title: "", action: async () => { }, bookingId: null });
	const [noteInput, setNoteInput] = useState("");
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
		<div className="space-y-6 font-vietnam">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Quản lý booking</h1>
					<p className="text-sm text-muted-foreground">
						Xử lý yêu cầu đặt lịch, theo dõi slot và cập nhật trạng thái trải nghiệm từ các phiên do staff tạo.
					</p>
				</div>

				<div className="flex flex-col gap-3 sm:flex-row">
					{/* <Button asChild variant="outline" >
						<Link href="/staff/sessions">Quản lý phiên trải nghiệm</Link>
					</Button> */}
					<div className="group relative z-50 w-full sm:min-w-52 sm:w-auto">
						<div className="flex h-9.5 cursor-pointer items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm transition-all hover:border-gray-200">
							<span className="whitespace-nowrap text-[13px] font-medium text-gray-700">
								{STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label || "Lọc trạng thái"}
							</span>
							<svg className="ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
							</svg>
						</div>

						<div className="invisible absolute top-full left-0 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
							<div className="flex flex-col whitespace-nowrap">
								{STATUS_OPTIONS.map((option) => (
									<div
										key={option.value}
										onClick={() => setStatusFilter(option.value as BookingFilterValue)}
										className={`border-b border-gray-100 px-3 py-2.5 text-[13px] transition-colors last:border-b-0 ${statusFilter === option.value ? "bg-gray-50 font-bold text-staff-primary" : "cursor-pointer text-gray-700 hover:bg-gray-50"}`}
									>
										{option.label}
									</div>
								))}
							</div>
						</div>
					</div>

					<button
						onClick={() => void loadBookings()}
						disabled={loading}
						className="group relative h-9.5 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white px-4 text-[13px] font-medium whitespace-nowrap text-gray-700 shadow-sm transition-all duration-500 hover:border-staff-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span className="absolute inset-y-0 left-0 w-0 bg-staff-primary transition-all duration-500 ease-out group-hover:w-full" />
						<div className="relative z-10 flex items-center justify-center text-gray-700 transition-colors duration-500 group-hover:text-white">
							<RefreshCw
								className={`mr-2 h-3.5 w-3.5 text-gray-400 transition-transform duration-700 ease-in-out group-hover:text-white ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
							/>
							<span className="relative">Làm mới</span>
						</div>
					</button>
				</div>
			</div>

			{/* <Card className="border-l-4 border-l-[#052962] bg-slate-50/70">
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
			</Card> */}

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
						<div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
							<Table>
								<TableHeader>
									<TableRow className="bg-[#052962] hover:bg-[#052962] rounded-t-lg">
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-[#FFE500] pl-4">MÃ ĐƠN</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">KHÁCH HÀNG</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">SẢN PHẨM</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">LỊCH HẸN</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">THANH TOÁN</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">TRẠNG THÁI</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-[#FFE500] pr-4 text-right">THAO TÁC</TableHead>
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
													{/* Bỏ variant, thêm className để đổi màu nền và màu chữ */}
													<Badge className="rounded-lg  bg-staff-primary px-2.5 py-1 text-white hover:bg-staff-primary/90 shadow-none">
														{STATUS_LABELS[booking.status]}
													</Badge>
													{booking.cancelReason ? (
														<div className="mt-2 max-w-52 text-xs ">
															Lý do: {booking.cancelReason}
														</div>
													) : null}
												</TableCell>

												<TableCell>
													<div className="flex justify-end gap-2">
														{booking.status === "PENDING_CONFIRM" ? (
															<Button
																size="sm"
																onClick={() => openActionDialog("Xác nhận booking", backofficeApi.confirmStaffBooking, booking.id)}
																disabled={isActing}
																className="rounded-lg"
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
																	onClick={() => openActionDialog("Ghi chú check-in", backofficeApi.checkInStaffBooking, booking.id)}
																	disabled={isActing}
																	className="rounded-lg"
																>
																	{isActing ? <Loader2 className="animate-spin " /> : null}
																	Check-in
																</Button>
																<Button
																	size="sm"
																	variant="outline"
																	onClick={() => openActionDialog("Lý do No-show", backofficeApi.markStaffBookingNoShow, booking.id)}
																	disabled={isActing}
																	className="rounded-lg"
																>
																	{isActing ? <Loader2 className="animate-spin" /> : null}
																	No-show
																</Button>
															</>
														) : null}

														{booking.status === "CHECKED_IN" ? (
															// Trong phần gọi nút "Hoàn tất"
															<Button
																size="sm"
																variant="outline"
																onClick={() => openActionDialog(
																	"Hoàn tất booking",
																	async (id, note) => await backofficeApi.completeStaffBooking(id), // Bỏ qua note ở đây
																	booking.id
																)}
																disabled={isActing}
																className="rounded-lg"
															>
																{isActing ? <Loader2 className="animate-spin" /> : null}
																Hoàn tất
															</Button>
														) : null}

														{["PENDING_CONFIRM", "CONFIRMED"].includes(booking.status) ? (
															<Button
																size="sm"
																variant="destructive"
																onClick={() => openActionDialog("Nhập lý do hủy", backofficeApi.cancelStaffBooking, booking.id)}
																disabled={isActing}
																className="rounded-lg"
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
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{dialogConfig.title}</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						<input
							value={noteInput}
							onChange={(e) => setNoteInput(e.target.value)}
							placeholder="Nhập nội dung/ghi chú tại đây..."
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						/>
					</div>
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>Hủy</Button>
						<Button onClick={async () => {
							if (dialogConfig.bookingId) {
								await dialogConfig.action(dialogConfig.bookingId, noteInput);
								setIsActionDialogOpen(false);
								setNoteInput("");
							}
						}}>Xác nhận</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
