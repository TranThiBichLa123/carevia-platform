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
import { Activity, ArrowLeft, Coins, Eye, MessageSquare, RefreshCcw, ShoppingBag, Star } from "lucide-react";

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
		<div className="space-y-6 px-4 font-vietnam py-6 md:px-8 bg-slate-50/50 min-h-screen">
			{/* Top Header Section */}
			<div className="flex flex-col gap-4 rounded-2xl  bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
				<div className="flex flex-col md:flex-row items-start md:items-center gap-4">
					{device.image && (
						<div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl  bg-slate-50">
							<img
								src={device.image}
								alt={device.name}
								className="h-full w-full object-cover"
							/>
						</div>
					)}
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{device.name}</h1>
							<Badge className="bg-admin-primary/10 text-admin-primary border-admin-primary/20 font-medium">
								{device.status}
							</Badge>
						</div>
						<p className="text-sm text-muted-foreground mt-1">
							Mã định danh: <span className="font-mono text-slate-700 font-medium">#{device.id}</span> • Slug: <span className="text-slate-500 font-mono">{device.slug}</span>
						</p>
					</div>
				</div>
				<Button
					asChild
					variant="outline"
					className="group relative h-9.5 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white px-4 text-[13px] font-medium whitespace-nowrap text-gray-700 shadow-sm transition-all duration-500 hover:border-admin-primary active:scale-95 self-start md:self-center cursor-pointer font-vietnam"
				>
					<Link href="/admin">
						{/* Lớp nền màu xanh Primary trượt từ trái sang phải chiếm trọn nút khi hover chuột vào */}
						<span className="absolute inset-y-0 left-0 w-0 bg-admin-primary transition-all duration-500 ease-out group-hover:w-full" />

						{/* Khung nội dung chữ nổi lên trên lớp nền nhờ z-10 */}
						<div className="relative z-10 flex items-center justify-center text-gray-700 transition-colors duration-500 group-hover:text-white">
							<ArrowLeft
								className="mr-2 h-3.5 w-3.5 text-gray-400 transition-transform duration-500 ease-in-out group-hover:text-white group-hover:-translate-x-1"
							/>
							<span className="relative">Quay lại Dashboard</span>
						</div>
					</Link>
				</Button>


			</div>

			{/* Core Metrics Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{/* Giá bán Card */}
				<Card className="relative overflow-hidden border shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardDescription className="text-sm font-medium">Doanh thu & Giá</CardDescription>
						<div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
							<Coins className="h-5 w-5" />
						</div>
					</CardHeader>
					<CardContent>
						<CardTitle className="text-2xl font-bold text-slate-900">{formatCurrency(device.price)}</CardTitle>
						<div className="mt-1 flex items-center gap-1.5 text-xs">
							{device.discountPercentage > 0 ? (
								<>
									<span className="line-through text-muted-foreground">{formatCurrency(device.originalPrice)}</span>
									<span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">-{device.discountPercentage}%</span>
								</>
							) : (
								<span className="text-muted-foreground">Giá gốc niêm yết</span>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Lượt xem Card */}
				<Card className="relative overflow-hidden border shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardDescription className="text-sm font-medium">Lượt tương tác</CardDescription>
						<div className="rounded-xl bg-blue-50 p-2 text-blue-600">
							<Eye className="h-5 w-5" />
						</div>
					</CardHeader>
					<CardContent>
						<CardTitle className="text-2xl font-bold text-slate-900">{device.viewCount.toLocaleString()}</CardTitle>
						<p className="mt-1 text-xs text-muted-foreground">Tổng số lượt click vào sản phẩm</p>
					</CardContent>
				</Card>

				{/* Đã bán Card */}
				<Card className="relative overflow-hidden border shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardDescription className="text-sm font-medium">Sản lượng bán</CardDescription>
						<div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
							<ShoppingBag className="h-5 w-5" />
						</div>
					</CardHeader>
					<CardContent>
						<CardTitle className="text-2xl font-bold text-slate-900">{device.sold.toLocaleString()}</CardTitle>
						<p className="mt-1 text-xs text-muted-foreground">Kho hàng hiện tại: <span className="font-semibold text-slate-700">{device.stock} sản phẩm</span></p>
					</CardContent>
				</Card>

				{/* Đánh giá Card */}
				<Card className="relative overflow-hidden border shadow-sm transition-all hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardDescription className="text-sm font-medium">Xếp hạng phản hồi</CardDescription>
						<div className="rounded-xl bg-amber-50 p-2 text-amber-600">
							<Star className="h-5 w-5 fill-amber-500" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-baseline gap-2">
							<CardTitle className="text-2xl font-bold text-slate-900">{device.averageRating.toFixed(1)}</CardTitle>
							<span className="text-sm text-slate-500">/ 5.0</span>
						</div>
						<p className="mt-1 text-xs text-muted-foreground">
							Tổng số: <span className="font-semibold text-slate-700">{device.ratingCount || 0} lượt đánh giá</span>
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main Content Layout Split */}
			<div className="grid gap-6 lg:grid-cols-3">

				{/* Left Columns - Detailed Business & Specs (Takes 2 blocks) */}
				<div className="space-y-6 lg:col-span-2">
					{/* Commercial & Specification Info */}
					<Card className="border shadow-sm bg-white overflow-hidden">
						<CardHeader className="border-b border-slate-100 bg-slate-50/50">
							<div className="flex items-center gap-2 text-admin-primary">
								<Activity className="h-5 w-5" />
								<CardTitle className="text-lg">Thông tin thương mại & Vận hành</CardTitle>
							</div>
							<CardDescription>Cấu hình thuộc tính, phân loại và nguồn gốc xuất xứ của thiết bị.</CardDescription>
						</CardHeader>
						<CardContent className="p-6 space-y-6">
							{/* Tags & Taxonomy Section */}
							<div className="space-y-3">
								<h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Phân loại & Định mục</h4>
								<div className="flex flex-wrap gap-2">
									{device.brand && (
										<Badge variant="secondary" className="bg-slate-100 text-slate-800 border font-medium px-3 py-1 rounded-lg">
											Hãng: {device.brand.name}
										</Badge>
									)}
									{device.category && (
										<Badge variant="secondary" className="bg-slate-100 text-slate-800 border font-medium px-3 py-1 rounded-lg">
											Danh mục: {device.category.name}
										</Badge>
									)}
									{device.skinType && (
										<Badge className="bg-purple-50 text-purple-700 border border-purple-200/60 font-medium px-3 py-1 rounded-lg">
											Loại da: {device.skinType}
										</Badge>
									)}
									{device.isBookingAvailable && (
										<Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium px-3 py-1 rounded-lg">
											Cho đặt lịch trải nghiệm ({formatCurrency(device.bookingPrice)})
										</Badge>
									)}
								</div>
							</div>

							{/* Origin & Manufacturing Info */}
							<div className="space-y-3">
								<h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Xuất xứ & Sản xuất</h4>
								<p className="text-sm text-slate-600">Xuất xứ: {device.origin || "Chưa cập nhật"}</p>
								<p className="text-sm text-slate-600">Bảo hành chính hãng: {device.warranty ? `${device.warranty.period} tháng` : "Không bảo hành"}</p>
								<p className="text-sm text-slate-600">Trạng thái máy: {device.deviceCondition || "Mới 100%"}</p>
							</div>
						</CardContent>
					</Card>

					{/* User Reviews Section */}
					<Card className="border shadow-sm bg-white overflow-hidden">
						<CardHeader className="border-b border-slate-100 bg-slate-50/50">
							<div className="flex items-center gap-2 text-admin-primary">
								<MessageSquare className="h-5 w-5" />
								<CardTitle className="text-lg">Đánh giá & Phản hồi</CardTitle>
							</div>
							<CardDescription>Những đánh giá mới nhất từ người dùng về thiết bị này.</CardDescription>
						</CardHeader>
						<CardContent className="p-6 space-y-4">
							{reviews.length === 0 ? (
								<p className="text-sm text-muted-foreground">Chưa có đánh giá nào cho thiết bị này.</p>
							) : (
								<div className="space-y-4">
									{reviews.map((review) => (
										<div key={review.id} className=" rounded-lg p-4 bg-slate-50">
											<div className="flex items-center gap-3">
												<div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-200">
													<img
														src={review.accountAvatar || "/default-avatar.png"}
														alt={review.accountName}
														className="h-full w-full object-cover"
													/>
												</div>
												<div>
													<p className="text-sm font-semibold text-slate-900">{review.accountName}</p>
													<p className="text-xs text-muted-foreground">{formatDateTime(review.createdAt)}</p>
												</div>
											</div>
											<p className="mt-2 text-sm text-slate-700">{review.comment}</p>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Similar Devices */}
				<div className="space-y-6">
					<Card className="border shadow-sm bg-white overflow-hidden">
						<CardHeader className="border-b border-slate-100 bg-slate-50/50">
							<div className="flex items-center gap-2 text-admin-primary">
								<RefreshCcw className="h-5 w-5" />
								<CardTitle className="text-lg">Thiết bị tương tự</CardTitle>
							</div>
							<CardDescription>Những thiết bị có cấu hình và phân loại gần giống, giúp so sánh hiệu quả kinh doanh.</CardDescription>
						</CardHeader>
						<CardContent className="p-6 space-y-4">
							{similarDevices.length === 0 ? (
								<p className="text-sm text-muted-foreground">Không tìm thấy thiết bị tương tự nào.</p>
							) : (
								<div className="space-y-3">
									{similarDevices.map((simDevice) => (
										<div key={simDevice.id} className="flex items-center gap-3">
											<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-200">
												<img
													src={simDevice.image || "/default-device.png"}
													alt={simDevice.name}
													className="h-full w-full object-cover"
												/>
											</div>
											<div>
												<p className="text-sm font-medium text-slate-900">{simDevice.name}</p>
												<p className="text-xs text-muted-foreground">Giá: {formatCurrency(simDevice.price)}</p>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}



