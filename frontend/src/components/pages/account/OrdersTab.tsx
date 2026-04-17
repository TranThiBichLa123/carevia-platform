"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store";
import { getUserOrders, deleteOrder, type Order } from "@/lib/orderApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Package,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  Loader2,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import PriceFormatter from "@/components/common/PriceFormatter";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock size={14} /> },
  paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle size={14} /> },
  processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Package size={14} /> },
  completed: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle size={14} /> },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle size={14} /> },
  failed: { label: "Thất bại", color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle size={14} /> },
};

const OrdersTab = () => {
  const { auth_token } = useUserStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!auth_token) return;
    try {
      setLoading(true);
      const data = await getUserOrders(auth_token);
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [auth_token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDelete = async () => {
    if (!deletingId || !auth_token) return;
    try {
      await deleteOrder(deletingId, auth_token);
      setOrders((prev) => prev.filter((o) => (o._id || o.id) !== deletingId));
      toast.success("Order deleted");
    } catch {
      toast.error("Failed to delete order");
    }
    setDeletingId(null);
  };

  const filteredOrders = orders.filter((o) => filter === "all" || o.status === filter);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-teal-600" size={24} />
        <span className="ml-2 text-gray-500">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Tất cả" },
          { key: "pending_payment", label: "Chờ thanh toán" },
          { key: "paid", label: "Đã thanh toán" },
          { key: "processing", label: "Đang xử lý" },
          { key: "completed", label: "Hoàn thành" },
          { key: "cancelled", label: "Đã hủy" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              filter === tab.key
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1">
                ({orders.filter((o) => o.status === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <ShoppingBag className="mx-auto w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            {filter === "all" ? "Bạn chưa có đơn hàng nào." : "Không có đơn hàng nào trong trạng thái này."}
          </p>
          <Link href="/client/devices">
            <Button className="mt-4 bg-teal-600 hover:bg-teal-700 text-white">
              Mua sắm ngay
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const orderId = order._id || order.id;
            const status = statusConfig[order.status] || statusConfig.pending_payment;
            return (
              <Card key={orderId} className="overflow-hidden border hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-gray-500">
                      #{order.orderCode || orderId?.slice(-8)}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                  </div>
                  <Badge className={`${status.color} border flex items-center gap-1`}>
                    {status.icon} {status.label}
                  </Badge>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="space-y-3">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                          {item.deviceImage ? (
                            <Image
                              src={item.deviceImage}
                              alt={item.deviceName}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.deviceName}</p>
                          <p className="text-xs text-gray-500">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          <PriceFormatter amount={item.subtotal} />
                        </p>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <p className="text-xs text-gray-400">
                        +{(order.items?.length || 0) - 3} sản phẩm khác
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t">
                  <div className="text-sm">
                    <span className="text-gray-500">Tổng: </span>
                    <span className="font-bold text-lg text-gray-900">
                      <PriceFormatter amount={order.totalAmount || order.total || 0} />
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.status === "pending_payment" && (
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => router.push(`/client/user/checkout?orderId=${orderId}`)}
                      >
                        <CreditCard size={14} className="mr-1" /> Thanh toán
                      </Button>
                    )}
                    <Link href={`/client/user/orders/${orderId}`}>
                      <Button size="sm" variant="outline" className="text-teal-600 border-teal-200">
                        <Eye size={14} className="mr-1" /> Chi tiết
                        <ChevronRight size={14} />
                      </Button>
                    </Link>
                    {(order.status === "cancelled" || order.status === "failed") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => setDeletingId(orderId)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đơn hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersTab;
