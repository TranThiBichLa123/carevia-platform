"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { 
  CalendarCheck2, 
  ClipboardList, 
  Layers3, 
  TicketPercent, 
  Boxes,
  Menu, 
  X, 
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store";

const staffSections = [
  { title: "Dashboard tổng quan", href: "/staff", icon: LayoutDashboard },
  { title: "Thiết bị, tồn kho & bảo trì", href: "/staff/inventory", icon: Boxes },
  { title: "Quản lý Booking", href: "/staff/bookings", icon: CalendarCheck2 },
  { title: "Quản lý Đơn Hàng", href: "/staff/orders", icon: ClipboardList },
  { title: "Quản lý Phiên", href: "/staff/sessions", icon: Layers3 },
  { title: "Quản lý Voucher", href: "/staff/vouchers", icon: TicketPercent },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isSidebarOpen = isMobile ? isMobileSidebarOpen : isDesktopSidebarOpen;
  const sidebarWidth = isDesktopSidebarOpen ? "16rem" : "5rem";

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen((current) => !current);
      return;
    }

    setIsDesktopSidebarOpen((current) => !current);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] text-center">
        <div className="max-w-md border-t-4 border-[#C70000] bg-white p-8 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-[#111111]">Access Denied</h1>
          <p className="mt-2 text-sm text-[#666666]">Vui lòng đăng nhập tài khoản Staff.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F6F6F6] text-[#111111] antialiased md:grid md:grid-cols-[var(--staff-sidebar-width)_minmax(0,1fr)]"
      style={{ "--staff-sidebar-width": sidebarWidth } as CSSProperties}
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
          "fixed inset-y-0 left-0 z-50 flex max-w-[85vw] flex-col bg-[#052962] text-white shadow-xl transition-[transform,width] duration-300 ease-out md:sticky md:top-0 md:h-screen md:max-w-none md:shadow-none",
          isMobile ? "w-72" : "w-(--staff-sidebar-width)",
          isMobileSidebarOpen || !isMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={cn(
          "flex h-16 items-center border-b border-[#173E77] px-4",
          !isMobile && !isDesktopSidebarOpen ? "justify-center px-2" : "justify-between"
        )}>
          {(isMobile || isDesktopSidebarOpen) && (
            <span className="font-serif text-xl font-bold text-[#FFE500]">Carevia</span>
          )}
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-[#173E77] hover:text-white"
            aria-label="Thu gọn hoặc mở rộng sidebar"
          >
            {isSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
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
                  "flex items-center rounded-xl px-3 py-3 text-sm transition-all duration-200",
                  isMobile || isDesktopSidebarOpen ? "justify-start gap-3" : "justify-center gap-0 px-2",
                  isActive
                    ? "bg-[#173E77] text-white font-semibold ring-1 ring-inset ring-[#2E5B99]"
                    : "text-white/80 hover:bg-[#123466] hover:text-white"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {(isMobile || isDesktopSidebarOpen) && <span className="truncate">{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[#173E77] p-2">
          <button className={cn(
            "flex w-full rounded-xl px-3 py-3 text-sm text-white/70 transition-colors hover:bg-red-900/40 hover:text-white",
            isMobile || isDesktopSidebarOpen ? "items-center gap-3 justify-start" : "items-center justify-center px-2"
          )}>
            <LogOut className="size-4 shrink-0" />
            {(isMobile || isDesktopSidebarOpen) && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#DCDCDC] bg-white px-4 md:hidden shrink-0">
          <button onClick={toggleSidebar} className="rounded-lg border border-[#DCDCDC] p-2 transition-colors hover:bg-slate-50">
            <Menu className="size-5" />
          </button>
          <span className="font-serif text-lg font-bold text-[#052962]">Carevia Work</span>
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
