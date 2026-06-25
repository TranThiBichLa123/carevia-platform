"use client";

import Link from "next/link";
import { Loader2, Percent, RefreshCw, Search, Ticket, TicketPercent, WalletCards, ArrowUpDown } from "lucide-react";
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

export default function StaffVouchersPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [devices, setDevices] = useState<StaffDevice[]>([]);
	const [vouchers, setVouchers] = useState<BackofficeVoucher[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	{/* 🌟 STATE MỚI: Quản lý Tìm kiếm và Sắp xếp */ }
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST">("NEWEST");

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

	const activeCount = vouchers.filter((v) => v.status === "ACTIVE").length;
	const disabledCount = vouchers.filter((v) => v.status === "DISABLED").length;
	const expiredCount = vouchers.filter((v) => v.status === "EXPIRED").length;
	const usedUpCount = vouchers.filter((v) => v.status === "USED_UP").length;

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
		{/* Chặn triệt để xử lý nếu voucher không ở trạng thái ACTIVE */ }
		if (voucher.status !== "ACTIVE") return;

		try {
			await backofficeApi.updateVoucherStatus(voucher.id, "DISABLED");
			toast.success(`Đã cập nhật voucher sang Tạm dừng.`);
			await loadInitialData();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái voucher."));
		}
	};

	{/* 🌟 LOGIC MỚI: Xử lý tìm kiếm kết hợp sắp xếp dữ liệu */ }
	const filteredAndSortedVouchers = vouchers
		.filter((voucher) => {
			const search = searchTerm.toLowerCase();
			const matchCode = voucher.code.toLowerCase().includes(search);
			const matchDevice = (voucher.applicableDeviceName || "Toàn hệ thống").toLowerCase().includes(search);
			return matchCode || matchDevice;
		})
		.sort((a, b) => {
			if (sortBy === "NEWEST") return b.id - a.id;
			return a.id - b.id;
		});

	if (!isAuthenticated) {
		return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản staff để quản lý voucher.</div>;
	}

	if (authUser?.role !== "STAFF") {
		return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Bạn không có quyền truy cập màn voucher.</div>;
	}

	return (
		<div className="space-y-6 font-vietnam">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Quản lý voucher</h1>
				<p className="text-sm text-muted-foreground">Tạo mã giảm giá, gán theo thiết bị và theo dõi trạng thái sử dụng.</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card><CardHeader><CardDescription>Đang chạy</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><TicketPercent className="size-6 text-sky-500" />{activeCount}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Tạm dừng</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><WalletCards className="size-6 text-rose-500" />{disabledCount}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Hết hạn</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><Percent className="size-6 text-amber-500" />{expiredCount}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Hết lượt</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><TicketPercent className="size-6 text-indigo-500" />{usedUpCount}</CardTitle></CardHeader></Card>
			</div>

			<div className="flex flex-col lg:flex-row gap-6 w-full items-start">
				{/* Cột trái: Form tạo */}
				<div className="w-full lg:w-[400px] shrink-0">
					<Card className="border border-gray-100 bg-white shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden font-vietnam">
						{/* ĐỒNG BỘ HEADER: Tách nền nhẹ nhàng với border mờ ngăn cách */}
						<CardHeader className="space-y-1.5 pb-6 border-b border-gray-50 bg-gray-50/30 p-5 md:p-6">
							<CardTitle className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
								<Ticket className="h-5 w-5 text-[#173E77]" />
								Tạo voucher mới
							</CardTitle>
							<CardDescription className="text-sm text-gray-500 leading-relaxed">
								Thiết lập nhanh mã khuyến mãi cho booking hoặc mua sắm.
							</CardDescription>
						</CardHeader>

						<CardContent className="p-5 md:p-6 pt-6">
							<form className="space-y-5" onSubmit={handleCreateVoucher}>

								{/* Áp dụng cho thiết bị */}
								<div className="space-y-2">
									<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Thiết bị áp dụng</label>
									{/* Custom Dropdown Hover cho ô Chọn thiết bị */}
									<div className="group/device relative z-60 w-full">
										<div className="flex h-10 cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2 shadow-xs transition-all hover:border-gray-300">
											<span className="whitespace-nowrap text-[13px] font-medium text-gray-700 truncate max-w-[90%]">
												{devices.find((device) => String(device.id) === form.applicableDeviceId)?.name || "Áp dụng cho tất cả thiết bị"}
											</span>
											<svg className="ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover/device:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
											</svg>
										</div>
										<div className="invisible absolute top-full left-0 mt-1.5 w-full max-h-52 overflow-y-auto rounded-xl border border-gray-100 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover/device:visible group-hover/device:opacity-100 p-1">
											<div className="flex flex-col whitespace-nowrap">
												<div
													onClick={() => setForm((current) => ({ ...current, applicableDeviceId: "" }))}
													className={`rounded-lg px-3 py-2.5 text-[13px] transition-colors ${!form.applicableDeviceId ? "bg-gray-50 font-bold text-staff-primary" : "cursor-pointer text-gray-700 hover:bg-gray-50/80"}`}
												>
													Áp dụng cho tất cả thiết bị
												</div>
												{devices.map((device) => (
													<div
														key={device.id}
														onClick={() => setForm((current) => ({ ...current, applicableDeviceId: String(device.id) }))}
														className={`rounded-lg px-3 py-2.5 text-[13px] transition-colors ${form.applicableDeviceId === String(device.id) ? "bg-gray-50 font-bold text-staff-primary" : "cursor-pointer text-gray-700 hover:bg-gray-50/80"}`}
													>
														{device.name}
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
								{/* Mã & Loại giảm */}
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Mã Voucher</label>
										<Input
											placeholder="Ví dụ: SUMMER2026"
											value={form.code}
											onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0 text-gray-700 uppercase"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Loại giảm giá</label>
										{/* Custom Dropdown Hover cho ô Loại giảm */}
										<div className="group/type relative z-50 w-full">
											<div className="flex h-10 cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2 shadow-xs transition-all hover:border-gray-300">
												<span className="whitespace-nowrap text-[13px] font-medium text-gray-700">
													{form.voucherType === "PERCENTAGE" ? "Phần trăm (%)" : form.voucherType === "FIXED_AMOUNT" ? "Tiền mặt (đ)" : "Chọn loại giảm"}
												</span>
												<svg className="ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover/type:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
												</svg>
											</div>
											<div className="invisible absolute top-full left-0 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-100 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover/type:visible group-hover/type:opacity-100 p-1">
												<div className="flex flex-col whitespace-nowrap">
													<div
														onClick={() => setForm((current) => ({ ...current, voucherType: "PERCENTAGE" }))}
														className={`rounded-lg px-3 py-2.5 text-[13px] transition-colors ${form.voucherType === "PERCENTAGE" ? "bg-gray-50 font-bold text-staff-primary" : "cursor-pointer text-gray-700 hover:bg-gray-50/80"}`}
													>
														Phần trăm (%)
													</div>
													<div
														onClick={() => setForm((current) => ({ ...current, voucherType: "FIXED_AMOUNT" }))}
														className={`rounded-lg px-3 py-2.5 text-[13px] transition-colors ${form.voucherType === "FIXED_AMOUNT" ? "bg-gray-50 font-bold text-staff-primary" : "cursor-pointer text-gray-700 hover:bg-gray-50/80"}`}
													>
														Tiền mặt (đ)
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Mô tả */}
								<div className="space-y-2">
									<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Mô tả chương trình</label>
									<Textarea
										placeholder="Nhập nội dung hiển thị của voucher..."
										value={form.description}
										onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
										className="min-h-[80px] bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0 text-gray-700 py-2.5"
									/>
								</div>

								{/* Giá trị giảm & Số lượng */}
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Giá trị giảm</label>
										<Input
											type="number"
											min="0"
											value={form.discountValue}
											onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Số lượng phát hành</label>
										<Input
											type="number"
											min="1"
											value={form.totalQuantity}
											onChange={(event) => setForm((current) => ({ ...current, totalQuantity: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0"
										/>
									</div>
								</div>

								{/* Đơn tối thiểu & Giảm tối đa */}
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Giá trị đơn tối thiểu (đ)</label>
										<Input
											type="number"
											min="0"
											value={form.minOrderValue}
											onChange={(event) => setForm((current) => ({ ...current, minOrderValue: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0"
										/>
									</div>
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Mức giảm tối đa (đ)</label>
										<Input
											type="number"
											min="0"
											value={form.maxDiscount}
											onChange={(event) => setForm((current) => ({ ...current, maxDiscount: event.target.value }))}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0"
										/>
									</div>
								</div>

								{/* Bắt đầu & Kết thúc (Đã sửa lỗi ẩn chữ khi gõ) */}
								<div className="grid gap-4 md:grid-cols-2 font-vietnam">

									{/* THỜI GIAN BẮT ĐẦU */}
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Thời gian bắt đầu</label>
										<Input
											type="date"
											value={form.startDate}
											onChange={(event) =>
												setForm((current) => ({
													...current,
													startDate: event.target.value,
												}))
											}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0 cursor-pointer w-full text-gray-700"
										/>
									</div>

									{/* THỜI GIAN KẾT THÚC */}
									<div className="space-y-2">
										<label className="text-[13px] font-semibold text-gray-700 tracking-wide">Thời gian kết thúc</label>
										<Input
											type="date"
											value={form.endDate}
											onChange={(event) =>
												setForm((current) => ({
													...current,
													endDate: event.target.value,
												}))
											}
											className="h-10 bg-white border border-gray-200 rounded-xl shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-staff-primary/10 focus-visible:border-staff-primary focus-visible:ring-offset-0 cursor-pointer w-full text-gray-700"
										/>
									</div>

								</div>



								<Button
									type="submit"
									disabled={saving}
									className="w-full h-10 px-5 !bg-[#173E77] !text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:!bg-[#052962] hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm cursor-pointer"
								>
									{saving ? (
										<Loader2 className="mr-2 size-4 animate-spin" />
									) : (
										/* Thay bằng icon Ticket từ lucide-react để phù hợp với ngữ cảnh Voucher */
										<Ticket className="mr-2 size-4" />
									)}
									{saving ? "Đang tạo..." : "Tạo voucher"}
								</Button>

							</form>
						</CardContent>
					</Card>
				</div>


				{/* Cột phải: Danh sách */}
				<div className="flex-1 min-w-0 w-full space-y-6">
					<Card className="w-full overflow-hidden border border-gray-100 bg-white shadow-sm rounded-2xl font-vietnam">
						{/* 🌟 HÀNG CHỨA: Ô tìm kiếm, bộ lọc Sort và nút làm mới cùng hàng */}
						<CardHeader className="border-b border-gray-50 bg-gray-50/10 pb-5 p-5 md:p-6">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<CardTitle className="text-lg font-bold text-gray-900 tracking-tight">Danh sách voucher</CardTitle>
									<CardDescription className="text-sm text-gray-500 mt-0.5">{filteredAndSortedVouchers.length} / {vouchers.length} mã tìm thấy.</CardDescription>
								</div>

								{/* Hộp điều khiển tích hợp đồng bộ hàng ngang */}
								<div className="flex flex-wrap items-center gap-2.5">
									{/* Thanh tìm kiếm mã hoặc thiết bị */}
									<div className="relative w-full sm:w-60 md:w-64">
										<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
										<Input
											placeholder="Tìm mã hoặc sản phẩm..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="h-9 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg w-full focus-visible:ring-1 focus-visible:ring-staff-primary"
										/>
									</div>

									{/* Dropdown sắp xếp mới/cũ */}
									<div className="group/sort relative">
										<div className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-2xs hover:border-gray-300">
											<ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
											<span>{sortBy === "NEWEST" ? "Mới nhất" : "Cũ nhất"}</span>
										</div>
										<div className="invisible absolute right-0 top-full mt-1 z-50 w-28 rounded-lg border border-gray-100 bg-white opacity-0 shadow-md transition-all p-1">
											<div onClick={() => setSortBy("NEWEST")} className="rounded-md px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">Mới nhất</div>
											<div onClick={() => setSortBy("OLDEST")} className="rounded-md px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">Cũ nhất</div>
										</div>
									</div>

									{/* Nút làm mới */}
									<button
										type="button"
										onClick={() => void loadInitialData()}
										disabled={loading}
										className="group relative h-9 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white px-4 text-[13px] font-semibold text-gray-700 shadow-2xs hover:border-[#173E77] active:scale-95 disabled:opacity-50 cursor-pointer"
									>
										<span className="absolute inset-y-0 left-0 w-0 bg-[#173E77] transition-all duration-300 group-hover:w-full" />
										<div className="relative z-10 flex items-center justify-center transition-colors group-hover:text-white">
											<RefreshCw className={`mr-1.5 h-3.5 w-3.5 text-gray-400 group-hover:text-white ${loading ? "animate-spin" : ""}`} />
											<span>Làm mới</span>
										</div>
									</button>
								</div>
							</div>
						</CardHeader>

						<CardContent className="p-0">
							{loading ? (
								<div className="py-16 text-center text-sm text-muted-foreground">Đang tải voucher...</div>
							) : (
								<div className="w-full overflow-x-auto">
									<Table className="w-full min-w-[850px]">
										<TableHeader>
											<TableRow className="bg-[#052962] hover:bg-[#052962] border-none">
												<TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-[#FFE500] pl-6 w-[18%]">Mã</TableHead>
												<TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-white/90 w-[18%]">Giảm giá</TableHead>
												<TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-white/90 w-[20%]">Thiết bị áp dụng</TableHead>
												<TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-white/90 w-[20%]">Hiệu lực</TableHead>
												<TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-white/90 w-[10%]">Đã dùng</TableHead>
												<TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-[#FFE500] w-[12%]">Trạng thái</TableHead>
												<TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-white/90 pr-6 text-right w-[16%]">Thao tác</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredAndSortedVouchers.map((voucher) => {
												{/* 🌟 FIX TRẠNG THÁI: Định nghĩa cứng màu nền inline tránh lỗi mất màu */ }
												let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
												if (voucher.status === "DISABLED") badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
												if (voucher.status === "EXPIRED") badgeStyle = "bg-gray-100 text-gray-600 border-gray-300";
												if (voucher.status === "USED_UP") badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";

												return (
													<TableRow key={voucher.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0">
														<TableCell className="pl-6 py-3.5">
															<div className="font-bold text-gray-900">{voucher.code}</div>
															<div className="text-xs text-gray-400 font-medium mt-0.5 truncate max-w-[150px]">{voucher.description || "Không có mô tả"}</div>
														</TableCell>
														<TableCell className="py-3.5">
															<div className="font-semibold text-gray-800">
																{voucher.voucherType === "PERCENTAGE" ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)}
															</div>
															<div className="text-xs text-gray-400 font-medium mt-0.5">Đơn tối thiểu {formatCurrency(voucher.minOrderValue || 0)}</div>
														</TableCell>
														<TableCell className="py-3.5 font-medium text-gray-600 text-[13px] truncate max-w-[150px]">{voucher.applicableDeviceName || "Toàn hệ thống"}</TableCell>
														<TableCell className="py-3.5 text-xs font-medium text-gray-600 space-y-0.5">
															<div>Từ {formatDateTime(voucher.startDate)}</div>
															<div>Đến {formatDateTime(voucher.endDate)}</div>
														</TableCell>
														<TableCell className="py-3.5 font-semibold text-gray-700 text-[13px]">{voucher.usedQuantity}/{voucher.totalQuantity}</TableCell>

														{/* 🌟 HIỂN THỊ CỘT TRẠNG THÁI CHUẨN CSS */}
														<TableCell className="py-3.5">
															<span className={`inline-flex items-center font-bold uppercase tracking-wide text-[10px] px-2 py-0.5 rounded-md border ${badgeStyle}`}>
																{VOUCHER_LABELS[voucher.status]}
															</span>
														</TableCell>

														{/* 🌟 KHÓA NÚT KÍCH HOẠT SANG MÀU XÁM */}
														<TableCell className="pr-6 py-3.5 text-right">
															<div className="flex justify-end gap-2">
																<Button asChild variant="outline" size="sm" className="h-8 px-3 rounded-lg border-gray-200 text-gray-700 text-xs font-semibold cursor-pointer">
																	<Link href={`/staff/vouchers/${voucher.id}`}>Chi tiết</Link>
																</Button>
																{voucher.status === "ACTIVE" ? (
																	<Button
																		size="sm"
																		onClick={() => void handleToggleStatus(voucher)}
																		className="h-8 px-3 rounded-lg font-semibold text-xs shadow-xs transition-all duration-200 cursor-pointer !bg-[#173E77] !text-white hover:!bg-[#052962]"
																	>
																		Tạm dừng
																	</Button>
																) : (
																	<Button
																		disabled
																		size="sm"
																		className="h-8 px-3 rounded-lg font-semibold text-xs border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed select-none shadow-none"
																	>
																		Kích hoạt
																	</Button>
																)}
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
				</div>
			</div>
		</div>
	);
}