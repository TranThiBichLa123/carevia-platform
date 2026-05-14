"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Boxes, Loader2, Plus, RefreshCw, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
	type InventoryTransactionType,
	type StaffDeviceBrand,
	type StaffDeviceCategory,
	type StaffDevice,
	type StaffDeviceStatus,
	type StaffInventoryTransaction,
} from "@/lib/backofficeApi";
import { formatCurrency, formatDate, formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";

type DeviceFilter = "ALL" | StaffDeviceStatus;

const DEVICE_STATUS_OPTIONS: Array<{ value: DeviceFilter; label: string }> = [
	{ value: "ALL", label: "Tất cả trạng thái" },
	{ value: "AVAILABLE", label: "Sẵn sàng" },
	{ value: "OUT_OF_STOCK", label: "Hết hàng" },
	{ value: "MAINTENANCE", label: "Bảo trì" },
	{ value: "INACTIVE", label: "Ngừng hoạt động" },
];

const DEVICE_STATUS_LABELS: Record<StaffDeviceStatus, string> = {
	AVAILABLE: "Sẵn sàng",
	OUT_OF_STOCK: "Hết hàng",
	MAINTENANCE: "Bảo trì",
	INACTIVE: "Ngừng hoạt động",
};

const DEVICE_STATUS_BADGE: Record<StaffDeviceStatus, "default" | "secondary" | "destructive" | "outline"> = {
	AVAILABLE: "default",
	OUT_OF_STOCK: "destructive",
	MAINTENANCE: "secondary",
	INACTIVE: "outline",
};

const TRANSACTION_LABELS: Record<InventoryTransactionType, string> = {
	IMPORT: "Nhập kho",
	EXPORT: "Xuất kho",
	AUDIT_ADJUSTMENT: "Kiểm kê",
};

export default function StaffInventoryPage() {
	const { authUser, isAuthenticated } = useUserStore();
	const [devices, setDevices] = useState<StaffDevice[]>([]);
	const [transactions, setTransactions] = useState<StaffInventoryTransaction[]>([]);
	const [loadingDevices, setLoadingDevices] = useState(true);
	const [loadingTransactions, setLoadingTransactions] = useState(true);
	const [actionDeviceId, setActionDeviceId] = useState<number | null>(null);
	const [statusFilter, setStatusFilter] = useState<DeviceFilter>("ALL");
	const [search, setSearch] = useState("");
	const [lowStockOnly, setLowStockOnly] = useState(false);
	const [maintenanceOnly, setMaintenanceOnly] = useState(false);
	const [totalDevices, setTotalDevices] = useState(0);
	const [categories, setCategories] = useState<StaffDeviceCategory[]>([]);
	const [brands, setBrands] = useState<StaffDeviceBrand[]>([]);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [creatingDevice, setCreatingDevice] = useState(false);
	const [createForm, setCreateForm] = useState({
		name: "",
		description: "",
		price: "",
		stock: "0",
		categoryId: "NONE",
		brandId: "NONE",
		sku: "",
		image: "",
	});

	const loadDevices = useCallback(async () => {
		try {
			setLoadingDevices(true);
			const response = await backofficeApi.getStaffDevices({
				search: search.trim() || undefined,
				status: statusFilter === "ALL" ? undefined : statusFilter,
				lowStockOnly,
				maintenanceOnly,
				page: 0,
				size: 50,
			});
			setDevices(response.items || []);
			setTotalDevices(response.totalItems || 0);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải danh sách tồn kho."));
		} finally {
			setLoadingDevices(false);
		}
	}, [search, statusFilter, lowStockOnly, maintenanceOnly]);

	const loadTransactions = useCallback(async () => {
		try {
			setLoadingTransactions(true);
			const response = await backofficeApi.getInventoryTransactions({ page: 0, size: 20 });
			setTransactions(response.items || []);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải lịch sử nhập xuất kho."));
		} finally {
			setLoadingTransactions(false);
		}
	}, []);

	const loadDeviceMetadata = useCallback(async () => {
		try {
			const [categoryData, brandData] = await Promise.all([
				backofficeApi.getStaffDeviceCategories(),
				backofficeApi.getStaffDeviceBrands(),
			]);
			setCategories(categoryData || []);
			setBrands(brandData || []);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải danh mục hoặc thương hiệu."));
		}
	}, []);

	useEffect(() => {
		if (!isAuthenticated) {
			setLoadingDevices(false);
			setLoadingTransactions(false);
			return;
		}

		void loadDevices();
		void loadTransactions();
		void loadDeviceMetadata();
	}, [isAuthenticated, loadDevices, loadTransactions, loadDeviceMetadata]);

	const lowStockCount = devices.filter((device) => device.stock <= 5 && device.status !== "INACTIVE").length;
	const maintenanceCount = devices.filter((device) => device.status === "MAINTENANCE").length;
	const outOfStockCount = devices.filter((device) => device.status === "OUT_OF_STOCK").length;

	const requestInventoryAdjustment = async (
		deviceId: number,
		transactionType: InventoryTransactionType
	) => {
		const quantityLabel =
			transactionType === "AUDIT_ADJUSTMENT"
				? "Nhập số lượng tồn kho thực tế sau kiểm kê"
				: `Nhập số lượng cho thao tác ${TRANSACTION_LABELS[transactionType].toLowerCase()}`;
		const quantityRaw = window.prompt(quantityLabel, transactionType === "AUDIT_ADJUSTMENT" ? "0" : "1");
		if (quantityRaw === null) {
			return;
		}

		const quantity = Number(quantityRaw);
		if (!Number.isFinite(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
			toast.error("Số lượng phải là số nguyên không âm.");
			return;
		}

		const reason = window.prompt("Nhập lý do của giao dịch kho", "");
		if (!reason || !reason.trim()) {
			toast.error("Cần nhập lý do cho giao dịch kho.");
			return;
		}

		const note = window.prompt("Ghi chú bổ sung (có thể bỏ trống)", "") ?? undefined;

		try {
			setActionDeviceId(deviceId);
			await backofficeApi.adjustStaffInventory(deviceId, {
				transactionType,
				quantity,
				reason: reason.trim(),
				note: note?.trim() || undefined,
			});
			toast.success(`Đã cập nhật ${TRANSACTION_LABELS[transactionType].toLowerCase()} thành công.`);
			await Promise.all([loadDevices(), loadTransactions()]);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật tồn kho."));
		} finally {
			setActionDeviceId(null);
		}
	};

	const handleMaintenance = async (device: StaffDevice) => {
		try {
			setActionDeviceId(device.id);

			if (device.status === "MAINTENANCE") {
				const endDate = window.prompt(
					"Ngày hoàn tất bảo trì (YYYY-MM-DD, bỏ trống để dùng hôm nay)",
					new Date().toISOString().slice(0, 10)
				);
				if (endDate === null) {
					setActionDeviceId(null);
					return;
				}

				const costRaw = window.prompt(
					"Chi phí bảo trì (có thể bỏ trống)",
					device.maintenanceCost?.toString() || ""
				);

				await backofficeApi.updateStaffDeviceMaintenance(device.id, {
					markCompleted: true,
					maintenanceEndDate: endDate || undefined,
					maintenanceCost: costRaw ? Number(costRaw) : undefined,
				});
				toast.success("Đã hoàn tất bảo trì thiết bị.");
			} else {
				const reason = window.prompt("Nhập lý do bảo trì", device.maintenanceReason || "");
				if (!reason || !reason.trim()) {
					toast.error("Cần nhập lý do bảo trì.");
					setActionDeviceId(null);
					return;
				}

				const expectedEndDate = window.prompt("Ngày dự kiến hoàn tất (YYYY-MM-DD, có thể bỏ trống)", "") ?? undefined;
				const costRaw = window.prompt("Chi phí dự kiến (có thể bỏ trống)", "") ?? undefined;

				await backofficeApi.updateStaffDeviceMaintenance(device.id, {
					maintenanceReason: reason.trim(),
					maintenanceStartDate: new Date().toISOString().slice(0, 10),
					maintenanceEndDate: expectedEndDate || undefined,
					maintenanceCost: costRaw ? Number(costRaw) : undefined,
					markCompleted: false,
				});
				toast.success("Đã đưa thiết bị vào bảo trì.");
			}

			await loadDevices();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái bảo trì."));
		} finally {
			setActionDeviceId(null);
		}
	};

	const resetCreateForm = () => {
		setCreateForm({
			name: "",
			description: "",
			price: "",
			stock: "0",
			categoryId: "NONE",
			brandId: "NONE",
			sku: "",
			image: "",
		});
	};

	const handleCreateDevice = async () => {
		const name = createForm.name.trim();
		const price = Number(createForm.price);
		const stock = Number(createForm.stock);

		if (!name) {
			toast.error("Tên sản phẩm là bắt buộc.");
			return;
		}

		if (!Number.isFinite(price) || price < 0) {
			toast.error("Giá bán phải là số không âm.");
			return;
		}

		if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
			toast.error("Tồn kho ban đầu phải là số nguyên không âm.");
			return;
		}

		try {
			setCreatingDevice(true);
			await backofficeApi.createStaffDevice({
				name,
				description: createForm.description.trim() || undefined,
				price,
				stock,
				categoryId: createForm.categoryId !== "NONE" ? Number(createForm.categoryId) : undefined,
				brandId: createForm.brandId !== "NONE" ? Number(createForm.brandId) : undefined,
				sku: createForm.sku.trim() || undefined,
				image: createForm.image.trim() || undefined,
			});
			toast.success("Đã tạo sản phẩm mới và đưa vào kho.");
			setCreateDialogOpen(false);
			resetCreateForm();
			await loadDevices();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tạo sản phẩm mới."));
		} finally {
			setCreatingDevice(false);
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-muted-foreground">
				Đăng nhập bằng tài khoản staff để quản lý tồn kho.
			</div>
		);
	}

	if (authUser && !["STAFF", "ADMIN"].includes(authUser.role)) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-muted-foreground">
				Bạn không có quyền truy cập màn quản lý tồn kho.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Tồn kho và bảo trì</h1>
					<p className="text-sm text-muted-foreground">
						Theo dõi số lượng tồn, xử lý nhập xuất kiểm kê và điều phối bảo trì thiết bị.
					</p>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row">
					<Button onClick={() => setCreateDialogOpen(true)}>
						<Plus className="size-4" />
						Nhập sản phẩm mới
					</Button>
					<Button variant="outline" onClick={() => { void loadDevices(); void loadTransactions(); }} disabled={loadingDevices || loadingTransactions}>
						<RefreshCw className={loadingDevices || loadingTransactions ? "animate-spin" : ""} />
						Làm mới
					</Button>
				</div>
			</div>

			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Tạo sản phẩm mới trong kho</DialogTitle>
						<DialogDescription>
							Dùng khi thiết bị chưa từng tồn tại trong hệ thống. Sau khi tạo xong, staff có thể tiếp tục nhập xuất và bảo trì như các sản phẩm khác.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2 md:col-span-2">
							<label className="text-sm font-medium">Tên sản phẩm</label>
							<Input value={createForm.name} onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ví dụ: Máy điện di chăm sóc da" />
						</div>
						<div className="space-y-2 md:col-span-2">
							<label className="text-sm font-medium">Mô tả ngắn</label>
							<Textarea value={createForm.description} onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả ngắn để staff dễ nhận diện sản phẩm" rows={3} />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Giá bán</label>
							<Input type="number" min="0" value={createForm.price} onChange={(event) => setCreateForm((current) => ({ ...current, price: event.target.value }))} placeholder="0" />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Tồn kho ban đầu</label>
							<Input type="number" min="0" value={createForm.stock} onChange={(event) => setCreateForm((current) => ({ ...current, stock: event.target.value }))} placeholder="0" />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Danh mục</label>
							<Select value={createForm.categoryId} onValueChange={(value) => setCreateForm((current) => ({ ...current, categoryId: value }))}>
								<SelectTrigger className="bg-white">
									<SelectValue placeholder="Chọn danh mục" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="NONE">Không chọn</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Thương hiệu</label>
							<Select value={createForm.brandId} onValueChange={(value) => setCreateForm((current) => ({ ...current, brandId: value }))}>
								<SelectTrigger className="bg-white">
									<SelectValue placeholder="Chọn thương hiệu" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="NONE">Không chọn</SelectItem>
									{brands.map((brand) => (
										<SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">SKU</label>
							<Input value={createForm.sku} onChange={(event) => setCreateForm((current) => ({ ...current, sku: event.target.value }))} placeholder="Ví dụ: DEV-CAREVIA-001" />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">Ảnh đại diện</label>
							<Input value={createForm.image} onChange={(event) => setCreateForm((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." />
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetCreateForm(); }} disabled={creatingDevice}>
							Hủy
						</Button>
						<Button onClick={() => void handleCreateDevice()} disabled={creatingDevice}>
							{creatingDevice ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
							Tạo sản phẩm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card>
					<CardHeader>
						<CardDescription>Thiết bị trong bộ lọc hiện tại</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl">
							<Boxes className="size-6 text-sky-500" />
							{totalDevices}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Low stock</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl text-amber-600">{lowStockCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Đang bảo trì</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl">
							<Wrench className="size-6 text-indigo-500" />
							{maintenanceCount}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader>
						<CardDescription>Đã hết hàng</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl text-rose-600">{outOfStockCount}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Bộ lọc tồn kho</CardTitle>
					<CardDescription>Lọc nhanh thiết bị cần staff xử lý ngay trong ngày.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
					<Input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Tìm theo tên, SKU hoặc slug"
					/>
					<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DeviceFilter)}>
						<SelectTrigger className="bg-white">
							<SelectValue placeholder="Lọc theo trạng thái" />
						</SelectTrigger>
						<SelectContent>
							{DEVICE_STATUS_OPTIONS.map((option) => (
								<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button variant={lowStockOnly ? "default" : "outline"} onClick={() => setLowStockOnly((current) => !current)}>
						Low stock
					</Button>
					<Button variant={maintenanceOnly ? "default" : "outline"} onClick={() => setMaintenanceOnly((current) => !current)}>
						Bảo trì
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Thiết bị vận hành</CardTitle>
					<CardDescription>Thao tác nhập, xuất, kiểm kê và cập nhật bảo trì trực tiếp theo từng thiết bị.</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingDevices ? (
						<div className="flex min-h-56 items-center justify-center text-muted-foreground">
							<Loader2 className="size-5 animate-spin" />
						</div>
					) : devices.length === 0 ? (
						<div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
							Không có thiết bị phù hợp với bộ lọc hiện tại.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Thiết bị</TableHead>
									<TableHead>SKU / Danh mục</TableHead>
									<TableHead>Tồn kho</TableHead>
									<TableHead>Giá bán</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Bảo trì</TableHead>
									<TableHead className="text-right">Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{devices.map((device) => {
									const isActing = actionDeviceId === device.id;
									return (
										<TableRow key={device.id}>
											<TableCell>
												<div className="font-medium">{device.name}</div>
												<div className="text-xs text-muted-foreground">ID #{device.id}</div>
											</TableCell>
											<TableCell>
												<div className="font-medium">{device.sku || "Chưa gán SKU"}</div>
												<div className="text-xs text-muted-foreground">{device.category?.name || "Chưa có danh mục"}</div>
											</TableCell>
											<TableCell>
												<div className={`font-semibold ${device.stock <= 5 ? "text-amber-600" : "text-foreground"}`}>{device.stock}</div>
												<div className="text-xs text-muted-foreground">Đã bán: {device.sold}</div>
											</TableCell>
											<TableCell>
												<div className="font-medium">{formatCurrency(device.price)}</div>
												<div className="text-xs text-muted-foreground">Booking: {device.bookingPrice ? formatCurrency(device.bookingPrice) : "Không áp dụng"}</div>
											</TableCell>
											<TableCell>
												<Badge variant={DEVICE_STATUS_BADGE[device.status]}>{DEVICE_STATUS_LABELS[device.status]}</Badge>
											</TableCell>
											<TableCell>
												{device.maintenanceReason ? (
													<div className="space-y-1 text-xs text-muted-foreground">
														<div>{device.maintenanceReason}</div>
														{device.maintenanceStartDate ? <div>Bắt đầu: {formatDate(device.maintenanceStartDate)}</div> : null}
														{device.maintenanceEndDate ? <div>Kết thúc: {formatDate(device.maintenanceEndDate)}</div> : null}
														{typeof device.maintenanceCost === "number" ? <div>Chi phí: {formatCurrency(device.maintenanceCost)}</div> : null}
													</div>
												) : (
													<span className="text-xs text-muted-foreground">Chưa có lịch sử bảo trì</span>
												)}
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap justify-end gap-2">
													<Button size="sm" variant="outline" disabled={isActing} onClick={() => void requestInventoryAdjustment(device.id, "IMPORT")}>
														{isActing ? <Loader2 className="animate-spin" /> : <ArrowDownToLine className="size-4" />}
														Nhập
													</Button>
													<Button size="sm" variant="outline" disabled={isActing} onClick={() => void requestInventoryAdjustment(device.id, "EXPORT")}>
														{isActing ? <Loader2 className="animate-spin" /> : <ArrowUpFromLine className="size-4" />}
														Xuất
													</Button>
													<Button size="sm" variant="outline" disabled={isActing} onClick={() => void requestInventoryAdjustment(device.id, "AUDIT_ADJUSTMENT")}>
														{isActing ? <Loader2 className="animate-spin" /> : null}
														Kiểm kê
													</Button>
													<Button size="sm" variant={device.status === "MAINTENANCE" ? "default" : "outline"} disabled={isActing} onClick={() => void handleMaintenance(device)}>
														{isActing ? <Loader2 className="animate-spin" /> : <Wrench className="size-4" />}
														{device.status === "MAINTENANCE" ? "Hoàn tất bảo trì" : "Bảo trì"}
													</Button>
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

			<Card>
				<CardHeader>
					<CardTitle>Lịch sử nhập xuất kho</CardTitle>
					<CardDescription>20 giao dịch gần nhất để staff kiểm soát thay đổi tồn kho.</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingTransactions ? (
						<div className="flex min-h-40 items-center justify-center text-muted-foreground">
							<Loader2 className="size-5 animate-spin" />
						</div>
					) : transactions.length === 0 ? (
						<div className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
							Chưa có giao dịch tồn kho nào được ghi nhận.
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Thời gian</TableHead>
									<TableHead>Thiết bị</TableHead>
									<TableHead>Loại giao dịch</TableHead>
									<TableHead>Biến động</TableHead>
									<TableHead>Kết quả</TableHead>
									<TableHead>Ghi chú</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{transactions.map((transaction) => (
									<TableRow key={transaction.id}>
										<TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
										<TableCell>
											<div className="font-medium">{transaction.deviceName}</div>
											<div className="text-xs text-muted-foreground">{transaction.createdBy || "system"}</div>
										</TableCell>
										<TableCell>{TRANSACTION_LABELS[transaction.transactionType]}</TableCell>
										<TableCell className={transaction.quantityChange >= 0 ? "text-emerald-600" : "text-rose-600"}>
											{transaction.quantityChange >= 0 ? "+" : ""}{transaction.quantityChange}
										</TableCell>
										<TableCell>{transaction.previousStock} -&gt; {transaction.newStock}</TableCell>
										<TableCell>
											<div className="font-medium">{transaction.reason}</div>
											<div className="text-xs text-muted-foreground">{transaction.note || "Không có ghi chú"}</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}