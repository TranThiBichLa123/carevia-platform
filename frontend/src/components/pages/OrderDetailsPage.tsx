"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import PriceFormatter from "@/components/common/PriceFormatter";
import PremiumFeature from "@/components/common/PremiumFeature";
import Link from "next/link";
import { User, MapPin, ShieldCheck, ReceiptText, MessageCircle, Download, AlertTriangle, Ban, Info } from "lucide-react";
import { ArrowRight, Box, Calendar, CheckCircle2, Truck } from "lucide-react";
import {
  CheckCircle,
  Package,
  Clock,
  CreditCard,
  ArrowLeft,
  FileText,
  ShoppingBag,
  ClipboardList,
  XCircle,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { getOrderById, cancelOrder, type Order } from "@/lib/orderApi";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import { cn } from "./OrdersPage";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// â”€â”€â”€ Cancel reason options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CANCEL_REASONS = [
  "Tôi muốn thay đổi phương thức thanh toán",
  "Tôi đặt nhầm sản phẩm / số lượng",
  "Tôi tìm thấy giá rẻ hơn ở nơi khác",
  "Tôi không còn nhu cầu mua nữa",
  "Tôi muốn thay đổi địa chỉ giao hàng",
  "Thời gian xử lý quá lâu",
  "Lý do khác",
];

type CancelPolicy =
  | { allowed: true; requiresRefund: boolean }
  | { allowed: false; reason: string; canContactSupport: boolean };

const getCancelPolicy = (status: string): CancelPolicy => {
  switch (status?.toUpperCase()) {
    case "PENDING_PAYMENT":
      return { allowed: true, requiresRefund: false };
    case "PAID":
      return { allowed: true, requiresRefund: true };
    case "PROCESSING":
      return {
        allowed: false,
        reason: "Đơn hàng đang được vận chuyển đến bạn. Không thể hủy trực tiếp.",
        canContactSupport: true,
      };
    case "COMPLETED":
      return {
        allowed: false,
        reason: "Đơn hàng đã hoàn thành và được giao thành công.",
        canContactSupport: false,
      };
    case "CANCELLED":
      return {
        allowed: false,
        reason: "Đơn hàng này đã được hủy trước đó.",
        canContactSupport: false,
      };
    default:
      return {
        allowed: false,
        reason: "Không thể hủy đơn hàng ở trạng thái hiện tại.",
        canContactSupport: true,
      };
  }
};

const getStatusBanner = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDING_PAYMENT":
      return {
        bg: "bg-amber-50 border-amber-200",
        icon: <Clock className="h-5 w-5 text-amber-600" />,
        title: "Chờ thanh toán",
        desc: "Đơn hàng của bạn đang chờ được thanh toán. Vui lòng hoàn tất thanh toán để xử lý.",
        titleColor: "text-amber-800",
        descColor: "text-amber-700",
      };
    case "PAID":
      return {
        bg: "bg-blue-50 border-blue-200",
        icon: <CheckCircle className="h-5 w-5 text-blue-600" />,
        title: "Đã thanh toán — Đang chuẩn bị hàng",
        desc: "Thanh toán đã được xác nhận. Chúng tôi đang đóng gói và chuẩn bị giao cho bạn.",
        titleColor: "text-blue-800",
        descColor: "text-blue-700",
      };
    case "PROCESSING":
      return {
        bg: "bg-purple-50 border-purple-200",
        icon: <Truck className="h-5 w-5 font-vietnam text-purple-600" />,
        title: "Đang vận chuyển",
        desc: "Đơn hàng của bạn đang trên đường giao. Shipper sẽ liên hệ trước khi đến.",
        titleColor: "text-purple-800",
        descColor: "text-purple-700",
      };
    case "COMPLETED":
      return {
        bg: "bg-emerald-50 border-emerald-200",
        icon: <CheckCircle2 className="h-5 w-5 font-vietnam text-emerald-600" />,
        title: "Đã giao hàng thành công",
        desc: "Cảm ơn bạn đã mua sắm! Đơn hàng đã được giao thành công.",
        titleColor: "text-emerald-800",
        descColor: "text-emerald-700",
      };
    case "CANCELLED":
      return {
        bg: "bg-red-50 border-red-200",
        icon: <XCircle className="h-5 w-5 font-vietnam text-red-600" />,
        title: "Đơn hàng đã hủy",
        desc: "Đơn hàng này đã bị hủy.",
        titleColor: "text-red-800",
        descColor: "text-red-700",
      };
    default:
      return null;
  }
};

const StepItem = ({ icon, label, active, isCurrent, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex flex-col items-center gap-3 w-20"
  >
    <div className="relative">
      {isCurrent && (
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
      )}
      <div className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-500",
        active ? "bg-primary scale-110" : "bg-gray-200"
      )}>
        {React.cloneElement(icon, {
          className: cn("w-5 h-5", active ? "text-white" : "text-gray-400")
        })}
      </div>
    </div>
    <span className={cn(
      "text-[10px] font-bold font-vietnam text-center leading-tight transition-colors duration-500",
      active ? "text-gray-900" : "text-gray-400"
    )}>
      {label}
    </span>
  </motion.div>
);

const ENABLE_FREE_ACCESS = true;

const OrderDetailsPage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [cancelCustomReason, setCancelCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth_token } = useUserStore();
  const orderId = params.id as string;
  const success = searchParams.get("success");

  if (!ENABLE_FREE_ACCESS) {
    return (
      <PremiumFeature
        icon={FileText}
        title="Detailed Order Tracking"
        description="Get comprehensive order details with real-time tracking, payment status, and complete itemized breakdowns."
        features={[
          "Complete order history and details",
          "Real-time order status tracking",
          "Detailed payment information",
          "Full itemized breakdown with images",
          "Order timeline and updates",
          "Customer support integration",
          "Export order details as PDF",
          "Priority customer service",
        ]}
      />
    );
  }

  useEffect(() => {
    // Tạo một biến cờ để tránh gọi API trùng lặp nếu component re-render nhanh
    let isMounted = true;

    const fetchOrder = async () => {
      if (!orderId || !auth_token) {
        toast.error("Thiếu thông tin đăng nhập hoặc mã đơn hàng.");
        router.push("/client/account?tab=orders");
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderById(orderId, auth_token);

        if (!isMounted) return;

        if (orderData) {
          setOrder(orderData);
          // Kiểm tra thông báo thành công chỉ chạy 1 lần duy nhất
          if (success === "true" && orderData.status?.toUpperCase() === "PAID") {
            toast.success("Thanh toán thành công! Đơn hàng đã được xác nhận.");
          }
        } else {
          toast.error("Không tìm thấy đơn hàng");
          router.push("/client/account?tab=orders");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Không thể tải chi tiết đơn hàng");
        router.push("/client/account?tab=orders");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrder();

    // Cleanup function: Hủy trạng thái khi component bị unmount
    return () => {
      isMounted = false;
    };
    // TUYỆT ĐỐI KHÔNG đưa 'router' hoặc 'success' vào mảng dependency này nữa
  }, [orderId, auth_token]);

  const handleCancelOrder = async () => {
    if (!order || !auth_token) return;
    const finalReason = cancelReason === "Lý do khác" ? cancelCustomReason.trim() || "Lý do khác" : cancelReason;
    setCancelling(true);
    try {
      const result = await cancelOrder(String(order.id), finalReason, auth_token);
      if (result.success && result.order) {
        setOrder(result.order);
        toast.success("Đơn hàng đã được hủy thành công.");
      } else {
        toast.error(result.message || "Không thể hủy đơn hàng.");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi hủy đơn hàng.");
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "PENDING_PAYMENT":
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "PROCESSING":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID": return "Đã thanh toán";
      case "PENDING_PAYMENT":
      case "PENDING": return "Chờ thanh toán";
      case "PROCESSING": return "Đang vận chuyển";
      case "COMPLETED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID": return "text-green-600 bg-green-50";
      case "PENDING_PAYMENT":
      case "PENDING": return "text-yellow-600 bg-yellow-50";
      case "PROCESSING": return "text-purple-600 bg-purple-50";
      case "COMPLETED": return "text-emerald-600 bg-emerald-50";
      case "CANCELLED": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <Container>
        <PageBreadcrumb
          items={[{ label: "Đơn hàng của bạn", href: "/client/account?tab=orders" }]}
          currentPage="Chi tiết đơn hàng"
        />
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng</h1>
          <Button onClick={() => router.push("/client/account?tab=orders")}>
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </Container>
    );
  }

  const calculateSubtotal = () =>
    order.items.reduce((total, item) => total + (item.subtotal || item.unitPrice * item.quantity), 0);
  const calculateShipping = () => (calculateSubtotal() > 100 ? 0 : 15);
  const calculateTax = () => calculateSubtotal() * 0.08;

  const policy = getCancelPolicy(order.status);
  const banner = getStatusBanner(order.status);
  const isCancelled = order.status?.toUpperCase() === "CANCELLED";

  return (
    <Container className="">
      <div className="py-4">
        <PageBreadcrumb
          items={[{ label: "Đơn hàng của bạn", href: "/client/account?tab=orders" }]}
          currentPage="Chi tiết đơn hàng"
        />
      </div>

      <div className="">
        {/* Status Banner */}
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 rounded-2xl border p-5 mb-6 ${banner.bg}`}
          >
            <div className="mt-0.5 shrink-0">{banner.icon}</div>
            <div>
              <p className={`font-bold font-vietnam text-sm ${banner.titleColor}`}>{banner.title}</p>
              <p className={`text-[13px] font-vietnam mt-0.5 ${banner.descColor}`}>{banner.desc}</p>
              {/* Show cancel reason if cancelled */}
              {isCancelled && order.cancelReason && (
                <p className="text-[12px] text-red-600 mt-1 font-vietnam">
                  Lý do hủy: <span className="font-semibold">{order.cancelReason}</span>
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* PENDING_PAYMENT: pay now prompt */}
        {order.status?.toUpperCase() === "PENDING_PAYMENT" && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-vietnam text-amber-800 font-medium">
                Đơn hàng chưa được thanh toán
              </span>
            </div>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white font-vietnam rounded-xl px-4"
              onClick={() => router.push(`/client/user/checkout?orderId=${order._id}`)}
            >
              Thanh toán ngay
            </Button>
          </div>
        )}

        {/* SECTION 1: Shipping status tracker */}
        {!isCancelled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ x: [0, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="p-3 bg-primary/10 rounded-2xl"
                  >
                    <Truck className="w-6 h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold font-vietnam text-lg text-gray-900 leading-tight">
                      {order.status === "COMPLETED" ? "Giao hàng thành công" : "Thông tin vận chuyển"}
                    </h3>
                    <p className="text-xs font-vietnam text-gray-400 mt-1">
                      Mã đơn: <span className="text-gray-600 font-semibold">#{order._id.slice(-8).toUpperCase()}</span>
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 text-[10px] font-bold font-vietnam uppercase tracking-wider rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="relative pt-4 pb-8 px-2">
                <div className="absolute top-[22px] left-0 w-full h-1 bg-gray-100 rounded-full" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      order.status === "COMPLETED" ? "100%" :
                        order.status === "PROCESSING" ? "66%" :
                          order.status === "PAID" ? "33%" :
                            "15%"
                  }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="absolute top-[22px] left-0 h-1 bg-primary rounded-full z-10"
                />
                <div className="relative z-20 flex justify-between">
                  <StepItem icon={<FileText />} label="Đã đặt hàng" active={true} delay={0.2} />
                  <StepItem
                    icon={<Box />}
                    label="Đang chuẩn bị"
                    active={["PAID", "PROCESSING", "COMPLETED"].includes(order.status?.toUpperCase())}
                    isCurrent={order.status?.toUpperCase() === "PAID"}
                    delay={0.4}
                  />
                  <StepItem
                    icon={<Truck />}
                    label="Đang giao"
                    active={["PROCESSING", "COMPLETED"].includes(order.status?.toUpperCase())}
                    isCurrent={order.status?.toUpperCase() === "PROCESSING"}
                    delay={0.6}
                  />
                  <StepItem
                    icon={<CheckCircle2 />}
                    label="Đã nhận hàng"
                    active={order.status?.toUpperCase() === "COMPLETED"}
                    isCurrent={order.status?.toUpperCase() === "COMPLETED"}
                    delay={0.8}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="group bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 flex-1 flex items-center gap-5 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-primary-hover">
                  <Calendar className="w-6 h-6 text-primary transition-colors group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-vietnam">Dự kiến nhận</p>
                  <p className="font-black text-gray-900 text-lg font-vietnam mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
              <div className="group bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 flex-1 flex items-center gap-5 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-purple-hover">
                  <Clock className="w-6 h-6 text-purple transition-colors group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-vietnam">Xử lý trong</p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <p className="font-black text-gray-900 text-2xl font-vietnam">24</p>
                    <p className="text-xs font-bold text-gray-500 font-vietnam">giờ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CANCELLED: show big cancelled card instead of tracker */}
        {isCancelled && (
          <div className="bg-white rounded-[24px] shadow-sm border border-red-100 p-10 text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-bold text-lg font-vietnam text-gray-900">Đơn hàng đã bị hủy</h3>
            {order.cancelReason && (
              <p className="text-sm font-vietnam text-gray-500 mt-2">
                Lý do: <span className="font-semibold text-gray-700">{order.cancelReason}</span>
              </p>
            )}
            {order.refundStatus && (
              <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${order.refundStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  order.refundStatus === 'REQUESTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    (order.refundStatus === 'APPROVED' || order.refundStatus === 'PROCESSING') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                {order.refundStatus === 'REQUESTED' && '⏳ Hoàn tiền đang chờ xét duyệt'}
                {order.refundStatus === 'APPROVED' && '✅ Hoàn tiền đã được duyệt'}
                {order.refundStatus === 'PROCESSING' && '🔄 Đang xử lý hoàn tiền'}
                {order.refundStatus === 'SUCCESS' && '✅ Hoàn tiền thành công'}
                {order.refundStatus === 'FAILED' && '❌ Hoàn tiền thất bại — liên hệ hỗ trợ'}
                {order.refundStatus === 'CANCELLED' && 'Hoàn tiền đã hủy'}
              </div>
            )}
            <p className="text-xs font-vietnam text-gray-400 mt-3 max-w-sm mx-auto">
              Nếu bạn đã thanh toán, hoàn tiền sẽ được xử lý trong 3–7 ngày làm việc.
            </p>
            <Link href="/client/account?tab=orders">
              <Button variant="outline" className="mt-6 font-vietnam rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại đơn hàng
              </Button>
            </Link>
          </div>
        )}

        {/* SECTION 2: Timeline + Delivery Info */}
        {!isCancelled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Timeline */}
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
              <h3 className="font-bold font-vietnam mb-8 text-sm uppercase tracking-[0.15em] text-gray-400">
                Hành trình đơn hàng
              </h3>
              <div className="space-y-0 relative">
                {["PAID", "COMPLETED"].includes(order.status?.toUpperCase()) && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex gap-6 group">
                    <div className="flex flex-col items-end w-16 pt-1">
                      <span className="text-[11px] font-bold text-gray-900 leading-none">Hôm nay</span>
                    </div>
                    <div className="relative pb-10 border-l-2 border-primary pl-8">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full border-4 border-primary-light z-10">
                        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
                      </div>
                      <p className="font-bold font-vietnam text-[14px] text-primary">Thanh toán xác nhận</p>
                      <p className="text-[13px] font-vietnam text-gray-500 mt-1 leading-relaxed">
                        Thanh toán thành công. Shop đang chuẩn bị hàng cho bạn.
                      </p>
                    </div>
                  </motion.div>
                )}
                {["PROCESSING", "COMPLETED"].includes(order.status?.toUpperCase()) && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex gap-6 group">
                    <div className="flex flex-col items-end w-16 pt-1">
                      <span className="text-[11px] font-bold text-gray-900 leading-none">Hôm nay</span>
                    </div>
                    <div className="relative pb-10 border-l-2 border-primary pl-8">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full border-4 border-primary-light z-10" />
                      <p className="font-bold font-vietnam text-[14px] text-primary">Đang vận chuyển</p>
                      <p className="text-[13px] font-vietnam text-gray-500 mt-1">Kiện hàng đã rời kho <span className="font-semibold text-gray-700">Carevia Hub</span>.</p>
                    </div>
                  </motion.div>
                )}
                {order.status?.toUpperCase() === "COMPLETED" && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex gap-6 group">
                    <div className="flex flex-col items-end w-16 pt-1">
                      <span className="text-[11px] font-bold text-gray-900 leading-none">Hôm nay</span>
                    </div>
                    <div className="relative pl-8">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full border-4 border-primary-light z-10" />
                      <p className="font-bold font-vietnam text-[14px] text-primary">Giao hàng thành công</p>
                      <p className="text-[13px] font-vietnam text-gray-500 mt-1">Đơn hàng đã được giao. Cảm ơn bạn!</p>
                    </div>
                  </motion.div>
                )}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="flex gap-6 group">
                  <div className="flex flex-col items-end w-16 pt-1">
                    <span className="text-[11px] font-bold text-gray-400 leading-none">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-200 rounded-full border-4 border-gray-50 z-10" />
                    <p className="font-bold font-vietnam text-[14px] text-gray-400">Đơn hàng đã đặt</p>
                    <p className="text-[12px] font-vietnam text-gray-400 mt-0.5">Mã: #{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 flex flex-col h-full">
              <h3 className="font-bold font-vietnam mb-8 text-sm uppercase tracking-[0.15em] text-gray-400">
                Thông tin vận chuyển
              </h3>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between py-4 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
                      <User className="w-4 h-4 text-primary group-hover:text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 font-vietnam">Người nhận</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 font-vietnam">{order.shippingAddress || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-4 border-y border-gray-50 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
                      <Truck className="w-4 h-4 text-primary group-hover:text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 font-vietnam">Đơn vị vận chuyển</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 font-vietnam">Giao Hàng Nhanh (GHN)</span>
                </div>
                <div className="flex items-start justify-between py-4 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
                      <MapPin className="w-4 h-4 text-primary group-hover:text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-500 font-vietnam">Thành phố</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 font-vietnam text-right max-w-[180px]">
                    {order.shippingCity || "—"}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                <p className="text-[11px] text-gray-400 font-medium italic font-vietnam">
                  * Vui lòng giữ điện thoại để shipper liên lạc khi hàng đến.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Product list */}
        <div className="mt-6">
          <h3 className="font-bold font-vietnam mb-4 px-2 text-sm text-gray-500 uppercase tracking-wider">
            Sản phẩm đã đặt ({order.items.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {order.items.map((item, index) => (
              <div key={index} className="bg-white p-3 rounded-[16px] shadow-sm border border-gray-100 flex items-center gap-4 hover:border-primary/30 transition-all group relative">
                <Link
                  href={`/client/devices/${item.deviceId || item.id}`}
                  className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden p-1.5 flex-shrink-0 border border-gray-50 block"
                >
                  <Image
                    src={item.deviceImage}
                    alt={item.deviceName}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-300"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/client/devices/${item.deviceId || item.id}`}>
                    <h4 className="font-bold font-vietnam text-[13px] text-gray-900 truncate leading-tight hover:text-primary transition-colors">
                      {item.deviceName}
                    </h4>
                  </Link>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <PriceFormatter amount={item.unitPrice} className="text-[13px] font-bold font-vietnam text-gray-900" />
                    <span className="text-[10px] text-gray-400 font-medium font-vietnam">x{item.quantity}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-vietnam mt-0.5">
                    Phân loại: <span className="text-gray-600 font-bold uppercase">Chăm sóc sức khỏe</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: Payment summary + Actions */}
        <div className="bg-white mt-8 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left: Payment detail */}
            <div className="flex-1 p-8 border-r border-gray-50 bg-gray-50/20">
              <h3 className="font-bold text-gray-900 text-[15px] mb-6 flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-primary" />
                Chi tiết thanh toán
              </h3>
              <div className="space-y-3 font-vietnam">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tổng tiền hàng</span>
                  <PriceFormatter amount={calculateSubtotal()} />
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Phí vận chuyển</span>
                  <PriceFormatter amount={calculateShipping()} />
                </div>
                {/* {calculateTax() > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Thuế VAT (8%)</span>
                    <PriceFormatter amount={calculateTax()} />
                  </div>
                )} */}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Voucher giảm giá</span>
                  <span className="text-red-500">- <PriceFormatter amount={0} /></span>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Thành tiền</span>
                  <PriceFormatter amount={order.total} className="text-3xl font-black text-primary tracking-tighter" />
                </div>
                <div className="flex items-center gap-2 mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <p className="text-[11px] text-primary font-bold">
                    Vui lòng kiểm tra kỹ đơn hàng trước khi xác nhận nhận hàng.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="w-full md:w-80 p-8 flex flex-col justify-center gap-4 bg-white">
              <p className="text-[11px] text-gray-400 font-medium text-center mb-2 italic">
                Cần hỗ trợ về đơn hàng này?
              </p>

              <Button variant="outline" className="group relative w-full h-12 overflow-hidden rounded-full border-primary text-primary font-bold transition-all duration-500">
                <span className="absolute inset-y-0 left-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />
                <div className="relative z-10 flex items-center justify-center transition-colors duration-500 group-hover:text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span>Liên hệ hỗ trợ</span>
                </div>
              </Button>

              {/* Chỉ hiện nút tải hóa đơn khi đã thanh toán */}
              {/* {["PAID", "PROCESSING", "COMPLETED"].includes(order.status?.toUpperCase()) && (
                <Button className="group relative w-full h-12 overflow-hidden rounded-full bg-black text-white font-bold transition-all duration-500">
                  <span className="absolute inset-y-0 left-0 w-0 bg-zinc-800 transition-all duration-500 ease-out group-hover:w-full" />
                  <div className="relative z-10 flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    <span>Tải hóa đơn (PDF)</span>
                  </div>
                </Button>
              )} */}

              {/* Cancel button â€” conditional on policy */}
              {policy.allowed ? (
                <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-full border-red-300 text-red-600 hover:bg-red-50 font-bold font-vietnam transition-all"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Hủy đơn hàng
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="max-w-[440px] rounded-[24px] p-0 overflow-hidden border-none">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.6, ease: "circOut" }}
                      className="h-1.5 bg-gradient-to-r from-red-400 via-red-600 to-red-400"
                    />
                    <div className="p-8">
                      <AlertDialogHeader className="text-left mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <AlertDialogTitle className="text-lg font-bold font-vietnam text-gray-900">
                            Xác nhận hủy đơn hàng
                          </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-[13px] font-vietnam text-gray-600 leading-relaxed">
                          Đơn hàng <span className="font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</span> sẽ bị hủy.
                          {policy.requiresRefund && (
                            <span className="block mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[12px]">
                              ⚠️ Bạn đã thanh toán cho đơn hàng này. Hoàn tiền sẽ được xử lý trong <strong>3–7 ngày làm việc</strong>.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      {/* Reason selector */}
                      <div className="mb-6">
                        <label className="text-[12px] font-bold uppercase tracking-wider text-gray-500 font-vietnam mb-2 block">
                          Lý do hủy đơn
                        </label>
                        {/* Khối Dropdown Lý do hủy */}
                        <div className="relative group w-full">
                          {/* Hiển thị lý do hiện tại */}
                          <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl cursor-pointer group-hover:border-red-300 transition-all shadow-sm">
                            <span className="text-[13px] font-medium text-gray-700 font-vietnam truncate mr-2">
                              {cancelReason || "Chọn lý do hủy..."}
                            </span>
                            <ChevronDown
                              size={16}
                              className="text-gray-400 group-hover:rotate-180 transition-transform duration-300 group-hover:text-red-500"
                            />
                          </div>

                          {/* Danh sách các lựa chọn khi Hover */}
                          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <div className="flex flex-col max-h-[200px] overflow-y-auto">
                              {CANCEL_REASONS.map((reason) => (
                                <div
                                  key={reason}
                                  onClick={() => setCancelReason(reason)}
                                  className={`px-4 py-3 text-[13px] cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors font-vietnam
            ${cancelReason === reason
                                      ? 'text-red-600 font-bold bg-red-50'
                                      : 'text-gray-700 hover:bg-gray-50 hover:text-red-500'
                                    }`}
                                >
                                  {reason}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {cancelReason === "Lý do khác" && (
                          <textarea
                            value={cancelCustomReason}
                            onChange={(e) => setCancelCustomReason(e.target.value)}
                            placeholder="Nhập lý do hủy của bạn..."
                            rows={3}
                            className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[13px] font-vietnam text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                          />
                        )}
                      </div>

                      <AlertDialogFooter className="flex gap-3">
                        <AlertDialogCancel
                          className="flex-1 h-11 rounded-full border-gray-200 font-vietnam text-gray-700 hover:bg-gray-50"
                          disabled={cancelling}
                        >
                          Giữ đơn hàng
                        </AlertDialogCancel>
                        <Button
                          onClick={handleCancelOrder}
                          disabled={cancelling}
                          className="flex-1 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white font-vietnam font-bold"
                        >
                          {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
                        </Button>
                      </AlertDialogFooter>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                // Can't cancel â€” show reason with optional support link
                !isCancelled && (() => {
                  const p = policy as { allowed: false; reason: string; canContactSupport: boolean };
                  return (
                    <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                      <div className="flex items-start gap-2">
                        <Ban className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[12px] font-bold text-gray-500 font-vietnam">Không thể hủy đơn hàng</p>
                          <p className="text-[11px] text-gray-400 font-vietnam mt-0.5">{p.reason}</p>
                          {p.canContactSupport && (
                            <button className="text-[11px] text-primary font-semibold font-vietnam mt-1.5 hover:underline">
                              Liên hệ hỗ trợ để yêu cầu hủy →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default OrderDetailsPage;
