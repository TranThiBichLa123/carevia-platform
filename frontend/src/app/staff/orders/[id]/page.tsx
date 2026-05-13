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
	type BackofficeOrderStatus,
} from "@/lib/backofficeApi";
import {
	formatCurrency,
	formatDateTime,
	getBackofficeErrorMessage,
} from "@/lib/backofficeUtils";

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
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Chi tiết đơn hàng {order.orderCode}</h1>
					<p className="text-sm text-muted-foreground">Tạo lúc {formatDateTime(order.createdAt)}</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/staff/orders">Quay lại danh sách</Link>
				</Button>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardDescription>Khách hàng</CardDescription>
						<CardTitle>Account #{order.accountId}</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						<p>{order.shippingAddress}</p>
						<p>{order.shippingCity}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardDescription>Thanh toán</CardDescription>
						<CardTitle>{formatCurrency(order.totalAmount)}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>Phương thức: {order.paymentMethod || "Chưa có"}</p>
						<p>Transaction: {order.paymentTransactionId || "Chưa phát sinh"}</p>
						<Badge variant={ORDER_VARIANTS[order.status]}>{ORDER_LABELS[order.status]}</Badge>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardDescription>Thao tác nhanh</CardDescription>
						<CardTitle>Cập nhật trạng thái</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						{order.status === "PENDING_PAYMENT" ? (
							<Button disabled={updating} onClick={() => void handleStatusUpdate("PAID")}>Đánh dấu PAID</Button>
						) : null}
						{order.status === "PAID" ? (
							<Button disabled={updating} onClick={() => void handleStatusUpdate("PROCESSING")}>Chuyển xử lý</Button>
						) : null}
						{order.status === "PROCESSING" ? (
							<Button disabled={updating} onClick={() => void handleStatusUpdate("COMPLETED")}>Hoàn tất</Button>
						) : null}
						{["PENDING_PAYMENT", "PAID"].includes(order.status) ? (
							<Button variant="destructive" disabled={updating} onClick={() => void handleStatusUpdate("CANCELLED")}>Hủy đơn</Button>
						) : null}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Sản phẩm trong đơn</CardTitle>
					<CardDescription>{order.items.length} sản phẩm</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Thiết bị</TableHead>
								<TableHead>Số lượng</TableHead>
								<TableHead>Đơn giá</TableHead>
								<TableHead>Thành tiền</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{order.items.map((item) => (
								<TableRow key={item.id}>
									<TableCell>{item.deviceName}</TableCell>
									<TableCell>{item.quantity}</TableCell>
									<TableCell>{formatCurrency(item.unitPrice)}</TableCell>
									<TableCell>{formatCurrency(item.subtotal)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
