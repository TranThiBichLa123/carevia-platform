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
    { value: "PROCESSING", label: "Đang vận chuyển" },
    { value: "COMPLETED", label: "Hoàn tất" },
    { value: "FAILED", label: "Thanh toán lỗi" },
    { value: "CANCELLED", label: "Đã hủy" },
];

const ORDER_LABELS: Record<BackofficeOrderStatus, string> = {
    PENDING_PAYMENT: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    PROCESSING: "Đang vận chuyển",
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

    if (authUser?.role !== "STAFF") {
        return (
            <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
                Bạn không có quyền truy cập màn quản lý đơn hàng.
            </div>
        );
    }

    return (
        <div className="space-y-6 font-vietnam">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
                    <p className="text-sm text-muted-foreground">
                        Theo dõi tiến trình xử lý, thanh toán và hoàn tất giao dịch mua thiết bị.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="group relative z-50 w-full sm:min-w-52 sm:w-auto">
                        <div className="flex h-9.5 cursor-pointer items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm transition-all hover:border-gray-200">
                            <span className="whitespace-nowrap text-[13px] font-medium text-gray-700">
                                {ORDER_OPTIONS.find((option) => option.value === statusFilter)?.label || "Lọc trạng thái"}
                            </span>
                            <svg className="ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <div className="invisible absolute top-full left-0 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
                            <div className="flex flex-col whitespace-nowrap">
                                {ORDER_OPTIONS.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => setStatusFilter(option.value as OrderFilter)}
                                        className={`border-b border-gray-100 px-3 py-2.5 text-[13px] transition-colors last:border-b-0 ${statusFilter === option.value ? "bg-gray-50 font-bold text-staff-primary" : "cursor-pointer text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => void loadOrders()}
                        disabled={loading}
                        className="group relative h-9.5 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white px-4 text-[13px] font-medium whitespace-nowrap text-gray-700 shadow-sm transition-all duration-500 hover:border-staff-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <span className="absolute inset-y-0 left-0 w-0 bg-staff-primary transition-all duration-500 ease-out group-hover:w-full" />
                        <div className="relative z-10 flex items-center justify-center text-gray-700 transition-colors duration-500 group-hover:text-white">
                            <RefreshCw
                                className={`mr-2 h-3.5 w-3.5 text-gray-400 transition-transform duration-700 ease-in-out group-hover:text-white ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
                            />
                            <span className="relative">Làm mới</span>
                        </div>
                    </button>
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
                        <CardDescription>Đang vận chuyển</CardDescription>
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
                        <div className="w-full overflow-hidden rounded-lg border border-[#DCDCDC] bg-white font-vietnam">
                            <div className="overflow-x-auto">
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
                                                    <TableCell className="py-4 align-middle">
                                                        <Badge
                                                            variant={ORDER_VARIANTS[order.status]}
                                                            className="rounded-lg px-2.5 py-1 text-[10px]  font-vietnam font-bold uppercase border-none tracking-wider"
                                                        >
                                                            {ORDER_LABELS[order.status]}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Tạo lúc */}
                                                    <TableCell className="py-4 align-middle text-xs text-[#333333] font-vietnam">
                                                        {formatDateTime(order.createdAt)}
                                                    </TableCell>

                                                    {/* Thao tác */}
                                                    <TableCell className="py-4 pr-4 align-middle">
                                                        <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-1.5">
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-lg border-[#052962] text-[#052962] font-vietnam font-bold text-xs h-7 hover:bg-[#052962] hover:text-white transition-colors px-3"
                                                            >
                                                                <Link href={`/staff/orders/${order.id}`}>Chi tiết</Link>
                                                            </Button>

                                                            {order.status === "PENDING_PAYMENT" && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => void handleStatusUpdate(order.id, "PAID")}
                                                                    disabled={isUpdating}
                                                                    className="rounded-lg bg-[#052962] font-vietnam hover:bg-[#031F4B] text-white text-xs font-bold h-7 px-3 shadow-none"
                                                                >
                                                                    Đánh dấu PAID
                                                                </Button>
                                                            )}

                                                            {order.status === "PAID" && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => void handleStatusUpdate(order.id, "PROCESSING")}
                                                                    disabled={isUpdating}
                                                                    className="rounded-lg font-vietnam bg-[#052962] hover:bg-[#031F4B] text-white text-xs font-bold h-7 px-3 shadow-none"
                                                                >
                                                                    Chuyển xử lý
                                                                </Button>
                                                            )}

                                                            {order.status === "PROCESSING" && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => void handleStatusUpdate(order.id, "COMPLETED")}
                                                                    disabled={isUpdating}
                                                                    className="rounded-lg font-vietnam bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-7 px-3 shadow-none"
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
                                                                    className="rounded-lg font-vietnam bg-[#C70000] hover:bg-red-900 text-white text-xs font-bold h-7 px-3 shadow-none"
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
                        </div>

                    )}
                </CardContent>
            </Card>
        </div>
    );
}
