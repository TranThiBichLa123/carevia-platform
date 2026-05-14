"use client";

import Link from "next/link";
import {
	BellRing,
	Boxes,
	ChartColumnBig,
	ClipboardList,
	MessageSquareMore,
	Settings2,
	Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useUserStore } from "@/lib/store";

const adminSections = [
	{
		title: "Thống Kê Hệ Thống",
		description: "Tổng hợp người dùng, booking, doanh thu và thiết bị nổi bật.",
		href: "/admin/statistics",
		icon: ChartColumnBig,
	},
	{
		title: "Quản Lý Người Dùng",
		description: "Duyệt staff, khóa hoặc mở khóa tài khoản trong hệ thống.",
		href: "/admin/users",
		icon: Shield,
	},
	{
		title: "CRM & Đánh Giá",
		description: "Duyệt, ẩn và phản hồi đánh giá của khách hàng theo từng thiết bị.",
		href: "/admin/reviews",
		icon: MessageSquareMore,
	},
	{
		title: "Cấu Hình Hệ Thống",
		description: "Cập nhật hotline, email, địa chỉ showroom và nội dung hỗ trợ hiển thị ngoài website.",
		href: "/admin/settings",
		icon: Settings2,
	},
	{
		title: "Lịch Sử Thao Tác",
		description: "Theo dõi ai đã sửa hồ sơ, duyệt tài khoản hay cập nhật dữ liệu nghiệp vụ trong hệ thống.",
		href: "/admin/audit-logs",
		icon: ClipboardList,
	},
	{
		title: "Thông Báo Hệ Thống",
		description: "Theo dõi các sự kiện nghiệp vụ và cập nhật trạng thái đã đọc.",
		href: "/admin/notifications",
		icon: BellRing,
	},
	{
		title: "Điều Phối Vận Hành",
		description: "Đi thẳng sang khu vận hành để kiểm soát tồn kho, phiên trải nghiệm và đơn hàng.",
		href: "/staff/inventory",
		icon: Boxes,
	},
];

export default function AdminDashboardPage() {
	const { authUser, isAuthenticated } = useUserStore();

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-6 text-sm text-muted-foreground">
				Đăng nhập bằng tài khoản admin để truy cập khu vực quản trị.
			</div>
		);
	}

	if (authUser?.role !== "ADMIN") {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-6 text-sm text-muted-foreground">
				Chỉ admin mới có quyền truy cập dashboard quản trị.
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<section className="overflow-hidden rounded-[28px] bg-linear-to-r from-slate-900 via-slate-800 to-sky-900 p-8 text-white shadow-lg">
					<p className="text-sm uppercase tracking-[0.25em] text-white/60">
						Admin Console
					</p>
					<h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
						Trung tâm điều hành Carevia
					</h1>
					<p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
						Đi vào các module quản trị để kiểm soát người dùng, CRM, cấu hình hiển thị website và điều phối vận hành O2O.
					</p>
					<div className="mt-6 flex flex-wrap gap-3">
						<Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
							<Link href="/admin/reviews">Mở CRM & đánh giá</Link>
						</Button>
						<Button asChild variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
							<Link href="/admin/settings">Chỉnh cấu hình doanh nghiệp</Link>
						</Button>
					</div>
				</section>

				<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{adminSections.map((section) => {
						const Icon = section.icon;
						return (
							<Card key={section.href} className="border-slate-200 bg-white">
								<CardHeader>
									<div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-800">
										<Icon className="size-6" />
									</div>
									<CardTitle>{section.title}</CardTitle>
									<CardDescription>{section.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<Button asChild className="w-full">
										<Link href={section.href}>Truy cập</Link>
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</section>
			</div>
		</div>
	);
}