"use client";

import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { notificationApi, type NotificationItem } from "@/lib/notificationApi";
import { useUserStore } from "@/lib/store";
import { formatDateTime } from "@/lib/backofficeUtils";

export default function AdminNotificationsPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [showUnreadOnly, setShowUnreadOnly] = useState(false);

	const loadNotifications = useCallback(async () => {
		try {
			setLoading(true);
			const response = showUnreadOnly
				? await notificationApi.getUnread(0, 50)
				: await notificationApi.getAll(0, 50);
			setNotifications(response.items || []);
		} catch {
			toast.error("Không thể tải thông báo quản trị.");
		} finally {
			setLoading(false);
		}
	}, [showUnreadOnly]);

	useEffect(() => {
		if (!isAuthenticated) {
			setLoading(false);
			return;
		}

		void loadNotifications();
	}, [isAuthenticated, loadNotifications, showUnreadOnly]);

	const unreadCount = notifications.filter(
		(notification) => notification.status === "UNREAD"
	).length;

	const handleMarkAsRead = async (id: number) => {
		try {
			await notificationApi.markAsRead(id);
			setNotifications((current) =>
				current.map((item) =>
					item.id === id ? { ...item, status: "READ" as const } : item
				)
			);
		} catch {
			toast.error("Không thể cập nhật trạng thái thông báo.");
		}
	};

	const handleMarkAll = async () => {
		try {
			await notificationApi.markAllAsRead();
			setNotifications((current) =>
				current.map((item) => ({ ...item, status: "READ" as const }))
			);
			toast.success("Đã đánh dấu toàn bộ thông báo là đã đọc.");
		} catch {
			toast.error("Không thể đánh dấu tất cả là đã đọc.");
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
				Đăng nhập bằng tài khoản admin để xem thông báo hệ thống.
			</div>
		);
	}

	if (authUser?.role !== "ADMIN") {
		return (
			<div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
				Chỉ admin mới truy cập được trang thông báo quản trị.
			</div>
		);
	}

	return (
		<div className="space-y-6 px-4 py-6 md:px-8">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Thông báo hệ thống</h1>
					<p className="text-sm text-muted-foreground">
						Theo dõi các sự kiện booking, đơn hàng và thanh toán phát sinh trong hệ thống.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant={showUnreadOnly ? "outline" : "default"} onClick={() => setShowUnreadOnly(false)}>Tất cả</Button>
					<Button variant={showUnreadOnly ? "default" : "outline"} onClick={() => setShowUnreadOnly(true)}>Chưa đọc</Button>
					<Button variant="outline" onClick={() => void loadNotifications()} disabled={loading}>Làm mới</Button>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader><CardDescription>Tổng thông báo</CardDescription><CardTitle className="text-3xl">{notifications.length}</CardTitle></CardHeader>
				</Card>
				<Card>
					<CardHeader><CardDescription>Chưa đọc</CardDescription><CardTitle className="text-3xl">{unreadCount}</CardTitle></CardHeader>
				</Card>
				<Card>
					<CardHeader><CardDescription>Hành động nhanh</CardDescription><CardTitle><Button variant="outline" onClick={() => void handleMarkAll()} disabled={unreadCount === 0}><CheckCheck />Đánh dấu tất cả</Button></CardTitle></CardHeader>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Luồng thông báo</CardTitle>
					<CardDescription>{showUnreadOnly ? "Chỉ hiển thị thông báo chưa đọc." : "Hiển thị toàn bộ thông báo gần nhất."}</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex min-h-56 items-center justify-center"><Loader2 className="size-5 animate-spin" /></div>
					) : notifications.length === 0 ? (
						<div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">Chưa có thông báo phù hợp.</div>
					) : (
						<div className="space-y-3">
							{notifications.map((notification) => (
								<div key={notification.id} className={`rounded-2xl border p-4 ${notification.status === "UNREAD" ? "border-sky-200 bg-sky-50/50" : "border-border bg-background"}`}>
									<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<Bell className="size-4 text-sky-500" />
												<Badge variant={notification.status === "UNREAD" ? "default" : "outline"}>{notification.notificationType.replace(/_/g, " ")}</Badge>
											</div>
											<div>
												<p className="font-medium">{notification.title}</p>
												<p className="text-sm text-muted-foreground">{notification.message}</p>
											</div>
											<p className="text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
										</div>
										{notification.status === "UNREAD" ? (
											<Button size="sm" variant="outline" onClick={() => void handleMarkAsRead(notification.id)}>
												<Check className="size-4" />Đã đọc
											</Button>
										) : null}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
