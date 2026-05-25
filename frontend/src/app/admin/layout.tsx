"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
    ClipboardList,
    BellRing,
    Building2,
    ChartColumnBig,
    MessageSquareMore,
    Settings2,
    Shield,
    LayoutDashboard,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/store";

const sidebarItems = [
    {
        title: "Dashboard hệ thống",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Quản lý Brand",
        href: "/admin/brands",
        icon: Building2,
    },
    {
        title: "User & Seller Staff",
        href: "/admin/users",
        icon: Shield,
    },
    {
        title: "Kiểm duyệt nội dung",
        href: "/admin/reviews",
        icon: MessageSquareMore,
    },
    {
        title: "Thống kê hệ thống",
        href: "/admin/statistics",
        icon: ChartColumnBig,
    },
    {
        title: "Audit Log",
        href: "/admin/audit-logs",
        icon: ClipboardList,
    },
    {
        title: "Cấu Hình Hệ Thống",
        href: "/admin/settings",
        icon: Settings2,
    },
    {
        title: "Thông Báo Hệ Thống",
        href: "/admin/notifications",
        icon: BellRing,
    },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { authUser, isAuthenticated } = useUserStore();
    const isMounted = useSyncExternalStore(
        () => () => undefined,
        () => true,
        () => false,
    );

    const currentSection = [...sidebarItems]
        .sort((left, right) => right.href.length - left.href.length)
        .find((item) => item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href));

    // Ngăn chặn Hydration mismatch trong lúc SSR
    if (!isMounted) {
        return <div className="min-h-screen bg-slate-50" />;
    }

    // Kiểm tra trạng thái đăng nhập hệ thống
    if (!isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm text-muted-foreground">
                Đăng nhập bằng tài khoản Platform Admin để truy cập khu vực quản trị.
            </div>
        );
    }

    // Kiểm tra vai trò phân quyền
    if (authUser?.role !== "ADMIN") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm text-muted-foreground">
                Chỉ Platform Admin mới có quyền truy cập dashboard quản trị.
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar Cố Định */}
            <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
                {/* Brand Header */}
                <div className="flex h-16 items-center border-b border-slate-200 px-6">
                    <Link href="/admin" className="flex items-center gap-2 font-bold text-slate-900">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white font-black text-sm">C</span>
                        Carevia Platform
                    </Link>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex-1 space-y-1 px-4 py-6">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <Icon className={cn("size-5", isActive ? "text-white" : "text-slate-500")} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile / Footer Sidebar */}
                <div className="border-t border-slate-200 p-4">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                        <div className="min-w-0 flex-1 pr-2">
                            <p className="truncate text-sm font-semibold text-slate-800">
                                {authUser?.username || "Admin"}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                                {authUser?.email || "admin@carevia.vn"}
                            </p>
                        </div>
                        <button
                            onClick={() => (window.location.href = "/")}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                            title="Thoát về trang chủ"
                        >
                            <LogOut className="size-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col pl-64">
                {/* Top Navbar */}
                <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
                    <div className="text-sm font-medium text-slate-500">
                        Marketplace Platform / <span className="text-slate-900">{currentSection?.title || "Bảng điều khiển"}</span>
                    </div>
                </header>

                {/* Render Page Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
