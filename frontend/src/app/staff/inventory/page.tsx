"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ArrowDownToLine,
	ArrowUpFromLine,
	Boxes,
	ClipboardCheck,
	ImagePlus,
	Layers,
	Loader2,
	MoreHorizontal,
	PackageX,
	Pencil,
	Plus,
	RefreshCw,
	Search,
	TicketPercent,
	Trash2,
	Wrench,
} from "lucide-react";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
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
import { cn } from "@/components/pages/OrdersPage";

type DeviceFilter = "ALL" | StaffDeviceStatus;
type DeviceDialogMode = "create" | "edit";

const DEVICE_STATUS_OPTIONS: Array<{ value: DeviceFilter; label: string }> = [
	{ value: "ALL", label: "Tất cả trạng thái" },
	{ value: "AVAILABLE", label: "Sẵn sàng" },
	{ value: "OUT_OF_STOCK", label: "Hết hàng" },
	{ value: "MAINTENANCE", label: "Bảo trì" },
	{ value: "INACTIVE", label: "Ngừng hoạt động" },
];

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
	imagePublicId: "",
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
	const [vouchers, setVouchers] = useState<BackofficeVoucher[]>([]);
	const [metadataLoaded, setMetadataLoaded] = useState(false);
	const [metadataLoading, setMetadataLoading] = useState(false);

	const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
	const [deviceDialogMode, setDeviceDialogMode] = useState<DeviceDialogMode>("create");
	const [editingDevice, setEditingDevice] = useState<StaffDevice | null>(null);
	const [deviceForm, setDeviceForm] = useState(EMPTY_DEVICE_FORM);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [savingDevice, setSavingDevice] = useState(false);
	const [voucherLoading, setVoucherLoading] = useState(false);
	const [voucherSelection, setVoucherSelection] = useState("NONE");

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
			const message = getBackofficeErrorMessage(error, "Không thể tải danh sách thiết bị.");
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
		setUploadingImage(false);
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
				imagePublicId: device.imagePublicId || "",
			});
			setDeviceDialogOpen(true);
		} catch {
			// Toast already shown.
		}
	};

	const closeDeviceDialog = () => {
		if (savingDevice || voucherLoading || metadataLoading || uploadingImage) {
			return;
		}
		setDeviceDialogOpen(false);
		resetDeviceForm();
	};

	const handleUploadDeviceImage = async (file: File) => {
		if (!file.type.startsWith("image/")) {
			toast.error("Chỉ có thể tải lên tệp hình ảnh.");
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			toast.error("Ảnh thiết bị không được vượt quá 10MB.");
			return;
		}

		try {
			setUploadingImage(true);
			const uploaded = await backofficeApi.uploadStaffDeviceImage(file, {
				deviceId: deviceDialogMode === "edit" ? editingDevice?.id : undefined,
				currentPublicId: deviceForm.imagePublicId.trim() || undefined,
			});

			setDeviceForm((current) => ({
				...current,
				image: uploaded.imageUrl,
				imagePublicId: uploaded.imagePublicId,
			}));

			if (deviceDialogMode === "edit" && editingDevice) {
				const updatedDevice = {
					...editingDevice,
					image: uploaded.imageUrl,
					imagePublicId: uploaded.imagePublicId,
				};
				setEditingDevice(updatedDevice);
				setDevices((current) => current.map((device) => (
					device.id === editingDevice.id
						? { ...device, image: uploaded.imageUrl, imagePublicId: uploaded.imagePublicId }
						: device
				)));
			}

			toast.success(deviceDialogMode === "edit" ? "Ảnh thiết bị đã được cập nhật." : "Đã tải ảnh thiết bị lên Cloudinary.");
		} catch (error) {
			toast.error(getBackofficeErrorMessage(error, "Không thể tải ảnh thiết bị lên."));
		} finally {
			setUploadingImage(false);
		}
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
				imagePublicId: deviceForm.imagePublicId.trim() || undefined,
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
	// Hàm helper định nghĩa màu sắc Badge trạng thái dẹt mượt mà
	const getDeviceStatusBadge = (status: string) => {
		const configs: Record<string, { label: string; className: string }> = {
			AVAILABLE: { label: "Sẵn sàng", className: "bg-emerald-50 border-emerald-100 text-emerald-700" },
			MAINTENANCE: { label: "Bảo trì", className: "bg-blue-50 border-blue-100 text-blue-700" },
			OUT_OF_STOCK: { label: "Hết hàng", className: "bg-rose-50 border-rose-100 text-rose-700" },
		};
		const config = configs[status] || { label: status, className: "bg-gray-50 border-gray-100 text-gray-600" };
		return (
			<span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider font-vietnam shadow-sm", config.className)}>
				{config.label}
			</span>
		);
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

	if (authUser?.role !== "STAFF") {
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

				{/* VÙNG CHỨA NÚT THAO TÁC */}
				<div className="flex flex-col gap-2.5 sm:flex-row sm:items-center font-vietnam">

					{/* 1. Nút Nhập sản phẩm mới (Đồng bộ style, chiều cao và font chữ) */}
					<button
						onClick={() => void openCreateDialog()}
						className="inline-flex h-9.5 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-staff-primary px-4 text-[13px] text-white shadow-sm transition-all duration-200 active:scale-95  font-vietnam"
					>
						<Plus className="w-4 h-4" />
						<span>Nhập sản phẩm mới</span>
					</button>

					{/* 2. Nút Làm mới (Hiệu ứng trượt đồng màu với nút thêm mới) */}
					<button
						onClick={() => {
							void loadDevices();
							void loadTransactions();
						}}
						disabled={loadingDevices || loadingTransactions}
						className={cn(
							"group relative overflow-hidden",
							"text-[13px] font-medium whitespace-nowrap",
							"border border-gray-100 bg-white text-gray-700",
							"hover:border-staff-primary transition-all duration-500",
							"h-9.5 shrink-0 rounded-md px-4 shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
						)}
					>
						{/* Lớp nền trượt màu Primary: Khớp hoàn toàn với màu gốc của nút Nhập sản phẩm mới */}
						<span className="absolute inset-y-0 left-0 w-0 bg-staff-primary transition-all duration-500 ease-out group-hover:w-full" />

						{/* Nội dung chữ và Icon: Chuyển sang màu trắng tinh tế khi lớp nền trượt qua */}
						<div className="relative z-10 flex items-center justify-center text-gray-700 group-hover:text-white transition-colors duration-500">
							<RefreshCw
								className={cn(
									"w-3.5 h-3.5 mr-2 transition-transform duration-700 ease-in-out text-gray-400 group-hover:text-white",
									(loadingDevices || loadingTransactions) ? "animate-spin" : "group-hover:rotate-180"
								)}
							/>
							<span className="relative">Làm mới</span>
						</div>
					</button>

				</div>
			</div>

			{/* <Card className="border-l-4 border-l-[#052962] bg-slate-50/70">
				<CardContent className="flex flex-col gap-3 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
					<div>
						<div className="font-vietnam text-foreground">Tab này đã gộp UC-08 và nghiệp vụ tồn kho.</div>
						<div>Thêm, sửa, soft delete, đổi trạng thái, gán voucher, nhập xuất và bảo trì đều xử lý tại đây để staff không phải chuyển tab.</div>
					</div>
					{deviceError ? (
						<div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
							{deviceError} Nếu vừa cập nhật backend, hãy restart server để nạp route staff mới.
						</div>
					) : null}
				</CardContent>
			</Card> */}

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

					<div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
						<div className="space-y-5">
							<Card className="border-dashed border-slate-300 bg-slate-50/60">
								<CardHeader className="pb-4">
									<CardTitle className="text-base">Ảnh đại diện thiết bị</CardTitle>
									<CardDescription>
										Ảnh tải lên sẽ được đồng bộ qua Cloudinary trong folder device/devices.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-start">
										<div className="relative aspect-4/3 overflow-hidden rounded-2xl border bg-white shadow-sm">
											{deviceForm.image ? (
												<Image
													src={deviceForm.image}
													alt={deviceForm.name || "Device preview"}
													fill
													sizes="(max-width: 1024px) 100vw, 220px"
													className="object-cover"
												/>
											) : (
												<div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
													<div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
														<ImagePlus className="size-6" />
													</div>
													<div>
														<div className="font-medium text-foreground">Chưa có ảnh đại diện</div>
														<div>Chọn ảnh để staff dễ kiểm tra và nhận diện thiết bị hơn.</div>
													</div>
												</div>
											)}
										</div>

										<div className="space-y-3">
											<div className="space-y-1">
												<Label className="text-sm font-medium">Tải ảnh mới</Label>
												<p className="text-sm text-muted-foreground">
													Hỗ trợ JPG, PNG, WEBP. Khi đổi ảnh ở chế độ sửa, hệ thống sẽ cập nhật lại asset Cloudinary tương ứng.
												</p>
											</div>

											<div className="flex flex-wrap gap-2">
												<label
													htmlFor="device-image-upload"
													className={cn(
														"inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
														uploadingImage && "pointer-events-none opacity-70"
													)}
												>
													{uploadingImage ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
													{deviceForm.image ? "Đổi ảnh" : "Tải ảnh lên"}
												</label>
												<input
													id="device-image-upload"
													type="file"
													accept="image/*"
													className="hidden"
													disabled={uploadingImage}
													onChange={(event) => {
														const file = event.target.files?.[0];
														event.target.value = "";
														if (file) {
															void handleUploadDeviceImage(file);
														}
													}}
												/>
												{deviceForm.image ? (
													<Button
														type="button"
														variant="outline"
														onClick={() => setDeviceForm((current) => ({ ...current, image: "", imagePublicId: "" }))}
														disabled={uploadingImage}
													>
														<Trash2 className="size-4" />
														Gỡ ảnh
													</Button>
												) : null}
											</div>

											<div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-muted-foreground">
												Ảnh sẽ được lưu tập trung trên Cloudinary theo folder device/devices để lần cập nhật sau staff chỉ cần đổi ảnh là asset được đồng bộ lại đúng chỗ.
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="pb-4">
									<CardTitle className="text-base">Thông tin sản phẩm</CardTitle>
									<CardDescription>Nhóm lại các trường chính để staff nhập nhanh và dễ quét mắt hơn.</CardDescription>
								</CardHeader>
								<CardContent className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2 md:col-span-2">
										<Label className="text-sm font-vietnam">Tên sản phẩm</Label>
										<Input value={deviceForm.name} onChange={(event) => setDeviceForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ví dụ: Máy điện di chăm sóc da" />
									</div>
									<div className="space-y-2 md:col-span-2">
										<Label className="text-sm font-vietnam">Mô tả ngắn</Label>
										<Textarea value={deviceForm.description} onChange={(event) => setDeviceForm((current) => ({ ...current, description: event.target.value }))} placeholder="Mô tả ngắn để staff dễ nhận diện sản phẩm" rows={4} />
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-vietnam">Giá bán</Label>
										<Input type="number" min="0" value={deviceForm.price} onChange={(event) => setDeviceForm((current) => ({ ...current, price: event.target.value }))} placeholder="0" />
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-vietnam">Tồn kho</Label>
										<Input type="number" min="0" value={deviceForm.stock} onChange={(event) => setDeviceForm((current) => ({ ...current, stock: event.target.value }))} placeholder="0" />
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-vietnam">Loại da</Label>
										<Input value={deviceForm.skinType} onChange={(event) => setDeviceForm((current) => ({ ...current, skinType: event.target.value }))} placeholder="Ví dụ: Da dầu, da nhạy cảm" />
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-vietnam">Trạng thái</Label>
										{deviceDialogMode === "edit" ? (
											<Select value={deviceForm.status} onValueChange={(value) => setDeviceForm((current) => ({ ...current, status: value as StaffDeviceStatus }))}>
												<SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
												<SelectContent>{DEVICE_STATUS_OPTIONS.filter((option) => option.value !== "ALL").map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
											</Select>
										) : (
											<div className="rounded-xl border bg-white px-3 py-2 text-sm text-muted-foreground">Thiết bị mới sẽ mặc định ở trạng thái sẵn sàng. Sau khi tạo, staff có thể sửa lại trạng thái.</div>
										)}
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-vietnam">Danh mục</Label>
										<Select value={deviceForm.categoryId} onValueChange={(value) => setDeviceForm((current) => ({ ...current, categoryId: value }))}>
											<SelectTrigger className="bg-white"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
											<SelectContent><SelectItem value="NONE">Không chọn</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-vietnam">Thương hiệu</Label>
										<Select value={deviceForm.brandId} onValueChange={(value) => setDeviceForm((current) => ({ ...current, brandId: value }))}>
											<SelectTrigger className="bg-white"><SelectValue placeholder="Chọn thương hiệu" /></SelectTrigger>
											<SelectContent><SelectItem value="NONE">Không chọn</SelectItem>{brands.map((brand) => <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>)}</SelectContent>
										</Select>
									</div>
									<div className="space-y-2 md:col-span-2">
										<Label className="text-sm font-vietnam">SKU</Label>
										<Input value={deviceForm.sku} onChange={(event) => setDeviceForm((current) => ({ ...current, sku: event.target.value }))} placeholder="Ví dụ: DEV-CAREVIA-001" />
									</div>
								</CardContent>
							</Card>
						</div>

						<Card className="h-fit rounded-2xl border bg-slate-50/70">
							<CardHeader className="pb-4">
								<CardTitle className="text-base">Voucher áp dụng riêng</CardTitle>
								<CardDescription>Voucher chỉ tải khi cần chỉnh sửa thiết bị, để tránh phát sinh request thừa lúc mở trang.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
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
							</CardContent>
						</Card>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={closeDeviceDialog} disabled={savingDevice || voucherLoading || metadataLoading || uploadingImage}>Hủy</Button>
						<Button onClick={() => void handleSaveDevice()} disabled={savingDevice || voucherLoading || metadataLoading || uploadingImage}>
							{savingDevice ? <Loader2 className="animate-spin" /> : deviceDialogMode === "create" ? <Plus className="size-4" /> : <Pencil className="size-4" />}
							{deviceDialogMode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<Card>
					<CardHeader className="gap-2 px-6 py-5">
						<CardDescription>Thiết bị trong bộ lọc hiện tại</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl"><Boxes className="size-6 text-sky-500" />{totalDevices}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-2 px-6 py-5">
						<CardDescription>Low stock</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl text-amber-600">{lowStockCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-2 px-6 py-5">
						<CardDescription>Đang bảo trì</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl"><Wrench className="size-6 text-indigo-500" />{maintenanceCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-2 px-6 py-5">
						<CardDescription>Đã hết hàng</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl text-rose-600">{outOfStockCount}</CardTitle>
					</CardHeader>
				</Card>
			</div>


			{/* 🌟 ĐÃ SỬA: Loại bỏ class "overflow-hidden" tại đây để dropdown hiển thị tự do */}
			<Card className="border border-gray-100 shadow-sm bg-white rounded-xl font-vietnam relative">

				{/* Header chính: Thêm "rounded-t-xl" để giữ bo góc phía trên của Card */}
				<CardHeader className="border-b border-gray-50/60 bg-white px-5 pt-5 pb-3 rounded-t-xl">
					{/* Vùng bên trái: Nội dung tiêu đề */}
					<div className="shrink-0">
						<CardTitle className="text-base font-bold text-gray-800 tracking-tight">
							Bộ lọc thiết bị vận hành
						</CardTitle>
						<CardDescription className="text-[13px] text-gray-400 mt-1">
							Lọc nhanh thiết bị cần staff xử lý ngay trong ngày.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="px-5 pt-3 pb-4 font-vietnam">
					<div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">

						{/* 1. Ô tìm kiếm thông minh tích hợp Icon kính lúp */}
						<div className="relative flex-1 min-w-0 group">
							<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
								<Search className="w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
							</div>
							<input
								type="text"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Tìm theo tên, SKU hoặc slug..."
								className="h-9.5 w-full rounded-md border border-gray-100 bg-white pl-9 pr-4 text-[13px] font-medium text-gray-700 placeholder-gray-400 outline-none shadow-sm transition-all duration-300 hover:border-gray-200 focus:border-primary"
							/>
						</div>

						{/* 2. Bộ lọc Trạng thái Custom Hover (Đồng bộ cấu trúc mượt mà) */}
						{/* 🌟 ĐÃ SỬA: Tăng z-index lên "z-50" cho khối cha để chắc chắn đè lên bảng dữ liệu phía dưới nếu có */}
						<div className="relative z-50 w-full group lg:min-w-55 lg:w-auto">
							{/* Nút hiển thị */}
							<div className="flex h-9.5 cursor-pointer items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm transition-all hover:border-gray-200">
								<span className="text-[13px] font-medium text-gray-700 whitespace-nowrap">
									{DEVICE_STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label || "Lọc theo trạng thái"}
								</span>
								<svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
								</svg>
							</div>

							{/* Danh sách trạng thái ẩn/hiện khi di chuột */}
							{/* 🌟 ĐÃ SỬA: Đảm bảo z-50 và điều chỉnh vị trí đổ xuống chuẩn xác */}
							<div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
								<div className="flex flex-col whitespace-nowrap">
									{DEVICE_STATUS_OPTIONS.map((option) => (
										<div
											key={option.value}
											onClick={() => setStatusFilter(option.value as DeviceFilter)}
											className={`px-3 py-2.5 text-[13px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${statusFilter === option.value ? 'text-primary font-bold bg-gray-50' : 'text-gray-700 hover:bg-gray-50'}`}
										>
											{option.label}
										</div>
									))}
								</div>
							</div>
						</div>

						{/* 3. Nút lọc Sắp hết hàng (Low stock) */}
						<button
							onClick={() => setLowStockOnly((current) => !current)}
							className={cn(
								"inline-flex h-9.5 items-center justify-center gap-1.5 rounded-md border px-4 text-[13px] font-vietnam whitespace-nowrap shadow-sm transition-all duration-300 active:scale-95",
								lowStockOnly
									? "bg-amber-50 border-amber-200 text-amber-700 font-bold"
									: "bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
							)}
						>
							<PackageX className={cn("w-4 h-4", lowStockOnly ? "text-amber-600" : "text-gray-400")} />
							<span>Low stock</span>
						</button>

						{/* 4. Nút lọc Bảo trì (Maintenance) */}
						<button
							onClick={() => setMaintenanceOnly((current) => !current)}
							className={cn(
								"inline-flex h-9.5 items-center justify-center gap-1.5 rounded-md border px-4 text-[13px] font-vietnam whitespace-nowrap shadow-sm transition-all duration-300 active:scale-95",
								maintenanceOnly
									? "bg-blue-50 border-blue-200 text-blue-700 font-bold"
									: "bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
							)}
						>
							<Wrench className={cn("w-3.5 h-3.5", maintenanceOnly ? "text-blue-600" : "text-gray-400")} />
							<span>Bảo trì</span>
						</button>
					</div>
				</CardContent>
			</Card>


			<Card>
				<CardHeader>
					<CardTitle>Thiết bị vận hành</CardTitle>
					<CardDescription>Thao tác nhập, xuất, kiểm kê, chỉnh sửa và cập nhật bảo trì trực tiếp theo từng thiết bị.</CardDescription>
				</CardHeader>
				<CardContent className="p-0 font-vietnam">
					{loadingDevices ? (
						<div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-400">
							<Loader2 className="w-6 h-6 animate-spin text-primary" />
							<p className="text-[13px] font-medium">Đang đồng bộ danh mục thiết bị...</p>
						</div>
					) : devices.length === 0 ? (
						<div className="mx-6 my-16 rounded-xl border-2 border-dashed border-gray-100 px-6 py-16 text-center text-gray-400">
							<Layers className="w-10 h-10 mx-auto text-gray-200 mb-3" />
							<p className="text-[13px] font-semibold">Không có thiết bị phù hợp với bộ lọc hiện tại.</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table className="w-full border-collapse">
								<TableHeader className="bg-gray-50/70 border-b border-gray-100">
									<TableRow className="hover:bg-transparent">
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5 pl-6">Thiết bị</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5">SKU / Thương hiệu</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5">Tồn kho</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5">Giá vận hành</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5">Trạng thái</TableHead>
										<TableHead className="min-w-50 py-3.5 text-[12px] font-bold text-gray-500">Thông tin bảo trì</TableHead>
										<TableHead className="text-[12px] font-bold text-gray-500 py-3.5 pr-6 text-right">Thao tác</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody className="divide-y divide-gray-50">
									{devices.map((device) => {
										const isActing = actionDeviceId === device.id;
										return (
											<TableRow key={device.id} className="hover:bg-gray-50/30 transition-colors group">

												{/* CỘT 1: HÌNH ẢNH SẢN PHẨM & TÊN */}
												<TableCell className="py-3.5 pl-6">
													<div className="flex items-center gap-3">
														{/* Box Ảnh thiết bị tỉ lệ 1:1 có shadow mượt */}
														<div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden shadow-inner">
															<Image
																src={device.image || "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=96&q=80"}
																alt={device.name}
																fill
																sizes="48px"
																className="object-cover transition-transform duration-500 group-hover:scale-105"
															/>
														</div>
														<div className="min-w-0">
															<p className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
																{device.name}
															</p>
															<p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide bg-gray-50 border border-gray-100 w-fit px-1.5 py-0.5 rounded">
																ID: #{device.id}
															</p>
														</div>
													</div>
												</TableCell>

												{/* CỘT 2: SKU / THƯƠNG HIỆU */}
												<TableCell className="py-3.5">
													<div className="text-[13px] font-semibold text-gray-700">{device.sku || "—"}</div>
													<div className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-medium">
														<span>{device.brand?.name || "No Brand"}</span>
														<span className="w-1 h-1 rounded-full bg-gray-200" />
														<span className="max-w-25 truncate">{device.category?.name || "Uncategorized"}</span>
													</div>
												</TableCell>

												{/* CỘT 3: TỒN KHO & ĐÃ BÁN */}
												<TableCell className="py-3.5">
													<div className={cn(
														"text-[13px] font-bold",
														device.stock <= 5 ? "text-amber-600 animate-pulse" : "text-gray-700"
													)}>
														{device.stock} sản phẩm
													</div>
													<div className="text-[11px] font-medium text-gray-400 mt-0.5">
														Đã bán: <strong className="text-gray-600 font-bold">{device.sold}</strong>
													</div>
												</TableCell>

												{/* CỘT 4: GIÁ BÁN & BOOKING */}
												<TableCell className="py-3.5">
													<div className="text-[13px] font-bold text-gray-800 tracking-tight">{formatCurrency(device.price)}</div>
													<div className="text-[11px] font-medium text-gray-400 mt-0.5 whitespace-nowrap">
														Lịch hẹn: <span className="text-gray-600 font-semibold">{device.bookingPrice ? formatCurrency(device.bookingPrice) : "Không áp dụng"}</span>
													</div>
												</TableCell>

												{/* CỘT 5: TRẠNG THÁI BADGE */}
												<TableCell className="py-3.5">
													{getDeviceStatusBadge(device.status)}
												</TableCell>

												{/* CỘT 6: THÔNG TIN BẢO TRÌ ĐÓNG HỘP TINH TẾ */}
												<TableCell className="py-3.5 align-top">
													{device.maintenanceReason ? (
														<div className="max-w-47.5 space-y-0.5 rounded-lg border border-gray-100/50 bg-gray-50/60 p-2 text-[11px] font-medium text-gray-500">
															<div className="text-gray-700 font-semibold truncate">🔧 {device.maintenanceReason}</div>
															{device.maintenanceStartDate && <div>Bắt đầu: {formatDate(device.maintenanceStartDate)}</div>}
															{device.maintenanceEndDate && <div>Hạn: {formatDate(device.maintenanceEndDate)}</div>}
															{typeof device.maintenanceCost === "number" && (
																<div className="text-primary font-bold border-t border-gray-100 pt-0.5 mt-0.5">
																	Phí: {formatCurrency(device.maintenanceCost)}
																</div>
															)}
														</div>
													) : (
														<span className="text-[12px] text-gray-300 italic pl-1">Sẵn sàng vận hành</span>
													)}
												</TableCell>

												{/* 🌟 CỘT 7: GỘP THÀNH MỘT NÚT DROPDOWN HOVER DUY NHẤT */}
												<TableCell className="py-3.5 pr-6 text-right relative">
													<div className="inline-block relative group/menu">

														{/* Nút Ba Chấm kích hoạt menu */}
														<button
															disabled={isActing}
															className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-md transition-all active:scale-90 border border-transparent hover:border-gray-200 shadow-sm"
														>
															{isActing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <MoreHorizontal className="w-4 h-4" />}
														</button>

														{/* Menu thả xuống đổ về bên trái (z-50 chống đè khuất) */}
														<div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 font-vietnam">
															<div className="flex flex-col text-left py-1">

																{/* 1. Nhập kho */}
																<button
																	onClick={() => void requestInventoryAdjustment(device.id, "IMPORT")}
																	className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
																>
																	<ArrowDownToLine className="w-3.5 h-3.5 text-gray-400" /> Nhập số lượng
																</button>

																{/* 2. Xuất kho */}
																<button
																	onClick={() => void requestInventoryAdjustment(device.id, "EXPORT")}
																	className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
																>
																	<ArrowUpFromLine className="w-3.5 h-3.5 text-gray-400" /> Xuất hàng đi
																</button>

																{/* 3. Kiểm kê */}
																<button
																	onClick={() => void requestInventoryAdjustment(device.id, "AUDIT_ADJUSTMENT")}
																	className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
																>
																	<ClipboardCheck className="w-3.5 h-3.5 text-gray-400" /> Kiểm kê kho
																</button>

																{/* 4. Điều phối bảo trì */}
																<button
																	onClick={() => void handleMaintenance(device)}
																	className={cn(
																		"flex items-center gap-2 px-3 py-2 text-[12.5px] font-semibold border-t border-gray-50",
																		device.status === "MAINTENANCE" ? "text-emerald-600 hover:bg-emerald-50/50" : "text-blue-600 hover:bg-blue-50/50"
																	)}
																>
																	<Wrench className="w-3.5 h-3.5 text-current" />
																	{device.status === "MAINTENANCE" ? "Hoàn tất sửa" : "Yêu cầu bảo trì"}
																</button>

																{/* ĐƯỜNG KẺ NGĂN CÁCH KHỐI HÀNH ĐỘNG NGUY HIỂM */}
																<div className="h-px bg-gray-100 my-1" />

																{/* 5. Chỉnh sửa */}
																<button
																	onClick={() => void openEditDialog(device)}
																	className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
																>
																	<Pencil className="w-3.5 h-3.5 text-gray-400" /> Chỉnh sửa thông tin
																</button>

																{/* 6. Xóa bỏ */}
																<button
																	onClick={() => void handleDeleteDevice(device)}
																	className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-rose-600 hover:bg-rose-50 transition-colors"
																>
																	<Trash2 className="w-3.5 h-3.5 text-rose-400" /> Xóa thiết bị
																</button>

															</div>
														</div>

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
<TableCell>{transaction.previousStock} → {transaction.newStock}</TableCell>
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