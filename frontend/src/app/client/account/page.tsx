"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/common/Container";
import { useUserStore } from "@/lib/store";
import {
  User,
  Package,
  BarChart3,
  Bell,
  Settings,
  Edit3,
  LogOut,
  Shield,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Tab components
import AccountProfileTab from "@/components/pages/account/ProfileTab";
import AccountOrdersTab from "@/components/pages/account/OrdersTab";
import AccountAnalyticsTab from "@/components/pages/account/AnalyticsTab";
import AccountNotificationsTab from "@/components/pages/account/NotificationsTab";
import AccountSettingsTab from "@/components/pages/account/SettingsTab";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { motion } from "framer-motion";

const tabs = [
  { key: "profile", label: "Hồ sơ", icon: User },
  { key: "orders", label: "Đơn hàng", icon: Package },
  { key: "analytics", label: "Phân tích", icon: BarChart3 },
  { key: "notifications", label: "Thông báo", icon: Bell },
  { key: "settings", label: "Cài đặt", icon: Settings },
];

const AccountPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { authUser, isAuthenticated } = useUserStore();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.some((t) => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    router.replace(`/client/account?tab=${key}`, { scroll: false });
  };

  if (!isAuthenticated || !authUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Vui lòng đăng nhập để xem tài khoản của bạn.</p>
        <Link
          href="/auth/signin"
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark"
        >
          Đăng nhập
        </Link>
      </div>
    );
  }
  const tabTitles: Record<string, string> = {
    profile: "Hồ sơ cá nhân",
    orders: "Đơn hàng của bạn",
    analytics: "Phân tích dữ liệu",
    notifications: "Thông báo",
    settings: "Cài đặt tài khoản",
  };

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return <AccountProfileTab />;
      case "orders":
        return <AccountOrdersTab />;
      case "analytics":
        return <AccountAnalyticsTab />;
      case "notifications":
        return <AccountNotificationsTab />;
      case "settings":
        return <AccountSettingsTab />;
      default:
        return <AccountProfileTab />;
    }
  };

  return (
    <Container className="py-3">

      <PageBreadcrumb
        // items={[{ label: "Tài khoản", href: "/user" }]}
        items={[]}
        currentPage={tabTitles[activeTab] || "Tài khoản"}
      />


      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-all ${isActive
                ? "bg-primary text-white shadow-md"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Icon size={16} />
              <span className="font-vietnam">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Banner */}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-primary to-purple rounded-2xl p-8 mb-8 overflow-hidden shadow-lg border border-white/10"
      >
        {/* Lớp phủ họa tiết chìm cho sang hơn */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://transparenttextures.com')]" />

        {/* Quầng sáng trang trí */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Avatar Section */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            {authUser.avatar_url ? (
              <img
                src={authUser.avatar_url}
                alt="Avatar"
                className="h-24 w-24 rounded-full border-4 border-white/30 shadow-xl object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white/90 flex items-center justify-center text-primary text-3xl font-bold shadow-xl">
                {authUser.username?.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-md" />
          </motion.div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {authUser.username}
              </h2>
              <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 transition-all">
                {authUser.role || "user"}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mt-2 justify-center md:justify-start text-white/80 text-sm">
              <Mail size={14} />
              <span>{authUser.email}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4 md:mt-0">
            <motion.button
              whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTabChange("profile")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl border border-white/30 transition-all text-sm font-semibold shadow-sm"
            >
              <Edit3 size={16} />
              <span className="font-vietnam">Chỉnh sửa</span>
            </motion.button>

            <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-black/10 backdrop-blur-sm text-white/90 rounded-xl border border-white/10 text-sm font-medium">
              <Shield size={16} />
              <span className="font-vietnam">
                {authUser.auth_provider === "google" ? "Google" : "Email"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>


      {/* Account Security Badge */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <Shield className="text-blue-600" size={20} />
        <div>
          <p className="text-sm font-vietnam font-semibold text-blue-800">Bảo mật tài khoản</p>
          <p className="text-xs text-blue-600">
            {authUser.auth_provider === "google"
              ? "Tài khoản OAuth - Bảo mật bởi Google"
              : "Tài khoản Email & Mật khẩu - Bảo mật bởi hệ thống"}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">{renderTab()}</div>
    </Container>
  );
};

export default AccountPage;
