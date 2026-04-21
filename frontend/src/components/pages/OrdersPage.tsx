"use client";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <Container className="py-8">
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
    <Container className="py-8">
      <PageBreadcrumb
        items={[{ label: "User", href: "/user" }]}
        currentPage="Orders"
        showSocialShare={false}
      />

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            My Orders
          </h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Package className="w-4 h-4" />
            View and manage your order history
          </p>
        </div>
        <Button
          onClick={fetchOrders}
          variant="outline"
          size="sm"
          disabled={loading}
          className="self-start sm:self-auto hover:bg-sky-50 hover:border-sky-300 transition-all"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

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
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven&apos;t placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link href="/shop">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg group">
                <ShoppingBag className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Start Shopping
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/60 overflow-hidden shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200/80 hover:bg-gradient-to-r">
                  <TableHead className="font-bold text-gray-700">Order ID</TableHead>
                  <TableHead className="font-bold text-gray-700">Date</TableHead>
                  <TableHead className="font-bold text-gray-700">Items</TableHead>
                  <TableHead className="font-bold text-gray-700">Total</TableHead>
                  <TableHead className="font-bold text-gray-700">Status</TableHead>
                  <TableHead className="font-bold text-gray-700">Payment</TableHead>
                  <TableHead className="font-bold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id} className="hover:bg-gradient-to-r hover:from-sky-50/50 hover:to-blue-50/50 transition-all border-b border-gray-100">
                    <TableCell className="font-mono text-sm font-semibold text-gray-700">
                      #{order._id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-sky-500" />
                        {formatDate(order.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(order.status)} capitalize font-semibold shadow-sm`}
                      >
                        {order.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentStatusIcon(order.status)}
                        <span className="text-sm font-medium text-gray-600">
                          {getPaymentStatusText(order.status)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/client/user/orders/${order?._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-sky-50 hover:border-sky-300 transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>

                        {order.status === "PENDING_PAYMENT" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(order)}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md"
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pay Now
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingOrder === order._id}
                                  className="hover:bg-red-600 shadow-md"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-xl">
                                    Delete Order
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-base">
                                    Are you sure you want to delete this order?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteOrder(order._id)}
                                    className="bg-red-600 hover:bg-red-700 rounded-lg"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
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
