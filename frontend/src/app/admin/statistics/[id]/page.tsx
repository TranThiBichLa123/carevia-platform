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
import { deviceApi, reviewApi, type DeviceData, type ReviewData } from "@/lib/deviceApi";
import { formatCurrency, formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";

export default function AdminStatisticsDetailPage() {
	const params = useParams<{ id: string }>();
	const deviceId = Number(params.id);
	const [device, setDevice] = useState<DeviceData | null>(null);
	const [similarDevices, setSimilarDevices] = useState<DeviceData[]>([]);
	const [reviews, setReviews] = useState<ReviewData[]>([]);
	const [loading, setLoading] = useState(true);

	const loadDeviceStats = useCallback(async () => {
		try {
			setLoading(true);
			const [deviceData, similarData, reviewData] = await Promise.all([
				deviceApi.getById(deviceId),
				deviceApi.getSimilar(deviceId, 4),
				reviewApi.getByDevice(deviceId, { page: 0, size: 5 }),
			]);
			setDevice(deviceData);
			setSimilarDevices(similarData);
			setReviews(reviewData.items || []);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải chi tiết thiết bị thống kê."));
		} finally {
			setLoading(false);
		}
	}, [deviceId]);

	useEffect(() => {
		if (!Number.isFinite(deviceId)) {
			setLoading(false);
			return;
		}
		void loadDeviceStats();
	}, [deviceId, loadDeviceStats]);

	if (loading) {
		return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Đang tải dữ liệu thiết bị...</div>;
	}

	if (!device) {
		return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Không tìm thấy thiết bị cần xem thống kê.</div>;
	}

	return (
		<div className="space-y-6 px-4 py-6 md:px-8">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{device.name}</h1>
					<p className="text-sm text-muted-foreground">Báo cáo chi tiết thiết bị theo dữ liệu quan tâm và bán hàng.</p>
				</div>
				<Button asChild variant="outline"><Link href="/admin/statistics">Quay lại thống kê</Link></Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card><CardHeader><CardDescription>Giá bán</CardDescription><CardTitle className="text-3xl">{formatCurrency(device.price)}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Lượt xem</CardDescription><CardTitle className="text-3xl">{device.viewCount}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Đã bán</CardDescription><CardTitle className="text-3xl">{device.sold}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Đánh giá</CardDescription><CardTitle className="text-3xl">{device.averageRating.toFixed(1)}</CardTitle></CardHeader></Card>
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
				<Card>
					<CardHeader>
						<CardTitle>Thông tin thương mại</CardTitle>
						<CardDescription>{device.description}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap gap-2">
							<Badge variant="outline">{device.status}</Badge>
							{device.skinType ? <Badge variant="outline">{device.skinType}</Badge> : null}
							{Array.isArray(device.skinConcerns)
								? device.skinConcerns.map((concern) => <Badge key={concern} variant="outline">{concern}</Badge>)
								: device.skinConcerns
									? <Badge variant="outline">{device.skinConcerns}</Badge>
									: null}
						</div>
						<div className="grid gap-3 md:grid-cols-2">
							{device.specifications.map((specification) => (
								<div key={specification.label} className="rounded-2xl border p-4">
									<p className="text-sm text-muted-foreground">{specification.label}</p>
									<p className="mt-2 font-medium">{specification.value}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Thiết bị tương tự</CardTitle>
						<CardDescription>Gợi ý cùng nhóm để so sánh hiệu suất.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{similarDevices.map((item) => (
							<div key={item.id} className="rounded-2xl border p-4">
								<p className="font-medium">{item.name}</p>
								<p className="text-sm text-muted-foreground">Giá {formatCurrency(item.price)}</p>
								<p className="text-sm text-muted-foreground">Sold {item.sold} | View {item.viewCount}</p>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Review gần đây</CardTitle>
					<CardDescription>{reviews.length} review mới nhất của thiết bị.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{reviews.length === 0 ? (
						<div className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">Thiết bị chưa có review nào.</div>
					) : (
						reviews.map((review) => (
							<div key={review.id} className="rounded-2xl border p-4">
								<div className="flex items-center justify-between gap-4">
									<p className="font-medium">{review.accountName}</p>
									<Badge variant="outline">{review.rating}/5</Badge>
								</div>
								<p className="mt-2 text-sm text-muted-foreground">{review.comment || "Không có nội dung"}</p>
								<p className="mt-2 text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</p>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
