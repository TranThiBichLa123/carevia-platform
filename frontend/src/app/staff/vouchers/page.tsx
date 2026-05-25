"use client";

import Link from "next/link";
import { Percent, RefreshCw, TicketPercent, WalletCards } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
	backofficeApi,
	type BackofficeVoucher,
	type BackofficeVoucherStatus,
	type BackofficeVoucherType,
	type StaffDevice,
} from "@/lib/backofficeApi";
import { useUserStore } from "@/lib/store";
import {
	formatCurrency,
	formatDateTime,
	getBackofficeErrorMessage,
	toIsoDateTime,
} from "@/lib/backofficeUtils";

const VOUCHER_LABELS: Record<BackofficeVoucherStatus, string> = {
	ACTIVE: "Đang chạy",
	EXPIRED: "Hết hạn",
	USED_UP: "Hết lượt",
	DISABLED: "Tạm dừng",
};

const VOUCHER_VARIANTS: Record<BackofficeVoucherStatus, "default" | "secondary" | "destructive" | "outline"> = {
	ACTIVE: "default",
	EXPIRED: "outline",
	USED_UP: "secondary",
	DISABLED: "destructive",
};

export default function StaffVouchersPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [devices, setDevices] = useState<StaffDevice[]>([]);
	const [vouchers, setVouchers] = useState<BackofficeVoucher[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		code: "",
		description: "",
		voucherType: "PERCENTAGE" as BackofficeVoucherType,
		discountValue: "10",
		minOrderValue: "0",
		maxDiscount: "0",
		totalQuantity: "50",
		startDate: "",
		endDate: "",
		applicableDeviceId: "",
	});

	const loadInitialData = useCallback(async () => {
		try {
			setLoading(true);
			const [voucherData, deviceData] = await Promise.all([
				backofficeApi.getAllVouchers(),
				backofficeApi.getStaffDevices({ page: 0, size: 100 }),
			]);
			setVouchers(voucherData);
			setDevices(deviceData.items || []);
			setForm((current) => ({
				...current,
				applicableDeviceId: current.applicableDeviceId || String(deviceData.items?.[0]?.id || ""),
			}));
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải dữ liệu voucher."));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!isAuthenticated) {
			setLoading(false);
			return;
		}

		void loadInitialData();
	}, [isAuthenticated, loadInitialData]);

	const activeCount = vouchers.filter((voucher) => voucher.status === "ACTIVE").length;
	const disabledCount = vouchers.filter((voucher) => voucher.status === "DISABLED").length;
	const expiredCount = vouchers.filter((voucher) => voucher.status === "EXPIRED").length;
	const usedUpCount = vouchers.filter((voucher) => voucher.status === "USED_UP").length;

	const handleCreateVoucher = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!form.startDate || !form.endDate) {
			toast.error("Chọn thời gian bắt đầu và kết thúc cho voucher.");
			return;
		}

		if (!form.applicableDeviceId) {
			toast.error("Chọn thiết bị thuộc brand của bạn để tạo voucher.");
			return;
		}

		try {
			setSaving(true);
			await backofficeApi.createVoucher({
				code: form.code.trim().toUpperCase(),
				description: form.description.trim() || undefined,
				voucherType: form.voucherType,
				discountValue: Number(form.discountValue),
				minOrderValue: Number(form.minOrderValue) || undefined,
				maxDiscount: Number(form.maxDiscount) || undefined,
				totalQuantity: Number(form.totalQuantity),
				startDate: toIsoDateTime(form.startDate),
				endDate: toIsoDateTime(form.endDate),
				applicableDeviceId: Number(form.applicableDeviceId),
			});
			toast.success("Đã tạo voucher mới.");
			setForm((current) => ({ ...current, code: "", description: "" }));
			await loadInitialData();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tạo voucher."));
		} finally {
			setSaving(false);
		}
	};

	const handleToggleStatus = async (voucher: BackofficeVoucher) => {
		const nextStatus: BackofficeVoucherStatus =
			voucher.status === "DISABLED" ? "ACTIVE" : "DISABLED";

		try {
			await backofficeApi.updateVoucherStatus(voucher.id, nextStatus);
			toast.success(`Đã cập nhật voucher sang ${VOUCHER_LABELS[nextStatus]}.`);
			await loadInitialData();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái voucher."));
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
				Đăng nhập bằng tài khoản staff để quản lý voucher.
			</div>
		);
	}

	if (authUser?.role !== "STAFF") {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
				Bạn không có quyền truy cập màn voucher.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Quản lý voucher</h1>
				<p className="text-sm text-muted-foreground">
					Tạo mã giảm giá, gán theo thiết bị và theo dõi trạng thái sử dụng.
				</p>
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.1fr_2fr]">
				<Card>
					<CardHeader>
						<CardTitle>Tạo voucher mới</CardTitle>
						<CardDescription>Thiết lập nhanh mã khuyến mãi cho booking hoặc mua sắm.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="space-y-4" onSubmit={handleCreateVoucher}>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2"><label className="text-sm font-medium">Mã</label><Input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} /></div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Loại giảm</label>
									<Select value={form.voucherType} onValueChange={(value) => setForm((current) => ({ ...current, voucherType: value as BackofficeVoucherType }))}>
										<SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
										<SelectContent>
											<SelectItem value="PERCENTAGE">Phần trăm</SelectItem>
											<SelectItem value="FIXED_AMOUNT">Tiền mặt</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="space-y-2"><label className="text-sm font-medium">Mô tả</label><Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2"><label className="text-sm font-medium">Giá trị giảm</label><Input type="number" min="0" value={form.discountValue} onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))} /></div>
								<div className="space-y-2"><label className="text-sm font-medium">Số lượng</label><Input type="number" min="1" value={form.totalQuantity} onChange={(event) => setForm((current) => ({ ...current, totalQuantity: event.target.value }))} /></div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2"><label className="text-sm font-medium">Đơn tối thiểu</label><Input type="number" min="0" value={form.minOrderValue} onChange={(event) => setForm((current) => ({ ...current, minOrderValue: event.target.value }))} /></div>
								<div className="space-y-2"><label className="text-sm font-medium">Giảm tối đa</label><Input type="number" min="0" value={form.maxDiscount} onChange={(event) => setForm((current) => ({ ...current, maxDiscount: event.target.value }))} /></div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2"><label className="text-sm font-medium">Bắt đầu</label><Input type="datetime-local" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} /></div>
								<div className="space-y-2"><label className="text-sm font-medium">Kết thúc</label><Input type="datetime-local" value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} /></div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium">Áp dụng cho thiết bị</label>
								<Select value={form.applicableDeviceId} onValueChange={(value) => setForm((current) => ({ ...current, applicableDeviceId: value }))}>
									<SelectTrigger className="w-full bg-white"><SelectValue /></SelectTrigger>
									<SelectContent>
										{devices.map((device) => (
											<SelectItem key={device.id} value={String(device.id)}>{device.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Button className="w-full" type="submit" disabled={saving}>{saving ? "Đang tạo..." : "Tạo voucher"}</Button>
						</form>
					</CardContent>
				</Card>

				<div className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						<Card><CardHeader><CardDescription>Đang chạy</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><TicketPercent className="size-6 text-sky-500" />{activeCount}</CardTitle></CardHeader></Card>
						<Card><CardHeader><CardDescription>Tạm dừng</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><WalletCards className="size-6 text-rose-500" />{disabledCount}</CardTitle></CardHeader></Card>
						<Card><CardHeader><CardDescription>Hết hạn</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><Percent className="size-6 text-amber-500" />{expiredCount}</CardTitle></CardHeader></Card>
						<Card><CardHeader><CardDescription>Hết lượt</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><TicketPercent className="size-6 text-indigo-500" />{usedUpCount}</CardTitle></CardHeader></Card>
					</div>

					<Card>
						<CardHeader>
							<div className="flex items-center justify-between gap-3">
								<div>
									<CardTitle>Danh sách voucher</CardTitle>
									<CardDescription>{vouchers.length} voucher hiện có.</CardDescription>
								</div>
								<Button variant="outline" onClick={() => void loadInitialData()} disabled={loading}>
									<RefreshCw className={loading ? "animate-spin" : ""} />
									Làm mới
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="py-16 text-center text-sm text-muted-foreground">Đang tải voucher...</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Mã</TableHead>
											<TableHead>Giảm giá</TableHead>
											<TableHead>Thiết bị áp dụng</TableHead>
											<TableHead>Hiệu lực</TableHead>
											<TableHead>Số lượng</TableHead>
											<TableHead>Trạng thái</TableHead>
											<TableHead className="text-right">Thao tác</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{vouchers.map((voucher) => (
											<TableRow key={voucher.id}>
												<TableCell>
													<div className="font-medium">{voucher.code}</div>
													<div className="text-xs text-muted-foreground">{voucher.description || "Không có mô tả"}</div>
												</TableCell>
												<TableCell>
													<div className="font-medium">
														{voucher.voucherType === "PERCENTAGE"
															? `${voucher.discountValue}%`
															: formatCurrency(voucher.discountValue)}
													</div>
													<div className="text-xs text-muted-foreground">Đơn tối thiểu {formatCurrency(voucher.minOrderValue || 0)}</div>
												</TableCell>
												<TableCell>{voucher.applicableDeviceName || "Toàn hệ thống"}</TableCell>
												<TableCell>
													<div className="text-xs text-muted-foreground">Từ {formatDateTime(voucher.startDate)}</div>
													<div className="text-xs text-muted-foreground">Đến {formatDateTime(voucher.endDate)}</div>
												</TableCell>
												<TableCell>{voucher.usedQuantity}/{voucher.totalQuantity}</TableCell>
												<TableCell><Badge variant={VOUCHER_VARIANTS[voucher.status]}>{VOUCHER_LABELS[voucher.status]}</Badge></TableCell>
												<TableCell>
													<div className="flex justify-end gap-2">
														<Button asChild variant="outline" size="sm"><Link href={`/staff/vouchers/${voucher.id}`}>Chi tiết</Link></Button>
														{voucher.status !== "USED_UP" && voucher.status !== "EXPIRED" ? (
															<Button size="sm" onClick={() => void handleToggleStatus(voucher)}>
																{voucher.status === "DISABLED" ? "Kích hoạt" : "Tạm dừng"}
															</Button>
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
