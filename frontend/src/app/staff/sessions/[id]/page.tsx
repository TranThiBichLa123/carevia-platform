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
import { backofficeApi, type BackofficeSession, type BackofficeSessionStatus } from "@/lib/backofficeApi";
import { formatCurrency, formatDate, formatTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { ArrowLeft, Cpu, Clock, ShieldAlert, MapPin, BarChart3, User, CircleX, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// Đồng bộ cấu trúc Badge trạng thái tinh tế như đã chỉnh sửa ở các bước trước
const SESSION_CONFIGS: Record<BackofficeSessionStatus, { label: string; className: string }> = {
	OPEN: { label: "Đang mở", className: "bg-emerald-50 border-emerald-100 text-emerald-700" },
	CLOSED: { label: "Đã đóng", className: "bg-gray-50 border-gray-100 text-gray-600" },
	FULL: { label: "Đã đầy", className: "bg-blue-50 border-blue-100 text-blue-700" },
	CANCELLED: { label: "Đã hủy", className: "bg-rose-50 border-rose-100 text-rose-700" },
};

export default function StaffSessionDetailPage() {
	const params = useParams<{ id: string }>();
	const sessionId = Number(params.id);
	const [session, setSession] = useState<BackofficeSession | null>(null);
	const [loading, setLoading] = useState(true);

	const loadSession = useCallback(async () => {
		try {
			setLoading(true);
			setSession(await backofficeApi.getSessionById(sessionId));
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải chi tiết phiên."));
		} finally {
			setLoading(false);
		}
	}, [sessionId]);

	useEffect(() => {
		if (!Number.isFinite(sessionId)) {
			setLoading(false);
			return;
		}
		void loadSession();
	}, [loadSession, sessionId]);

	const handleStatusUpdate = async (status: "CLOSED" | "CANCELLED") => {
		try {
			await backofficeApi.updateSessionStatus(sessionId, status);
			toast.success(`Đã cập nhật phiên sang ${SESSION_CONFIGS[status].label}.`);
			await loadSession();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái phiên."));
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center gap-2 font-vietnam text-muted-foreground">
				<div className="h-6 w-6 animate-spin rounded-full border-2 border-staff-primary border-t-transparent" />
				<span className="text-sm font-medium">Đang tải thông tin phiên...</span>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="flex min-h-[400px] flex-col items-center justify-center gap-3 font-vietnam text-center">
				<ShieldAlert className="h-10 w-10 text-rose-500 animate-bounce" />
				<div className="text-base font-semibold text-gray-900">Không tìm thấy phiên trải nghiệm.</div>
				<Button asChild variant="outline" className="rounded-xl mt-2">
					<Link href="/staff/sessions">Quay lại danh sách</Link>
				</Button>
			</div>
		);
	}

	const currentStatus = SESSION_CONFIGS[session.status] || { label: session.status, className: "bg-gray-50 text-gray-600" };

	return (
		<div className="space-y-6 font-vietnam p-1 md:p-2">
			{/* HEADER TRANG TIÊU ĐỀ */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
				<div>
					<div className="flex items-center gap-3 flex-wrap">
						<h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Chi tiết phiên #{session.id}</h1>
						<span className={cn(
							"inline-flex items-center justify-center px-3 py-1 rounded-md text-[10.5px] font-bold border uppercase tracking-wider shadow-xs leading-normal",
							currentStatus.className
						)}>
							{currentStatus.label}
						</span>
					</div>
					<p className="text-sm text-gray-500 mt-1.5 font-medium flex items-center gap-1.5">
						<Cpu className="h-4 w-4 text-gray-400" /> {session.deviceName} 
						<span className="text-gray-300">•</span> 
						<Clock className="h-4 w-4 text-gray-400" /> {formatDate(session.sessionDate)}
					</p>
				</div>
				
				{/* NÚT QUAY LẠI - Đồng bộ style nâng nhẹ phản hồi cơ học */}
				<Button asChild variant="outline" className="h-10 px-4 rounded-xl border-gray-200 text-gray-700 shadow-xs hover:bg-gray-50 hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 self-start sm:self-auto cursor-pointer">
					<Link href="/staff/sessions" className="flex items-center gap-2 font-semibold text-sm">
						<ArrowLeft className="h-4 w-4 shrink-0" />
						Quay lại danh sách
					</Link>
				</Button>
			</div>

			{/* 3 CÁI CARD THỐNG KÊ TỔNG QUAN HÀNG TRÊN */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* CARD 1: THIẾT BỊ */}
				<Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden transition-all hover:shadow-md">
					<CardHeader className="p-5 space-y-0">
						<CardDescription className="text-[13px] font-medium text-gray-400 text-left">Thiết bị vận hành</CardDescription>
						<div className="flex items-center gap-3 mt-2.5">
							<Cpu className="size-5 text-sky-500 shrink-0" />
							<CardTitle className="text-xl font-bold text-gray-900 tracking-tight leading-none truncate max-w-[200px] md:max-w-none">{session.deviceName}</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="px-5 pb-5 pt-0 text-xs text-gray-400 font-medium">
						Mã định danh: Device #{session.deviceId}
					</CardContent>
				</Card>

				{/* CARD 2: THỜI GIAN */}
				<Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden transition-all hover:shadow-md">
					<CardHeader className="p-5 space-y-0">
						<CardDescription className="text-[13px] font-medium text-gray-400 text-left">Khung giờ trải nghiệm</CardDescription>
						<div className="flex items-center gap-3 mt-2.5">
							<Clock className="size-5 text-emerald-500 shrink-0" />
							<CardTitle className="text-xl font-bold text-gray-900 tracking-tight leading-none">{formatTime(session.startTime)} - {formatTime(session.endTime)}</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="px-5 pb-5 pt-0 text-xs text-gray-400 font-medium">
						Ngày áp dụng: {formatDate(session.sessionDate)}
					</CardContent>
				</Card>

				{/* CARD 3: THAO TÁC NHANH TRẠNG THÁI */}
				<Card className="border border-gray-100 bg-white shadow-xs rounded-2xl overflow-hidden transition-all hover:shadow-md md:col-span-2 lg:col-span-1">
					<CardHeader className="p-5 space-y-0">
						<CardDescription className="text-[13px] font-medium text-gray-400 text-left">Hành động điều phối</CardDescription>
						<div className="flex flex-wrap gap-2 mt-3 items-center">
							{session.status === "OPEN" || session.status === "FULL" ? (
								<Button 
									onClick={() => void handleStatusUpdate("CLOSED")}
									className="h-9 px-4 !bg-[#173E77] !text-white font-semibold text-xs rounded-xl shadow-xs transition-all duration-200 hover:!bg-[#052962] hover:-translate-y-[1px] active:translate-y-0 cursor-pointer flex items-center gap-1.5"
								>
									<Lock className="size-3.5" />
									Đóng phiên
								</Button>
							) : null}
							
							{session.status !== "CANCELLED" && session.status !== "CLOSED" ? (
								<Button 
									variant="destructive" 
									onClick={() => void handleStatusUpdate("CANCELLED")}
									className="h-9 px-4 font-semibold text-xs rounded-xl shadow-xs transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 cursor-pointer flex items-center gap-1.5"
								>
									<CircleX className="size-3.5" />
									Hủy phiên
								</Button>
							) : (
								<span className="text-xs font-semibold text-gray-400 italic">Không có hành động khả dụng</span>
							)}
						</div>
					</CardHeader>
					<CardContent className="px-5 pb-5 pt-0 text-xs text-gray-400 font-medium">
						Cập nhật trực tiếp lên hệ thống client
					</CardContent>
				</Card>
			</div>

			{/* KHỐI THÔNG TIN VẬN HÀNH CHI TIẾT */}
			<Card className="border border-gray-100 bg-white shadow-xl shadow-gray-100/50 rounded-2xl overflow-hidden">
				<CardHeader className="space-y-1.5 pb-5 border-b border-gray-50 bg-gray-50/30 p-5 md:p-6">
					<CardTitle className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
						<BarChart3 className="h-5 w-5 text-staff-primary" />
						Thông tin vận hành chi tiết
					</CardTitle>
				</CardHeader>
				
				<CardContent className="grid gap-5 md:grid-cols-2 p-5 md:p-6">
					{/* Ô ĐỊA ĐIỂM */}
					<div className="rounded-xl border border-gray-100 bg-gray-50/20 p-5 space-y-3 transition-all hover:border-gray-200">
						<div className="flex items-center gap-2 text-gray-400">
							<MapPin className="h-4 w-4 text-sky-500" />
							<span className="text-[12.5px] font-semibold uppercase tracking-wider">Địa điểm phân phối</span>
						</div>
						<div className="space-y-1">
							<p className="text-base font-bold text-gray-900">{session.branchName}</p>
							<p className="text-sm font-medium text-gray-500 leading-relaxed">{session.locationDetail}</p>
						</div>
					</div>

					{/* Ô CÔNG SUẤT & GIÁ */}
					<div className="rounded-xl border border-gray-100 bg-gray-50/20 p-5 space-y-3 transition-all hover:border-gray-200">
						<div className="flex items-center gap-2 text-gray-400">
							<BarChart3 className="h-4 w-4 text-emerald-500" />
							<span className="text-[12.5px] font-semibold uppercase tracking-wider">Công suất & Giá vé</span>
						</div>
						<div className="space-y-1.5">
							<p className="text-base font-bold text-gray-900 flex items-center gap-1.5">
								{session.availableSlots}/{session.maxSlots}
								<span className="text-sm font-medium text-gray-500">slot còn khả dụng</span>
							Giá mỗi slot: {formatCurrency(session.pricePerSlot || 0)}{/* Ô TÀI KHOẢN PHỤ TRÁCH (BỔ SUNG THEO TIÊU CHUẨN AUDIT LOG) */}{session.staffId && (`Nhân sự quản lý: ${session.staffName || "Staff User"} (Mã nhân viên: #${session.staffId})`)};
							</p>
						</div>
					</div>
				</CardContent>
				{/* CÓ THỂ BỔ SUNG THÊM CÁC CARD CHI TIẾT KHÁC Ở ĐÂY */}
				{/* Ví dụ: Card thống kê số lượng slot đã đặt, danh sách khách hàng đã đăng ký, lịch sử thay đổi trạng thái phiên, v.v. */}
			</Card>
		</div>
	);
}