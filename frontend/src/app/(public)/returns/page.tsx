

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getMyRefunds, requestOrderReturn, type Refund, type RefundStatus } from "@/lib/refundApi";
import { getUserOrders, type Order } from "@/lib/orderApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  PackageOpen,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeftRight,
  Loader2,
} from "lucide-react";

const REFUND_STATUS_CONFIG: Record<RefundStatus, { label: string; color: string; icon: React.ReactNode }> = {
  REQUESTED: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Clock className="w-4 h-4" /> },
  APPROVED: { label: "Đã duyệt", color: "bg-blue-100 text-blue-700 border-blue-200", icon: <CheckCircle2 className="w-4 h-4" /> },
  PROCESSING: { label: "Đang vận chuyển", color: "bg-purple-100 text-purple-700 border-purple-200", icon: <RefreshCw className="w-4 h-4" /> },
  SUCCESS: { label: "Hoàn tiền thành công", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="w-4 h-4" /> },
  FAILED: { label: "Thất bại", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="w-4 h-4" /> },
  CANCELLED: { label: "Đã hủy", color: "bg-slate-100 text-slate-600 border-slate-200", icon: <XCircle className="w-4 h-4" /> },
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

export default function ReturnsPage() {
  const router = useRouter();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"refunds" | "return">("refunds");

  // Return request dialog
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnCustomReason, setReturnCustomReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const [refundRes, orders] = await Promise.all([
      getMyRefunds(),
      getUserOrders(""),
    ]);
    if (refundRes.success) setRefunds(refundRes.refunds);
    if (Array.isArray(orders)) {
      setCompletedOrders(
        orders.filter((o: Order) => o.status === "COMPLETED")
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openReturnDialog = (order: Order) => {
    setSelectedOrder(order);
    setReturnReason("");
    setReturnCustomReason("");
    setSubmitError("");
    setReturnDialogOpen(true);
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrder) return;
    const finalReason =
      returnReason === "Lý do khác" ? returnCustomReason.trim() : returnReason;
    if (!finalReason) {
      setSubmitError("Vui lòng chọn hoặc nhập lý do trả hàng.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    const res = await requestOrderReturn(selectedOrder.id, finalReason);
    setSubmitting(false);
    if (res.success) {
      setReturnDialogOpen(false);
      await loadData();
      setActiveTab("refunds");
    } else {
      setSubmitError(res.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.");
    }
  };

  const activeRefunds = refunds.filter((r) => r.status !== "SUCCESS" && r.status !== "CANCELLED" && r.status !== "FAILED");
  const historyRefunds = refunds.filter((r) => r.status === "SUCCESS" || r.status === "CANCELLED" || r.status === "FAILED");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PackageOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Hoàn tiền & Trả hàng</h1>
          </div>
          <p className="text-slate-500 ml-13">Theo dõi yêu cầu hoàn tiền và gửi yêu cầu trả hàng</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "refunds"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Yêu cầu hoàn tiền {refunds.length > 0 && `(${refunds.length})`}
          </button>
          <button
            onClick={() => setActiveTab("return")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "return"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Yêu cầu trả hàng
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : activeTab === "refunds" ? (
          <div className="space-y-4">
            {/* Active refunds */}
            {activeRefunds.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Đang vận chuyển</h2>
                <div className="space-y-3">
                  {activeRefunds.map((refund) => (
                    <RefundCard key={refund.id} refund={refund} router={router} />
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {historyRefunds.length > 0 && (
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Lịch sử</h2>
                <div className="space-y-3">
                  {historyRefunds.map((refund) => (
                    <RefundCard key={refund.id} refund={refund} router={router} />
                  ))}
                </div>
              </div>
            )}

            {refunds.length === 0 && (
              <div className="text-center py-16">
                <ArrowLeftRight className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Chưa có yêu cầu hoàn tiền nào</p>
                <p className="text-slate-400 text-sm mt-1">
                  Khi bạn hủy đơn hàng đã thanh toán hoặc gửi yêu cầu trả hàng, chúng sẽ xuất hiện ở đây.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Return request tab */
          <div className="space-y-4">
            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Điều kiện trả hàng</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                    <li>Chỉ áp dụng cho đơn hàng đã hoàn thành</li>
                    <li>Sản phẩm còn nguyên vẹn, đầy đủ phụ kiện</li>
                    <li>Trong vòng 7 ngày kể từ ngày nhận hàng</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {completedOrders.length === 0 ? (
              <div className="text-center py-16">
                <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Không có đơn hàng đủ điều kiện trả hàng</p>
                <p className="text-slate-400 text-sm mt-1">Chỉ đơn hàng đã hoàn thành mới có thể yêu cầu trả hàng.</p>
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Đơn hàng đã hoàn thành</h2>
                <div className="space-y-3">
                  {completedOrders.map((order) => {
                    const hasActiveReturn = refunds.some(
                      (r) => r.orderId === order.id && r.refundType === "ORDER_RETURN" && r.status !== "FAILED" && r.status !== "CANCELLED"
                    );
                    return (
                      <Card key={order.id} className="border-slate-200">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-800">{order.orderCode}</p>
                            <p className="text-sm text-slate-500">
                              {order.items?.length || 0} sản phẩm ·{" "}
                              {(order.totalAmount || 0).toLocaleString("vi-VN")}₫
                            </p>
                          </div>
                          {hasActiveReturn ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 border">
                              Đã gửi yêu cầu
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReturnDialog(order)}
                              className="shrink-0"
                            >
                              Yêu cầu trả hàng
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Return Request Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yêu cầu trả hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedOrder && (
              <div className="p-3 bg-slate-50 rounded-lg text-sm">
                <p className="font-medium text-slate-700">{selectedOrder.orderCode}</p>
                <p className="text-slate-500">{(selectedOrder.totalAmount || 0).toLocaleString("vi-VN")}₫</p>
              </div>
            )}
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Lý do trả hàng</p>
              {RETURN_REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="returnReason"
                    value={reason}
                    checked={returnReason === reason}
                    onChange={() => setReturnReason(reason)}
                    className="accent-blue-600"
                  />
                  {reason}
                </label>
              ))}
            </div>
            {returnReason === "Lý do khác" && (
              <Textarea
                placeholder="Mô tả lý do trả hàng của bạn..."
                value={returnCustomReason}
                onChange={(e) => setReturnCustomReason(e.target.value)}
                rows={3}
                maxLength={500}
              />
            )}
            {submitError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {submitError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmitReturn} disabled={submitting || !returnReason}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang gửi...</> : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RefundCard({ refund, router }: { refund: Refund; router: ReturnType<typeof useRouter> }) {
  const cfg = REFUND_STATUS_CONFIG[refund.status];
  return (
    <Card className="border-slate-200 hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="shrink-0 p-2 bg-slate-100 rounded-lg">
          <ArrowLeftRight className="w-5 h-5 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-500">
              {REFUND_TYPE_LABEL[refund.refundType] || refund.refundType}
            </span>
            <Badge className={`text-xs border ${cfg.color} flex items-center gap-1`}>
              {cfg.icon} {cfg.label}
            </Badge>
          </div>
          <p className="font-semibold text-slate-800">
            {refund.orderCode || refund.bookingCode}
          </p>
          <p className="text-sm text-slate-500">
            {(refund.amount || 0).toLocaleString("vi-VN")}₫
            {refund.reasonDetail && ` · ${refund.reasonDetail}`}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(refund.requestedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        </div>
        {refund.orderId && (
          <button
            onClick={() => router.push(`/orders/${refund.orderId}`)}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </CardContent>
    </Card>
  );
}

