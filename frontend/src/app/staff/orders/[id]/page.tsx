"use client";

import Link from "next/link";
import Image from "next/image";
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
	type BackofficeOrder,
	type BackofficePaymentStatus,
	type BackofficeOrderStatus,
} from "@/lib/backofficeApi";
import {
	formatCurrency,
	formatDateTime,
	getBackofficeErrorMessage,
} from "@/lib/backofficeUtils";
import { ArrowLeft, CheckSquare, CreditCard, ImageIcon, RefreshCw, ShieldCheck, User, Wrench, XCircle } from "lucide-react";

const ORDER_LABELS: Record<BackofficeOrderStatus, string> = {
	PENDING_PAYMENT: "Chờ thanh toán",
	PAID: "Đã thanh toán",
	PROCESSING: "Đang xử lý",
	SHIPPING: "Đang giao",
	COMPLETED: "Hoàn tất",
	FAILED: "Lỗi thanh toán",
	CANCELLED: "Đã hủy",
};

const ORDER_VARIANTS: Record<
	BackofficeOrderStatus,
	"default" | "secondary" | "destructive" | "outline"
> = {
	PENDING_PAYMENT: "outline",
	PAID: "default",
	PROCESSING: "secondary",
	SHIPPING: "secondary",
	COMPLETED: "default",
	FAILED: "destructive",
	CANCELLED: "destructive",
};

const PAYMENT_LABELS: Record<BackofficePaymentStatus, string> = {
	INITIATED: "Chờ thanh toán",
	SUCCESS: "Đã thanh toán",
	FAILED: "Thanh toán lỗi",
	TIMEOUT: "Hết thời gian thanh toán",
	CANCELLED: "Đã hủy thanh toán",
};

const PAYMENT_VARIANTS: Record<
	BackofficePaymentStatus,
	"default" | "secondary" | "destructive" | "outline"
> = {
	INITIATED: "outline",
	SUCCESS: "default",
	FAILED: "destructive",
	TIMEOUT: "secondary",
	CANCELLED: "destructive",
};

export default function StaffOrderDetailPage() {
	const params = useParams<{ id: string }>();
	const orderId = Number(params.id);
	const [order, setOrder] = useState<BackofficeOrder | null>(null);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);

	const loadOrder = useCallback(async () => {
		try {
			setLoading(true);
			setOrder(await backofficeApi.getOrderById(orderId));
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải chi tiết đơn hàng."));
		} finally {
			setLoading(false);
		}
	}, [orderId]);

	useEffect(() => {
		if (!Number.isFinite(orderId)) {
			setLoading(false);
			return;
		}
		void loadOrder();
	}, [loadOrder, orderId]);

	const handleStatusUpdate = async (status: BackofficeOrderStatus) => {
		try {
			setUpdating(true);
			await backofficeApi.updateOrderStatus(orderId, status);
			toast.success(`Đã cập nhật trạng thái sang ${ORDER_LABELS[status]}.`);
			await loadOrder();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái đơn hàng."));
		} finally {
			setUpdating(false);
		}
	};

	if (loading) {
		return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Đang tải đơn hàng...</div>;
	}

	if (!order) {
		return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Không tìm thấy đơn hàng.</div>;
	}

	return (
		<div className="space-y-6 font-vietnam max-w-350 ">

			{/* 📑 SECTION 1: HEADER SECTION */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5">
				<div>
					<div className="flex flex-wrap items-center gap-2.5">
						<h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
							Chi tiết đơn hàng
						</h1>
						<span className="font-mono text-base font-bold text-staff-primary bg-staff-primary/10 px-2.5 py-0.5 rounded-lg border border-staff-primary/20">
							#{order.orderCode}
						</span>
					</div>
					<p className="text-xs text-muted-foreground mt-1.5">
						Tập hồ sơ số liệu vận hành tự động khởi tạo lúc: <span className="text-slate-700 font-medium">{formatDateTime(order.createdAt)}</span>
					</p>
				</div>

				{/* 💡 NÚT QUAY LẠI TÍCH HỢP HIỆU ỨNG TRƯỢT NỀN THƯƠNG HIỆU */}
				<Button
					asChild
					variant="none"
					className="group relative h-10 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white px-4 text-[13px] font-medium text-gray-700 shadow-sm transition-all duration-300 hover:border-staff-primary active:scale-95"
				>
					<Link href="/staff/orders">
						<span className="absolute inset-y-0 left-0 w-0 bg-staff-primary transition-all duration-500 ease-out group-hover:w-full" />
						<div className="relative z-10 flex items-center justify-center transition-colors duration-500 group-hover:text-white">
							<ArrowLeft className="mr-2 h-4 w-4 text-gray-400 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
							<span>Quay lại danh sách</span>
						</div>
					</Link>
				</Button>
			</div>

			{/* 📊 SECTION 2: 3-COLUMN METADATA CARDS */}
			<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

				{/* Thẻ 1: Hồ sơ khách hàng */}
				<Card className="border border-slate-200/80 shadow-xs rounded-xl overflow-hidden bg-white">
					<CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/40">
						<div className="flex items-center gap-2 text-slate-600">
							<User className="h-4 w-4 text-staff-primary" />
							<CardTitle className="text-xs font-bold uppercase tracking-wider">Thông tin khách hàng</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="p-4 text-xs space-y-2.5 text-gray-600 font-medium">
						<div className="flex justify-between items-center border-b border-slate-50 pb-1.5 gap-3">
							<span className="text-slate-400">Tên khách hàng:</span>
							<span className="text-right text-gray-900 font-bold">{order.customerName || "Chưa có thông tin"}</span>
						</div>
						<div className="flex justify-between items-center border-b border-slate-50 pb-1.5 gap-3">
							<span className="text-slate-400">Số điện thoại:</span>
							<span className="text-right text-gray-900 font-bold">{order.customerPhone || "Chưa có thông tin"}</span>
						</div>
						{/* <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
							<span className="text-slate-400">Mã tài khoản:</span>
							<span className="font-mono text-gray-900 font-bold">{order.accountId}</span>
						</div> */}
						<div className="space-y-1">
							<span className="text-slate-400 block">Địa chỉ bàn giao:</span>
							<p className="text-gray-800 leading-relaxed bg-slate-50/50 p-2 rounded-lg border border-slate-100/70">
								📍 {order.shippingAddress}, {order.shippingCity}, {order.shippingCountry}
							</p>
						</div>
						{order.customerNote && (
							<div className="text-[11px] text-amber-700 bg-amber-50/40 border border-amber-100/60 rounded-lg p-2 mt-1">
								💬 <strong>Ghi chú:</strong> {order.customerNote}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Thẻ 2: Cấu hình Tài chính & Thanh toán */}
				<Card className="border border-slate-200/80 shadow-xs rounded-xl overflow-hidden bg-white">
					<CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/40">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-slate-600">
								<CreditCard className="h-4 w-4 text-indigo-600" />
								<CardTitle className="text-xs font-bold uppercase tracking-wider">Luồng giao dịch tài chính</CardTitle>
							</div>
							<Badge className="text-[10px] font-bold px-2 py-0.5 rounded-md" variant={PAYMENT_VARIANTS[order.paymentStatus]}>
								{PAYMENT_LABELS[order.paymentStatus]}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-4 text-xs space-y-2 text-gray-600 font-medium">
						<div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
							<span className="text-slate-400">Tổng tiền thanh toán:</span>
							<span className="text-base font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-slate-400">Hình thức:</span>
							<span className="bg-slate-100 px-2 py-0.5 rounded text-gray-800 font-semibold text-[11px] uppercase tracking-wide">
								{order.paymentMethod || "Chưa chọn"}
							</span>
						</div>
						<div className="space-y-1 pt-1">
							<span className="text-slate-400 block">Mã định danh giao dịch (TxID):</span>
							<p className=" text-gray-800 bg-slate-50 p-2 rounded-lg border border-slate-100 truncate text-[11px]">
								{order.paymentTransactionId ? `🔍 ${order.paymentTransactionId}` : "🚫 Chưa phát sinh giao dịch điện tử"}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Thẻ 3: Bảng điều khiển thao tác nhanh */}
				<Card className="border border-slate-200/80 shadow-xs rounded-xl overflow-hidden bg-white">
					<CardHeader className="p-4 pb-3 border-b border-slate-100 bg-slate-50/40">
						<div className="flex items-center gap-2 text-slate-600">
							<Wrench className="h-4 w-4 text-amber-600" />
							<CardTitle className="text-xs font-bold uppercase tracking-wider">Cơ cấu kiểm soát trạng thái</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="p-4 flex flex-col justify-center h-[calc(100%-49px)] gap-2.5">
						{order.status === "PENDING_PAYMENT" && (
							<Button
								className="w-full h-9 text-xs font-medium bg-staff-primary text-white hover:bg-staff-primary/90 transition-all active:scale-95 shadow-2xs"
								disabled={updating}
								onClick={() => void handleStatusUpdate("PAID")}
							>
								<CheckSquare className="size-3.5 mr-1.5" /> Đánh dấu đã trả tiền (PAID)
							</Button>
						)}
						{order.status === "PAID" && (
							<Button
								className="w-full h-9 text-xs font-medium bg-amber-300 text-white hover:bg-amber-400 transition-all active:scale-95 shadow-2xs"
								disabled={updating}
								onClick={() => void handleStatusUpdate("PROCESSING")}
							>
								<RefreshCw className="size-3.5 mr-1.5 animate-pulse" /> Chuyển sang xử lý hệ thống
							</Button>
						)}
						{order.status === "PROCESSING" && (
							<Button
								className="w-full h-9 text-xs hover:bg-staff-primary font-medium bg-staff-primary text-white  transition-all active:scale-95 shadow-2xs"
								disabled={updating}
								onClick={() => void handleStatusUpdate("COMPLETED")}
							>
								<ShieldCheck className="size-3.5 mr-1.5" /> Đóng hồ sơ: Hoàn tất đơn hàng
							</Button>
						)}
						{["PENDING_PAYMENT", "PAID"].includes(order.status) && (
							<Button
								variant="destructive"
								className="w-full h-9 text-xs font-medium border-rose-100 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
								disabled={updating}
								onClick={() => void handleStatusUpdate("CANCELLED")}
							>
								<XCircle className="size-3.5 mr-1.5" /> Đình chỉ & Hủy đơn hàng này
							</Button>
						)}

						{/* Trường hợp đơn hàng đã hoàn tất hoặc bị hủy không thể thao tác nữa */}
						{["COMPLETED", "CANCELLED"].includes(order.status) && (
							<div className="text-center text-xs py-6 text-slate-400 font-medium border border-dashed rounded-xl bg-slate-50/50 leading-normal font-vietnam">
								{order.status === "COMPLETED" ? (
									<>
										✅ Đơn hàng đã hoàn thành.<br />
										Hồ sơ mua hàng đã đóng và không thể chỉnh sửa tiếp.
									</>
								) : (
									<>
										❌ Đơn hàng đã bị hủy.<br />
										Trạng thái đơn hàng đã kết thúc và không thể thay đổi.
									</>
								)}
							</div>
						)}

					</CardContent>
				</Card>
			</div>

			{/* 🛍️ SECTION 3: PRODUCT ITEM TABLE & RECEIPT SPLIT */}
			<div className="grid gap-6 lg:grid-cols-3 items-start">

				{/* Bảng liệt kê sản phẩm (Chiếm 2 phần) */}
				<Card className="lg:col-span-2 border-slate-200/80 shadow-xs rounded-xl overflow-hidden bg-white">
					<CardHeader className="p-4 pb-3 border-b border-slate-100">
						<CardTitle className="text-sm font-semibold text-gray-900">Danh mục thiết bị chăm sóc da bàn giao</CardTitle>
						<CardDescription className="text-xs">Liệt kê {order.items.length} mặt hàng máy móc thẩm mỹ được chỉ định</CardDescription>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader className="bg-slate-50/60">
								<TableRow className="hover:bg-transparent border-b border-slate-100">
									<TableHead className="w-[45%] pl-4 text-xs font-semibold text-slate-500">Mô tả thiết bị</TableHead>
									<TableHead className="text-center text-xs font-semibold text-slate-500">Số lượng</TableHead>
									<TableHead className="text-right text-xs font-semibold text-slate-500">Đơn giá</TableHead>
									<TableHead className="text-right pr-4 text-xs font-semibold text-slate-500">Thành tiền</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="divide-y divide-slate-100">
								{order.items.map((item) => (
									<TableRow key={item.id} className="hover:bg-slate-50/30 transition-colors border-b border-slate-100/70">
										<TableCell className="pl-4 py-3.5">
											<div className="flex items-center gap-3">
												{/* 📸 Ô PREVIEW ẢNH THIẾT BỊ - Đã sửa lỗi TypeScript nhờ Next.js Image */}
												<div className="relative size-12 rounded-lg border border-slate-100 overflow-hidden bg-slate-50 shrink-0 shadow-3xs">
													{item.deviceImage ? (
														<Image
															src={item.deviceImage}
															alt={item.deviceName}
															fill
															sizes="48px"
															className="object-cover"
														/>
													) : (
														<div className="flex items-center justify-center h-full text-slate-300">
															<ImageIcon className="size-4" />
														</div>
													)}
												</div>

												<div className="min-w-0">
													<p className="text-sm font-medium text-gray-900 truncate max-w-[240px] md:max-w-[400px]">
														{item.deviceName}
													</p>
													{/* 💡 SỬA LỖI: Thay thế deviceCategory không tồn tại bằng việc hiển thị ID định danh của máy */}
													<p className="text-[11px]  text-gray-400 mt-0.5">ID Thiết bị: #{item.deviceId}</p>
												</div>
											</div>
										</TableCell>

										<TableCell className="text-center text-sm text-gray-700 font-medium">
											{item.quantity}
										</TableCell>

										<TableCell className="text-right text-sm text-gray-700 font-medium">
											{formatCurrency(item.unitPrice)}
										</TableCell>

										{/* 💡 SỬA LỖI: Thay thế item.totalPrice bằng item.subtotal theo đúng schema API */}
										<TableCell className="text-right pr-4 text-sm font-semibold text-gray-900">
											{formatCurrency(item.subtotal)}
										</TableCell>
									</TableRow>

								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
				{/* Hóa đơn tóm tắt bên cạnh (Chiếm 1 phần) */}
				<Card className="border-slate-200/80 shadow-xs rounded-xl overflow-hidden bg-white">
					<CardHeader className="p-4 pb-3 border-b border-slate-100">
						<CardTitle className="text-sm font-semibold text-gray-900">Tóm tắt hóa đơn</CardTitle>
						<CardDescription className="text-xs">Tổng hợp chi phí và thông tin thanh toán</CardDescription>
					</CardHeader>
					<CardContent className="p-4 space-y-3">
						<div className="flex justify-between text-sm text-gray-700">
							<span>Tổng tiền hàng:</span>
							<span>{formatCurrency(order.subtotal)}</span>
						</div>
						<div className="flex justify-between text-sm text-gray-700">
							<span>Phí vận chuyển:</span>
							<span>{formatCurrency(order.shippingFee)}</span>
						</div>
						<div className="flex justify-between text-sm text-gray-700">
							<span>Giảm giá:</span>
							<span>{formatCurrency(order.discountAmount)}</span>
						</div>
						<div className="flex justify-between text-base font-bold text-gray-900 border-t border-slate-100 pt-2">
							<span>Tổng thanh toán:</span>
							<span>{formatCurrency(order.totalAmount)}</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>

	);
}
