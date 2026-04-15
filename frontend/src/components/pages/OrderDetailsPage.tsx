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
import {
  CheckCircle,
  Package,
  Clock,
  CreditCard,
  ArrowLeft,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { getOrderById, type Order } from "@/lib/orderApi";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";

// Set to false to enable premium feature lock
const ENABLE_FREE_ACCESS = false;

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
        router.push("/user/orders");
        return;
      }
      setLoading(true);
      try {
        const orderData = await getOrderById(orderId, auth_token);
        if (orderData) {
          setOrder(orderData);
          if (success === "true" && orderData.status === "paid") {
            toast.success("Payment successful! Your order has been confirmed.");
          }
        } else {
          toast.error("Order not found");
          router.push("/user/orders");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
        router.push("/user/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, auth_token, router, success]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
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
          items={[{ label: "Orders", href: "/user/orders" }]}
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
            Order not found
          </h1>
          <Button onClick={() => router.push("/user/orders")}>
            Back to Orders
          </Button>
        </div>
      </Container>
    );
  }

  const calculateSubtotal = () => {
    return order.items.reduce(
      (total, item) => total + item.price * item.quantity,
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
        items={[{ label: "Orders", href: "/user/orders" }]}
        currentPage="Order Details"
      />

      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {success === "true" && order?.status === "paid" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h2 className="text-lg font-semibold text-green-800">
                  Payment Successful!
                </h2>
                <p className="text-green-700">
                  Your order has been confirmed and is being processed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/user/orders")}
          className="mb-6 pl-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        {/* Order Header */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusIcon(order.status)}
              {getStatusText(order.status)}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Order Date</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total Amount</p>
              <p className="font-medium">
                <PriceFormatter amount={order.total} />
              </p>
            </div>
            {order.paidAt && (
              <div>
                <p className="text-gray-500">Payment Date</p>
                <p className="font-medium">
                  {new Date(order.paidAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {order.status === "paid" && (
              <div>
                <p className="text-gray-500">Payment Method</p>
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">Card</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="relative h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    <PriceFormatter amount={item.price * item.quantity} />
                  </p>
                  <p className="text-sm text-gray-500">
                    <PriceFormatter amount={item.price} /> each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>
                <PriceFormatter amount={calculateSubtotal()} />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>
                {calculateShipping() === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <PriceFormatter amount={calculateShipping()} />
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>
                <PriceFormatter amount={calculateTax()} />
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>
                <PriceFormatter amount={order.total} />
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/user/orders")}
            className="flex-1"
          >
            View All Orders
          </Button>
          <Button onClick={() => router.push("/shop")} className="flex-1">
            Continue Shopping
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default OrderDetailsPage;
