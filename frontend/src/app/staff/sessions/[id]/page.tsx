"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
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
import { backofficeApi, type BackofficeSession, type BackofficeSessionStatus } from "@/lib/backofficeApi";
import { formatCurrency, formatDate, formatTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";

const SESSION_LABELS: Record<BackofficeSessionStatus, string> = {
	OPEN: "Đang mở",
	CLOSED: "Đã đóng",
	FULL: "Đã đầy",
	CANCELLED: "Đã hủy",
};

const SESSION_VARIANTS: Record<BackofficeSessionStatus, "default" | "secondary" | "destructive" | "outline"> = {
	OPEN: "default",
	CLOSED: "outline",
	FULL: "secondary",
	CANCELLED: "destructive",
};

export default function StaffSessionDetailPage() {
	const params = useParams<{ id: string }>();
	const sessionId = Number(params.id);
	const [session, setSession] = useState<BackofficeSession | null>(null);
	const [loading, setLoading] = useState(true);

	const loadSession = useCallback(async () => {
		try {
			setLoading(true);
			setSession(await backofficeApi.getSessionById(sessionId));
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải chi tiết phiên."));
		} finally {
			setLoading(false);
		}
	}, [sessionId]);

	useEffect(() => {
		if (!Number.isFinite(sessionId)) {
			setLoading(false);
			return;
		}

		void loadSession();
	}, [loadSession, sessionId]);

	const handleStatusUpdate = async (status: "CLOSED" | "CANCELLED") => {
		try {
			await backofficeApi.updateSessionStatus(sessionId, status);
			toast.success(`Đã cập nhật phiên sang ${SESSION_LABELS[status]}.`);
			await loadSession();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái phiên."));
		}
	};

	if (loading) {
		return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Đang tải phiên...</div>;
	}

	if (!session) {
		return <div className="px-6 py-16 text-center text-sm text-muted-foreground">Không tìm thấy phiên trải nghiệm.</div>;
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Chi tiết phiên #{session.id}</h1>
					<p className="text-sm text-muted-foreground">{session.deviceName} - {formatDate(session.sessionDate)}</p>
				</div>
				<Button asChild variant="outline"><Link href="/staff/sessions">Quay lại danh sách</Link></Button>
			</div>

			<div className="grid gap-4 lg:grid-cols-3">
				<Card>
					<CardHeader><CardDescription>Thiết bị</CardDescription><CardTitle>{session.deviceName}</CardTitle></CardHeader>
					<CardContent className="text-sm text-muted-foreground">Device #{session.deviceId}</CardContent>
				</Card>
				<Card>
					<CardHeader><CardDescription>Thời gian</CardDescription><CardTitle>{formatTime(session.startTime)} - {formatTime(session.endTime)}</CardTitle></CardHeader>
					<CardContent className="text-sm text-muted-foreground">{formatDate(session.sessionDate)}</CardContent>
				</Card>
				<Card>
					<CardHeader><CardDescription>Trạng thái</CardDescription><CardTitle><Badge variant={SESSION_VARIANTS[session.status]}>{SESSION_LABELS[session.status]}</Badge></CardTitle></CardHeader>
					<CardContent className="flex flex-wrap gap-2">
						{session.status === "OPEN" || session.status === "FULL" ? (
							<Button onClick={() => void handleStatusUpdate("CLOSED")}>Đóng phiên</Button>
						) : null}
						{session.status !== "CANCELLED" && session.status !== "CLOSED" ? (
							<Button variant="destructive" onClick={() => void handleStatusUpdate("CANCELLED")}>Hủy phiên</Button>
						) : null}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader><CardTitle>Thông tin vận hành</CardTitle></CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-2">
					<div className="rounded-2xl border p-4">
						<p className="text-sm text-muted-foreground">Địa điểm</p>
						<p className="mt-2 font-medium">{session.branchName}</p>
						<p className="text-sm text-muted-foreground">{session.locationDetail}</p>
					</div>
					<div className="rounded-2xl border p-4">
						<p className="text-sm text-muted-foreground">Công suất</p>
						<p className="mt-2 font-medium">{session.availableSlots}/{session.maxSlots} slot còn trống</p>
						<p className="text-sm text-muted-foreground">Giá mỗi slot: {formatCurrency(session.pricePerSlot || 0)}</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
