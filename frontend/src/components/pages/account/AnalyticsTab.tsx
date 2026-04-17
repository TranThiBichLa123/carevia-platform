"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/lib/store";
import { getUserOrders, type Order } from "@/lib/orderApi";
import { bookingService } from "@/services/bookings/bookingService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Package,
  Clock,
  ShoppingBag,
  CalendarCheck,
  Loader2,
} from "lucide-react";

const AnalyticsTab = () => {
  const { auth_token } = useUserStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orderData, bookingData] = await Promise.all([
        auth_token ? getUserOrders(auth_token) : Promise.resolve([]),
        bookingService.getAll(),
      ]);
      setOrders(orderData);
      setBookings(Array.isArray(bookingData) ? bookingData : []);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setLoading(false);
    }
  }, [auth_token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-teal-600" size={24} />
        <span className="ml-2 text-gray-500">Loading analytics...</span>
      </div>
    );
  }

  // Compute stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "failed")
    .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(
    (b: any) => b.status === "COMPLETED" || b.status === "Completed"
  ).length;
  const pendingBookings = bookings.filter(
    (b: any) => b.status === "PENDING" || b.status === "Pending" || b.status === "CONFIRMED" || b.status === "Confirmed"
  ).length;

  // Monthly spending (last 6 months)
  const monthlyData: { month: string; amount: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = d.toLocaleDateString("vi-VN", { month: "short", year: "numeric" });
    const monthOrders = orders.filter((o) => {
      const od = new Date(o.createdAt);
      return (
        od.getFullYear() === d.getFullYear() &&
        od.getMonth() === d.getMonth() &&
        o.status !== "cancelled" &&
        o.status !== "failed"
      );
    });
    monthlyData.push({
      month: monthLabel,
      amount: monthOrders.reduce((s, o) => s + (o.totalAmount || o.total || 0), 0),
      count: monthOrders.length,
    });
  }

  const maxAmount = Math.max(...monthlyData.map((m) => m.amount), 1);

  // Most ordered categories
  const categoryMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      const name = item.deviceName || "Unknown";
      categoryMap[name] = (categoryMap[name] || 0) + item.quantity;
    });
  });
  const topProducts = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng đơn hàng",
            value: totalOrders,
            icon: <ShoppingBag size={20} />,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Tổng chi tiêu",
            value: `$${totalSpent.toFixed(2)}`,
            icon: <DollarSign size={20} />,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Trung bình/đơn",
            value: `$${avgOrderValue.toFixed(2)}`,
            icon: <TrendingUp size={20} />,
            color: "text-orange-600 bg-orange-50",
          },
          {
            label: "Lịch đã đặt",
            value: totalBookings,
            icon: <CalendarCheck size={20} />,
            color: "text-purple-600 bg-purple-50",
          },
        ].map((stat, i) => (
          <Card key={i} className="border shadow-sm">
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <BarChart3 size={16} className="text-teal-600" /> Chi tiêu 6 tháng gần nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyData.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 flex-shrink-0">{m.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max((m.amount / maxAmount) * 100, 2)}%` }}
                    >
                      {m.amount > 0 && (
                        <span className="text-[10px] font-bold text-white">${m.amount.toFixed(0)}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{m.count} đơn</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Package size={16} className="text-teal-600" /> Sản phẩm mua nhiều nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Chưa có dữ liệu mua hàng</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map(([name, count], i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-800 truncate">{name}</span>
                    <span className="text-xs font-bold text-gray-500">{count} items</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Stats */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <Calendar size={16} className="text-teal-600" /> Tổng quan Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-700">{totalBookings}</p>
              <p className="text-xs text-blue-600 mt-1">Tổng lịch hẹn</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-700">{completedBookings}</p>
              <p className="text-xs text-green-600 mt-1">Đã hoàn thành</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <p className="text-2xl font-bold text-orange-700">{pendingBookings}</p>
              <p className="text-xs text-orange-600 mt-1">Đang chờ xử lý</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Distribution */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <Clock size={16} className="text-teal-600" /> Phân bố trạng thái đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "pending_payment", label: "Chờ thanh toán", color: "bg-yellow-500" },
              { key: "paid", label: "Đã thanh toán", color: "bg-green-500" },
              { key: "processing", label: "Đang xử lý", color: "bg-blue-500" },
              { key: "completed", label: "Hoàn thành", color: "bg-emerald-500" },
              { key: "cancelled", label: "Đã hủy", color: "bg-red-500" },
            ].map((s) => {
              const count = orders.filter((o) => o.status === s.key).length;
              return (
                <div key={s.key} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className="text-xs text-gray-600">{s.label}</span>
                  <span className="text-xs font-bold text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
