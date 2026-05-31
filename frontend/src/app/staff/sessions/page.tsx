"use client";

import Link from "next/link";
import { CalendarCheck, CalendarIcon, CheckCircle2, CircleSlash, Clock, DoorOpen, Loader2, LockIcon, Plus, RefreshCw, Users, XCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
	type BackofficeSession,
	type BackofficeSessionStatus,
	type StaffDevice,
} from "@/lib/backofficeApi";
import { useUserStore } from "@/lib/store";
import {
	formatCurrency,
	formatDate,
	formatTime,
	getBackofficeErrorMessage,
	getTodayInputValue,
} from "@/lib/backofficeUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
const SESSION_LABELS: Record<BackofficeSessionStatus, string> = {
	OPEN: "Đang mở",
	CLOSED: "Đã đóng",
	FULL: "Đã đầy",
	CANCELLED: "Đã hủy",
};

const SESSION_VARIANTS: Record<
	BackofficeSessionStatus,
	"default" | "secondary" | "destructive" | "outline"
> = {
	OPEN: "default",
	CLOSED: "outline",
	FULL: "secondary",
	CANCELLED: "destructive",
};
// Định nghĩa danh sách Giờ, Phút và Buổi để map dữ liệu
const HOURS = Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")); // Bước nhảy 5 phút (00, 05, 10...)
const PERIODS = ["AM", "PM"];

export default function StaffSessionsPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [devices, setDevices] = useState<StaffDevice[]>([]);
	const [sessions, setSessions] = useState<BackofficeSession[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [selectedDate, setSelectedDate] = useState(getTodayInputValue());
	const [form, setForm] = useState({
		deviceId: "",
		branchName: "Chi nhánh Quận 1",
		locationDetail: "Tầng 2 - Khu trải nghiệm",
		sessionDate: getTodayInputValue(),
		startTime: "09:00",
		endTime: "10:00",
		maxSlots: "8",
		pricePerSlot: "0",
	});

	// Hàm tiện ích tách chuỗi "09:00 AM" thành các giá trị độc lập để hiển thị lên UI
	const parseTime = (timeStr: string) => {
		if (!timeStr) return { hour: "09", minute: "00", period: "AM" };
		const [time, period] = timeStr.split(" ");
		const [hour, minute] = time.split(":");
		return { hour, minute, period };
	};

	const updateTime = (type: "hour" | "minute" | "period", value: string, isStart: boolean) => {
		const currentStr = isStart ? form.startTime : form.endTime;
		const { hour, minute, period } = parseTime(currentStr || (isStart ? "09:00 AM" : "10:00 AM"));

		let newHour = hour;
		let newMinute = minute;
		let newPeriod = period;

		if (type === "hour") newHour = value;
		if (type === "minute") newMinute = value;
		if (type === "period") newPeriod = value;

		const finalTimeStr = `${newHour}:${newMinute} ${newPeriod}`;
		setForm((current) => ({
			...current,
			[isStart ? "startTime" : "endTime"]: finalTimeStr
		}));
	};


	const loadDevices = useCallback(async () => {
		try {
			const response = await backofficeApi.getStaffDevices({ page: 0, size: 100 });
			setDevices(response.items || []);
			setForm((current) => ({
				...current,
				deviceId: current.deviceId || String(response.items?.[0]?.id || ""),
			}));
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải danh sách thiết bị."));
		}
	}, []);

	const loadSessions = useCallback(async () => {
		try {
			setLoading(true);
			setSessions(await backofficeApi.getSessionsByDate(selectedDate));
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải danh sách phiên trải nghiệm."));
		} finally {
			setLoading(false);
		}
	}, [selectedDate]);

	useEffect(() => {
		if (!isAuthenticated) {
			setLoading(false);
			return;
		}

		void loadDevices();
	}, [isAuthenticated, loadDevices]);

	useEffect(() => {
		if (!isAuthenticated) {
			return;
		}

		void loadSessions();
	}, [isAuthenticated, loadSessions, selectedDate]);

	const openSessions = sessions.filter((session) => session.status === "OPEN").length;
	const fullSessions = sessions.filter((session) => session.status === "FULL").length;
	const closedSessions = sessions.filter((session) => session.status === "CLOSED").length;
	const cancelledSessions = sessions.filter((session) => session.status === "CANCELLED").length;







	const handleCreateSession = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!form.deviceId) {
			toast.error("Chọn thiết bị trước khi tạo phiên.");
			return;
		}

		// 🌟 HÀM XỬ LÝ ĐỔI GIỜ TRỰC TIẾP: Chuyển "08:00 AM" -> "08:00" hoặc "02:30 PM" -> "14:30"
		const formatTimeTo24h = (timeStr: string) => {
			if (!timeStr) return "";
			const upperTime = timeStr.toUpperCase();
			if (upperTime.includes("AM") || upperTime.includes("PM")) {
				const [time, modifier] = upperTime.split(" ");
				let [hours, minutes] = time.split(":");

				if (hours === "12") {
					hours = "00";
				}
				if (modifier === "PM") {
					hours = String(parseInt(hours, 10) + 12);
				}
				return `${hours.padStart(2, "0")}:${minutes}`;
			}
			return timeStr; // Nếu đã chuẩn hệ 24h sẵn thì giữ nguyên
		};

		try {
			setSaving(true);
			await backofficeApi.createSession({
				deviceId: Number(form.deviceId),
				branchName: form.branchName,
				locationDetail: form.locationDetail,
				sessionDate: form.sessionDate,

				// 🌟 SỬA TẠI ĐÂY: Ép chuỗi thời gian về hệ 24h để Java LocalTime đọc được
				startTime: formatTimeTo24h(form.startTime),
				endTime: formatTimeTo24h(form.endTime),

				maxSlots: Number(form.maxSlots),
				pricePerSlot: Number(form.pricePerSlot),

				// Giữ lại ID người tạo là Staff để tránh lỗi database
				// staffId: Number(user?.id),
			});

			toast.success("Đã tạo phiên trải nghiệm.");
			setSelectedDate(form.sessionDate);
			await loadSessions();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tạo phiên trải nghiệm."));
		} finally {
			setSaving(false);
		}
	};









	const handleStatusUpdate = async (
		sessionId: number,
		nextStatus: "CLOSED" | "CANCELLED"
	) => {
		try {
			await backofficeApi.updateSessionStatus(sessionId, nextStatus);
			toast.success(`Đã cập nhật phiên sang ${SESSION_LABELS[nextStatus]}.`);
			await loadSessions();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái phiên."));
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
				Đăng nhập bằng tài khoản staff để quản lý phiên trải nghiệm.
			</div>
		);
	}

	if (authUser?.role !== "STAFF") {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
				Bạn không có quyền truy cập màn quản lý phiên.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Quản lý phiên trải nghiệm</h1>
					<p className="text-sm font-vietnam text-muted-foreground">
						Staff tạo các phiên ở đây để khách nhìn thấy lịch và đặt booking ở phía client.
					</p>
				</div>
				{/* <Badge variant="outline" className="w-fit">Nguồn lịch cho khách đặt hẹn</Badge> */}
			</div>

			{/* <Card className="border-l-4 border-l-emerald-600 bg-emerald-50/40">
				<CardContent className="py-4 text-sm text-muted-foreground">
					Mỗi phiên bạn tạo sẽ xuất hiện trực tiếp trong màn khách chọn lịch tại trang booking của thiết bị tương ứng. Nếu không có phiên đang mở, khách sẽ không chọn được giờ hẹn.
				</CardContent>
			</Card> */}

			<div className="flex flex-col lg:flex-row gap-6 w-full items-start font-vietnam">
				<div className="w-full lg:w-[430px] shrink-0">
					<Card className="border border-gray-100 bg-white shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden font-vietnam">
						<CardHeader className="space-y-1.5 pb-6 border-b border-gray-50 bg-gray-50/30">
							<CardTitle className="text-xl font-bold text-gray-900 tracking-tight">Tạo phiên mới</CardTitle>
							<CardDescription className="text-sm text-gray-500 leading-relaxed">
								Thiết lập khung giờ, chi nhánh và số slot để khách có lịch hẹn để chọn.
							</CardDescription>
						</CardHeader>

						<CardContent className="pt-6">
							<form className="space-y-5" onSubmit={handleCreateSession}>

								{/* Thiết bị */}
								<div className="space-y-2 font-vietnam">
									<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Thiết bị</label>

									{/* Dropdown kích hoạt bằng Hover (group/device) */}
									<div className="group/device relative z-50 w-full">

										{/* Khung hiển thị giá trị đang chọn */}
										<div className="flex h-10 cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2 shadow-xs transition-all hover:border-gray-300">
											<span className="whitespace-nowrap text-[13px] font-medium text-gray-700">
												{devices.find((device) => String(device.id) === form.deviceId)?.name || "Chọn thiết bị"}
											</span>
											{/* Mũi tên tự động xoay ngược 180 độ khi hover chuột vào */}
											<svg className="ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover/device:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
											</svg>
										</div>

										{/* Menu danh sách thiết bị đổ xuống khi hover */}
										<div className="invisible absolute top-full left-0 mt-1.5 w-full max-h-60 overflow-y-auto rounded-xl border border-gray-100 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover/device:visible group-hover/device:opacity-100">
											<div className="flex flex-col whitespace-nowrap p-1">
												{devices.map((device) => (
													<div
														key={device.id}
														onClick={() => setForm((current) => ({ ...current, deviceId: String(device.id) }))}
														className={`rounded-lg px-3 py-2.5 text-[13px] transition-colors ${form.deviceId === String(device.id)
															? "bg-gray-50 font-bold text-staff-primary"
															: "cursor-pointer text-gray-700 hover:bg-gray-50/80"
															}`}
													>
														{device.name}
													</div>
												))}
											</div>
										</div>

									</div>
								</div>


								{/* Chi nhánh & Vị trí */}
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Chi nhánh</label>
										{/* Nâng cấp Input: Thêm viền mịn, bo tròn đồng bộ, hiệu ứng focus mượt */}
										<Input
											value={form.branchName}
											onChange={(event) => setForm((current) => ({ ...current, branchName: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Vị trí</label>
										<Input
											value={form.locationDetail}
											onChange={(event) => setForm((current) => ({ ...current, locationDetail: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0"
										/>
									</div>
								</div>

								{/* Ngày & Thời gian */}
								<div className="grid gap-4 md:grid-cols-3 font-vietnam">

									{/* 1. Ô CHỌN NGÀY (Giữ nguyên vì native date picker trên từng trình duyệt nhìn vẫn ổn, chỉ chỉnh ẩn icon mặc định nếu cần) */}
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Ngày</label>
										<Input
											type="date"
											value={form.sessionDate}
											onChange={(event) => setForm((current) => ({ ...current, sessionDate: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0 text-gray-700 cursor-pointer"
										/>
									</div>
									{/* 1. Ô CHỌN GIỜ BẮT ĐẦU */}
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Bắt đầu</label>
										<Popover modal={false}>
											<PopoverTrigger asChild>
												<button type="button" className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2 shadow-xs transition-all hover:border-gray-300 outline-none text-[13px] font-medium text-gray-700">
													<span>{form.startTime || "09:00 AM"}</span>
													<Clock className="h-4 w-4 text-gray-400 shrink-0" />
												</button>
											</PopoverTrigger>
											{/* Popover tự động tính toán hướng trồi lên hoặc lộn xuống dựa vào không gian màn hình */}
											<PopoverContent align="start" className="w-56 p-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50">
												<div className="flex h-40 gap-1">
													{/* Cột chọn Giờ */}
													<ScrollArea className="flex-1 h-full border-r border-gray-50 pr-1">
														<div className="flex flex-col gap-0.5">
															{HOURS.map((h) => (
																<button
																	key={h}
																	type="button"
																	onClick={() => updateTime("hour", h, true)}
																	className={`text-[12.5px] py-1.5 rounded-lg transition-colors text-center ${parseTime(form.startTime).hour === h ? "bg-staff-primary text-white font-bold" : "text-gray-700 hover:bg-gray-50"}`}
																>
																	{h}
																</button>
															))}
														</div>
													</ScrollArea>
													{/* Cột chọn Phút */}
													<ScrollArea className="flex-1 h-full border-r border-gray-50 pr-1">
														<div className="flex flex-col gap-0.5">
															{MINUTES.map((m) => (
																<button
																	key={m}
																	type="button"
																	onClick={() => updateTime("minute", m, true)}
																	className={`text-[12.5px] py-1.5 rounded-lg transition-colors text-center ${parseTime(form.startTime).minute === m ? "bg-staff-primary text-white font-bold" : "text-gray-700 hover:bg-gray-50"}`}
																>
																	{m}
																</button>
															))}
														</div>
													</ScrollArea>
													{/* Cột chọn Buổi AM/PM */}
													<div className="flex flex-col gap-1 justify-center px-1 w-14">
														{PERIODS.map((p) => (
															<button
																key={p}
																type="button"
																onClick={() => updateTime("period", p, true)}
																className={`text-[11.5px] py-2 rounded-lg font-bold transition-colors text-center border ${parseTime(form.startTime).period === p ? "bg-staff-primary text-white border-staff-primary shadow-xs" : "border-gray-100 text-gray-500 hover:bg-gray-50"}`}
															>
																{p}
															</button>
														))}
													</div>
												</div>
											</PopoverContent>
										</Popover>
									</div>

									{/* 2. Ô CHỌN GIỜ KẾT THÚC */}
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Kết thúc</label>
										<Popover modal={false}>
											<PopoverTrigger asChild>
												<button type="button" className="flex h-10 w-full cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2 shadow-xs transition-all hover:border-gray-300 outline-none text-[13px] font-medium text-gray-700">
													<span>{form.endTime || "10:00 AM"}</span>
													<Clock className="h-4 w-4 text-gray-400 shrink-0" />
												</button>
											</PopoverTrigger>
											<PopoverContent align="start" className="w-56 p-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50">
												<div className="flex h-40 gap-1">
													{/* Cột chọn Giờ */}
													<ScrollArea className="flex-1 h-full border-r border-gray-50 pr-1">
														<div className="flex flex-col gap-0.5">
															{HOURS.map((h) => (
																<button
																	key={h}
																	type="button"
																	onClick={() => updateTime("hour", h, false)}
																	className={`text-[12.5px] py-1.5 rounded-lg transition-colors text-center ${parseTime(form.endTime).hour === h ? "bg-staff-primary text-white font-bold" : "text-gray-700 hover:bg-gray-50"}`}
																>
																	{h}
																</button>
															))}
														</div>
													</ScrollArea>
													{/* Cột chọn Phút */}
													<ScrollArea className="flex-1 h-full border-r border-gray-50 pr-1">
														<div className="flex flex-col gap-0.5">
															{MINUTES.map((m) => (
																<button
																	key={m}
																	type="button"
																	onClick={() => updateTime("minute", m, false)}
																	className={`text-[12.5px] py-1.5 rounded-lg transition-colors text-center ${parseTime(form.endTime).minute === m ? "bg-staff-primary text-white font-bold" : "text-gray-700 hover:bg-gray-50"}`}
																>
																	{m}
																</button>
															))}
														</div>
													</ScrollArea>
													{/* Cột chọn Buổi AM/PM */}
													<div className="flex flex-col gap-1 justify-center px-1 w-14">
														{PERIODS.map((p) => (
															<button
																key={p}
																type="button"
																onClick={() => updateTime("period", p, false)}
																className={`text-[11.5px] py-2 rounded-lg font-bold transition-colors text-center border ${parseTime(form.endTime).period === p ? "bg-staff-primary text-white border-staff-primary shadow-xs" : "border-gray-100 text-gray-500 hover:bg-gray-50"}`}
															>
																{p}
															</button>
														))}
													</div>
												</div>
											</PopoverContent>
										</Popover>
									</div>

								</div>


								{/* Slot & Giá */}
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Số slot</label>
										<Input
											type="number"
											min="1"
											value={form.maxSlots}
											onChange={(event) => setForm((current) => ({ ...current, maxSlots: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Giá/slot</label>
										<Input
											type="number"
											min="0"
											value={form.pricePerSlot}
											onChange={(event) => setForm((current) => ({ ...current, pricePerSlot: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0"
										/>
									</div>
								</div>

								<Button
									type="submit"
									disabled={saving}
									className="w-full h-10 px-5 !bg-[#173E77] !text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:!bg-[#052962] hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm"
								>
									{saving ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										/* Thay icon Save bằng icon Plus hoặc Calendar để phù hợp với việc tạo phiên */
										<Plus className="mr-2 size-4" />
									)}
									{saving ? "Đang tạo..." : "Tạo phiên trải nghiệm"}
								</Button>

							</form>
						</CardContent>
					</Card>
				</div>

				<div className="flex-1 min-w-0 w-full space-y-6">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 font-vietnam">

						{/* 1. CARD: ĐANG MỞ */}
						<Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden transition-all hover:shadow-md">
							<CardHeader className="p-5 space-y-0">
								{/* Nhãn chữ giữ nguyên của bạn, đưa lên hàng trên */}
								<CardDescription className="text-[13px] font-medium text-gray-400 text-left">Đang mở</CardDescription>

								{/* Hàng dưới: Gộp Icon và Số nằm ngang với nhau như hình mẫu */}
								<div className="flex items-center gap-2 mt-2.5">
									<CalendarCheck className="size-5 text-sky-500 shrink-0" />
									<CardTitle className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{openSessions}</CardTitle>
								</div>
							</CardHeader>
						</Card>

						{/* 2. CARD: ĐÃ ĐẦY */}
						<Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden transition-all hover:shadow-md">
							<CardHeader className="p-5 space-y-0">
								<CardDescription className="text-[13px] font-medium text-gray-400 text-left">Đã đầy</CardDescription>

								<div className="flex items-center gap-2 mt-2.5">
									<CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
									<CardTitle className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{fullSessions}</CardTitle>
								</div>
							</CardHeader>
						</Card>

						{/* 3. CARD: ĐÃ ĐÓNG */}
						<Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden transition-all hover:shadow-md">
							<CardHeader className="p-5 space-y-0">
								<CardDescription className="text-[13px] font-medium text-gray-400 text-left">Đã đóng</CardDescription>

								<div className="flex items-center gap-2 mt-2.5">
									<CheckCircle2 className="size-5 text-indigo-500 shrink-0" />
									<CardTitle className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{closedSessions}</CardTitle>
								</div>
							</CardHeader>
						</Card>

						{/* 4. CARD: ĐÃ HỦY */}
						<Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden transition-all hover:shadow-md">
							<CardHeader className="p-5 space-y-0">
								<CardDescription className="text-[13px] font-medium text-gray-400 text-left">Đã hủy</CardDescription>

								<div className="flex items-center gap-2 mt-2.5">
									<CircleSlash className="size-5 text-rose-500 shrink-0" />
									<CardTitle className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{cancelledSessions}</CardTitle>
								</div>
							</CardHeader>
						</Card>

					</div>

					<Card>
						<CardHeader>
							<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
								<div>
									<CardTitle>Phiên theo ngày</CardTitle>
									{/* <CardDescription>Ngày {formatDate(selectedDate)}</CardDescription> */}
								</div>
								<div className="flex gap-3 font-vietnam">

									<Popover modal={false}>
										{/* Nút Trigger giả lập ô Input */}
										<PopoverTrigger asChild>
											<button
												type="button"
												className={cn(
													"flex h-10 w-full bg-white border border-gray-200 rounded-xl shadow-xs transition-all text-left px-3.5 py-2 text-[13px] font-medium text-gray-700 hover:border-gray-300 outline-none items-center justify-between md:w-44 cursor-pointer",
													!selectedDate && "text-gray-400"
												)}
											>
												{/* Định dạng ngày hiển thị dạng DD/MM/YYYY đẹp mắt */}
												<span>
													{selectedDate ? format(new Date(selectedDate), "dd/MM/yyyy") : "Chọn ngày"}
												</span>
												<CalendarIcon className="h-4 w-4 text-gray-400 shrink-0" />
											</button>
										</PopoverTrigger>

										{/* 🌟 SỬA CHỖ 1: Đổi 'w-auto' thành 'w-fit' để ép hộp popup ôm vừa khít bảng lịch, thêm overflow-hidden để bo mượt */}
										<PopoverContent
											align="start"
											className="w-fit min-w-[320px] p-3 bg-white border border-gray-100 rounded-2xl shadow-xl z-50"
										>											<Calendar
												mode="single"
												selected={selectedDate ? new Date(selectedDate) : undefined}
												onSelect={(date: Date | undefined) => {
													if (date) {
														// Chuyển đổi định dạng Date Object về dạng chuỗi YYYY-MM-DD để không bị lệch logic state cũ của bạn
														const yyyy = date.getFullYear();
														const mm = String(date.getMonth() + 1).padStart(2, "0");
														const dd = String(date.getDate()).padStart(2, "0");
														setSelectedDate(`${yyyy}-${mm}-${dd}`);
													}
												}}
												// Tùy chỉnh ngôn ngữ hiển thị sang tiếng Việt nếu cần (bỏ dòng locale nếu muốn giữ tiếng Anh)
												locale={vi}
											/>
										</PopoverContent>
									</Popover>

									<button
										onClick={() => void loadSessions()}
										disabled={loading}
										className="group relative h-9.5 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white px-4 text-[13px] font-medium whitespace-nowrap text-gray-700 shadow-sm transition-all duration-500 hover:border-staff-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 font-vietnam cursor-pointer"
									>
										{/* Lớp nền màu xanh trượt từ trái sang phải chiếm trọn nút khi hover chuột vào */}
										<span className="absolute inset-y-0 left-0 w-0 bg-staff-primary transition-all duration-500 ease-out group-hover:w-full" />

										{/* Khung nội dung nổi lên trên lớp nền nhờ z-10 */}
										<div className="relative z-10 flex items-center justify-center text-gray-700 transition-colors duration-500 group-hover:text-white">
											<RefreshCw
												className={`mr-2 h-3.5 w-3.5 text-gray-400 transition-transform duration-700 ease-in-out group-hover:text-white ${loading ? "animate-spin" : "group-hover:rotate-180"
													}`}
											/>
											<span className="relative">Làm mới</span>
										</div>
									</button>

								</div>
							</div>
						</CardHeader>

						<CardContent>
							{loading ? (
								<div className="py-16 text-center text-sm text-muted-foreground">Đang tải phiên...</div>
							) : sessions.length === 0 ? (
								<div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm font-vietnam text-muted-foreground">
									Chưa có phiên trải nghiệm trong ngày đã chọn.
								</div>
							) : (
								<div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">

									<Table >
										<TableHeader>
											<TableRow className="bg-[#052962] hover:bg-[#052962] rounded-t-lg">
												<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-[#FFE500] pl-4">THIẾT BỊ</TableHead>
												<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">ĐỊA ĐIỂM</TableHead>
												<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">KHUNG GIỜ</TableHead>
												<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">SLOT</TableHead>
												<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">GIÁ</TableHead>
												<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">TRẠNG THÁI</TableHead>
												<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-[#FFE500] pr-4 text-right">THAO TÁC</TableHead>
											</TableRow>
										</TableHeader>



										<TableBody className="font-vietnam">
											{sessions.map((session) => (
												<TableRow key={session.id} >
													<TableCell className="py-3.5">
														<div className="font-medium">{session.deviceName}</div>
														<div className="text-xs text-muted-foreground">
															Session #{session.id}
														</div>
													</TableCell>

													<TableCell>
														<div className="font-medium">{session.branchName}</div>
														<div className="text-xs text-muted-foreground">
															{session.locationDetail}
														</div>
													</TableCell>

													<TableCell>
														<div className="font-medium">
															{formatTime(session.startTime)} - {formatTime(session.endTime)}
														</div>
														<div className="text-xs text-muted-foreground">
															Khung giờ hoạt động
														</div>
													</TableCell>

													<TableCell>
														<div className="font-medium">
															{session.availableSlots}/{session.maxSlots}
														</div>
														<div className="text-xs text-muted-foreground">
															Slot khả dụng
														</div>
													</TableCell>

													<TableCell>
														<div className="font-medium">
															{formatCurrency(session.pricePerSlot || 0)}
														</div>
														<div className="text-xs text-muted-foreground">
															Giá mỗi slot
														</div>
													</TableCell>

													<TableCell>
														<Badge className="rounded-lg bg-staff-primary px-2.5 py-1 text-white hover:bg-staff-primary/90 shadow-none">
															{SESSION_LABELS[session.status]}
														</Badge>
													</TableCell>

													<TableCell>
														<div className="flex justify-end gap-2">
															<Button
																asChild
																variant="outline"
																size="sm"
																className="rounded-lg"
															>
																<Link href={`/staff/sessions/${session.id}`}>
																	Chi tiết
																</Link>
															</Button>

															{session.status === "OPEN" || session.status === "FULL" ? (
																<Button
																	size="sm"
																	onClick={() =>
																		void handleStatusUpdate(session.id, "CLOSED")
																	}
																	className="rounded-lg bg-white text-black"
																>
																	Đóng
																</Button>
															) : null}

															{session.status !== "CANCELLED" &&
																session.status !== "CLOSED" ? (
																<Button
																	size="sm"
																	variant="destructive"
																	onClick={() =>
																		void handleStatusUpdate(session.id, "CANCELLED")
																	}
																	className="rounded-lg"
																>
																	Hủy
																</Button>
															) : null}
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
