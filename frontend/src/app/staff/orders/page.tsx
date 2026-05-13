"use client";

import Link from "next/link";
import { Package, RefreshCw, ShoppingCart, Truck } from "lucide-react";
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
    type BackofficeOrder,
    type BackofficeOrderStatus,
} from "@/lib/backofficeApi";
import { useUserStore } from "@/lib/store";
import {
    formatCurrency,
    formatDateTime,
    getBackofficeErrorMessage,
} from "@/lib/backofficeUtils";

type OrderFilter = "ALL" | BackofficeOrderStatus;

const ORDER_OPTIONS: Array<{ value: OrderFilter; label: string }> = [
    { value: "ALL", label: "Tất cả trạng thái" },
    { value: "PENDING_PAYMENT", label: "Chờ thanh toán" },
    { value: "PAID", label: "Đã thanh toán" },
    { value: "PROCESSING", label: "Đang xử lý" },
    { value: "COMPLETED", label: "Hoàn tất" },
    { value: "FAILED", label: "Thanh toán lỗi" },
    { value: "CANCELLED", label: "Đã hủy" },
];

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

export default function StaffOrdersPage() {
    const { authUser, isAuthenticated } = useUserStore();
    const [orders, setOrders] = useState<BackofficeOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<OrderFilter>("ALL");

    const loadOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await backofficeApi.getAllOrders({ page: 0, size: 100 });
            setOrders(response.items || []);
        } catch (error) {
            toast.error(getBackofficeErrorMessage(error, "Không thể tải danh sách đơn hàng."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        void loadOrders();
    }, [isAuthenticated, loadOrders]);

    const filteredOrders =
        statusFilter === "ALL"
            ? orders
            : orders.filter((order) => order.status === statusFilter);

    const pendingPayment = orders.filter(
        (order) => order.status === "PENDING_PAYMENT"
    ).length;
    const paidOrders = orders.filter((order) => order.status === "PAID").length;
    const processingOrders = orders.filter(
        (order) => order.status === "PROCESSING"
    ).length;
    const completedOrders = orders.filter(
        (order) => order.status === "COMPLETED"
    ).length;

    const handleStatusUpdate = async (
        orderId: number,
        nextStatus: BackofficeOrderStatus
    ) => {
        try {
            setUpdatingId(orderId);
            await backofficeApi.updateOrderStatus(orderId, nextStatus);
            toast.success(`Đã cập nhật đơn hàng sang ${ORDER_LABELS[nextStatus]}.`);
            await loadOrders();
        } catch (error) {
            toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái đơn hàng."));
        } finally {
            setUpdatingId(null);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
                Đăng nhập bằng tài khoản staff để quản lý đơn hàng.
            </div>
        );
    }

    if (authUser && !["STAFF", "ADMIN"].includes(authUser.role)) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
                Bạn không có quyền truy cập màn quản lý đơn hàng.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
                    <p className="text-sm text-muted-foreground">
                        Theo dõi tiến trình xử lý, thanh toán và hoàn tất giao dịch mua thiết bị.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as OrderFilter)}
                    >
                        <SelectTrigger className="w-full min-w-52 bg-white sm:w-52">
                            <SelectValue placeholder="Lọc trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            {ORDER_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={() => void loadOrders()} disabled={loading}>
                        <RefreshCw className={loading ? "animate-spin" : ""} />
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardDescription>Chờ thanh toán</CardDescription>
                        <CardTitle className="flex items-center gap-3 text-3xl">
                            <ShoppingCart className="size-6 text-sky-500" />
                            {pendingPayment}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Đã thanh toán</CardDescription>
                        <CardTitle className="flex items-center gap-3 text-3xl">
                            <Package className="size-6 text-emerald-500" />
                            {paidOrders}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Đang xử lý</CardDescription>
                        <CardTitle className="flex items-center gap-3 text-3xl">
                            <Truck className="size-6 text-amber-500" />
                            {processingOrders}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Đã hoàn tất</CardDescription>
                        <CardTitle className="flex items-center gap-3 text-3xl">
                            <Package className="size-6 text-indigo-500" />
                            {completedOrders}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Danh sách đơn hàng</CardTitle>
                    <CardDescription>{filteredOrders.length} đơn hàng trong bộ lọc hiện tại.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-16 text-center text-sm text-muted-foreground">Đang tải dữ liệu...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
                            Không có đơn hàng phù hợp.
                        </div>
                    ) : (
                        <div className="w-full font-vietnam overflow-x-auto border-b-2 border-[#111111]">
                            <Table className="w-full border-collapse bg-white font-sans text-[#111111]">
                                <TableHeader className="bg-[#052962] text-white">
                                    <TableRow className="border-none hover:bg-[#052962]">
                                        <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-[#FFE500] pl-4">Mã đơn</TableHead>
                                        <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">Khách hàng</TableHead>
                                        <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">Sản phẩm</TableHead>
                                        <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">Thanh toán</TableHead>
                                        <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">Trạng thái</TableHead>
                                        <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">Tạo lúc</TableHead>
                                        <TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-[#FFE500] pr-4 text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => {
                                        const isUpdating = updatingId === order.id;
                                        return (
                                            <TableRow
                                                key={order.id}
                                                className="border-b border-[#DCDCDC] hover:bg-[#F6F6F6] transition-colors"
                                            >
                                                {/* Mã đơn */}
                                                <TableCell className="py-4 pl-4 align-top">
                                                    <div className="font-vietnam font-bold text-sm text-[#052962]">{order.orderCode}</div>
                                                    <div className="text-[11px] font-mono text-[#666666] mt-0.5">ID: #{order.id}</div>
                                                </TableCell>

                                                {/* Khách hàng */}
                                                <TableCell className="py-4 align-top text-sm font-vietnam font-medium">
                                                    Account #{order.accountId}
                                                </TableCell>

                                                {/* Sản phẩm */}
                                                <TableCell className="py-4 align-top">
                                                    <div className="text-sm font-vietnam font-bold text-[#111111]">{order.items.length} sản phẩm</div>
                                                    <div className="max-w-56 truncate text-xs text-[#444444] font-vietnam mt-1 leading-tight">
                                                        {order.items.map((item) => item.deviceName).join(", ")}
                                                    </div>
                                                </TableCell>

                                                {/* Thanh toán */}
                                                <TableCell className="py-4 align-top">
                                                    <div className="font-vietnam font-bold text-sm text-[#C70000]">
                                                        {formatCurrency(order.totalAmount)}
                                                    </div>
                                                    <div className="text-[11px] text-[#666666] uppercase tracking-wider mt-0.5">
                                                        {order.paymentMethod || "Chưa chọn phương thức"}
                                                    </div>
                                                </TableCell>

                                                {/* Trạng thái - Dạng nhãn phẳng, không bo tròn góc */}
                                                <TableCell className="py-4 align-top">
                                                    <Badge
                                                        variant={ORDER_VARIANTS[order.status]}
                                                        className="rounded-none px-2 py-0.5 text-[10px] font-vietnam font-bold uppercase border-none tracking-wider"
                                                    >
                                                        {ORDER_LABELS[order.status]}
                                                    </Badge>
                                                </TableCell>

                                                {/* Tạo lúc */}
                                                <TableCell className="py-4 align-top text-xs text-[#333333] font-vietnam">
                                                    {formatDateTime(order.createdAt)}
                                                </TableCell>

                                                {/* Thao tác */}
                                                <TableCell className="py-4 pr-4 align-top">
                                                    <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-1.5">
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-none border-[#052962] text-[#052962] font-bold text-xs h-7 hover:bg-[#052962] hover:text-white transition-colors px-3"
                                                        >
                                                            <Link href={`/staff/orders/${order.id}`}>Chi tiết</Link>
                                                        </Button>

                                                        {order.status === "PENDING_PAYMENT" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => void handleStatusUpdate(order.id, "PAID")}
                                                                disabled={isUpdating}
                                                                className="rounded-none bg-[#052962] hover:bg-[#031F4B] text-white text-xs font-bold h-7 px-3 shadow-none"
                                                            >
                                                                Đánh dấu PAID
                                                            </Button>
                                                        )}

                                                        {order.status === "PAID" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => void handleStatusUpdate(order.id, "PROCESSING")}
                                                                disabled={isUpdating}
                                                                className="rounded-none bg-[#052962] hover:bg-[#031F4B] text-white text-xs font-bold h-7 px-3 shadow-none"
                                                            >
                                                                Chuyển xử lý
                                                            </Button>
                                                        )}

                                                        {order.status === "PROCESSING" && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => void handleStatusUpdate(order.id, "COMPLETED")}
                                                                disabled={isUpdating}
                                                                className="rounded-none bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-7 px-3 shadow-none"
                                                            >
                                                                Hoàn tất
                                                            </Button>
                                                        )}

                                                        {["PENDING_PAYMENT", "PAID"].includes(order.status) && (
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => void handleStatusUpdate(order.id, "CANCELLED")}
                                                                disabled={isUpdating}
                                                                className="rounded-none bg-[#C70000] hover:bg-red-900 text-white text-xs font-bold h-7 px-3 shadow-none"
                                                            >
                                                                Hủy
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
    );
}
