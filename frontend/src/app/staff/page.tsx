"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";

const staffSections = [
    {
        title: "Quản lý Booking",
        description: "Xác nhận, hoàn tất hoặc hủy lịch trải nghiệm của khách hàng.",
        href: "/staff/bookings",
        tag: "Operational"
    },
    {
        title: "Quản lý Đơn Hàng",
        description: "Theo dõi trạng thái đơn, cập nhật xử lý và hoàn tất giao dịch.",
        href: "/staff/orders",
        tag: "Financial"
    },
    {
        title: "Quản lý Phiên",
        description: "Tạo phiên trải nghiệm mới và kiểm soát số slot theo từng ngày.",
        href: "/staff/sessions",
        tag: "Configuration"
    },
    {
        title: "Quản lý Voucher",
        description: "Tạo mã giảm giá, bật tắt voucher và gán cho thiết bị phù hợp.",
        href: "/staff/vouchers",
        tag: "Marketing"
    },
];

export default function StaffDashboardPage() {
    const { authUser } = useUserStore();

    return (
        <div className="space-y-8">
            {/* Guardian Editorial Header Section */}
            <div className="border-b-4 border-[#111111] pb-2 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C70000] font-sans">
                    Carevia Internal Network / Staff Editorial Workspace
                </div>
                <h1 className="mt-1 font-vietnam text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl md:text-5xl">
                    Bảng điều khiển vận hành
                </h1>
                <p className="mt-3 text-sm md:text-base text-[#444444] font-vietnam max-w-3xl leading-relaxed">
                    Hệ thống xử lý nghiệp vụ, quản trị phân phối dịch vụ số và cấu hình chuỗi cung ứng trải nghiệm khách hàng tại Carevia.
                </p>
            </div>

            {/* Quick Stats Summary Line (Guardian Sub-bar style) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-[#DCDCDC] pb-6 mb-8 text-xs font-vietnam">
                <div className="border-l-2 border-[#052962] pl-2">
                    <span className="text-[#666666] block">Phiên làm việc</span>
                    <span className="font-bold text-[#111111]">Chính thức (Production)</span>
                </div>
                <div className="border-l-2 border-[#052962] pl-2">
                    <span className="text-[#666666] block">Tài khoản điều hành</span>
                    <span className="font-bold text-[#111111]">{authUser?.email || "N/A"}</span>
                </div>
                <div className="border-l-2 border-[#052962] pl-2">
                    <span className="text-[#666666] block">Ngôn ngữ phân phối</span>
                    <span className="font-bold text-[#111111]">Tiếng Việt (VI)</span>
                </div>
                <div className="border-l-2 border-[#052962] pl-2">
                    <span className="text-[#666666] block">Trạng thái cổng mạng</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 inline-block" /> Trực tuyến
                    </span>
                </div>
            </div>

            {/* Guardian Layout Grid (Editorial Card Blocks) */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {staffSections.map((section) => {
                    return (
                        <div
                            key={section.href}
                            className="flex flex-col justify-between bg-white border-t-4 border-[#052962] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow"
                        >
                            <div>
                                {/* Meta Topic Tag */}
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C70000] font-vietnam">
                                    {section.tag}
                                </span>
                                {/* Card Title */}
                                <h2 className="mt-2 font-vietnam text-xl font-bold tracking-tight text-[#111111] hover:text-[#052962] transition-colors">
                                    <Link href={section.href}>{section.title}</Link>
                                </h2>
                                {/* Card Description */}
                                <p className="mt-2 text-sm leading-relaxed text-[#333333] font-vietnam">
                                    {section.description}
                                </p>
                            </div>

                            {/* Guardian Style CTA Link Button */}
                            <div className="mt-6 pt-4 border-t border-[#EDEDED] flex justify-end">
                                <Button asChild className="rounded-none bg-[#052962] hover:bg-[#031F4B] text-white text-xs font-bold px-4 py-2">
                                    <Link href={section.href} className="flex items-center gap-1.5">
                                        Xử lý phân hệ <ChevronRight className="size-3" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
