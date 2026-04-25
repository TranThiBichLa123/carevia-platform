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
import { User, MapPin, ShieldCheck, ReceiptText, MessageCircle, Download } from "lucide-react";
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
} from "lucide-react";
import Image from "next/image";
import { getOrderById, type Order } from "@/lib/orderApi";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import { cn } from "./OrdersPage";
import { motion } from "framer-motion";

const StepItem = ({ icon, label, active, isCurrent, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex flex-col items-center gap-3 w-20"
  >
    <div className="relative">
      {/* Hiệu ứng sóng nháy (Ripple) nếu là bước hiện tại */}
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

// Set to true to enable access
const ENABLE_FREE_ACCESS = true;

const OrderDetailsPage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth_token } = useUserStore();
  const orderId = params.id as string;
  const success = searchParams.get("success");

  // Show premium feature lock if free access is disabled
  if (!ENABLE_FREE_ACCESS) {
    return (
      <PremiumFeature
        icon={FileText}
        title="Detailed Order Tracking"
        description="Get comprehensive order details with real-time tracking, payment status, and complete itemized breakdowns. This premium feature provides you with complete transparency and control over all your orders."
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
    const fetchOrder = async () => {
      if (!orderId || !auth_token) {
        toast.error("Order ID or authentication token missing");
        router.push("/client/user/orders");
        return;
      }
      setLoading(true);
      try {
        const orderData = await getOrderById(orderId, auth_token);
        if (orderData) {
          setOrder(orderData);
          if (success === "true" && orderData.status === "PAID") {
            toast.success("Payment successful! Your order has been confirmed.");
          }
        } else {
          toast.error("Order not found");
          router.push("/client/user/orders");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
        router.push("/client/user/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, auth_token, router, success]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "completed":
        return <Package className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payment Confirmed";
      case "pending":
        return "Payment Pending";
      case "completed":
        return "Order Completed";
      case "cancelled":
        return "Order Cancelled";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "completed":
        return "text-blue-600 bg-blue-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <Container>
        <PageBreadcrumb
          items={[{ label: "Orders", href: "/client/user/orders" }]}
          currentPage="Order Details"
        />
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
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
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy đơn hàng
          </h1>
          <Button onClick={() => router.push("/client/user/orders")}>
            Quay lại danh sách đơn hàng
          </Button>
        </div>
      </Container>
    );
  }

  const calculateSubtotal = () => {
    return order.items.reduce(
      (total, item) => total + (item.subtotal || item.unitPrice * item.quantity),
      0
    );
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 100 ? 0 : 15;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.08;
  };

  return (
    <Container className="pt-5">
      <PageBreadcrumb
        items={[{ label: "Đơn hàng của bạn", href: "/client/user/orders" }]}
        currentPage="Chi tiết đơn hàng"
      />

      <div className="">
        {/* Success Message */}
        {success === "true" && order?.status === "PAID" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h2 className="text-lg font-semibold text-green-800">
                  Thanh toán thành công!
                </h2>
                <p className="text-green-700">
                  Đơn hàng của bạn đã được xác nhận và đang được xử lý.
                </p>
              </div>
            </div>
          </div>
        )}



        {/* SECTION 1: Trạng thái vận chuyển & Thời gian */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Khối trạng thái vận chuyển kiểu Shopee nâng cấp Animation */}
          <div className="md:col-span-2 bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                {/* Icon xe tải với hiệu ứng rung nhẹ */}
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

              <div className="px-3 py-1 bg-purple/10 text-purple text-[10px] font-bold uppercase tracking-wider rounded-full">
                {order.status}
              </div>
            </div>

            <div className="relative pt-4 pb-8 px-2">
              {/* Thanh nền xám */}
              <div className="absolute top-[22px] left-0 w-full h-1 bg-gray-100 rounded-full" />

              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    order.status === "COMPLETED" ? "100%" :
                      order.status === "PROCESSING" ? "66%" :
                        order.status === "PAID" ? "33%" :
                          "15%" // Mặc định cho PENDING_PAYMENT hoặc các trạng thái mới đặt
                }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="absolute top-[22px] left-0 h-1 bg-primary rounded-full z-10"
              />


              <div className="relative z-20 flex justify-between">
                {/* Bước 1: Đặt hàng */}
                <StepItem
                  icon={<FileText />}
                  label="Đã đặt hàng"
                  active={true}
                  delay={0.2}
                />

                {/* Bước 2: Đang chuẩn bị */}
                <StepItem
                  icon={<Box />}
                  label="Đang chuẩn bị"
                  active={["PAID", "PROCESSING", "COMPLETED"].includes(order.status)}
                  isCurrent={order.status === "PAID"}
                  delay={0.4}
                />

                {/* Bước 3: Đang giao */}
                <StepItem
                  icon={<Truck />}
                  label="Đang giao"
                  active={["PROCESSING", "COMPLETED"].includes(order.status)}
                  isCurrent={order.status === "PROCESSING"}
                  delay={0.6}
                />

                {/* Bước 4: Hoàn thành */}
                <StepItem
                  icon={<CheckCircle2 />}
                  label="Đã nhận hàng"
                  active={order.status === "COMPLETED"}
                  isCurrent={order.status === "COMPLETED"}
                  delay={0.8}
                />
              </div>
            </div>
          </div>



          {/* 2 Khối nhỏ bên phải - Nâng cấp giao diện */}
          <div className="flex flex-col gap-4">
            {/* Khối 1: Dự kiến nhận hàng */}
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

            {/* Khối 2: Thời gian xử lý */}
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

        {/* SECTION 2: Timeline & Thông tin giao hàng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Timeline Chi Tiết Với Animation & Màu Primary */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100">
            <h3 className="font-bold font-vietnam mb-8 text-sm uppercase tracking-[0.15em] text-gray-400">
              Hành trình đơn hàng
            </h3>

            <div className="space-y-0 relative">

              {/* 1. Mốc: Hoàn thành (Ví dụ khi status là PAID hoặc COMPLETED) */}
              {["PAID", "COMPLETED"].includes(order.status) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex gap-6 group"
                >
                  <div className="flex flex-col items-end w-16 pt-1">
                    <span className="text-[11px] font-bold text-gray-900 leading-none">14:20</span>
                    <span className="text-[10px] text-gray-400 font-medium">Hôm nay</span>
                  </div>
                  <div className="relative pb-10 border-l-2 border-primary pl-8">
                    {/* Điểm mốc phát sáng */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-primary rounded-full border-4 border-primary-light z-10">
                      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
                    </div>
                    <p className="font-bold font-vietnam text-[14px] text-primary">Giao hàng thành công</p>
                    <p className="text-[13px] font-vietnam text-gray-500 mt-1 leading-relaxed">
                      Đơn hàng đã được giao đến tay khách hàng. Cảm ơn bạn đã mua sắm!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 2. Mốc: Đang vận chuyển */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex gap-6 group"
              >
                <div className="flex flex-col items-end w-16 pt-1">
                  <span className={cn(
                    "text-[11px] font-bold leading-none",
                    order.status === "PAID" ? "text-gray-400" : "text-gray-900"
                  )}>09:15</span>
                  <span className="text-[10px] text-gray-400 font-medium">12 Th04</span>
                </div>
                <div className={cn(
                  "relative pb-10 border-l-2 pl-8",
                  order.status === "PAID" ? "border-gray-100" : "border-primary"
                )}>
                  <div className={cn(
                    "absolute -left-[9px] top-0 w-4 h-4 rounded-full z-10 transition-all duration-500",
                    order.status === "PAID" ? "bg-gray-300 border-4 border-gray-50" : "bg-primary border-4 border-primary-light"
                  )} />
                  <p className={cn(
                    "font-bold font-vietnam text-[14px]",
                    order.status === "PAID" ? "text-gray-500" : "text-primary"
                  )}>
                    Đang vận chuyển
                  </p>
                  <p className="text-[13px] font-vietnam text-gray-500 mt-1 leading-relaxed">
                    Kiện hàng đã rời kho phân loại <span className="font-semibold text-gray-700">Carevia Hub</span>.
                  </p>
                </div>
              </motion.div>

              {/* 3. Mốc: Đã xác nhận */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex gap-6 group"
              >
                <div className="flex flex-col items-end w-16 pt-1">
                  <span className="text-[11px] font-bold text-gray-400 leading-none">08:00</span>
                  <span className="text-[10px] text-gray-400 font-medium">11 Th04</span>
                </div>
                <div className="relative pb-10 border-l-2 border-gray-100 pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-200 rounded-full border-4 border-gray-50 z-10" />
                  <p className="font-bold font-vietnam text-[14px] text-gray-400">Người bán đang chuẩn bị hàng</p>
                  <p className="text-[13px] font-vietnam text-gray-500 mt-1 leading-relaxed text-opacity-70">
                    Đơn hàng của bạn đã được xác nhận. Shop đang đóng gói sản phẩm.
                  </p>
                </div>
              </motion.div>

              {/* 4. Mốc: Đặt hàng thành công */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex gap-6 group"
              >
                <div className="flex flex-col items-end w-16 pt-1">
                  <span className="text-[11px] font-bold text-gray-400 leading-none">23:45</span>
                  <span className="text-[10px] text-gray-400 font-medium">10 Th04</span>
                </div>
                <div className="relative pl-8">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-gray-200 rounded-full border-4 border-gray-50 z-10" />
                  <p className="font-bold font-vietnam text-[14px] text-gray-400 text-opacity-60">Đơn hàng đã đặt</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Delivery Info - Nâng cấp giao diện */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="font-bold font-vietnam mb-8 text-sm uppercase tracking-[0.15em] text-gray-400">
              Thông tin vận chuyển
            </h3>

            <div className="space-y-1 flex-1">
              {/* Người nhận */}
              <div className="flex items-center justify-between py-4 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
                    <User className="w-4 h-4 text-primary group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 font-vietnam">Người nhận</span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-vietnam tracking-tight">Bích Là</span>
              </div>

              {/* Đơn vị vận chuyển */}
              <div className="flex items-center justify-between py-4 border-y border-gray-50 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
                    <Truck className="w-4 h-4 text-primary group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 font-vietnam">Đơn vị vận chuyển</span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-vietnam">Giao Hàng Nhanh (GHN)</span>
              </div>

              {/* Địa chỉ nhận */}
              <div className="flex items-start justify-between py-4 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
                    <MapPin className="w-4 h-4 text-primary group-hover:text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 font-vietnam">Địa chỉ nhận</span>
                </div>
                <span className="text-sm font-bold text-gray-900 font-vietnam text-right max-w-[180px] leading-relaxed">
                  Hồ Chí Minh, Việt Nam
                </span>
              </div>
            </div>

            {/* Một ghi chú nhỏ phía dưới để tạo cảm giác chu đáo */}
            <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
              <p className="text-[11px] text-gray-400 font-medium italic font-vietnam">
                * Vui lòng giữ điện thoại để shipper liên lạc khi hàng đến.
              </p>
            </div>
          </div>

        </div>

        {/* SECTION 3: Danh sách sản phẩm 2 cột có Link */}
        <div className="mt-6">
          <h3 className="font-bold font-vietnam mb-4 px-2 text-sm text-gray-500 uppercase tracking-wider">
            Sản phẩm đã đặt ({order.items.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="bg-white p-3 rounded-[16px] shadow-sm border border-gray-100 flex items-center gap-4 hover:border-primary/30 transition-all group relative"
              >
                {/* Dẫn link ở Ảnh sản phẩm */}
                <Link
                  href={`/client/devices/${item.deviceId || item.id}`} // Sử dụng ID chuẩn của bạn
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

                {/* Thông tin sản phẩm */}
                <div className="flex-1 min-w-0">
                  {/* Dẫn link ở Tên sản phẩm */}
                  <Link href={`/client/devices/${item.deviceId || item.id}`}>
                    <h4 className="font-bold font-vietnam text-[13px] text-gray-900 truncate leading-tight hover:text-primary transition-colors">
                      {item.deviceName}
                    </h4>
                  </Link>

                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <PriceFormatter
                      amount={item.unitPrice}
                      className="text-[13px] font-bold font-vietnam text-gray-900"
                    />
                    <span className="text-[10px] text-gray-400 font-medium font-vietnam">
                      x{item.quantity}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-400 font-vietnam mt-0.5">
                    Phân loại: <span className="text-gray-600 font-bold uppercase">Chăm sóc da</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>




        {/* SECTION 4: Tóm tắt thanh toán phong cách Shopee */}
        <div className="bg-white mt-8 rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* Cột trái: Chi tiết các khoản phí */}
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
                {calculateTax() > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Thuế (VAT)</span>
                    <PriceFormatter amount={calculateTax()} />
                  </div>
                )}

                {/* Nếu có mã giảm giá (Mô phỏng Shopee) */}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Voucher giảm giá</span>
                  <span className="text-red-500">- <PriceFormatter amount={0} /></span>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Thành tiền</span>
                  <PriceFormatter
                    amount={order.total}
                    className="text-3xl font-black text-primary tracking-tighter"
                  />
                </div>

                <div className="flex items-center gap-2 mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <p className="text-[11px] text-primary font-bold">
                    Vui lòng kiểm tra kỹ đơn hàng trước khi xác nhận nhận hàng.
                  </p>
                </div>
              </div>
            </div>

            {/* Cột phải: Các nút hành động */}
            <div className="w-full md:w-80 p-8 flex flex-col justify-center gap-4 bg-white">
              <p className="text-[11px] text-gray-400 font-medium text-center mb-2 italic">
                Cần hỗ trợ về đơn hàng này?
              </p>

              {/* Nút Liên hệ hỗ trợ - Màu Primary nhẹ */}
              <Button
                variant="outline"
                className="group relative w-full h-12 overflow-hidden rounded-full border-primary text-primary font-bold transition-all duration-500"
              >
                <span className="absolute inset-y-0 left-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />
                <div className="relative z-10 flex items-center justify-center transition-colors duration-500 group-hover:text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  <span>Liên hệ hỗ trợ</span>
                </div>
              </Button>

              {/* Nút Tải hóa đơn - Màu Đen tối giản */}
              <Button
                className="group relative w-full h-12 overflow-hidden rounded-full bg-black text-white font-bold transition-all duration-500"
              >
                <span className="absolute inset-y-0 left-0 w-0 bg-zinc-800 transition-all duration-500 ease-out group-hover:w-full" />
                <div className="relative z-10 flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  <span>Tải hóa đơn (PDF)</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </Container>
  );
}

export default OrderDetailsPage;
