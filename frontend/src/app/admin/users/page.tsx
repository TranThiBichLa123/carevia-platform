"use client";

import { ShieldCheck, ShieldX, Users } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	backofficeApi,
	type AdminAccount,
	type AdminAccountStatus,
	type AdminRole,
} from "@/lib/backofficeApi";
import { useUserStore } from "@/lib/store";
import { formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";

type RoleFilter = "ALL" | AdminRole;
type StatusFilter = "ALL" | AdminAccountStatus;

const STATUS_VARIANTS: Record<
	AdminAccountStatus,
	"default" | "secondary" | "destructive" | "outline"
> = {
	PENDING_EMAIL: "outline",
	PENDING_APPROVAL: "secondary",
	ACTIVE: "default",
	REJECTED: "destructive",
	SUSPENDED: "destructive",
	DEACTIVATED: "outline",
};

export default function AdminUsersPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [accounts, setAccounts] = useState<AdminAccount[]>([]);
	const [loading, setLoading] = useState(true);
	const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
	const [actingId, setActingId] = useState<number | null>(null);

	const loadAccounts = useCallback(async () => {
		try {
			setLoading(true);
			const response = await backofficeApi.getAdminAccounts({ page: 0, size: 200 });
			setAccounts(response.items || []);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải danh sách tài khoản."));
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!isAuthenticated) {
			setLoading(false);
			return;
		}
		void loadAccounts();
	}, [isAuthenticated, loadAccounts]);

	const filteredAccounts = accounts.filter((account) => {
		const matchRole = roleFilter === "ALL" || account.role === roleFilter;
		const matchStatus = statusFilter === "ALL" || account.status === statusFilter;
		return matchRole && matchStatus;
	});

	const activeCount = accounts.filter((account) => account.status === "ACTIVE").length;
	const pendingStaff = accounts.filter(
		(account) => account.role === "STAFF" && account.status === "PENDING_APPROVAL"
	).length;

	const handleStatusChange = async (
		accountId: number,
		nextStatus: AdminAccountStatus,
		reason?: string
	) => {
		try {
			setActingId(accountId);
			await backofficeApi.changeAdminAccountStatus(accountId, nextStatus, reason);
			toast.success(`Đã cập nhật tài khoản sang ${nextStatus}.`);
			await loadAccounts();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái tài khoản."));
		} finally {
			setActingId(null);
		}
	};

	const handleApprove = async (accountId: number) => {
		try {
			setActingId(accountId);
			await backofficeApi.approveStaffAccount(accountId);
			toast.success("Đã duyệt tài khoản staff.");
			await loadAccounts();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể duyệt tài khoản staff."));
		} finally {
			setActingId(null);
		}
	};

	const handleReject = async (accountId: number) => {
		const reason = window.prompt("Nhập lý do từ chối staff", "");
		if (!reason || !reason.trim()) {
			toast.error("Cần nhập lý do từ chối.");
			return;
		}

		try {
			setActingId(accountId);
			await backofficeApi.rejectStaffAccount(accountId, reason.trim());
			toast.success("Đã từ chối yêu cầu staff.");
			await loadAccounts();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể từ chối tài khoản staff."));
		} finally {
			setActingId(null);
		}
	};

	if (!isAuthenticated) {
		return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản admin để quản lý người dùng.</div>;
	}

	if (authUser?.role !== "ADMIN") {
		return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ admin mới truy cập được trang này.</div>;
	}

	return (
		<div className="space-y-6 px-4 py-6 md:px-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
				<p className="text-sm text-muted-foreground">Khóa/mở khóa tài khoản, duyệt staff và theo dõi trạng thái hệ thống người dùng.</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card><CardHeader><CardDescription>Tổng tài khoản</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><Users className="size-6 text-sky-500" />{accounts.length}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Đang hoạt động</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><ShieldCheck className="size-6 text-emerald-500" />{activeCount}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Staff chờ duyệt</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><ShieldX className="size-6 text-amber-500" />{pendingStaff}</CardTitle></CardHeader></Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<CardTitle>Danh sách tài khoản</CardTitle>
							<CardDescription>{filteredAccounts.length} tài khoản phù hợp bộ lọc.</CardDescription>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row">
							<Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
								<SelectTrigger className="w-full bg-white sm:w-40"><SelectValue placeholder="Vai trò" /></SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">Tất cả vai trò</SelectItem>
									<SelectItem value="CLIENT">Client</SelectItem>
									<SelectItem value="STAFF">Staff</SelectItem>
									<SelectItem value="ADMIN">Admin</SelectItem>
								</SelectContent>
							</Select>
							<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
								<SelectTrigger className="w-full bg-white sm:w-44"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">Tất cả trạng thái</SelectItem>
									<SelectItem value="ACTIVE">ACTIVE</SelectItem>
									<SelectItem value="PENDING_APPROVAL">PENDING_APPROVAL</SelectItem>
									<SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
									<SelectItem value="DEACTIVATED">DEACTIVATED</SelectItem>
									<SelectItem value="REJECTED">REJECTED</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline" onClick={() => void loadAccounts()} disabled={loading}>Làm mới</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="py-16 text-center text-sm text-muted-foreground">Đang tải tài khoản...</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Tài khoản</TableHead>
									<TableHead>Vai trò</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Lần cuối đăng nhập</TableHead>
									<TableHead>Tạo lúc</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredAccounts.map((account) => {
									const isActing = actingId === account.accountId;
									return (
										<TableRow key={account.accountId}>
											<TableCell>
												<div className="font-medium">{account.username}</div>
												<div className="text-xs text-muted-foreground">{account.email}</div>
											</TableCell>
											<TableCell>{account.role}</TableCell>
											<TableCell><Badge variant={STATUS_VARIANTS[account.status]}>{account.status}</Badge></TableCell>
											<TableCell>{account.lastLoginAt ? formatDateTime(account.lastLoginAt) : "Chưa đăng nhập"}</TableCell>
											<TableCell>{formatDateTime(account.createdAt)}</TableCell>
											<TableCell>
												<div className="flex justify-end gap-2">
													{account.role === "STAFF" && account.status === "PENDING_APPROVAL" ? (
														<>
															<Button size="sm" disabled={isActing} onClick={() => void handleApprove(account.accountId)}>Duyệt</Button>
															<Button size="sm" variant="destructive" disabled={isActing} onClick={() => void handleReject(account.accountId)}>Từ chối</Button>
														</>
													) : null}
													{account.status === "ACTIVE" ? (
														<Button size="sm" variant="destructive" disabled={isActing} onClick={() => void handleStatusChange(account.accountId, "SUSPENDED", "Admin khóa tài khoản")}>Khóa</Button>
													) : null}
													{["SUSPENDED", "DEACTIVATED", "REJECTED"].includes(account.status) ? (
														<Button size="sm" disabled={isActing} onClick={() => void handleStatusChange(account.accountId, "ACTIVE", "Admin mở lại tài khoản")}>Mở khóa</Button>
													) : null}
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
