"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ChevronRight } from "lucide-react";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  currentPage: string;
  showSocialShare?: boolean;
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  CheckCircle,
  Package,
  Home,
  Eye,
  Trash2,
  CreditCard,
  RefreshCw,
  Calendar,
  Clock,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import { getUserOrders, deleteOrder, Order } from "@/lib/orderApi";
import { OrderTableSkeleton } from "@/components/skeleton/OrderSkeleton";
import OrderDetailsModal from "@/components/pages/OrderDetailsModal";
import { motion } from "framer-motion";

const OrdersPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authUser, auth_token, isAuthenticated, verifyAuth } = useUserStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);

  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);
      if (auth_token && !authUser) {
        await verifyAuth();
      }
      setAuthLoading(false);
    };

    checkAuth();
  }, [auth_token, authUser, verifyAuth]);

  const fetchOrders = useCallback(async () => {
    if (!auth_token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedOrders = await getUserOrders(auth_token);
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [auth_token]);

  useEffect(() => {
    if (success === "true") {
      toast.success(
        "Payment completed successfully! Your order has been placed."
      );
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("success");
      newSearchParams.delete("orderId");
      router.replace(`/client/user/orders?${newSearchParams.toString()}`);

      setTimeout(() => {
        fetchOrders();
      }, 1000);
    }
  }, [success, searchParams, router, fetchOrders]);

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [fetchOrders, authLoading]);

  useEffect(() => {
    if (orders.length === 0) return;

    const hasPendingOrders = orders.some((order) => order.status === "PENDING_PAYMENT");
    if (!hasPendingOrders) return;

    const notificationShown = sessionStorage.getItem(
      "pendingOrderNotification"
    );
    if (!notificationShown) {
      toast.info(
        "Orders with pending status will be automatically updated when payment is confirmed.",
        {
          duration: 5000,
        }
      );
      sessionStorage.setItem("pendingOrderNotification", "true");
    }

    const interval = setInterval(() => {
      console.log(
        "Auto-refreshing orders to check for payment status updates..."
      );
      fetchOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [orders, fetchOrders]);

  const handleDeleteOrder = async (orderIdToDelete: string) => {
    if (!auth_token) return;

    try {
      setDeletingOrder(orderIdToDelete);
      const result = await deleteOrder(orderIdToDelete, auth_token);

      if (result.success) {
        toast.success("Order deleted successfully");
        setOrders(orders.filter((order) => order._id !== orderIdToDelete));
      } else {
        toast.error(result.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    } finally {
      setDeletingOrder(null);
    }
  };

  const handlePayNow = (order: Order) => {
    router.push(`/client/user/checkout?orderId=${order._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-300/60";
      case "pending":
        return "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-300/60";
      case "PAID":
        return "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-300/60";
      case "paid":
        return "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-300/60";
      case "COMPLETED":
        return "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-300/60";
      case "completed":
        return "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-emerald-300/60";
      case "CANCELLED":
        return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-300/60";
      case "cancelled":
        return "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-300/60";
      default:
        return "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-300/60";
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
      case "paid":
      case "COMPLETED":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "PENDING_PAYMENT":
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "CANCELLED":
      case "cancelled":
        return <CreditCard className="w-4 h-4 text-red-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "PAID":
      case "paid":
        return "Paid";
      case "COMPLETED":
      case "completed":
        return "Completed";
      case "PENDING_PAYMENT":
      case "pending":
        return "Pending";
      case "CANCELLED":
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (success === "true" && orderId) {
    return (
      <Container className="py-5">
        <PageBreadcrumb
          items={[{ label: "User", href: "/user" }]}
          currentPage="Orders"
          showSocialShare={false}
        />

        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl border-2 border-emerald-200/60 shadow-xl p-8 sm:p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/30 to-blue-200/30 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-emerald-600" />
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Order Placed Successfully!
                </h1>
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>

              <p className="text-gray-700 mb-8 text-base sm:text-lg max-w-md mx-auto">
                Thank you for your purchase. Your order has been received and is
                being processed.
              </p>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-emerald-200/50 shadow-md">
                <p className="text-sm text-gray-600 mb-2 font-medium">Order ID</p>
                <p className="font-mono text-lg sm:text-xl font-bold text-gray-900 break-all">
                  {orderId}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 text-sm sm:text-base">
                  You will receive an email confirmation shortly with your order
                  details and tracking information.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Link href="/shop" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full group hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                    >
                      <ShoppingBag className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Continue Shopping
                    </Button>
                  </Link>

                  <Link href="/" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg group"
                    >
                      <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Go to Homepage
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (authLoading) {
    return (
      <Container className="py-8">
        <PageBreadcrumb
          items={[{ label: "User", href: "/user" }]}
          currentPage="Orders"
          showSocialShare={false}
        />
        <OrderTableSkeleton />
      </Container>
    );
  }

  if (!authUser || !isAuthenticated) {
    return (
      <Container className="py-8">
        <PageBreadcrumb
          items={[{ label: "User", href: "/user" }]}
          currentPage="Orders"
          showSocialShare={false}
        />

        <div className="max-w-2xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 rounded-3xl border-2 border-sky-200/60 shadow-xl p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-200/30 to-blue-200/30 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-sky-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Please Sign In
              </h2>
              <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                You need to sign in to view your orders and track your purchases.
              </p>
              <Link href="/auth/signin">
                <Button size="lg" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg">
                  Sign In to Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">

      {/* BREADCRUMB - Đã thay giá trị thực tế để hết lỗi */}
      {/* <div className="mb-3 flex items-center justify-between">
        <nav className="flex items-center space-x-2 font-vietnam text-[13px]">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            Trang chủ
          </Link>

          <ChevronRight className="h-3.5 w-3.5 text-gray-300" /> */}

      {/* <Link
            href="/client/user"
            className="font-medium text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            User
          </Link> */}

      {/* <ChevronRight className="h-3.5 w-3.5 text-gray-300" /> */}

      {/* <span className="font-bold text-primary tracking-tight">
            Đơn hàng của bạn
          </span>
        </nav>
      </div> */}
      <PageBreadcrumb
        items={[]}
        currentPage="Đơn hàng của bạn"
        showSocialShare={false}
      />





      {loading ? (
        <OrderTableSkeleton />
      ) : orders.length === 0 ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl border-2 border-purple-200/60 shadow-xl p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Chưa có đơn hàng
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Bạn chưa đặt đơn hàng nào. Bắt đầu mua sắm để xem đơn hàng của bạn ở đây!
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg group">
                <ShoppingBag className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Bắt đầu mua sắm
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-sm border-t-2 border-primary overflow-hidden">
            <div className=" border-b-0 border-gray-200 p-3 flex justify-between items-center rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary" /> {/* Vạch màu điểm nhấn */}
                <span className="text-[13px] font-bold font-vietnam uppercase text-gray-600">
                  Danh sách ({orders.length})
                </span>
              </div>

              <Button
                onClick={fetchOrders}
                variant="outline"
                size="sm"
                disabled={loading}
                className={cn(
                  "group relative overflow-hidden self-start sm:self-auto",
                  "font-vietnam font-medium tracking-tight",
                  "border-primary bg-white text-primary", // Màu mặc định
                  "hover:border-primary transition-all duration-500",
                  "rounded-lg px-5 shadow-sm active:scale-95 disabled:opacity-70"
                )}
              >
                {/* Lớp nền trượt màu Primary đậm */}
                <span className="absolute inset-y-0 left-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />

                <div className="relative z-10 flex items-center transition-colors duration-500 group-hover:text-white">
                  <RefreshCw
                    className={cn(
                      "w-3.5 h-3.5 mr-2 transition-transform duration-700 ease-in-out",
                      loading ? "animate-spin" : "group-hover:rotate-180"
                    )}
                  />
                  <span className="relative">Làm mới</span>
                </div>
              </Button>




            </div>
            {/* Bảng đơn hàng dán ngay bên dưới này */}

            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-b border-gray-200 hover:bg-transparent">
                  <TableHead className="font-vietnam font-bold text-gray-900 uppercase text-[12px] tracking-wider">Order ID</TableHead>
                  <TableHead className="font-vietnam font-bold text-gray-900 uppercase text-[12px] tracking-wider">Ngày đặt</TableHead>
                  <TableHead className="font-vietnam font-bold text-gray-900 uppercase text-[12px] tracking-wider">Sản phẩm</TableHead>
                  <TableHead className="font-vietnam font-bold text-gray-900 uppercase text-[12px] tracking-wider">Tổng tiền</TableHead>
                  <TableHead className="font-vietnam font-bold text-gray-900 uppercase text-[12px] tracking-wider">Trạng thái</TableHead>
                  <TableHead className="font-vietnam font-bold text-gray-900 uppercase text-[12px] tracking-wider">Thanh toán</TableHead>
                  <TableHead className="font-vietnam font-bold text-gray-900 uppercase text-[12px] tracking-wider text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} className="group hover:bg-sky-50/30 transition-colors border-b border-gray-100 last:border-0">
                    {/* Order ID với phong cách mã số báo chí */}
                    <TableCell className="font-mono text-[13px] font-bold text-primary py-4">
                      #{order._id.slice(-8).toUpperCase()}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="font-vietnam text-gray-600 text-[13px]">
                      {formatDate(order.createdAt)}
                    </TableCell>

                    {/* Items */}
                    <TableCell>
                      <span className="font-vietnam text-[13px] text-gray-700 bg-gray-100 px-2 py-1 rounded-sm">
                        {order.items.length} món
                      </span>
                    </TableCell>

                    {/* Total - Nhấn mạnh số tiền */}
                    <TableCell className="font-vietnam font-bold text-gray-900 text-[14px]">
                      {formatPrice(order.total)}
                    </TableCell>

                    {/* Status Badge - Phẳng và tối giản */}
                    <TableCell>
                      <Badge variant="outline" className={`${getStatusColor(order.status)} rounded-none border-0 border-l-2 font-vietnam px-2 py-0.5 text-[11px] font-bold uppercase tracking-tighter`} >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <div className="flex items-center gap-2 font-vietnam text-[13px] text-gray-600">
                        {getPaymentStatusIcon(order.status)}
                        {getPaymentStatusText(order.status)}
                      </div>
                    </TableCell>

                    {/* Actions - Tinh gọn nút bấm */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/client/user/orders/${order?._id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-primary hover:bg-primary/5">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        {order.status === "PENDING_PAYMENT" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(order)}
                              className="h-8 bg-primary hover:bg-primary-hover text-white font-vietnam text-[12px] px-3 rounded-sm shadow-none"
                            >
                              Thanh toán
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="fortrashicon"
                                  size="sm"
                                  className="h-9 w-9 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent className="max-w-[420px] p-0 border-none bg-white shadow-2xl rounded-[24px] overflow-hidden">
                                {/* Thanh trang trí phía trên với hiệu ứng chạy màu */}
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: "100%" }}
                                  transition={{ duration: 0.8, ease: "circOut" }}
                                  className="h-1.5 bg-gradient-to-r from-red-400 via-red-600 to-red-400"
                                />

                                <div className="p-8 flex flex-col items-center">
                                  {/* 1. Icon Cảnh báo với hiệu ứng Nảy và Rung */}
                                  <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                    className="relative mb-6"
                                  >
                                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
                                    <div className="relative bg-red-50 p-5 rounded-full">
                                      <Trash2 className="w-8 h-8 text-red-600" />
                                    </div>
                                  </motion.div>

                                  {/* 2. Nội dung text xuất hiện dần từ dưới lên */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-center space-y-3"
                                  >
                                    <AlertDialogTitle className="text-[22px] font-bold text-gray-900 font-vietnam">
                                      Xác nhận xóa đơn hàng
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-500 leading-relaxed font-vietnam px-4">
                                      Hành động này <span className="text-red-600 font-bold">không thể hoàn tác</span>.
                                      Mọi dữ liệu của đơn hàng sẽ biến mất vĩnh viễn.
                                    </AlertDialogDescription>
                                  </motion.div>

                                  {/* 3. Nút bấm với hiệu ứng hover nâng cao */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex w-full gap-3 mt-8"
                                  >
                                    <AlertDialogCancel className="flex-1 h-12 rounded-2xl border-gray-100 font-vietnam font-medium hover:bg-gray-50 transition-all">
                                      Quay lại
                                    </AlertDialogCancel>

                                    <AlertDialogAction
                                      onClick={() => handleDeleteOrder(order._id)}
                                      className="flex-[1.5] h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center"
                                    >
                                      {deletingOrder === order._id ? (
                                        <motion.div
                                          animate={{ rotate: 360 }}
                                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                          className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                                        />
                                      ) : (
                                        "Xác nhận xóa"
                                      )}
                                    </AlertDialogAction>
                                  </motion.div>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>

                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>


          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-gray-200/60 p-5 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Order</span>
                      <span className="font-mono text-sm font-bold text-gray-800">
                        #{order._id.slice(-8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-sky-500" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(order.status)} capitalize font-semibold shadow-sm`}
                    >
                      {order.status.replace("_", " ")}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      {getPaymentStatusIcon(order.status)}
                      <span className="text-xs font-medium text-gray-500">
                        {getPaymentStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-5 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-emerald-600">
                    {formatPrice(order.total)}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/client/user/orders/${order?._id}`} className="flex-1 min-w-[120px]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full hover:bg-sky-50 hover:border-sky-300 transition-all"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                  </Link>

                  {order.status === "PENDING_PAYMENT" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handlePayNow(order)}
                        className="flex-1 min-w-[120px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingOrder === order._id}
                            className="px-4 hover:bg-red-600 shadow-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="mx-4 rounded-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl">Delete Order</AlertDialogTitle>
                            <AlertDialogDescription className="text-base">
                              Are you sure you want to delete this order? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto rounded-lg">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteOrder(order._id)}
                              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto rounded-lg"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }}
      />
    </Container>
  );
};

const OrdersPage = () => {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </Container>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
};

export default OrdersPage;
