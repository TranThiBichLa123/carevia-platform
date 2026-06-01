"use client";

import { CheckCircle2, RefreshCcw, ShieldCheck, ShieldX, Unlock, Users, XCircle, Lock as LockIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
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
import { deviceApi, type BrandData } from "@/lib/deviceApi";
import { useUserStore } from "@/lib/store";
import { formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { cn } from "@/components/pages/OrdersPage";

type RoleFilter = "ALL" | AdminRole;
type StatusFilter = "ALL" | AdminAccountStatus;

const ROLE_LABELS: Record<AdminRole, string> = {
	CLIENT: "Client",
	STAFF: "Brand Staff",
	ADMIN: "Platform Admin",
};

// Định nghĩa màu sắc và icon tinh tế cho từng Trạng thái tài khoản
const getAccountStatusBadge = (status: string) => {
	const configs: Record<string, { label: string; className: string }> = {
		ACTIVE: { label: "Hoạt động", className: "bg-emerald-50 border-emerald-100 text-emerald-700" },
		PENDING_APPROVAL: { label: "Chờ duyệt", className: "bg-amber-50 border-amber-100 text-amber-700" },
		SUSPENDED: { label: "Đang khóa", className: "bg-rose-50 border-rose-100 text-rose-700" },
		DEACTIVATED: { label: "Vô hiệu hóa", className: "bg-gray-50 border-gray-200 text-gray-600" },
		REJECTED: { label: "Từ chối", className: "bg-red-50 border-red-100 text-red-700" },
	};
	const config = configs[status] || { label: status, className: "bg-gray-50 border-gray-100 text-gray-600" };

	return (
		<span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider font-vietnam shadow-sm", config.className)}>
			{config.label}
		</span>
	);
};
// Định nghĩa màu sắc cho từng Vai trò
const getRoleBadge = (role: string) => {
	const configs: Record<string, string> = {
		ADMIN: "bg-purple-50 text-purple-700 border-purple-100",
		STAFF: "bg-indigo-50 text-indigo-700 border-indigo-100",
		CLIENT: "bg-sky-50 text-sky-700 border-sky-100",
	};
	return cn("inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold font-vietnam", configs[role] || "bg-gray-50 text-gray-600 border-gray-100");
};


export default function AdminUsersPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [accounts, setAccounts] = useState<AdminAccount[]>([]);
	const [brands, setBrands] = useState<BrandData[]>([]);
	const [loading, setLoading] = useState(true);
	const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
	const [actingId, setActingId] = useState<number | null>(null);
	const [brandSelections, setBrandSelections] = useState<Record<number, string>>({});

	const loadAccounts = useCallback(async () => {
		try {
			setLoading(true);
			const [response, brandData] = await Promise.all([
				backofficeApi.getAdminAccounts({ page: 0, size: 200 }),
				deviceApi.getBrands(),
			]);
			setAccounts(response.items || []);
			setBrands(brandData || []);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải danh sách tài khoản."));
		} finally {
			setLoading(false);
		}
	}, []);

	const handleRefresh = useCallback(() => {
		setRoleFilter("ALL");
		setStatusFilter("ALL");
		void loadAccounts();
	}, [loadAccounts]);

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

	const handleApprove = async (accountId: number, requestedBrandName?: string | null) => {
		const selectedBrandId = Number(brandSelections[accountId]);
		if (!selectedBrandId && !requestedBrandName) {
			toast.error("Chọn brand có sẵn hoặc dùng brand staff đã khai báo để duyệt seller staff.");
			return;
		}

		try {
			setActingId(accountId);
			await backofficeApi.approveStaffAccount(accountId, selectedBrandId || undefined);
			toast.success(
				selectedBrandId
					? "Đã duyệt tài khoản Brand Staff với brand đã chọn."
					: "Đã duyệt tài khoản Brand Staff và tạo/gắn brand từ hồ sơ seller."
			);
			await loadAccounts();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể duyệt tài khoản Brand Staff."));
		} finally {
			setActingId(null);
		}
	};

	const handleReject = async (accountId: number) => {
		const reason = window.prompt("Nhập lý do từ chối hồ sơ seller / brand", "");
		if (!reason || !reason.trim()) {
			toast.error("Cần nhập lý do từ chối.");
			return;
		}

		try {
			setActingId(accountId);
			await backofficeApi.rejectStaffAccount(accountId, reason.trim());
			toast.success("Đã từ chối hồ sơ seller staff.");
			await loadAccounts();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể từ chối hồ sơ seller staff."));
		} finally {
			setActingId(null);
		}
	};

	if (!isAuthenticated) {
		return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản Platform Admin để quản lý người dùng.</div>;
	}

	if (authUser?.role !== "ADMIN") {
		return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ admin mới truy cập được trang này.</div>;
	}

	return (
		<div className="space-y-6 px-4 py-6 md:px-8">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Quản lý User & Seller Staff</h1>
				<p className="text-sm text-muted-foreground">Khóa hoặc mở khóa tài khoản, duyệt seller staff và theo dõi hàng đợi onboarding của marketplace.</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card><CardHeader><CardDescription>Tổng tài khoản</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><Users className="size-6 text-sky-500" />{accounts.length}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Đang hoạt động</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><ShieldCheck className="size-6 text-emerald-500" />{activeCount}</CardTitle></CardHeader></Card>
				<Card><CardHeader><CardDescription>Brand Staff chờ duyệt</CardDescription><CardTitle className="flex items-center gap-3 text-3xl"><ShieldX className="size-6 text-amber-500" />{pendingStaff}</CardTitle></CardHeader></Card>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<CardTitle>Danh sách tài khoản</CardTitle>
							<CardDescription>{filteredAccounts.length} tài khoản phù hợp bộ lọc.</CardDescription>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center">

							{/* 1. Bộ lọc Vai trò */}
							<div className="relative group min-w-37.5 w-full sm:w-auto">
								{/* Nút hiển thị */}
								<div className="flex h-9.5 items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 transition-all hover:border-gray-300">
									<span className="text-[13px] font-medium text-gray-700 font-vietnam whitespace-nowrap">
										{roleFilter === "ALL" && "Tất cả vai trò"}
										{roleFilter !== "ALL" && ROLE_LABELS[roleFilter]}
									</span>
									<svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
									</svg>
								</div>

								{/* Danh sách lựa chọn ẩn/hiện khi hover */}
								<div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
									<div className="flex flex-col whitespace-nowrap">
										{[
											{ value: "ALL", label: "Tất cả vai trò" },
											{ value: "CLIENT", label: ROLE_LABELS.CLIENT },
											{ value: "STAFF", label: ROLE_LABELS.STAFF },
											{ value: "ADMIN", label: ROLE_LABELS.ADMIN }
										].map((item) => (
											<div
												key={item.value}
												onClick={() => setRoleFilter(item.value as RoleFilter)}
												className={`px-3 py-2.5 text-[13px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${roleFilter === item.value ? 'text-admin-primary font-bold bg-gray-50' : 'text-gray-700 hover:bg-gray-50'} font-vietnam`}
											>
												{item.label}
											</div>
										))}
									</div>
								</div>
							</div>

							{/* 2. Bộ lọc Trạng thái */}
							<div className="relative group min-w-42.5 w-full sm:w-auto">
								{/* Nút hiển thị */}
								<div className="flex h-9.5 items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 transition-all hover:border-gray-300">
									<span className="text-[13px] font-medium text-gray-700 font-vietnam whitespace-nowrap">
										{statusFilter === "ALL" && "Tất cả trạng thái"}
										{statusFilter === "ACTIVE" && "ACTIVE"}
										{statusFilter === "PENDING_APPROVAL" && "PENDING_APPROVAL"}
										{statusFilter === "SUSPENDED" && "SUSPENDED"}
										{statusFilter === "DEACTIVATED" && "DEACTIVATED"}
										{statusFilter === "REJECTED" && "REJECTED"}
									</span>
									<svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
									</svg>
								</div>

								{/* Danh sách lựa chọn ẩn/hiện khi hover */}
								<div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
									<div className="flex flex-col whitespace-nowrap">
										{[
											{ value: "ALL", label: "Tất cả trạng thái" },
											{ value: "ACTIVE", label: "ACTIVE" },
											{ value: "PENDING_APPROVAL", label: "PENDING_APPROVAL" },
											{ value: "SUSPENDED", label: "SUSPENDED" },
											{ value: "DEACTIVATED", label: "DEACTIVATED" },
											{ value: "REJECTED", label: "REJECTED" }
										].map((item) => (
											<div
												key={item.value}
												onClick={() => setStatusFilter(item.value as StatusFilter)}
												className={`px-3 py-2.5 text-[13px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${statusFilter === item.value ? 'text-admin-primary font-bold bg-gray-50' : 'text-gray-700 hover:bg-gray-50'} font-vietnam`}
											>
												{item.label}
											</div>
										))}
									</div>
								</div>
							</div>

							{/* 3. Nút Làm mới (Đồng bộ chiều cao và style chữ) */}
							<button
								onClick={handleRefresh}
								disabled={loading}
								className={cn(
									"group relative overflow-hidden",
									"font-vietnam text-[13px] font-medium激活 whitespace-nowrap",
									"border border-gray-200 bg-white text-gray-700", // Hạ màu viền xuống gray-100 cho mỏng nhẹ như ảnh
									"hover:border-admin-primary transition-all duration-500",
									"h-9.5 rounded-md px-4 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
								)}
							>
								{/* Lớp nền trượt màu Primary: Trượt ra khi hover và giữ nguyên khi chuột ở đó */}
								<span className="absolute inset-y-0 left-0 w-0 bg-admin-primary transition-all duration-500 ease-out group-hover:w-full" />

								{/* Nội dung chữ và Icon: Chuyển sang màu trắng mượt mà khi hover */}
								<div className="relative z-10 flex items-center justify-center text-gray-700 group-hover:text-white transition-colors duration-500">
									<RefreshCcw
										className={cn(
											"w-3.5 h-3.5 mr-2 transition-transform duration-700 ease-in-out text-gray-400 group-hover:text-white",
											loading ? "animate-spin" : "group-hover:rotate-180"
										)}
									/>
									<span className="relative">Làm mới</span>
								</div>
							</button>

						</div>

					</div>
				</CardHeader>
				<CardContent className=" font-vietnam">
					{loading ? (
						<div className="py-24 text-center flex flex-col items-center justify-center gap-3">
							<div className="w-6 h-6 border-2 border-admin-primary border-t-transparent rounded-full animate-spin" />
							<p className="text-[13px] font-medium text-gray-400">Đang tải danh sách tài khoản...</p>
						</div>
					) : (
						<div className="overflow-x-auto rounded-lg">
							<Table className="w-full border-collapse">
								<TableHeader className="bg-gray-50/70 border-b border-gray-100">
									<TableRow className="hover:bg-transparent">
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5 pl-6">Tài khoản</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5">Vai trò</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5">Trạng thái</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5">Đăng nhập cuối</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5">Ngày tạo</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5 pr-6 text-right">Thao tác</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody className="divide-y divide-gray-50">
									{filteredAccounts.map((account) => {
										const isActing = actingId === account.accountId;

										// Kiểm tra xem backend của bạn trả về tên biến avatar là gì (Ví dụ: account.avatar hoặc account.avatarUrl)
										const hasAvatar = !!account.avatarUrl;

										return (
											<TableRow key={account.accountId} className="hover:bg-gray-50/40 transition-colors group">
												{/* Cột 1: Thông tin tài khoản kèm Avatar thông minh */}
												<TableCell className="py-3.5 pl-6">
													<div className="flex items-center gap-3">

														{/* Khối bọc Avatar tròn */}
														<div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200/40 bg-linear-to-br from-gray-100 to-gray-200/60 text-[14px] font-bold text-gray-500 shadow-inner">
															{hasAvatar ? (
																<img
																	src={account.avatarUrl || ""}
																	alt={account.username}
																	className="w-full h-full object-cover"
																	onError={(e) => {
																		// Nếu link ảnh từ server bị lỗi (404), ẩn thẻ img để hiện chữ cái thay thế
																		e.currentTarget.style.display = 'none';
																	}}
																/>
															) : null}
															{/* Chữ cái thay thế luôn nằm ẩn phía dưới, xuất hiện khi không có ảnh hoặc ảnh lỗi */}
															<span className="absolute z-0">{account.username.charAt(0).toUpperCase()}</span>
														</div>

														<div className="min-w-0">
															<p className="text-[13px] font-semibold text-gray-700 group-hover:text-admin-primary transition-colors truncate">
																{account.username}
															</p>
															<p className="text-[12px] text-gray-400 truncate mt-0.5">{account.email}</p>
															{account.role === "STAFF" && account.status === "PENDING_APPROVAL" && account.requestedBrandName ? (
																<p className="mt-1 text-[11px] font-medium text-sky-700 truncate">
																	Hồ sơ brand: {account.requestedBrandName}
																</p>
															) : null}
														</div>
													</div>
												</TableCell>

												{/* Cột 2: Vai trò */}
												<TableCell className="py-3.5">
													<span className={getRoleBadge(account.role)}>{ROLE_LABELS[account.role]}</span>
												</TableCell>

												{/* Cột 3: Trạng thái */}
												<TableCell className="py-3.5">
													{getAccountStatusBadge(account.status)}
												</TableCell>

												{/* Cột 4: Lần cuối đăng nhập */}
												<TableCell className="py-3.5 text-[13px] text-gray-500 font-medium">
													{account.lastLoginAt ? (
														<span className="text-gray-600">{formatDateTime(account.lastLoginAt)}</span>
													) : (
														<span className="text-gray-300 italic text-[12px]">Chưa đăng nhập</span>
													)}
												</TableCell>

												{/* Cột 5: Tạo lúc */}
												<TableCell className="py-3.5 text-[13px] text-gray-400 font-medium">
													{formatDateTime(account.createdAt)}
												</TableCell>

												{/* Cột 6: Các nút hành động */}
												<TableCell className="py-3.5 pr-6 text-right">
													<div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">

														{/* Hành động phê duyệt Brand Staff */}
														{account.role === "STAFF" && account.status === "PENDING_APPROVAL" && (
															<>
																<Select
																	value={brandSelections[account.accountId] || ""}
																	onValueChange={(value) =>
																		setBrandSelections((current) => ({ ...current, [account.accountId]: value }))
																	}
																>
																	<SelectTrigger className="h-8 w-45 bg-white text-[12px]">
																		<SelectValue placeholder="Gắn brand có sẵn" />
																	</SelectTrigger>
																	<SelectContent>
																		{brands.map((brand) => (
																			<SelectItem key={brand.id} value={String(brand.id)}>
																				{brand.name}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
																{account.requestedBrandName ? (
																	<div className="max-w-52 text-left text-[11px] leading-4 text-sky-700">
																		<div className="font-semibold">Brand staff khai báo: {account.requestedBrandName}</div>
																		{account.requestedBrandDescription ? (
																			<div className="mt-1 text-slate-500 line-clamp-2">{account.requestedBrandDescription}</div>
																		) : null}
																	</div>
																) : null}
																<button
																	disabled={isActing || (!brandSelections[account.accountId] && !account.requestedBrandName)}
																	onClick={() => void handleApprove(account.accountId, account.requestedBrandName)}
																	className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[12px] font-semibold shadow-sm active:scale-95 disabled:opacity-50 transition-all"
																>
																	<CheckCircle2 className="w-3.5 h-3.5" /> {brandSelections[account.accountId] ? "Duyệt" : "Duyệt theo hồ sơ"}
																</button>
																<button
																	disabled={isActing}
																	onClick={() => void handleReject(account.accountId)}
																	className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-600 rounded-md text-[12px] font-semibold active:scale-95 disabled:opacity-50 transition-all"
																>
																	<XCircle className="w-3.5 h-3.5" /> Từ chối
																</button>
															</>
														)}

														{/* Hành động KHÓA tài khoản */}
														{account.status === "ACTIVE" && (
															<button
																disabled={isActing}
																onClick={() => void handleStatusChange(account.accountId, "SUSPENDED", "Admin khóa tài khoản")}
																className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-md text-[12px] font-semibold active:scale-95 disabled:opacity-50 transition-all"
															>
																<LockIcon className="w-3.5 h-3.5" /> Khóa
															</button>
														)}

														{/* Hành động MỞ KHÓA tài khoản */}
														{["SUSPENDED", "DEACTIVATED", "REJECTED"].includes(account.status) && (
															<button
																disabled={isActing}
																onClick={() => void handleStatusChange(account.accountId, "ACTIVE", "Admin mở lại tài khoản")}
																className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[12px] font-semibold shadow-sm active:scale-95 disabled:opacity-50 transition-all"
															>
																<Unlock className="w-3.5 h-3.5" /> Mở khóa
															</button>
														)}

													</div>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>

			</Card>
		</div>
	);
}
