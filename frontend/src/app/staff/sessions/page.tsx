"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
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
} from "@/lib/backofficeApi";
import { deviceApi, type DeviceData } from "@/lib/deviceApi";
import { useUserStore } from "@/lib/store";
import {
	formatCurrency,
	formatDate,
	formatTime,
	getBackofficeErrorMessage,
	getTodayInputValue,
} from "@/lib/backofficeUtils";

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

export default function StaffSessionsPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [devices, setDevices] = useState<DeviceData[]>([]);
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

	const loadDevices = useCallback(async () => {
		try {
			const response = await deviceApi.getAll({ page: 0, size: 100 });
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

		try {
			setSaving(true);
			await backofficeApi.createSession({
				deviceId: Number(form.deviceId),
				branchName: form.branchName,
				locationDetail: form.locationDetail,
				sessionDate: form.sessionDate,
				startTime: form.startTime,
				endTime: form.endTime,
				maxSlots: Number(form.maxSlots),
				pricePerSlot: Number(form.pricePerSlot),
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

	if (authUser && !["STAFF", "ADMIN"].includes(authUser.role)) {
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
					<p className="text-sm text-muted-foreground">
						Staff tạo các phiên ở đây để khách nhìn thấy lịch và đặt booking ở phía client.
					</p>
				</div>
				<Badge variant="outline" className="w-fit">Nguồn lịch cho khách đặt hẹn</Badge>
			</div>

			<Card className="border-l-4 border-l-emerald-600 bg-emerald-50/40">
				<CardContent className="py-4 text-sm text-muted-foreground">
					Mỗi phiên bạn tạo sẽ xuất hiện trực tiếp trong màn khách chọn lịch tại trang booking của thiết bị tương ứng. Nếu không có phiên đang mở, khách sẽ không chọn được giờ hẹn.
				</CardContent>
			</Card>

			<div className="grid gap-6 xl:grid-cols-[1.15fr_2fr]">
				<Card>
					<CardHeader>
						<CardTitle>Tạo phiên mới</CardTitle>
						<CardDescription>Thiết lập khung giờ, chi nhánh và số slot để khách có lịch hẹn để chọn.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleCreateSession}>
							<div className="space-y-2">
								<label className="text-sm font-medium">Thiết bị</label>
								<Select value={form.deviceId} onValueChange={(value) => setForm((current) => ({ ...current, deviceId: value }))}>
									<SelectTrigger className="w-full bg-white">
										<SelectValue placeholder="Chọn thiết bị" />
									</SelectTrigger>
									<SelectContent>
										{devices.map((device) => (
											<SelectItem key={device.id} value={String(device.id)}>
												{device.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<label className="text-sm font-medium">Chi nhánh</label>
									<Input value={form.branchName} onChange={(event) => setForm((current) => ({ ...current, branchName: event.target.value }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Vị trí</label>
									<Input value={form.locationDetail} onChange={(event) => setForm((current) => ({ ...current, locationDetail: event.target.value }))} />
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-3">
								<div className="space-y-2">
									<label className="text-sm font-medium">Ngày</label>
									<Input type="date" value={form.sessionDate} onChange={(event) => setForm((current) => ({ ...current, sessionDate: event.target.value }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Bắt đầu</label>
									<Input type="time" value={form.startTime} onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Kết thúc</label>
									<Input type="time" value={form.endTime} onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))} />
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<label className="text-sm font-medium">Số slot</label>
									<Input type="number" min="1" value={form.maxSlots} onChange={(event) => setForm((current) => ({ ...current, maxSlots: event.target.value }))} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Giá/slot</label>
									<Input type="number" min="0" value={form.pricePerSlot} onChange={(event) => setForm((current) => ({ ...current, pricePerSlot: event.target.value }))} />
								</div>
							</div>

							<Button className="w-full" type="submit" disabled={saving}>
								{saving ? "Đang tạo..." : "Tạo phiên trải nghiệm"}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						<Card><CardHeader><CardDescription>Đang mở</CardDescription><CardTitle className="text-3xl">{openSessions}</CardTitle></CardHeader></Card>
						<Card><CardHeader><CardDescription>Đã đầy</CardDescription><CardTitle className="text-3xl">{fullSessions}</CardTitle></CardHeader></Card>
						<Card><CardHeader><CardDescription>Đã đóng</CardDescription><CardTitle className="text-3xl">{closedSessions}</CardTitle></CardHeader></Card>
						<Card><CardHeader><CardDescription>Đã hủy</CardDescription><CardTitle className="text-3xl">{cancelledSessions}</CardTitle></CardHeader></Card>
					</div>

					<Card>
						<CardHeader>
							<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
								<div>
									<CardTitle>Phiên theo ngày</CardTitle>
									<CardDescription>Ngày {formatDate(selectedDate)}</CardDescription>
								</div>
								<div className="flex gap-3">
									<Input className="w-full bg-white md:w-44" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
									<Button variant="outline" onClick={() => void loadSessions()} disabled={loading}>
										<RefreshCw className={loading ? "animate-spin" : ""} />
										Làm mới
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="py-16 text-center text-sm text-muted-foreground">Đang tải phiên...</div>
							) : sessions.length === 0 ? (
								<div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
									Chưa có phiên trải nghiệm trong ngày đã chọn.
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Thiết bị</TableHead>
											<TableHead>Địa điểm</TableHead>
											<TableHead>Khung giờ</TableHead>
											<TableHead>Slot</TableHead>
											<TableHead>Giá</TableHead>
											<TableHead>Trạng thái</TableHead>
											<TableHead className="text-right">Thao tác</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{sessions.map((session) => (
											<TableRow key={session.id}>
												<TableCell>
													<div className="font-medium">{session.deviceName}</div>
													<div className="text-xs text-muted-foreground">Session #{session.id}</div>
												</TableCell>
												<TableCell>
													<div className="font-medium">{session.branchName}</div>
													<div className="text-xs text-muted-foreground">{session.locationDetail}</div>
												</TableCell>
												<TableCell>
													{formatTime(session.startTime)} - {formatTime(session.endTime)}
												</TableCell>
												<TableCell>{session.availableSlots}/{session.maxSlots}</TableCell>
												<TableCell>{formatCurrency(session.pricePerSlot || 0)}</TableCell>
												<TableCell><Badge variant={SESSION_VARIANTS[session.status]}>{SESSION_LABELS[session.status]}</Badge></TableCell>
												<TableCell>
													<div className="flex justify-end gap-2">
														<Button asChild variant="outline" size="sm">
															<Link href={`/staff/sessions/${session.id}`}>Chi tiết</Link>
														</Button>
														{session.status === "OPEN" || session.status === "FULL" ? (
															<Button size="sm" onClick={() => void handleStatusUpdate(session.id, "CLOSED")}>Đóng</Button>
														) : null}
														{session.status !== "CANCELLED" && session.status !== "CLOSED" ? (
															<Button size="sm" variant="destructive" onClick={() => void handleStatusUpdate(session.id, "CANCELLED")}>Hủy</Button>
														) : null}
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
