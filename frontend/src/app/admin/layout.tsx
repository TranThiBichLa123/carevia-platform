"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
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
        title: "Người dùng & Đối tác",
        href: "/admin/users",
        icon: Shield,
    },
    {
        title: "Kiểm duyệt nội dung",
        href: "/admin/reviews",
        icon: MessageSquareMore,
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

    const [isCollapsed, setIsCollapsed] = useState(false);


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
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-20 flex flex-col border-r border-slate-200 bg-white transition-all duration-300",
                    /* THAY ĐỔI CHIỀU RỘNG: Đúng bằng 64px (w-16) khi thu gọn hoặc 256px (w-64) khi mở rộng */
                    isCollapsed ? "w-16" : "w-64"
                )}
            >                {/* Brand Header */}
                <div
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`flex h-16 items-center border-b border-slate-200 px-4 cursor-pointer hover:bg-slate-50 transition-all ${isCollapsed ? 'justify-center' : 'px-6'
                        }`}
                >
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                        {/* Logo chữ C luôn hiển thị */}
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white font-black text-sm">
                            C
                        </span>
                        {/* Chữ "Carevia Platform" ẩn đi khi thu gọn */}
                        {!isCollapsed && (
                            <span className="truncate transition-opacity duration-300">
                                Carevia Platform
                            </span>
                        )}
                    </div>
                </div>


                {/* Navigation Tabs */}
                <nav className={cn(
                    "flex-1 space-y-1 py-6 transition-all duration-300",
                    isCollapsed ? "px-2" : "px-4" // Thu hẹp padding hai bên khi thu gọn để icon không bị ép sát
                )}>
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                title={isCollapsed ? item.title : undefined} // Hiển thị tooltip tên tab khi rê chuột vào lúc thu gọn
                                className={cn(
                                    "flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-300",
                                    isCollapsed
                                        ? "justify-center px-0 h-11 w-11 mx-auto" // Biến Tab thành ô vuông căn giữa khi thu gọn
                                        : "gap-3 px-4",
                                    isActive
                                        ? "bg-slate-900 text-white shadow-sm"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                )}
                            >
                                <Icon className={cn("size-5 shrink-0", isActive ? "text-white" : "text-slate-500")} />

                                {/* Ẩn chữ của Tab khi Sidebar thu nhỏ */}
                                {!isCollapsed && (
                                    <span className="truncate transition-opacity duration-200">
                                        {item.title}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile / Footer Sidebar */}
                <div className={cn(
                    "border-t border-slate-200 transition-all duration-300",
                    isCollapsed ? "p-2" : "p-4"
                )}>
                    <div className={cn(
                        "flex items-center rounded-xl transition-all duration-300",
                        isCollapsed
                            ? "justify-center bg-transparent p-0" // Bỏ nền xám, căn giữa nút thoát khi thu nhỏ
                            : "justify-between bg-slate-50 p-3"
                    )}>
                        {/* Ẩn toàn bộ thông tin Tên và Email của User khi thu nhỏ */}
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1 pr-2 transition-opacity duration-200">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                    {authUser?.username || "Admin"}
                                </p>
                                <p className="truncate text-xs text-slate-500">
                                    {authUser?.email || "admin@carevia.vn"}
                                </p>
                            </div>
                        )}

                        {/* Nút đăng xuất (Vẫn giữ lại để bấm, tăng kích thước một chút khi ở dạng thu gọn cho dễ tương tác) */}
                        <button
                            onClick={() => (window.location.href = "/")}
                            className={cn(
                                "rounded-lg text-slate-500 hover:text-slate-700 transition-colors",
                                isCollapsed
                                    ? "p-3 bg-slate-100 hover:bg-slate-200 shadow-sm" // Biến nút thoát thành một ô bấm riêng biệt nổi bật
                                    : "p-1.5 hover:bg-slate-200"
                            )}
                            title="Thoát về trang chủ"
                        >
                            <LogOut className="size-4" />
                        </button>
                    </div>
                </div>

            </aside>

            {/* Main Content Area */}
            <div
                className={cn(
                    "flex flex-1 flex-col transition-all duration-300",
                    isCollapsed ? "pl-16" : "pl-64"
                )}
            >                {/* Top Navbar */}
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
