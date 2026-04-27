"use client";

import React, { useState, useEffect, useRef } from "react";
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
  RefreshCw,
  Camera,
  Award,
  Star,
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import authApi from "@/lib/authApi";

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
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const { updateUser, logoutUser, verifyAuth, refreshProfile } = useUserStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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


  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB.");
      return;
    }

    setIsAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await authApi.upload<{ avatarUrl: string }>("/accounts/me/avatar", formData);
      if (response.success) {
        await refreshProfile();
        toast.success("Cập nhật ảnh đại diện thành công!");
      } else {
        throw new Error(response.error?.message || "Không thể tải ảnh lên.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải ảnh lên.");
    } finally {
      setIsAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
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

      {/* ── Hero Profile Card ── */}
      <Card className="border-none overflow-hidden shadow-xl bg-white">
        {/* Banner - Màu Primary với Bong Bóng Blue-100 Animation */}
        <div className="h-20 bg-primary relative overflow-hidden">
          {/* Bong bóng 1 - Chuyển động lên xuống */}
          <div
            className="absolute top-[-20px] left-[10%] w-32 h-32 rounded-full bg-blue-100/20 animate-bounce duration-[3000ms]"
            style={{ animationDuration: '6s' }}
          />

          {/* Bong bóng 2 - Chuyển động xoay & trôi nổi */}
          <div
            className="absolute bottom-[-40px] right-[15%] w-48 h-48 rounded-full bg-blue-100/10 animate-pulse"
            style={{ animationDuration: '4s' }}
          />

          {/* Bong bóng 3 - Chuyển động nhỏ, lơ lửng */}
          <div
            className="absolute top-[20%] right-[5%] w-20 h-20 rounded-full bg-blue-100/20 animate-pulse"
            style={{ animationDuration: '5s' }}
          />

          {/* Bong bóng 4 - Nằm góc trái dưới */}
          <div
            className="absolute bottom-[10%] left-[5%] w-16 h-16 rounded-full bg-blue-100/15 animate-bounce"
            style={{ animationDuration: '7s' }}
          />
        </div>


        <div className="px-8 pb-8">
          {/* Profile Header Container - Điều chỉnh Gap và Alignment */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 relative z-10">

            {/* Avatar - Chuyển thành HÌNH TRÒN */}
            <div className="relative group shrink-0">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                {authUser.avatar_url ? (
                  <img src={authUser.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600 text-4xl font-black">
                    {authUser.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload Overlay - Cũng chuyển thành HÌNH TRÒN */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isAvatarUploading}
                className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-[2px]"
              >
                {isAvatarUploading ? (
                  <RefreshCw className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="h-6 w-6 text-white" />
                    <span className="text-white text-[10px] font-black uppercase tracking-wider">Đổi ảnh</span>
                  </>
                )}
              </button>
            </div>

            {/* User Info - Xử lý chống tràn và đè chữ */}
            <div className="flex-1 text-center md:text-left min-w-0 pb-1">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-1">
                <h2 className="text-3xl font-black font-vietnam text-white leading-none tracking-tight">
                  {authUser.full_name || authUser.username}
                </h2>

                <div className="flex gap-2">
                  <Badge className="flex items-center justify-center bg-white/20 text-white backdrop-blur-md border-none px-2.5 h-6 font-black text-[9px] tracking-widest uppercase rounded-md">
                    {authUser.role}
                  </Badge>

                  {authUser.membership_level && (
                    <Badge className="flex items-center justify-center bg-yellow-400/20 text-yellow-200 border-none px-2.5 h-6 font-black text-[9px] tracking-widest uppercase rounded-md">
                      <Award size={10} className="mr-1.5 shrink-0" />
                      <span className="leading-none">{authUser.membership_level}</span>
                    </Badge>
                  )}
                </div>

              </div>

              {/* 2. Email - Cho gần lại Tên và tạo khoảng cách với phần bên dưới */}
              <p className="text-gray-500 font-medium text-sm mt-2 mb-3">
                {authUser.email}
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                {/* Khối Điểm - Dùng h-10 để cố định chiều cao */}
                <div className="flex items-center gap-2 bg-gray-50 px-4 h-10 rounded-lg border border-gray-100 shadow-sm">
                  <Star size={16} className="text-orange-400 fill-orange-400 shrink-0" />
                  <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                    {authUser.loyalty_points || 0} CarePoints
                  </span>
                </div>

                {/* Khối Mã KH */}
                {authUser.client_code && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 h-10 rounded-lg border border-gray-100 shadow-sm">
                    <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Mã KH:</span>
                    <span className="font-mono font-bold text-sm text-primary tracking-wider">
                      {authUser.client_code}
                    </span>
                  </div>
                )}
              </div>

            </div>
            {/* Logout Action */}
            <div className=" self-center md:self-end">
              <Button
                variant="outline"
                className="relative overflow-hidden group border-red-100 text-red-500 hover:text-white font-vietnam font-bold text-xs  tracking-widest rounded-xl px-5 py-5 transition-all duration-500"
                onClick={() => setIsLogoutModalOpen(true)}
              >
                {/* Lớp nền trượt từ TRÁI QUA PHẢI */}
                <span className="absolute inset-0 bg-red-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />

                {/* Nội dung bên trên */}
                <span className="relative flex items-center gap-2 z-10">
                  <LogOut
                    size={18}
                    className="transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110"
                  />
                  <span>Đăng xuất</span>
                </span>
              </Button>
            </div>

          </div>
        </div>
      </Card>


      {/* Account Security Badge */}
      <div className="flex items-center mt-5 gap-4 mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
        <Shield className="text-purple" size={20} />
        <div>
          <p className="text-sm font-vietnam font-semibold text-purple">Bảo mật tài khoản</p>
          <p className="text-xs font-vietnam text-purple">
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
