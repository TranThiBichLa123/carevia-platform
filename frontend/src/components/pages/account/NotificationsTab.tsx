"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/lib/store";
import { notificationApi, type NotificationItem } from "@/lib/notificationApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  Calendar,
  ShoppingBag,
  CreditCard,
  Info,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const NotificationsTab = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { isAuthenticated } = useUserStore();
  const router = useRouter();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data =
        filter === "unread"
          ? await notificationApi.getUnread(0, 50)
          : await notificationApi.getAll(0, 50);
      setNotifications(data.items || []);
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      // Use mock data as fallback
      setNotifications([
        {
          id: 1,
          title: "Booking đã được xác nhận",
          message: "Lịch hẹn trải nghiệm SkinPro Gen 2 của bạn đã được xác nhận cho ngày 15/04/2026.",
          notificationType: "BOOKING_CONFIRMED",
          status: "UNREAD",
          referenceId: "bk-888",
          referenceType: "BOOKING",
          actionUrl: "/client/my-bookings",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 2,
          title: "Đơn hàng đang xử lý",
          message: "Đơn hàng #ORD-2026 của bạn đang được chuẩn bị giao hàng.",
          notificationType: "ORDER_PROCESSING",
          status: "UNREAD",
          referenceId: "ord-123",
          referenceType: "ORDER",
          actionUrl: "/client/user/orders",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 3,
          title: "Thanh toán thành công",
          message: "Thanh toán $45.00 cho đơn hàng #ORD-2025 đã hoàn tất.",
          notificationType: "PAYMENT_SUCCESS",
          status: "READ",
          referenceId: "ord-122",
          referenceType: "ORDER",
          actionUrl: "/client/user/orders",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 4,
          title: "Nhắc nhở lịch hẹn",
          message: "Bạn có lịch hẹn trải nghiệm AquaSteam Luxury vào ngày mai lúc 09:30.",
          notificationType: "BOOKING_REMINDER",
          status: "READ",
          referenceId: "bk-890",
          referenceType: "BOOKING",
          actionUrl: "/client/my-bookings",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ]);
      setUnreadCount(2);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "READ" as const } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" as const })));
    setUnreadCount(0);
  };

  const handleClick = (notification: NotificationItem) => {
    if (notification.status === "UNREAD") {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getTypeIcon = (type: string) => {
    if (type.includes("BOOKING")) return <Calendar size={16} className="text-blue-600" />;
    if (type.includes("ORDER")) return <ShoppingBag size={16} className="text-green-600" />;
    if (type.includes("PAYMENT")) return <CreditCard size={16} className="text-orange-600" />;
    return <Info size={16} className="text-gray-600" />;
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      BOOKING_CONFIRMED: "Xác nhận booking",
      BOOKING_CANCELLED: "Hủy booking",
      BOOKING_REMINDER: "Nhắc nhở booking",
      ORDER_PROCESSING: "Đơn hàng xử lý",
      ORDER_COMPLETED: "Đơn hàng hoàn thành",
      PAYMENT_SUCCESS: "Thanh toán thành công",
      PAYMENT_FAILED: "Thanh toán thất bại",
    };
    return map[type] || type.replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-teal-600" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-800">Thông báo</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} mới
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck size={14} className="mr-1" /> Đọc tất cả
            </Button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-xs font-medium ${
            filter === "all" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-full text-xs font-medium ${
            filter === "unread" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Bell className="mx-auto w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Không có thông báo nào.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                notification.status === "UNREAD"
                  ? "bg-teal-50/50 border-teal-200"
                  : "bg-white border-gray-100 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(notification.notificationType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {getTypeLabel(notification.notificationType)}
                    </span>
                    {notification.status === "UNREAD" && (
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800">{notification.title}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[11px] text-gray-400">{formatDate(notification.createdAt)}</span>
                  {notification.status === "UNREAD" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.id);
                      }}
                      className="text-[11px] text-teal-600 hover:underline flex items-center gap-1"
                    >
                      <Check size={12} /> Đã đọc
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
