"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ArrowDownToLine,
	ArrowUpFromLine,
	Boxes,
	Loader2,
	Pencil,
	Plus,
	RefreshCw,
	TicketPercent,
	Trash2,
	Wrench,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
	backofficeApi,
	type BackofficeVoucher,
	type InventoryTransactionType,
	type StaffDevice,
	type StaffDeviceBrand,
	type StaffDeviceCategory,
	type StaffDeviceStatus,
	type StaffInventoryTransaction,
} from "@/lib/backofficeApi";
import { formatCurrency, formatDate, formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";

type DeviceFilter = "ALL" | StaffDeviceStatus;
type DeviceDialogMode = "create" | "edit";

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

const EMPTY_DEVICE_FORM = {
	name: "",
	description: "",
	price: "",
	stock: "0",
	skinType: "",
	status: "AVAILABLE" as StaffDeviceStatus,
	categoryId: "NONE",
	brandId: "NONE",
	sku: "",
	image: "",
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
	const [deviceError, setDeviceError] = useState<string | null>(null);

	const [categories, setCategories] = useState<StaffDeviceCategory[]>([]);
	const [brands, setBrands] = useState<StaffDeviceBrand[]>([]);
	const [vouchers, setVouchers] = useState<BackofficeVoucher[]>([]);
	const [metadataLoaded, setMetadataLoaded] = useState(false);
	const [metadataLoading, setMetadataLoading] = useState(false);

	const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
	const [deviceDialogMode, setDeviceDialogMode] = useState<DeviceDialogMode>("create");
	const [editingDevice, setEditingDevice] = useState<StaffDevice | null>(null);
	const [deviceForm, setDeviceForm] = useState(EMPTY_DEVICE_FORM);
	const [savingDevice, setSavingDevice] = useState(false);
	const [voucherLoading, setVoucherLoading] = useState(false);
	const [voucherSelection, setVoucherSelection] = useState("NONE");

	const loadDevices = useCallback(async () => {
		try {
			setLoadingDevices(true);
			setDeviceError(null);
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
			const message = getBackofficeErrorMessage(error, "Không thể tải danh sách thiết bị.");
			setDeviceError(message);
			toast.error(message);
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

	const ensureDeviceMetadata = useCallback(async () => {
		if (metadataLoaded) {
			return;
		}

		try {
			setMetadataLoading(true);
			const [categoryData, brandData, voucherData] = await Promise.all([
				backofficeApi.getStaffDeviceCategories(),
				backofficeApi.getStaffDeviceBrands(),
				backofficeApi.getAllVouchers(),
			]);
			setCategories(categoryData || []);
			setBrands(brandData || []);
			setVouchers(voucherData || []);
			setMetadataLoaded(true);
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải danh mục, thương hiệu hoặc voucher."));
			throw error;
		} finally {
			setMetadataLoading(false);
		}
	}, [metadataLoaded]);

	useEffect(() => {
		if (!isAuthenticated) {
			setLoadingDevices(false);
			setLoadingTransactions(false);
			return;
		}

		void loadDevices();
		void loadTransactions();
	}, [isAuthenticated, loadDevices, loadTransactions]);

	const lowStockCount = devices.filter((device) => device.stock <= 5 && device.status !== "INACTIVE").length;
	const maintenanceCount = devices.filter((device) => device.status === "MAINTENANCE").length;
	const outOfStockCount = devices.filter((device) => device.status === "OUT_OF_STOCK").length;

	const assignedVouchersForEditingDevice = useMemo(() => {
		if (!editingDevice) return [];
		return vouchers.filter((voucher) => voucher.applicableDeviceId === editingDevice.id);
	}, [editingDevice, vouchers]);

	const assignableVouchers = useMemo(() => {
		if (!editingDevice) return [];
		return vouchers.filter(
			(voucher) =>
				voucher.status === "ACTIVE" &&
				(voucher.applicableDeviceId == null || voucher.applicableDeviceId === editingDevice.id)
		);
	}, [editingDevice, vouchers]);

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

	const resetDeviceForm = () => {
		setDeviceForm(EMPTY_DEVICE_FORM);
		setEditingDevice(null);
		setVoucherSelection("NONE");
	};

	const openCreateDialog = async () => {
		try {
			await ensureDeviceMetadata();
			setDeviceDialogMode("create");
			resetDeviceForm();
			setDeviceDialogOpen(true);
		} catch {
			// Toast already shown.
		}
	};

	const openEditDialog = async (device: StaffDevice) => {
		try {
			await ensureDeviceMetadata();
			setDeviceDialogMode("edit");
			setEditingDevice(device);
			setVoucherSelection("NONE");
			setDeviceForm({
				name: device.name,
				description: device.description || "",
				price: String(device.price ?? 0),
				stock: String(device.stock ?? 0),
				skinType: device.skinType || "",
				status: device.status,
				categoryId: device.category ? String(device.category.id) : "NONE",
				brandId: device.brand ? String(device.brand.id) : "NONE",
				sku: device.sku || "",
				image: device.image || "",
			});
			setDeviceDialogOpen(true);
		} catch {
			// Toast already shown.
		}
	};

	const closeDeviceDialog = () => {
		if (savingDevice || voucherLoading || metadataLoading) {
			return;
		}
		setDeviceDialogOpen(false);
		resetDeviceForm();
	};

	const handleSaveDevice = async () => {
		const name = deviceForm.name.trim();
		const description = deviceForm.description.trim();
		const image = deviceForm.image.trim();
		const price = Number(deviceForm.price);
		const stock = Number(deviceForm.stock);

		if (!name) {
			toast.error("Tên thiết bị là bắt buộc.");
			return;
		}
		if (!image) {
			toast.error("Thiết bị cần có ảnh đại diện.");
			return;
		}
		if (!Number.isFinite(price) || price < 0) {
			toast.error("Giá bán phải là số không âm.");
			return;
		}
		if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
			toast.error("Tồn kho phải là số nguyên không âm.");
			return;
		}

		try {
			setSavingDevice(true);
			const payload = {
				name,
				description: description || undefined,
				price,
				stock,
				skinType: deviceForm.skinType.trim() || undefined,
				categoryId: deviceForm.categoryId !== "NONE" ? Number(deviceForm.categoryId) : undefined,
				brandId: deviceForm.brandId !== "NONE" ? Number(deviceForm.brandId) : undefined,
				sku: deviceForm.sku.trim() || undefined,
				image,
			};

			if (deviceDialogMode === "create") {
				await backofficeApi.createStaffDevice(payload);
				toast.success("Đã tạo sản phẩm mới và đưa vào kho.");
			} else if (editingDevice) {
				await backofficeApi.updateStaffDevice(editingDevice.id, {
					...payload,
					status: deviceForm.status,
				});
				toast.success("Đã cập nhật thiết bị.");
			}

			setDeviceDialogOpen(false);
			resetDeviceForm();
			await loadDevices();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể lưu thông tin thiết bị."));
		} finally {
			setSavingDevice(false);
		}
	};

	const handleDeleteDevice = async (device: StaffDevice) => {
		if (!window.confirm(`Xác nhận chuyển thiết bị \"${device.name}\" sang trạng thái ngừng hoạt động?`)) {
			return;
		}

		try {
			setActionDeviceId(device.id);
			await backofficeApi.deleteStaffDevice(device.id);
			toast.success("Đã soft delete thiết bị.");
			if (editingDevice?.id === device.id) {
				setDeviceDialogOpen(false);
				resetDeviceForm();
			}
			await loadDevices();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể xóa thiết bị."));
		} finally {
			setActionDeviceId(null);
		}
	};

	const reloadMetadata = async () => {
		setMetadataLoaded(false);
		await ensureDeviceMetadata();
	};

	const handleAssignVoucher = async () => {
		if (!editingDevice || voucherSelection === "NONE") {
			toast.error("Chọn voucher trước khi gán.");
			return;
		}

		try {
			setVoucherLoading(true);
			await backofficeApi.assignVoucherToStaffDevice(editingDevice.id, Number(voucherSelection));
			toast.success("Đã gán voucher cho thiết bị.");
			setVoucherSelection("NONE");
			await reloadMetadata();
			await loadDevices();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể gán voucher cho thiết bị."));
		} finally {
			setVoucherLoading(false);
		}
	};

	const handleRemoveVoucher = async (voucher: BackofficeVoucher) => {
		if (!editingDevice) return;

		try {
			setVoucherLoading(true);
			await backofficeApi.removeVoucherFromStaffDevice(editingDevice.id, voucher.id);
			toast.success("Đã bỏ gán voucher khỏi thiết bị.");
			await reloadMetadata();
			await loadDevices();
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể bỏ gán voucher."));
		} finally {
			setVoucherLoading(false);
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-muted-foreground">
				Đăng nhập bằng tài khoản staff để quản lý thiết bị và tồn kho.
			</div>
		);
	}

	if (authUser && !["STAFF", "ADMIN"].includes(authUser.role)) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-muted-foreground">
				Bạn không có quyền truy cập màn quản lý vận hành thiết bị.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Thiết bị, tồn kho và bảo trì</h1>
					<p className="text-sm text-muted-foreground">
						Staff quản lý danh mục thiết bị, nhập xuất kiểm kê, bảo trì và gán voucher ngay trên cùng một màn.
					</p>
				</div>

				<div className="flex flex-col gap-2 sm:flex-row">
					<Button onClick={() => void openCreateDialog()}>
						<Plus className="size-4" />
						Nhập sản phẩm mới
					</Button>
					<Button variant="outline" onClick={() => { void loadDevices(); void loadTransactions(); }} disabled={loadingDevices || loadingTransactions}>
						<RefreshCw className={loadingDevices || loadingTransactions ? "animate-spin" : ""} />
						Làm mới
					</Button>
				</div>
			</div>

			<Card className="border-l-4 border-l-[#052962] bg-slate-50/70">
				<CardContent className="flex flex-col gap-3 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
					<div>
						<div className="font-semibold text-foreground">Tab này đã gộp UC-08 và nghiệp vụ tồn kho.</div>
						<div>Thêm, sửa, soft delete, đổi trạng thái, gán voucher, nhập xuất và bảo trì đều xử lý tại đây để staff không phải chuyển tab.</div>
					</div>
					{deviceError ? (
						<div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
							{deviceError} Nếu vừa cập nhật backend, hãy restart server để nạp route staff mới.
						</div>
					) : null}
				</CardContent>
			</Card>

			<Dialog open={deviceDialogOpen} onOpenChange={(open) => { if (!open) { closeDeviceDialog(); } else { setDeviceDialogOpen(true); } }}>
				<DialogContent className="sm:max-w-4xl">
					<DialogHeader>
						<DialogTitle>{deviceDialogMode === "create" ? "Tạo sản phẩm mới trong kho" : "Cập nhật thiết bị"}</DialogTitle>
						<DialogDescription>
							{deviceDialogMode === "create"
								? "Dùng khi thiết bị chưa từng tồn tại trong hệ thống. Sau khi tạo xong, staff có thể tiếp tục nhập xuất và bảo trì như các sản phẩm khác."
								: "Chỉnh sửa thông tin thiết bị, đổi trạng thái vận hành và quản lý voucher áp dụng riêng nếu cần."}
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">Tên sản phẩm</label><Input value={deviceForm.name} onChange={(event) => setDeviceForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ví dụ: Máy điện di chăm sóc da" /></div>
							<div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">Mô tả ngắn</label><Textarea value={deviceForm.description} onChange={(event) => setDeviceForm((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả ngắn để staff dễ nhận diện sản phẩm" rows={4} /></div>
							<div className="space-y-2"><label className="text-sm font-medium">Giá bán</label><Input type="number" min="0" value={deviceForm.price} onChange={(event) => setDeviceForm((current) => ({ ...current, price: event.target.value }))} placeholder="0" /></div>
							<div className="space-y-2"><label className="text-sm font-medium">Tồn kho</label><Input type="number" min="0" value={deviceForm.stock} onChange={(event) => setDeviceForm((current) => ({ ...current, stock: event.target.value }))} placeholder="0" /></div>
							<div className="space-y-2"><label className="text-sm font-medium">Loại da</label><Input value={deviceForm.skinType} onChange={(event) => setDeviceForm((current) => ({ ...current, skinType: event.target.value }))} placeholder="Ví dụ: Da dầu, da nhạy cảm" /></div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Trạng thái</label>
								{deviceDialogMode === "edit" ? (
									<Select value={deviceForm.status} onValueChange={(value) => setDeviceForm((current) => ({ ...current, status: value as StaffDeviceStatus }))}>
										<SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
										<SelectContent>{DEVICE_STATUS_OPTIONS.filter((option) => option.value !== "ALL").map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
									</Select>
								) : (
									<div className="rounded-xl border bg-white px-3 py-2 text-sm text-muted-foreground">Thiết bị mới sẽ mặc định ở trạng thái sẵn sàng. Sau khi tạo, staff có thể sửa lại trạng thái.</div>
								)}
							</div>
							<div className="space-y-2"><label className="text-sm font-medium">Danh mục</label><Select value={deviceForm.categoryId} onValueChange={(value) => setDeviceForm((current) => ({ ...current, categoryId: value }))}><SelectTrigger className="bg-white"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger><SelectContent><SelectItem value="NONE">Không chọn</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent></Select></div>
							<div className="space-y-2"><label className="text-sm font-medium">Thương hiệu</label><Select value={deviceForm.brandId} onValueChange={(value) => setDeviceForm((current) => ({ ...current, brandId: value }))}><SelectTrigger className="bg-white"><SelectValue placeholder="Chọn thương hiệu" /></SelectTrigger><SelectContent><SelectItem value="NONE">Không chọn</SelectItem>{brands.map((brand) => <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>)}</SelectContent></Select></div>
							<div className="space-y-2"><label className="text-sm font-medium">SKU</label><Input value={deviceForm.sku} onChange={(event) => setDeviceForm((current) => ({ ...current, sku: event.target.value }))} placeholder="Ví dụ: DEV-CAREVIA-001" /></div>
							<div className="space-y-2 md:col-span-2"><label className="text-sm font-medium">Ảnh đại diện</label><Input value={deviceForm.image} onChange={(event) => setDeviceForm((current) => ({ ...current, image: event.target.value }))} placeholder="https://..." /></div>
						</div>

						<div className="space-y-4 rounded-2xl border bg-slate-50/70 p-4">
							<div>
								<h3 className="font-semibold text-foreground">Voucher áp dụng riêng</h3>
								<p className="text-sm text-muted-foreground">Voucher chỉ tải khi cần chỉnh sửa thiết bị, để tránh phát sinh request thừa lúc mở trang.</p>
							</div>

							{metadataLoading ? (
								<div className="flex min-h-28 items-center justify-center text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
							) : deviceDialogMode === "edit" && editingDevice ? (
								<>
									<div className="space-y-2">
										<div className="text-sm font-medium">Voucher đang gán</div>
										{assignedVouchersForEditingDevice.length ? (
											<div className="space-y-2">
												{assignedVouchersForEditingDevice.map((voucher) => (
													<div key={voucher.id} className="flex items-center justify-between rounded-xl border bg-white px-3 py-2">
														<div>
															<div className="font-medium">{voucher.code}</div>
															<div className="text-xs text-muted-foreground">Thiết bị đích: {voucher.applicableDeviceName || editingDevice.name}</div>
														</div>
														<Button size="sm" variant="outline" disabled={voucherLoading} onClick={() => void handleRemoveVoucher(voucher)}>Bỏ gán</Button>
													</div>
												))}
											</div>
										) : <div className="text-sm text-muted-foreground">Thiết bị này chưa có voucher riêng.</div>}
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium">Gán voucher hiện có</label>
										<Select value={voucherSelection} onValueChange={setVoucherSelection}>
											<SelectTrigger className="bg-white"><SelectValue placeholder="Chọn voucher" /></SelectTrigger>
											<SelectContent>
												<SelectItem value="NONE">Chọn voucher để gán</SelectItem>
												{assignableVouchers.map((voucher) => <SelectItem key={voucher.id} value={String(voucher.id)}>{voucher.code} - {voucher.applicableDeviceName || "Chưa gán"}</SelectItem>)}
											</SelectContent>
										</Select>
										<Button className="w-full" disabled={voucherLoading || voucherSelection === "NONE"} onClick={() => void handleAssignVoucher()}>
											{voucherLoading ? <Loader2 className="animate-spin" /> : <TicketPercent className="size-4" />}
											Gán voucher cho thiết bị
										</Button>
									</div>
								</>
							) : (
								<div className="text-sm text-muted-foreground">Tạo thiết bị trước. Sau đó mở chế độ sửa để cập nhật trạng thái và gán voucher áp dụng riêng.</div>
							)}
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={closeDeviceDialog} disabled={savingDevice || voucherLoading || metadataLoading}>Hủy</Button>
						<Button onClick={() => void handleSaveDevice()} disabled={savingDevice || voucherLoading || metadataLoading}>
							{savingDevice ? <Loader2 className="animate-spin" /> : deviceDialogMode === "create" ? <Plus className="size-4" /> : <Pencil className="size-4" />}
							{deviceDialogMode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<Card>
					<CardHeader>
						<CardDescription>Thiết bị trong bộ lọc hiện tại</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl"><Boxes className="size-6 text-sky-500" />{totalDevices}</CardTitle>
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
						<CardTitle className="flex items-center gap-3 text-3xl"><Wrench className="size-6 text-indigo-500" />{maintenanceCount}</CardTitle>
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
					<CardTitle>Bộ lọc thiết bị vận hành</CardTitle>
					<CardDescription>Lọc nhanh thiết bị cần staff xử lý ngay trong ngày.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
					<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, SKU hoặc slug" />
					<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DeviceFilter)}>
						<SelectTrigger className="bg-white"><SelectValue placeholder="Lọc theo trạng thái" /></SelectTrigger>
						<SelectContent>{DEVICE_STATUS_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
					</Select>
					<Button variant={lowStockOnly ? "default" : "outline"} onClick={() => setLowStockOnly((current) => !current)}>Low stock</Button>
					<Button variant={maintenanceOnly ? "default" : "outline"} onClick={() => setMaintenanceOnly((current) => !current)}>Bảo trì</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Thiết bị vận hành</CardTitle>
					<CardDescription>Thao tác nhập, xuất, kiểm kê, chỉnh sửa và cập nhật bảo trì trực tiếp theo từng thiết bị.</CardDescription>
				</CardHeader>
				<CardContent>
					{loadingDevices ? (
						<div className="flex min-h-56 items-center justify-center text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
					) : devices.length === 0 ? (
						<div className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">Không có thiết bị phù hợp với bộ lọc hiện tại.</div>
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
											<TableCell><Badge variant={DEVICE_STATUS_BADGE[device.status]}>{DEVICE_STATUS_LABELS[device.status]}</Badge></TableCell>
											<TableCell>
												{device.maintenanceReason ? (
													<div className="space-y-1 text-xs text-muted-foreground">
														<div>{device.maintenanceReason}</div>
														{device.maintenanceStartDate ? <div>Bắt đầu: {formatDate(device.maintenanceStartDate)}</div> : null}
														{device.maintenanceEndDate ? <div>Kết thúc: {formatDate(device.maintenanceEndDate)}</div> : null}
														{typeof device.maintenanceCost === "number" ? <div>Chi phí: {formatCurrency(device.maintenanceCost)}</div> : null}
													</div>
												) : <span className="text-xs text-muted-foreground">Chưa có lịch sử bảo trì</span>}
											</TableCell>
											<TableCell>
												<div className="flex flex-wrap justify-end gap-2">
													<Button size="sm" variant="outline" disabled={isActing} onClick={() => void openEditDialog(device)}><Pencil className="size-4" />Sửa</Button>
													<Button size="sm" variant="destructive" disabled={isActing} onClick={() => void handleDeleteDevice(device)}><Trash2 className="size-4" />Xóa</Button>
													<Button size="sm" variant="outline" disabled={isActing} onClick={() => void requestInventoryAdjustment(device.id, "IMPORT")}>
														{isActing ? <Loader2 className="animate-spin" /> : <ArrowDownToLine className="size-4" />}Nhập
													</Button>
													<Button size="sm" variant="outline" disabled={isActing} onClick={() => void requestInventoryAdjustment(device.id, "EXPORT")}>
														{isActing ? <Loader2 className="animate-spin" /> : <ArrowUpFromLine className="size-4" />}Xuất
													</Button>
													<Button size="sm" variant="outline" disabled={isActing} onClick={() => void requestInventoryAdjustment(device.id, "AUDIT_ADJUSTMENT")}>
														{isActing ? <Loader2 className="animate-spin" /> : null}Kiểm kê
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
						<div className="flex min-h-40 items-center justify-center text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
					) : transactions.length === 0 ? (
						<div className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">Chưa có giao dịch tồn kho nào được ghi nhận.</div>
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
										<TableCell className={transaction.quantityChange >= 0 ? "text-emerald-600" : "text-rose-600"}>{transaction.quantityChange >= 0 ? "+" : ""}{transaction.quantityChange}</TableCell>
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