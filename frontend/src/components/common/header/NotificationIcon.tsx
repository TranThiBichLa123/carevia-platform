"use client";
import { Bell } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { useUserStore } from "../../../lib/store";
import { useIsHydrated } from "../../../hooks";
import { notificationApi } from "../../../lib/notificationApi";

const NotificationIcon = () => {
  const { isAuthenticated, authUser } = useUserStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isHydrated = useIsHydrated();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && authUser && isHydrated) {
      fetchUnreadCount();
      // Poll every 60s for new notifications
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, authUser, isHydrated, fetchUnreadCount]);

  if (!isAuthenticated || !authUser || !isHydrated) {
    return null;
  }

  if (!mounted) {
    return (
      <Link
        href="/client/account?tab=notifications"
        className="relative text-gray-600 hover:text-primary hoverEffect"
        title="Thông báo"
      >
        <Bell size={24} />
      </Link>
    );
  }

  return (
    <Link
      href="/client/account?tab=notifications"
      className="relative text-black hover:text-primary hoverEffect"
      title="Thông báo"
    >
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute -right-2 -top-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationIcon;
