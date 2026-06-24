"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Package,
  ArrowRight,
  Home,
  ShoppingBag,
  Calendar,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getOrderById, type Order } from "@/lib/orderApi";
import { useUserStore } from "@/lib/store";
import {
  handlePaymentSuccess,
  pollOrderStatus,
  needsPaymentUpdate,
} from "@/lib/paymentUtils";
import { verifyZaloPayPayment } from "@/lib/zaloPayApi";
import PriceFormatter from "@/components/common/PriceFormatter";
import Cookies from "js-cookie";
import Container from "@/components/common/Container";

const SuccessPageClient = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [statusUpdated, setStatusUpdated] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { auth_token, authUser, verifyAuth } = useUserStore();

  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id"); // Stripe adds this parameter
  const appTransId = searchParams.get("apptransid"); // ZaloPay adds this on redirect
  const isZaloPay = !!appTransId && !sessionId;

  // Verify authentication on component mount
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

  useEffect(() => {
    if (authLoading) {
      return; // Wait for auth check
    }

    if (!orderId) {
      router.push("/client/account?tab=orders");
      return;
    }

    const fetchOrder = async () => {
      // Check token in cookies first, then fallback to store
      const token = Cookies.get("auth_token") || auth_token;

      console.log(
        "Success: Token check - cookies:",
        !!Cookies.get("auth_token"),
        "store:",
        !!auth_token,
        "final:",
        !!token
      );

      if (!token) {
        console.log("Success: No token found, redirecting to signin");
        toast.error("Authentication required");
        router.push("/auth/signin");
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderById(orderId, token);
        if (orderData) {
          setOrder(orderData);
          console.log("Success: Order fetched:", orderData);

          // ZaloPay: actively verify payment via backend (avoids callback-not-reachable issue)
          if (isZaloPay && orderData.status !== "PAID" && !statusUpdated) {
            console.log("Success: ZaloPay redirect detected, verifying payment...");
            try {
              const verifyResult = await verifyZaloPayPayment(orderId, token);
              console.log("Success: ZaloPay verify result:", verifyResult);
              if (verifyResult.status === "PAID") {
                const updatedOrder = await getOrderById(orderId, token);
                if (updatedOrder) setOrder(updatedOrder);
                setStatusUpdated(true);
                toast.success("Thanh toán thành công! Đơn hàng đã được xác nhận.");
              }
            } catch (error) {
              console.error("Success: ZaloPay verify error:", error);
            }
          } else if (
            sessionId &&
            needsPaymentUpdate(orderData, sessionId) &&
            !statusUpdated
          ) {
            console.log("Success: Order needs payment update", {
              orderStatus: orderData.status,
              sessionId,
              statusUpdated,
            });
            try {
              const paymentResult = await handlePaymentSuccess(
                orderId,
                sessionId,
                token
              );

              if (paymentResult.success && paymentResult.order) {
                setOrder(paymentResult.order);
                setStatusUpdated(true);
                console.log("Success: Order status updated to paid");
              } else {
                console.log(
                  "Success: Direct update failed, will rely on polling"
                );
              }
            } catch (error) {
              console.error("Success: Error in payment status update:", error);
            }
          } else if (orderData.status === "PAID") {
            console.log("Success: Order already marked as paid");
            setStatusUpdated(true);
          } else {
            console.log("Success: No payment update needed", {
              orderStatus: orderData.status,
              hasSessionId: !!sessionId,
              statusUpdated,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, auth_token, router, authLoading, sessionId, statusUpdated, isZaloPay]);

  useEffect(() => {
    // Show success toast when loading completes
    if (!authLoading && !loading) {
      toast.success("Thanh toán thành công!");
    }
  }, [authLoading, loading]);

  // Poll for order status — for ZaloPay without sessionId, or Stripe fallback
  useEffect(() => {
    if (!order || statusUpdated || order.status === "PAID") {
      return;
    }
    // Only poll if it's a ZaloPay or Stripe redirect (not a random page load)
    if (!isZaloPay && !sessionId) {
      return;
    }

    const token = Cookies.get("auth_token") || auth_token;
    if (!token || !orderId) return;

    console.log("Success: Starting polling for order status update");

    const startPolling = async () => {
      try {
        const pollResult = await pollOrderStatus(
          orderId,
          token,
          "paid",
          6,
          5000
        );

        if (pollResult.success && pollResult.order) {
          setOrder(pollResult.order);
          setStatusUpdated(true);
          toast.success("Payment status updated!");
        } else {
          console.log("Success: Polling completed without status update");
        }
      } catch (error) {
        console.error("Success: Error in polling:", error);
      }
    };

    startPolling();
  }, [order, sessionId, isZaloPay, statusUpdated, orderId, auth_token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || authLoading) {
    return (
      <Container className="">
        <PageBreadcrumb
          items={[{ label: "Đơn hàng của bạn", href: "/client/account?tab=orders" }]}
          currentPage="Thanh toán thành công"
          showSocialShare={false}
        />

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 text-center">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="">
      <div className="my-4">
        <PageBreadcrumb
          items={[{ label: "Đơn hàng của bạn", href: "/client/account?tab=orders" }]}
          currentPage="Thanh toán thành công"
          showSocialShare={false}
        />
      </div>


      <div className="max-w-4xl mx-auto">
        {/* Success Animation */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 md:p-12 text-center mb-8 ">
          <div className="relative">
            {/* Animated Success Icon */}
            <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
              <CheckCircle className="w-14 h-14 text-white animate-pulse" />
            </div>

            {/* Celebration Animation */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-100"></div>
              <div className="absolute top-10 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-300"></div>
              <div className="absolute top-5 left-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-500"></div>
              <div className="absolute top-12 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-700"></div>
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 animate-fade-in">
            Thanh toán thành công! 🎉
          </h1>

          <p className="text-base text-gray-600 mb-5 animate-fade-in delay-100">
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và đang
            được xử lý.
          </p>

          {order && (
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 font-vietnam border border-purple-200 rounded-2xl p-6 mb-8 animate-fade-in delay-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-purple-700">
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Mã đơn hàng</span>
                  </div>
                  <p className="font-mono text-base font-bold text-gray-900">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div className="space-y-2 text-base">
                  <div className="flex items-center justify-center gap-2 text-purple-700">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Ngày đặt hàng</span>
                  </div>
                  <p className="text-gray-900 text-base font-bold">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="space-y-2 text-base">
                  <div className="flex items-center justify-center gap-2 text-purple-700">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Trạng thái thanh toán</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {order.status === "PAID" ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-base text-purple-600">
                          Đã thanh toán
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <span className="font-semibold text-base text-yellow-600">
                          Đang xử lý
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-base">
                  <div className="flex items-center justify-center gap-2 text-purple-700">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Tổng thanh toán</span>
                  </div>
                  <PriceFormatter
                    amount={order.total}
                    className="text-base font-bold text-purple-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-300">
            <Link href="/client/account?tab=orders">
              <Button
                size="lg"
                className="bg-gradient-to-r text-base from-primary to-primary hover:from-primary-dark hover:to-primary text-white px-8 py-3 rounded-full shadow-lg transition-all transform hover:scale-105"
              >
                <Package className="w-5 h-5 mr-2" />
                Xem đơn hàng của tôi
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <Link href="/client/devices">
              <Button
                variant="outline"
                size="lg"
                className="text-base border-2 border-gray-300 hover:border-gray-400 px-8 py-3 rounded-full transition-all transform hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </Link>

            <Link href="/">
              <Button
                variant="ghost"
                size="lg"
                className="hover:bg-gray-100 text-base px-8 py-3 rounded-full transition-all"
              >
                <Home className="w-5 h-5 mr-2" />
                Về trang chủ
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        {order && (
          <div className="bg-white rounded-2xl font-vietnam border border-gray-100 shadow-sm p-6 md:p-8 animate-fade-in delay-400">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="w-16 h-16 text-base bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Số lượng: {item.quantity} ×{" "}
                      <PriceFormatter amount={item.price} />
                    </p>
                  </div>

                  <div className="text-right">
                    <PriceFormatter
                      amount={item.price * item.quantity}
                      className="font-semibold text-gray-900"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">
                    Tổng thanh toán:
                  </span>
                  <PriceFormatter
                    amount={order.total}
                    className="text-base font-bold text-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tiếp theo */}
        <div className="bg-primary-light font-vietnam rounded-2xl border border-primary-light p-6 md:p-8 mt-8 animate-fade-in delay-500">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Tiếp theo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Tiếp nhận đơn
              </h4>
              <p className="text-sm text-gray-600">
                Đơn hàng của bạn đã được hệ thống ghi nhận thành công              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Đang xử lý</h4>
              <p className="text-sm text-gray-600">
                Nhóm của chúng tôi sẽ chuẩn bị đơn hàng của bạn cẩn thận để vận chuyển
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Vận chuyển</h4>
              <p className="text-sm text-gray-600">
                Theo dõi đơn hàng của bạn khi nó di chuyển đến cửa nhà bạn
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </Container>
  );
};

const SuccessPage = () => {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 text-center">
              <div className="animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          </div>
        </Container>
      }
    >
      <SuccessPageClient />
    </Suspense>
  );
};

export default SuccessPage;
