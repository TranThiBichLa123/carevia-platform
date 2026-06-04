"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import {
  Building2,
  CalendarCheck2,
  ChartColumnBig,
  ClipboardList,
  Layers3,
  MessageSquareMore,
  TicketPercent,
  Boxes,
  Menu,
  X,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import authApi from "@/lib/authApi";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store";

const staffSections = [
  { title: "Dashboard brand", href: "/staff", icon: LayoutDashboard },
  { title: "Hồ sơ brand", href: "/staff/brand", icon: Building2 },
  { title: "Thiết bị & tồn kho", href: "/staff/inventory", icon: Boxes },
  { title: "Quản lý booking", href: "/staff/bookings", icon: CalendarCheck2 },
  { title: "Quản lý đơn hàng", href: "/staff/orders", icon: ClipboardList },
  { title: "Phiên trải nghiệm", href: "/staff/sessions", icon: Layers3 },
  { title: "Quản lý Voucher", href: "/staff/vouchers", icon: TicketPercent },
  { title: "CRM & Đánh giá", href: "/staff/reviews", icon: MessageSquareMore },
  // { title: "Thống kê brand", href: "/staff/statistics", icon: ChartColumnBig },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { authUser, isAuthenticated, logoutUser } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isSidebarOpen = isMobile ? isMobileSidebarOpen : isDesktopSidebarOpen;
  const sidebarWidth = isDesktopSidebarOpen ? "16rem" : "5rem";

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((current) => !current);
      return;
    }

    setIsDesktopSidebarOpen((current) => !current);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await authApi.post("/auth/logout", {});

      if (!response.success) {
        throw new Error(response.error?.message || "Không thể đăng xuất.");
      }

      await logoutUser();
      setIsMobileSidebarOpen(false);
      toast.success("Đã đăng xuất khỏi workspace seller.");
      router.push("/auth/signin");
    } catch (error) {
      console.error("Staff logout error:", error);
      toast.error(error instanceof Error ? error.message : "Không thể đăng xuất.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] text-center">
        <div className="max-w-md border-t-4 border-[#C70000] bg-white p-8 shadow-sm">
          <h1 className="font-vietnam text-2xl font-bold text-[#111111]">Access Denied</h1>
          <p className="mt-2 text-sm text-[#666666]">Vui lòng đăng nhập tài khoản Brand Staff.</p>
        </div>
      </div>
    );
  }

  if (authUser?.role !== "STAFF") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] px-6 text-center">
        <div className="max-w-md border-t-4 border-[#C70000] bg-white p-8 shadow-sm">
          <h1 className="font-vietnam text-2xl font-bold text-[#111111]">Sai phạm vi truy cập</h1>
          <p className="mt-2 text-sm text-[#666666]">Khu vực này dành cho Brand Staff. Platform Admin chỉ thao tác trong dashboard quản trị.</p>
        </div>
      </div>
    );
  }

  if (authUser?.status !== "ACTIVE" || !authUser?.brand_id) {
    const isPendingApproval = authUser?.status === "PENDING_APPROVAL";

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] px-6 text-center">
        <div className="max-w-2xl border-t-4 border-[#052962] bg-white p-8 shadow-sm">
          <h1 className="font-vietnam text-2xl font-bold text-[#111111]">
            {isPendingApproval ? "Seller đang chờ admin duyệt" : "Brand chưa được gán cho tài khoản staff"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#666666]">
            {isPendingApproval
              ? "Sau khi xác thực email, seller chỉ có thể vào workspace khi Platform Admin duyệt hồ sơ brand và gắn brand vận hành."
              : "Tài khoản staff này chưa có brand hoạt động nên các trang nghiệp vụ đã bị khóa để tránh truy cập sai phạm vi dữ liệu."}
          </p>
          {authUser?.requested_brand_name ? (
            <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-left text-sm text-sky-950">
              <div className="font-semibold">Hồ sơ đang gửi duyệt: {authUser.requested_brand_name}</div>
              {authUser.requested_brand_description ? (
                <p className="mt-2 text-sky-900/80">{authUser.requested_brand_description}</p>
              ) : null}
            </div>
          ) : null}
          <div className="mt-6 text-sm text-[#666666]">
            Platform Admin có thể gắn bạn vào brand có sẵn hoặc tạo brand mới từ hồ sơ seller ngay trong màn hình quản trị user.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-[#F6F6F6] text-[#111111] antialiased md:grid transition-[grid-template-columns] duration-300",
        // Nếu mở rộng thì cột sidebar là 210px, nếu thu gọn thì cột sidebar chỉ là 64px
        isDesktopSidebarOpen
          ? "md:grid-cols-[210px_minmax(0,1fr)]"
          : "md:grid-cols-[64px_minmax(0,1fr)]"
      )}
    >

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] transition-opacity duration-300 md:hidden",
          isMobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#052962] text-white shadow-xl transition-[width,transform] duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:max-w-none md:shadow-none",
          // Xử lý chiều rộng linh hoạt theo trạng thái đóng/mở trên PC
          isMobile
            ? "w-72 max-w-[85vw]"
            : isDesktopSidebarOpen ? "w-[210px]" : "w-[64px]",
          isMobileSidebarOpen || !isMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={cn(
          "flex h-16 items-center border-b border-[#173E77] px-8 transition-all duration-300",
          // Căn giữa nút Menu khi thu gọn sidebar để nhìn cân đối
          !isMobile && !isDesktopSidebarOpen ? "justify-center px-0" : "justify-between"
        )}>
          {/* Khi sidebar ĐANG MỞ: Hiển thị chữ, bấm vào chữ để thu gọn */}
          {(isMobile || isDesktopSidebarOpen) && (
            <button
              onClick={toggleSidebar}
              className="font-vietnam text-xl font-bold text-[#FFE500] hover:opacity-80 transition-opacity text-left active:scale-[0.98]"
              aria-label="Thu gọn sidebar"
            >
              Carevia Seller
            </button>
          )}

          {/* Khi sidebar ĐANG ĐÓNG: Hiển thị nút Menu căn ngay giữa dòng */}
          {(!isMobile && !isDesktopSidebarOpen) && (
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-2 text-white/80 transition-colors hover:bg-[#173E77] hover:text-white active:scale-95"
              aria-label="Mở rộng sidebar"
            >
              <Menu className="size-5" />
            </button>
          )}
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto p-2">
          {staffSections.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isMobile) {
                    setIsMobileSidebarOpen(false);
                  }
                }}
                className={cn(
                  "flex items-center rounded-xl px-3 py-3 text-sm font-vietnam transition-all duration-200",
                  isMobile || isDesktopSidebarOpen ? "justify-start gap-3" : "justify-center gap-0 px-0 h-10 w-10 mx-auto",
                  isActive
                    ? "bg-[#173E77] text-white font-semibold ring-1 ring-inset ring-[#2E5B99]"
                    : "text-white/80 hover:bg-[#123466] hover:text-white"
                )}
                title={!isDesktopSidebarOpen ? item.title : undefined} // Hiện tooltip tên menu khi thu gọn
              >
                <Icon className="size-4 shrink-0" />
                {(isMobile || isDesktopSidebarOpen) && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#173E77] p-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={cn(
              "flex rounded-xl text-sm text-white/70 transition-all duration-200 hover:bg-red-900/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60",
              isMobile || isDesktopSidebarOpen
                ? "w-full px-3 py-3 items-center gap-3 justify-start"
                : "w-10 h-10 px-0 py-0 items-center justify-center mx-auto"
            )}
            title={!isDesktopSidebarOpen ? "Đăng xuất" : undefined}
          >
            <LogOut className="size-4 shrink-0" />
            {(isMobile || isDesktopSidebarOpen) && <span className="font-vietnam">{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#DCDCDC] bg-white px-4 md:hidden shrink-0">
          <button onClick={toggleSidebar} className="rounded-lg border border-[#DCDCDC] p-2 transition-colors hover:bg-slate-50">
            <Menu className="size-5" />
          </button>
          <span className="font-vietnam text-lg font-bold text-[#052962]">Carevia Brand Hub</span>
          <div className="w-9" />
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <div
            className={cn(
              "flex min-h-full w-full flex-col gap-6 px-4 py-5 transition-[padding] duration-300 md:px-6 xl:px-8 2xl:px-10",
              !isDesktopSidebarOpen && "2xl:px-12"
            )}
          >
            {children}
          </div>
        </main>
      </div>

    </div>
  );

}
