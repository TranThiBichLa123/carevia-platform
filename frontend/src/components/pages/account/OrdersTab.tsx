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
import { getMyRefunds, requestOrderReturn, type Refund, type RefundStatus } from "@/lib/refundApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CardContent } from "@/components/ui/card";
import {
  PackageOpen,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowLeftRight,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment: { label: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock size={14} /> },
  paid: { label: "Đã thanh toán", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle size={14} /> },
  processing: { label: "Đang vận chuyển", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <Package size={14} /> },
  completed: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle size={14} /> },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle size={14} /> },
  failed: { label: "Thất bại", color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle size={14} /> },
};

const REFUND_STATUS_CONFIG: Record<RefundStatus, { label: string; color: string; icon: React.ReactNode }> = {
  REQUESTED: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock size={14} /> },
  APPROVED: { label: "Đã duyệt", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle2 size={14} /> },
  PROCESSING: { label: "Đang vận chuyển", color: "bg-purple-100 text-purple-700 border-purple-200", icon: <RefreshCw size={14} /> },
  SUCCESS: { label: "Hoàn tiền thành công", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 size={14} /> },
  FAILED: { label: "Thất bại", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={14} /> },
  CANCELLED: { label: "Đã hủy", color: "bg-slate-100 text-slate-600 border-slate-200", icon: <XCircle size={14} /> },
};

const REFUND_TYPE_LABEL: Record<string, string> = {
  ORDER_CANCEL: "Hủy đơn hàng",
  BOOKING_CANCEL: "Hủy lịch đặt",
  ORDER_RETURN: "Trả hàng",
};

const RETURN_REASONS = [
  "Sản phẩm bị hỏng/lỗi khi nhận",
  "Sản phẩm không đúng mô tả",
  "Nhận sai sản phẩm",
  "Không hài lòng với chất lượng",
  "Lý do khác",
];

const OrdersTab = () => {
  const { auth_token } = useUserStore();
  const router = useRouter();
  const [section, setSection] = useState<"orders" | "returns">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Refund / Returns state
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [refundsLoading, setRefundsLoading] = useState(false);
  const [refundSubTab, setRefundSubTab] = useState<"list" | "request">("list");
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnCustomReason, setReturnCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  // 1. Tối ưu lại fetchRefunds: KHÔNG gọi lại API getUserOrders nữa, 
  // vì danh sách orders đã được fetchOrders lấy về và lưu ở state `orders` rồi.
  const fetchRefunds = useCallback(async () => {
    if (!auth_token) return;
    try {
      setRefundsLoading(true);
      const refundRes = await getMyRefunds();
      if (refundRes.success) {
        setRefunds(refundRes.refunds);
      }
    } catch (error) {
      console.error("Failed to load refunds", error);
    } finally {
      setRefundsLoading(false);
    }
  }, [auth_token]);

  // 2. Tự động đồng bộ các đơn hàng hoàn thành (Completed Orders) từ biến `orders` đã có sẵn
  useEffect(() => {
    if (Array.isArray(orders)) {
      const completed = orders.filter((o) => o.status?.toUpperCase() === "COMPLETED" || o.status?.toUpperCase() === "DELIVERED");
      setCompletedOrders(completed);
    }
  }, [orders]); // Chỉ chạy lại khi biến orders thay đổi

  // 3. Khởi tạo dữ liệu ban đầu khi có Token
  useEffect(() => {
    if (auth_token) {
      fetchOrders();
    }
  }, [auth_token, fetchOrders]);

  // 4. Chỉ fetch dữ liệu đổi trả khi người dùng thực sự bấm vào tab "returns" và chưa có dữ liệu
  useEffect(() => {
    if (section === "returns" && auth_token) {
      fetchRefunds();
    }
  }, [section, auth_token, fetchRefunds]);







  const openReturnDialog = (order: Order) => {
    setSelectedOrder(order);
    setReturnReason("");
    setReturnCustomReason("");
    setSubmitError("");
    setReturnDialogOpen(true);
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrder) return;
    const finalReason = returnReason === "Lý do khác" ? returnCustomReason.trim() : returnReason;
    if (!finalReason) { setSubmitError("Vui lòng chọn hoặc nhập lý do trả hàng."); return; }
    setSubmitting(true);
    setSubmitError("");
    const res = await requestOrderReturn(selectedOrder.id, finalReason);
    setSubmitting(false);
    if (res.success) {
      setReturnDialogOpen(false);
      toast.success("Đã gửi yêu cầu trả hàng!");
      await fetchRefunds();
      setRefundSubTab("list");
    } else {
      setSubmitError(res.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.");
    }
  };

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

  const filteredOrders = orders.filter((o) => filter === "all" || o.status?.toLowerCase() === filter);

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
        <Loader2 className="animate-spin text-primary" size={24} />
        <span className="ml-2 text-gray-500">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-vietnam">


      {section === "returns" ? (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            <button
              onClick={() => setRefundSubTab("list")}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${refundSubTab === "list" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Yêu cầu hoàn tiền {refunds.length > 0 && `(${refunds.length})`}
            </button>
            <button
              onClick={() => setRefundSubTab("request")}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${refundSubTab === "request" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Yêu cầu trả hàng
            </button>
          </div>

          {refundsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
          ) : refundSubTab === "list" ? (
            /* Refund list */
            <div className="space-y-3">
              {refunds.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <ArrowLeftRight className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Chưa có yêu cầu hoàn tiền nào</p>
                  <p className="text-gray-400 text-sm mt-1">Khi bạn hủy đơn đã thanh toán hoặc trả hàng, chúng sẽ xuất hiện ở đây.</p>
                </div>
              ) : (
                refunds.map((refund) => {
                  const cfg = REFUND_STATUS_CONFIG[refund.status];
                  return (
                    <Card key={refund.id} className="overflow-hidden border border-gray-200 hover:shadow-md transition-all rounded-xl">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="shrink-0 p-2 bg-slate-100 rounded-lg">
                          <ArrowLeftRight className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-slate-500">{REFUND_TYPE_LABEL[refund.refundType] || refund.refundType}</span>
                            <Badge className={`text-xs border ${cfg.color} flex items-center gap-1`}>{cfg.icon} {cfg.label}</Badge>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm">{refund.orderCode || refund.bookingCode}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            <PriceFormatter amount={refund.amount || 0} />
                            {refund.reasonDetail && ` · ${refund.reasonDetail}`}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(refund.requestedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </p>
                        </div>
                        {refund.orderId && (
                          <Link href={`/client/user/orders/${refund.orderId}`}>
                            <Button size="sm" variant="ghost" className="text-primary rounded-lg text-xs">
                              <Eye size={13} className="mr-1" /> Xem đơn <ChevronRight size={13} />
                            </Button>
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          ) : (
            /* Return request */
            <div className="space-y-4">
              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Điều kiện trả hàng</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-600 text-xs">
                      <li>Chỉ áp dụng cho đơn hàng đã hoàn thành</li>
                      <li>Sản phẩm còn nguyên vẹn, đầy đủ phụ kiện</li>
                      <li>Trong vòng 7 ngày kể từ ngày nhận hàng</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              {completedOrders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <PackageOpen className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">Không có đơn hàng đủ điều kiện trả hàng</p>
                  <p className="text-gray-400 text-sm mt-1">Chỉ đơn hàng đã hoàn thành mới có thể yêu cầu trả hàng.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedOrders.map((order) => {
                    const hasActiveReturn = refunds.some(
                      (r) => r.orderId === order.id && r.refundType === "ORDER_RETURN" && r.status !== "FAILED" && r.status !== "CANCELLED"
                    );
                    return (
                      <Card key={order.id} className="border-gray-200 rounded-xl">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-800">{order.orderCode}</p>
                            <p className="text-sm text-gray-500">
                              {order.items?.length || 0} sản phẩm · <PriceFormatter amount={order.totalAmount || 0} />
                            </p>
                          </div>
                          {hasActiveReturn ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 border">Đã gửi yêu cầu</Badge>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => openReturnDialog(order)} className="shrink-0">
                              Yêu cầu trả hàng
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Return Dialog */}
          <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Yêu cầu trả hàng</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                {selectedOrder && (
                  <div className="p-3 bg-slate-50 rounded-lg text-sm">
                    <p className="font-medium text-slate-700">{selectedOrder.orderCode}</p>
                    <PriceFormatter amount={selectedOrder.totalAmount || 0} />
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Lý do trả hàng</p>
                  {RETURN_REASONS.map((reason) => (
                    <label key={reason} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="returnReason" value={reason} checked={returnReason === reason} onChange={() => setReturnReason(reason)} className="accent-primary" />
                      {reason}
                    </label>
                  ))}
                </div>
                {returnReason === "Lý do khác" && (
                  <Textarea placeholder="Mô tả lý do..." value={returnCustomReason} onChange={(e) => setReturnCustomReason(e.target.value)} rows={3} maxLength={500} />
                )}
                {submitError && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle size={14} /> {submitError}</p>}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReturnDialogOpen(false)} disabled={submitting}>Hủy</Button>
                <Button onClick={handleSubmitReturn} disabled={submitting || !returnReason}>
                  {submitting ? <><Loader2 size={14} className="mr-2 animate-spin" />Đang gửi...</> : "Gửi yêu cầu"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending_payment", label: "Chờ thanh toán" },
              { key: "paid", label: "Đã thanh toán" },
              { key: "processing", label: "Đang vận chuyển" },
              { key: "completed", label: "Hoàn thành" },
              { key: "cancelled", label: "Đã hủy" },
              { key: "return", label: "Trả hàng" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  // Loại bỏ điều kiện check tab.key === "return" riêng lẻ
                  setFilter(tab.key);
                }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${filter === tab.key // Cho phép nút "Trả hàng" chuyển màu xanh khi được active
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}

              >
                {tab.label}
                {tab.key !== "all" && tab.key !== "return" && (
                  <span className="ml-1">
                    ({orders.filter((o) => o.status?.toLowerCase() === tab.key).length})
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
                <Button className="mt-4 bg-primary hover:bg-primary-dark text-white">
                  Mua sắm ngay
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const orderId = order._id || order.id;
                const normalizedStatus = order.status?.toLowerCase().replace("_payment", "_payment") || "pending_payment";
                const status = statusConfig[normalizedStatus] || statusConfig.pending_payment;
                return (
                  <Card key={orderId} className="overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 rounded-xl">
                    {/* Order Header */}
                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {/* <span className="text-[11px] font-mono font-semibold text-gray-400 tracking-wider">
                          #{order.orderCode || String(orderId)?.slice(-8)}
                        </span> */}
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-[11px] text-gray-400">{formatDate(order.createdAt)}</span>
                      </div>
                      <Badge className={`${status.color} border border-current/20 flex items-center gap-1 text-[11px] font-semibold rounded-full px-3`}>
                        {status.icon} {status.label}
                      </Badge>
                    </div>

                    {/* Order Items */}
                    <div className="px-5 py-4">
                      <div className="space-y-3">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                              {item.deviceImage ? (
                                <Image
                                  src={item.deviceImage}
                                  alt={item.deviceName}
                                  width={56}
                                  height={56}
                                  unoptimized
                                  loading="lazy"
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                  <Package size={18} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.deviceName}</p>
                              <p className="text-xs text-gray-400 mt-0.5">Số lượng: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-700 shrink-0">
                              <PriceFormatter amount={item.subtotal} />
                            </p>
                          </div>
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <p className="text-xs text-gray-400 pl-1">
                            +{(order.items?.length || 0) - 3} sản phẩm khác
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Footer */}
                    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-400">Tổng cộng</span>
                        <span className="font-bold text-base text-gray-900">
                          <PriceFormatter amount={order.totalAmount || order.total || 0} />
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === "PENDING_PAYMENT" && (
                          <Button
                            size="sm"
                            variant={"none"}
                            className="bg-primary  text-white rounded-lg text-xs"
                            onClick={() => router.push(`/client/user/checkout?orderId=${orderId}`)}
                          >
                            <CreditCard size={13} className="mr-1" /> Thanh toán
                          </Button>
                        )}
                        <Link href={`/client/user/orders/${orderId}`} prefetch={false}>
                          <Button size="sm" variant="none" className="text-primary rounded-lg text-xs">
                            <Eye size={13} className="mr-1" /> Chi tiết
                            <ChevronRight size={13} />
                          </Button>
                        </Link>

                        {(order.status === "CANCELLED" || order.status === "FAILED") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            onClick={() => setDeletingId(String(orderId))}
                          >
                            <Trash2 size={13} />
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
        </>
      )}
    </div>
  );
};

export default OrdersTab;