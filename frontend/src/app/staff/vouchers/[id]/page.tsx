"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
import { backofficeApi, type BackofficeVoucher, type BackofficeVoucherStatus } from "@/lib/backofficeApi";
import { formatCurrency, formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, CalendarDays, LayoutGrid, Smartphone, Ticket, ToggleLeft, ToggleRight } from "lucide-react";

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

export default function StaffVoucherDetailPage() {
	const params = useParams<{ id: string }>();
	const voucherId = Number(params.id);
	const [voucher, setVoucher] = useState<BackofficeVoucher | null>(null);
	const [loading, setLoading] = useState(true);

	const loadVoucher = useCallback(async () => {
		try {
			setLoading(true);
			const vouchers = await backofficeApi.getAllVouchers();
			setVoucher(vouchers.find((item) => item.id === voucherId) || null);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải chi tiết voucher."));
		} finally {
			setLoading(false);
		}
	}, [voucherId]);

	useEffect(() => {
		if (!Number.isFinite(voucherId)) {
			setLoading(false);
			return;
		}
		void loadVoucher();
	}, [loadVoucher, voucherId]);

	const handleToggleStatus = async () => {
		if (!voucher || voucher.status === "USED_UP" || voucher.status === "EXPIRED") {
			return;
		}

		const nextStatus: BackofficeVoucherStatus = voucher.status === "DISABLED" ? "ACTIVE" : "DISABLED";
		try {
			await backofficeApi.updateVoucherStatus(voucher.id, nextStatus);
			toast.success(`Đã cập nhật voucher sang ${VOUCHER_LABELS[nextStatus]}.`);
			await loadVoucher();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái voucher."));
		}
	};

	if (loading) {
		return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Đang tải voucher...</div>;
	}

	if (!voucher) {
		return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Không tìm thấy voucher.</div>;
	}

	return (
		<div className="space-y-6">
			{/* 📑 Phân khu 1: Header điều hướng cao cấp */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
				<div>
					<div className="flex flex-wrap items-center gap-2.5">
						<h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">Cấu hình mã ưu đãi</h1>
						<span className="font-mono font-extrabold text-sm md:text-base text-staff-primary bg-violet-50 px-2.5 py-0.5 rounded-lg border border-violet-100/60 shadow-2xs">
							🎟️ {voucher.code}
						</span>
					</div>
					<p className="text-sm text-muted-foreground mt-1.5 font-vietnam">
						Khởi tạo hệ thống lúc {formatDateTime(voucher.createdAt)} • Quản lý điều khoản và trạng thái phát hành.
					</p>
				</div>

				<Button asChild variant="outline" className="h-10 text-xs px-4 font-medium text-gray-600 border-gray-200 bg-white hover:bg-gray-50 transition-colors rounded-lg flex items-center gap-1.5 shrink-0 shadow-2xs">
					<Link href="/staff/vouchers">
						<ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
						Quay lại danh sách
					</Link>
				</Button>
			</div>

			{/* 📊 Phân khu 2: Hệ thống thẻ chỉ số phân tầng (Row 3 cột cân đối) */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

				{/* Card 1: Trạng thái & Thao tác điều khiển */}
				<Card className="overflow-hidden border-gray-100/70 shadow-sm flex flex-col justify-between">
					<CardContent className="p-5 flex items-center justify-between flex-1">
						<div className="space-y-1.5">
							<p className="text-[13px] font-medium text-gray-500 font-vietnam">Trạng thái phát hành</p>
							<div className="pt-0.5">
								<Badge variant={VOUCHER_VARIANTS[voucher.status]} className="font-vietnam font-semibold px-2 py-0.5 text-xs">
									{VOUCHER_LABELS[voucher.status]}
								</Badge>
							</div>
						</div>

						<div className="shrink-0">
							{voucher.status !== "USED_UP" && voucher.status !== "EXPIRED" ? (
								<Button
									onClick={() => void handleToggleStatus()}
									className={`h-9.5 text-xs font-medium px-4 shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${voucher.status === "DISABLED"
										? "bg-staff-primary hover:bg-staff-primary/90 text-white"
										: "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100"
										}`}
								>
									{voucher.status === "DISABLED" ? (
										<>
											<ToggleLeft className="size-4" />
											Kích hoạt mã
										</>
									) : (
										<>
											<ToggleRight className="size-4" />
											Tạm dừng phát hành
										</>
									)}
								</Button>
							) : (
								<span className="text-xs font-medium text-gray-400 italic bg-gray-50 px-2.5 py-1.5 rounded-lg border border-dashed select-none">
									Khóa chỉnh sửa trạng thái
								</span>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Card 2: Giá trị chiết khấu thương mại */}
				<Card className="overflow-hidden border-gray-100/70 shadow-sm">
					<CardContent className="p-5 flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-[13px] font-medium text-gray-500 font-vietnam">Mức giảm doanh thu</p>
							<h3 className="text-2xl font-black tracking-tight text-gray-900">
								{voucher.voucherType === "PERCENTAGE" ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)}
							</h3>
							<p className="text-[11px] text-muted-foreground font-vietnam">
								Đơn tối thiểu: <span className="text-gray-700 font-semibold">{voucher.minOrderValue ? formatCurrency(voucher.minOrderValue) : "0 đ"}</span>
							</p>
						</div>
						<div className="p-3 rounded-xl shrink-0 bg-violet-50 text-violet-600 border border-violet-100/30">
							<Ticket className="size-5" />
						</div>
					</CardContent>
				</Card>

				{/* Card 3: Phân phối & Kiểm soát giới hạn hạn ngạch */}
				<Card className="overflow-hidden border-gray-100/70 shadow-sm">
					<CardContent className="p-5 flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-[13px] font-medium text-gray-500 font-vietnam">Tải lượng phân phối</p>
							<h3 className="text-2xl font-bold tracking-tight text-gray-900">
								<span className="text-staff-primary">{voucher.remainingQuantity}</span>
								<span className="text-gray-300 font-normal mx-1">/</span>
								<span className="text-gray-400 text-lg font-medium">{voucher.totalQuantity}</span>
							</h3>
							<p className="text-[11px] text-muted-foreground font-vietnam">
								Hệ thống ghi nhận đã tiêu dùng <span className="text-slate-900 font-semibold">{voucher.usedQuantity}</span> lượt.
							</p>
						</div>
						<div className="p-3 rounded-xl shrink-0 bg-slate-50 text-slate-500 border border-slate-100">
							<LayoutGrid className="size-5" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* ⚙️ Phân khu 3: Chi tiết phạm vi áp dụng & Điều kiện ràng buộc cấu hình */}
			<Card className="border border-slate-200/80 bg-white shadow-xs rounded-xl overflow-hidden">
				<CardHeader className="p-5 border-b border-slate-50 bg-slate-50/20">
					<CardTitle className="text-base font-semibold text-gray-900 font-vietnam">Phạm vi áp dụng & Khung hiệu lực</CardTitle>
					<CardDescription className="text-xs text-muted-foreground font-vietnam">
						{voucher.description || "Mã giảm giá áp dụng chung, không có mô tả điều khoản đặc biệt đi kèm từ quản trị viên."}
					</CardDescription>
				</CardHeader>

				<CardContent className="p-5 grid gap-5 md:grid-cols-2">

					{/* 📱 Cột trái: Ràng buộc đối tượng sản phẩm */}
					<div className="rounded-xl border border-slate-100 bg-white p-4 flex items-start gap-3.5 shadow-2xs">
						<div className="p-2.5 rounded-lg bg-sky-50 text-sky-600 shrink-0 mt-0.5 border border-sky-100/40">
							<Smartphone className="size-4" />
						</div>
						<div className="space-y-1.5 min-w-0 flex-1">
							<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-vietnam">Thiết bị / Danh mục chỉ định</p>
							<div className="font-semibold text-sm text-gray-800 font-vietnam leading-snug pt-0.5">
								{voucher.applicableDeviceName ? (
									<div className="flex items-center gap-2.5 mt-1 p-1.5 bg-slate-50/80 rounded-lg border border-slate-100 w-fit max-w-full">
										{/* Khung cố định kích thước cho ảnh */}
										<div className="w-8 h-8 rounded-md overflow-hidden border border-slate-200 bg-white shrink-0 flex items-center justify-center">
											<img
												src={voucher.applicableDeviceImage || "/placeholder-device.png"}
												alt={voucher.applicableDeviceName}
												className="w-full h-full object-contain"
												onError={(e) => {
													(e.target as HTMLImageElement).src = "/placeholder-device.png";
												}}
											/>
										</div>
										<span className="text-staff-primary font-semibold font-vietnam text-xs truncate pr-1">
											{voucher.applicableDeviceName}
										</span>
									</div>
								) : voucher.applicableCategoryId ? (
									<span className="text-indigo-600 block mt-1">📦 Áp dụng riêng cho ID Danh mục #{voucher.applicableCategoryId}</span>
								) : (
									<span className="text-emerald-600 block mt-1">🌍 Toàn bộ thiết bị chăm sóc da trên toàn hệ thống</span>
								)}
							</div>
							{voucher.maxDiscount && voucher.voucherType === "PERCENTAGE" && (
								<p className="text-[11px] text-rose-600 font-semibold font-vietnam bg-rose-50 px-2 py-1 rounded-lg border border-rose-100/50 w-fit mt-2 flex items-center gap-1">
									⚠️ Giới hạn giảm tối đa: {formatCurrency(voucher.maxDiscount)}
								</p>
							)}
						</div>
					</div>

					{/* 📅 Cột phải: Khung chu kỳ thời gian cấu hình (ĐÃ SỬA LỖI TRÀN LỊCH) */}
					<div className="rounded-xl border border-slate-100 bg-white p-4 flex items-start gap-3.5 shadow-2xs">
						{/* 💡 SỬA TẠI ĐÂY: Thay Calendar (Component Lịch to) bằng CalendarDays (Chỉ là Icon vẽ nhỏ gọn) */}
						<div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5 border border-emerald-100/40">
							<CalendarDays className="size-4" />
						</div>

						<div className="space-y-2 flex-1 min-w-0">
							<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-vietnam">Khung thời gian hiệu lực</p>

							{/* Hệ thống lưới 2 cột chiếm trọn 100% diện tích bên phải một cách vuông vức */}
							<div className="grid grid-cols-2 gap-2.5 text-xs font-medium text-gray-700 font-vietnam pt-0.5 w-full">
								<div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
									<div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Ngày bắt đầu</div>
									<div className="text-gray-800 font-bold mt-1 text-[11px] md:text-xs tracking-wide">
										{formatDateTime(voucher.startDate)}
									</div>
								</div>

								<div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
									<div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Ngày kết thúc</div>
									<div className="text-gray-800 font-bold mt-1 text-[11px] md:text-xs tracking-wide">
										{formatDateTime(voucher.endDate)}
									</div>
								</div>
							</div>
						</div>
					</div>

				</CardContent>

			</Card>

		</div>


	);
}

