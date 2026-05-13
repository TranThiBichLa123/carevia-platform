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
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Voucher {voucher.code}</h1>
					<p className="text-sm text-muted-foreground">Tạo lúc {formatDateTime(voucher.createdAt)}</p>
				</div>
				<Button asChild variant="outline"><Link href="/staff/vouchers">Quay lại danh sách</Link></Button>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<Card>
					<CardHeader><CardDescription>Trạng thái</CardDescription><CardTitle><Badge variant={VOUCHER_VARIANTS[voucher.status]}>{VOUCHER_LABELS[voucher.status]}</Badge></CardTitle></CardHeader>
					<CardContent>
						{voucher.status !== "USED_UP" && voucher.status !== "EXPIRED" ? (
							<Button onClick={() => void handleToggleStatus()}>{voucher.status === "DISABLED" ? "Kích hoạt" : "Tạm dừng"}</Button>
						) : null}
					</CardContent>
				</Card>
				<Card>
					<CardHeader><CardDescription>Giá trị giảm</CardDescription><CardTitle>{voucher.voucherType === "PERCENTAGE" ? `${voucher.discountValue}%` : formatCurrency(voucher.discountValue)}</CardTitle></CardHeader>
					<CardContent className="text-sm text-muted-foreground">Giảm tối đa: {formatCurrency(voucher.maxDiscount || 0)}</CardContent>
				</Card>
				<Card>
					<CardHeader><CardDescription>Số lượng</CardDescription><CardTitle>{voucher.remainingQuantity}/{voucher.totalQuantity}</CardTitle></CardHeader>
					<CardContent className="text-sm text-muted-foreground">Đã dùng {voucher.usedQuantity} lượt</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader><CardTitle>Phạm vi áp dụng</CardTitle><CardDescription>{voucher.description || "Không có mô tả"}</CardDescription></CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="rounded-2xl border p-4">
						<p className="text-sm text-muted-foreground">Thiết bị</p>
						<p className="mt-2 font-medium">{voucher.applicableDeviceName || "Toàn bộ thiết bị"}</p>
					</div>
					<div className="rounded-2xl border p-4">
						<p className="text-sm text-muted-foreground">Hiệu lực</p>
						<p className="mt-2 font-medium">Từ {formatDateTime(voucher.startDate)}</p>
						<p className="text-sm text-muted-foreground">Đến {formatDateTime(voucher.endDate)}</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
