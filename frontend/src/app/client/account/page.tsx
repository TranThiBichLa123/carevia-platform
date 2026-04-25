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

const tabs = [
  { key: "profile", label: "Profile", icon: User },
  { key: "orders", label: "Orders", icon: Package },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
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
        <p className="text-gray-500">Please sign in to view your account.</p>
        <Link
          href="/auth/signin"
          className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
        >
          Sign In
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
                ? "bg-teal-600 text-white shadow-md"
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
      <div className="relative bg-gradient-to-r from-teal-500 to-purple-500 rounded-2xl p-6 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {authUser.avatar_url ? (
              <img
                src={authUser.avatar_url}
                alt="Avatar"
                className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-teal-600 text-3xl font-bold border-4 border-white shadow-lg">
                {authUser.username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full" />
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
              {authUser.full_name || authUser.username}
            </h2>
            <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
              <span className="text-white/80 text-sm">{authUser.email}</span>
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                {authUser.role || "user"}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => handleTabChange("profile")}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-all text-sm font-medium"
            >
              <Edit3 size={14} /> <span className="font-vietnam">Chỉnh sử hồ sơ</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-all text-sm font-medium">
              <Shield size={14} /> <span className="font-vietnam">{authUser.auth_provider === "google" ? "Tài khoản OAuth" : "Tài khoản Email"}</span>
            </button>
          </div>
        </div>
      </div>

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
