"use client";

import {
  Bell,
  Heart,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  User,
  UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useUserStore } from "../../../lib/store";

const accountMenuItems = [
  {
    href: "/client/account?tab=profile",
    label: "My Profile",
    icon: UserCircle2,
  },
  {
    href: "/client/account?tab=orders",
    label: "Orders",
    icon: Package,
  },
  {
    href: "/client/user/wishlist",
    label: "Wishlist",
    icon: Heart,
  },
  {
    href: "/client/account?tab=notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    href: "/client",
    label: "Continue Shopping",
    icon: ShoppingBag,
  },
  {
    href: "/client/account?tab=settings",
    label: "Settings",
    icon: Settings,
  },
] as const;

const UserButton = () => {
  const router = useRouter();
  const { isAuthenticated, authUser, logoutUser } = useUserStore();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Không render gì cho đến khi Client sẵn sàng

  // const displayName =
  //   authUser?.name?.trim() || authUser?.email?.split("@")[0] || "My Profile";
  const displayName =
    authUser?.username?.trim() || 
    authUser?.email?.split("@")[0] || 
    "My Profile";

  const avatarInitial = displayName.charAt(0).toUpperCase() || "?";

  const handleLogout = () => {
    logoutUser();
    router.push("/auth/signin");
  };

  if (!isAuthenticated || !authUser) {
    return (
      <Link
        href="/auth/signin"
        className="flex items-center gap-2 group hover:text-primary-hover hoverEffect"
      >
        <User size={30} />
        <span>
          <p className="text-xs font-medium">Welcome</p>
          <p className="font-semibold text-sm">Sign in / Register</p>
        </span>
      </Link>
    );
  }

  return (
    <div className="relative group">
      {/* Nút bấm trên Header */}
      <Link
        href="/client/account"
        className="flex items-center gap-2 text-slate-700 hover:text-cyan-600 transition-colors duration-200"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-500/50 p-0.5 transition-colors duration-200 group-hover:border-cyan-600">
          {authUser.avatar_url ? (
            <img
              src={authUser.avatar_url}
              alt={displayName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-cyan-50 text-[13px] font-semibold text-cyan-700">
              {avatarInitial}
            </div>
          )}
        </span>
        <span className="leading-tight">
          <p className="text-xs font-medium text-slate-500">Welcome</p>
          <p className="max-w-24 truncate text-sm font-semibold text-cyan-600">
            {displayName}
          </p>
        </span>
      </Link>

      {/* Dropdown Menu */}
      <div className="invisible absolute right-0 top-full z-50 w-64 translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.12)]">

          {/* Header của Dropdown */}
          <div className="flex items-center gap-3 px-4 py-4 bg-slate-50/50">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white shadow-sm ring-1 ring-cyan-100 p-0.5">
              {authUser.avatar_url ? (
                <img
                  src={authUser.avatar_url}
                  alt={displayName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-base font-bold text-cyan-700">
                  {avatarInitial}
                </div>
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-bold text-slate-800">
                {displayName}
              </p>
              <p className="truncate text-[12px] text-slate-500">
                {authUser.email}
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Danh sách Menu */}
          <div className="p-1.5">
            {accountMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-slate-600 transition-all duration-200 hover:bg-cyan-50 hover:text-cyan-700 group/item"
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-400 group-hover/item:text-cyan-600" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Nút Logout */}
          <div className="border-t border-slate-50 p-1.5 bg-slate-50/30">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-red-500 transition-all duration-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserButton;
