"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ArrowDownToLine,
	ArrowUpFromLine,
	Boxes,
	Check,
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // Đảm bảo đường dẫn này đúng với project của bạn


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
			AVAILABLE: { label: "Sẵn sàng", className: " font-vietnam bg-emerald-50 border-emerald-100 text-emerald-700" },
			MAINTENANCE: { label: "Bảo trì", className: " font-vietnam bg-blue-50 border-blue-50 text-staff-primary" },
			OUT_OF_STOCK: { label: "Hết hàng", className: " font-vietnam bg-rose-50 border-rose-100 text-rose-700" },
		};
		const config = configs[status] || { label: status, className: " font-vietnam bg-gray-50 border-gray-100 text-gray-600" };
		return (
			<span className={cn(
				// GIẢI PHÁP: Dùng py-1 để đẩy trần và sàn ra đều nhau, chữ tự căn giữa tự nhiên
				"inline-flex items-center justify-center px-2 py-1 rounded-md text-[10.5px] font-bold border uppercase tracking-wider font-vietnam shadow-xs leading-normal",
				config.className
			)}>
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

					{/* 1. Nút Nhập thiết bị mới (Đồng bộ style, chiều cao và font chữ) */}
					<button
						onClick={() => void openCreateDialog()}
						className="inline-flex h-9.5 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-staff-primary px-4 text-[13px] text-white shadow-sm transition-all duration-200 active:scale-95  font-vietnam"
					>
						<Plus className="w-4 h-4" />
						<span>Nhập thiết bị mới</span>
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
						{/* Lớp nền trượt màu Primary: Khớp hoàn toàn với màu gốc của nút Nhập thiết bị mới */}
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


			<Dialog
				open={deviceDialogOpen}
				onOpenChange={(open) => { if (!open) { closeDeviceDialog(); } else { setDeviceDialogOpen(true); } }}
			>

				<DialogContent className="sm:max-w-4xl font-vietnam h-[88vh] flex flex-col p-0 overflow-hidden border-gray-100 shadow-xl rounded-2xl">

					<DialogHeader className="p-5 pb-4 border-b border-gray-100 shrink-0 bg-white">
						<DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
							<span>{deviceDialogMode === "create" ? "Thêm thiết bị mới vào kho" : "Cập nhật thiết bị"}</span>


						</DialogTitle>

						<DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
							{deviceDialogMode === "create"
								? `Khai báo hồ sơ thiết bị gốc vào không gian lưu trữ của ${authUser?.brand_name || "thương hiệu"}. Hệ thống tự động liên kết mã định danh phân phối trực tiếp từ hãng chính thức.`
								: "Chỉnh sửa thông số kỹ thuật, cập nhật trạng thái vận hành hoặc liên kết phân bổ mã ưu đãi đặc quyền cho sản phẩm."}
						</DialogDescription>
					</DialogHeader>



					<div className="flex-1 overflow-y-auto p-5 scrollbar-thin space-y-5 bg-slate-50/30">
						{/* HÀNG 1 */}
						{/* Khung chia cột chính (Tỷ lệ cột trái rộng hơn cột phải) */}
						<div className="grid gap-5 lg:grid-cols-[1.35fr_1fr] items-start">

							{/* Cột trái: Nhóm thông tin cốt lõi của thiết bị */}
							<div className="space-y-4">
								{/*  Card: Ảnh đại diện thiết bị (Đã thu gọn chiều cao tối đa) */}
								<Card className="border rounded-lg border-slate-200/80 bg-white shadow-xs">
									<CardContent className="p-4">
										{/* Thu nhỏ tỷ lệ cột ảnh từ 220px xuống còn 160px để tiết kiệm không gian dọc */}
										<div className="grid gap-4 sm:grid-cols-[160px_1fr] items-center">

											{/* Khối hiển thị Preview Ảnh (Đổi sang tỉ lệ vuông 1:1 cho gọn) */}
											<div className="relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-slate-50 shadow-inner">
												{deviceForm.image ? (
													<Image
														src={deviceForm.image}
														alt={deviceForm.name || "Device preview"}
														fill
														sizes="160px"
														className="object-cover"
													/>
												) : (
													<div className="flex h-full flex-col items-center justify-center gap-1.5 p-2 text-center text-xs text-muted-foreground">
														<div className="rounded-full bg-slate-100 p-2 text-slate-400">
															<ImagePlus className="size-4" />
														</div>
														<span className="font-medium text-gray-700">Chưa có ảnh</span>
													</div>
												)}
											</div>

											{/* Khối nút bấm và thao tác Tải ảnh */}
											{/*  Chuyển sang flex flex-col với gap-3.5 (hoặc gap-4) để ép 3 khối lớn cách đều nhau tăm tắp */}
											<div className="flex flex-col gap-3.5">

												{/* Khối 1: Tiêu đề và mô tả ảnh (Đã gộp chung dòng để ăn theo khoảng cách đều) */}
												<div className="space-y-1">
													<Label className="text-[14px] font-semibold text-gray-700 block">Hình ảnh đại diện</Label>
													<p className="text-[11px] text-muted-foreground leading-normal font-vietnam">
														Hỗ trợ định dạng JPG, PNG, WEBP. Ảnh được tự động đồng bộ hóa trên CDN Cloudinary.
													</p>
												</div>

												{/* Khối 2: Cụm nút bấm hành động */}
												<div className="flex flex-wrap gap-2">
													<label
														htmlFor="device-image-upload"
														className={cn(
															"inline-flex h-8.5 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-staff-primary px-3 text-xs font-medium text-white shadow-sm transition-all hover:bg-staff-primary/90 active:scale-95",
															uploadingImage && "pointer-events-none opacity-70"
														)}
													>
														{uploadingImage ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
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

													{deviceForm.image && (
														<Button
															type="button"
															variant="outline"
															className="h-8.5 text-xs px-3 text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700 transition-colors"
															disabled={uploadingImage}
															onClick={() => setDeviceForm((current) => ({ ...current, image: "", imagePublicId: "" }))}
														>
															<Trash2 className="size-3.5" />
															Gỡ ảnh
														</Button>
													)}
												</div>

												{/* Khối 3: Dòng chú thích hệ thống */}
												<div className="text-[10px] text-gray-400 bg-gray-50/50 p-2 rounded-lg border border-gray-100/60 leading-normal font-vietnam">
													💡 Asset lưu tự động theo cấu trúc thư mục của Brand để tối ưu hóa tốc độ tải trang.
												</div>
											</div>


										</div>
									</CardContent>
								</Card>
							</div>
							{/*  Cột phải: Quản lý cấu hình Voucher đặc quyền cho sản phẩm (Gọn gàng, hạn chế phình dọc) */}
							<Card className="h-fit rounded-xl border border-gray-200/80 bg-white shadow-xs">
								<CardHeader className="p-3.5 border-b border-gray-100 bg-slate-50/50">
									<div className="flex items-center gap-2">
										<TicketPercent className="h-4 w-4 text-violet-600" />
										<CardTitle className="text-[14px] font-semibold text-slate-600 font-vietnam">Voucher áp dụng </CardTitle>
									</div>

								</CardHeader>

								<CardContent className="p-4 space-y-4">
									{metadataLoading ? (
										<div className="flex min-h-24 flex-col items-center justify-center gap-1">
											<Loader2 className="size-4 animate-spin text-staff-primary" />
											<span className="text-[10px] text-muted-foreground font-vietnam">Đang tải...</span>
										</div>
									) : deviceDialogMode === "edit" && editingDevice ? (
										<>
											{/* Khối 1: Danh sách voucher đang liên kết */}
											<div className="space-y-1.5">
												<div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-vietnam">Voucher đang gán</div>
												{assignedVouchersForEditingDevice.length ? (
													/* Khóa chiều cao tối đa 140px và cho cuộn nội bộ tránh đẩy nát layout */
													<div className="space-y-2 max-h-35 overflow-y-auto pr-0.5 scrollbar-thin">
														{assignedVouchersForEditingDevice.map((voucher) => (
															<div key={voucher.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-slate-50/50 p-2 text-xs">
																<div className="min-w-0 pr-2">
																	<div className="font-mono font-bold text-xs text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded border border-violet-100/50 w-fit">
																		{voucher.code}
																	</div>
																	<div className="text-[10px] text-muted-foreground mt-0.5 truncate font-vietnam">
																		Đích: {voucher.applicableDeviceName || editingDevice.name}
																	</div>
																</div>
																<Button
																	size="default"
																	variant="outline"
																	className="h-7 text-[11px] font-medium text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200 transition-colors shrink-0"
																	disabled={voucherLoading}
																	onClick={() => void handleRemoveVoucher(voucher)}
																>
																	Bỏ gán
																</Button>
															</div>
														))}
													</div>
												) : (
													<div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/40 py-4 text-center text-xs text-muted-foreground italic font-vietnam">
														Thiết bị này chưa áp dụng voucher.
													</div>
												)}
											</div>

											{/* Khối 2: Form gán voucher mới */}
											<div className="space-y-2 pt-2 border-t border-gray-100">
												<label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block font-vietnam">Gán voucher hiện có</label>
												<Select value={voucherSelection} onValueChange={setVoucherSelection}>
													<SelectTrigger className="bg-white h-8.5 text-xs"><SelectValue placeholder="Chọn voucher" /></SelectTrigger>
													<SelectContent>
														<SelectItem value="NONE" className="text-xs">Chọn voucher để gán</SelectItem>
														{assignableVouchers.map((voucher) => (
															<SelectItem key={voucher.id} value={String(voucher.id)} className="text-xs font-mono">
																{voucher.code} {voucher.applicableDeviceName ? `(${voucher.applicableDeviceName})` : ""}
															</SelectItem>
														))}
													</SelectContent>
												</Select>

												<Button
													className="w-full h-8.5 text-xs font-medium bg-staff-primary text-white hover:bg-staff-primary/90 transition-all active:scale-[0.98] shadow-2xs"
													disabled={voucherLoading || voucherSelection === "NONE"}
													onClick={() => void handleAssignVoucher()}
												>
													{voucherLoading ? <Loader2 className="animate-spin size-3.5 mr-1.5" /> : <Plus className="size-3.5 mr-1.5" />}
													Liên kết voucher vào máy
												</Button>
											</div>
										</>
									) : (
										/* Khối Empty State cao cấp thay thế text thô khi ở chế độ tạo mới sản phẩm */
										<div className="flex flex-col items-center justify-center text-center p-5 bg-gray-50/30 rounded-xl border border-dashed border-gray-200/80">
											<div className="rounded-full bg-white p-2 text-gray-400 mb-2 border border-gray-100 shadow-3xs">
												<TicketPercent className="h-4 w-4 stroke-[1.5]" />
											</div>
											<p className="text-xs font-medium text-gray-400 max-w-[200px] leading-normal font-vietnam">
												Tạo thiết bị trước, sau đó mở chế độ sửa để cấu hình voucher.
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
						{/* HÀNG 2 */}
						{/*  Card: Thông tin sản phẩm (Đã tinh gọn diện tích dọc & tích hợp logic tự động gán Brand) */}
						<Card className="border border-slate-200/80 bg-white shadow-xs rounded-xl overflow-hidden">
							<CardContent className="p-5 space-y-5">

								{/* 🧩 Phân khu 1: Định danh cơ bản (Dòng chảy dọc) */}
								<div className="space-y-4">
									{/* Tên sản phẩm */}
									<div className="space-y-1.5">
										<Label className="text-[14px] font-semibold text-slate-600 font-vietnam tracking-wide">Tên thiết bị chăm sóc da</Label>
										<Input
											className="h-9.5 text-[8px] bg-slate-50/30 focus-visible:bg-white border-slate-200 focus-visible:ring-staff-primary/20 focus-visible:border-staff-primary/60 transition-all font-medium text-gray-800"
											value={deviceForm.name}
											onChange={(event) => setDeviceForm((current) => ({ ...current, name: event.target.value }))}
											placeholder="Ví dụ: Máy sủi da chết và đẩy tinh chất siêu âm"
										/>
									</div>

									{/* Mô tả ngắn */}
									<div className="space-y-1.5">
										<Label className="text-[14px] font-semibold text-slate-600 font-vietnam tracking-wide">Mô tả đặc tính cốt lõi</Label>
										<Textarea
											className="text-xs p-3 bg-slate-50/30 focus-visible:bg-white border-slate-200 focus-visible:ring-staff-primary/20 focus-visible:border-staff-primary/60 transition-all font-vietnam leading-relaxed text-gray-600 resize-none"
											value={deviceForm.description}
											onChange={(event) => setDeviceForm((current) => ({ ...current, description: event.target.value }))}
											placeholder="Tóm tắt công dụng chính, tần suất sóng âm hoặc công nghệ tích hợp để nhân viên tư vấn nhanh cho khách..."
											rows={2.5}
										/>
									</div>
								</div>

								{/* ⚙️ Phân khu 2: Thông số vận hành & Thương mại (Lưới Grid 2 cột gọn gàng) */}
								<div className="grid gap-x-4 gap-y-4 border-t border-slate-100 pt-4 sm:grid-cols-2">

									{/* Giá bán (Có hậu tố VND tích hợp bên trong ô nhập) */}
									<div className="space-y-1.5">
										<Label className="text-[14px] font-semibold text-slate-600 font-vietnam tracking-wide">Giá cho thuê / bán</Label>
										<div className="relative flex items-center w-full">
											<Input
												className="h-9.5 w-full text-xs pr-12 bg-slate-50/30 focus-visible:bg-white border-slate-200 focus-visible:ring-staff-primary/20 focus-visible:border-staff-primary/60 font-medium text-gray-800"
												type="number"
												min="0"
												value={deviceForm.price}
												onChange={(event) => setDeviceForm((current) => ({ ...current, price: event.target.value }))}
												placeholder="0"
											/>
											<span className="absolute right-3 text-[14px] font-bold text-slate-400 select-none pointer-events-none">VND</span>
										</div>
									</div>

									{/* Tồn kho (Có hậu tố Máy tích hợp bên trong ô nhập) */}
									<div className="space-y-1.5">
										<Label className="text-[14px] font-semibold text-slate-600 font-vietnam tracking-wide">Số lượng tồn kho khởi tạo</Label>
										<div className="relative flex items-center w-full">
											<Input
												className="h-9.5 w-full text-xs pr-12 bg-slate-50/30 focus-visible:bg-white border-slate-200 focus-visible:ring-staff-primary/20 focus-visible:border-staff-primary/60 font-medium text-gray-800"
												type="number"
												min="0"
												value={deviceForm.stock}
												onChange={(event) => setDeviceForm((current) => ({ ...current, stock: event.target.value }))}
												placeholder="0"
											/>
											<span className="absolute right-3 text-[14px] font-bold text-slate-400 select-none pointer-events-none">Máy</span>
										</div>
									</div>

									{/* Loại da chỉ định */}
									<div className="space-y-1.5">
										<Label className="text-[14px] font-semibold text-slate-600 font-vietnam tracking-wide">Loại da chỉ định</Label>
										<Input
											className="h-9.5 w-full text-xs bg-slate-50/30 focus-visible:bg-white border-slate-200 focus-visible:ring-staff-primary/20 focus-visible:border-staff-primary/60 font-medium text-gray-800"
											value={deviceForm.skinType}
											onChange={(event) => setDeviceForm((current) => ({ ...current, skinType: event.target.value }))}
											placeholder="Ví dụ: Da dầu mụn, da nhạy cảm"
										/>
									</div>

									{/* Danh mục phân loại (Đã chỉnh w-full và đồng bộ màu nền đè) */}
									<div className="space-y-1.5">
										<Label className="text-[14px] font-semibold text-slate-600 font-vietnam tracking-wide">Danh mục phân loại</Label>
										<Select
											value={deviceForm.categoryId}
											onValueChange={(value) => setDeviceForm((current) => ({ ...current, categoryId: value }))}
										>
											{/* 💡 Đồng bộ text-gray-800 và font-medium cho chữ hiển thị khi đã chọn mục */}
											<SelectTrigger className="w-full h-9.5 text-xs bg-slate-50/30 border-slate-200 focus:bg-white focus:ring-staff-primary/20 focus:border-staff-primary/60 text-gray-800 font-medium rounded-lg shadow-2xs transition-all">
												<SelectValue placeholder="Chọn danh mục gốc" />
											</SelectTrigger>

											<SelectContent className="bg-white border border-slate-100 shadow-xl rounded-xl max-h-[240px] z-50 overflow-y-auto p-1 font-vietnam animate-in fade-in-50 zoom-in-95 duration-100">
												{categories.map((category) => (
													<SelectItem
														key={category.id}
														value={String(category.id)}
														className="text-[14px] text-gray-800 font-medium rounded-md focus:bg-staff-primary/10 focus:text-staff-primary cursor-pointer py-2 pl-8 pr-2 transition-colors data-[state=checked]:font-semibold data-[state=checked]:text-staff-primary"
													>
													{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* Trạng thái vận hành */}
									<div className="space-y-1.5">
										<Label className="text-[14px] font-semibold text-slate-600 font-vietnam tracking-wide">Trạng thái cấu hình</Label>
										{deviceDialogMode === "edit" ? (
											<Select value={deviceForm.status} onValueChange={(value) => setDeviceForm((current) => ({ ...current, status: value as StaffDeviceStatus }))}>
												{/* Đồng bộ kích thước h-9.5 và w-full */}
												<SelectTrigger className="w-full h-9.5 text-xs bg-slate-50/30 border-slate-200 focus:bg-white text-gray-800 font-medium rounded-lg">
													<SelectValue />
												</SelectTrigger>
												<SelectContent className="bg-white z-50 border border-slate-100 shadow-xl rounded-xl p-1">
													{DEVICE_STATUS_OPTIONS.filter((option) => option.value !== "ALL").map((option) => (
														<SelectItem key={option.value} value={option.value} className="text-xs text-gray-800 font-medium">{option.label}</SelectItem>
													))}
												</SelectContent>
											</Select>
										) : (
											<div className="w-full h-9.5 rounded-lg border border-dashed border-emerald-200 bg-emerald-50/20 px-3 flex items-center text-[14px] text-emerald-700 font-semibold font-vietnam select-none">
												Hệ thống tự động kích hoạt: Sẵn sàng
											</div>
										)}
									</div>

									{/* Mã định danh SKU */}
									<div className="space-y-1.5">
										<Label className="text-[14px] font-semibold text-slate-600 font-vietnam tracking-wide">Mã định danh sản phẩm (SKU)</Label>
										<Input
											className="h-9.5 w-full text-xs font-vietnam  tracking-wider bg-slate-50/30 focus-visible:bg-white border-slate-200 focus-visible:ring-staff-primary/20 focus-visible:border-slate-200 text-slate-700 font-bold"
											value={deviceForm.sku}
											onChange={(event) => setDeviceForm((current) => ({ ...current, sku: event.target.value }))}
											placeholder="Ví dụ: SKU-FOREO-LUNA4"
										/>
									</div>
								</div>

								{/*  Khối thông báo pháp nhân sở hữu thương hiệu (Đã được sửa lỗi nhảy chữ) */}
								{authUser?.brand_name && (
									<div className="text-[11px] text-amber-700 bg-amber-50/50 border border-amber-100/70 rounded-xl p-3 flex items-start gap-2.5 shadow-3xs border-dashed mt-1">
										<span className="shrink-0 mt-0.5 text-xs select-none">🛡️</span>
										<div className="leading-relaxed font-vietnam font-medium">
											Thiết bị này được đăng ký độc quyền trong không gian lưu trữ của thương hiệu <strong className="font-bold text-amber-800 bg-amber-100/40 px-1.5 py-0.5 rounded mx-0.5">{authUser.brand_name}</strong> và do chính hãng trực tiếp cung ứng.
										</div>
									</div>
								)}

							</CardContent>
						</Card>
					</div>

					<DialogFooter className="p-4 border-t border-gray-100 shrink-0 bg-slate-50/50 flex flex-row items-center gap-2 justify-end rounded-b-2xl">

						{/* Nút hủy thao tác */}
						<Button
							variant="outline"
							className="h-9 text-xs px-4 font-medium text-gray-600 border-gray-200 bg-white hover:bg-gray-50 transition-colors rounded-lg font-vietnam"
							onClick={closeDeviceDialog}
							disabled={savingDevice || voucherLoading || metadataLoading || uploadingImage}
						>
							Hủy bỏ
						</Button>

						{/* Nút lưu hành động chính */}
						<Button
							className="h-9 text-xs px-4 font-medium bg-staff-primary hover:bg-staff-primary/90 text-white shadow-sm transition-all duration-200 active:scale-95 disabled:opacity-40 rounded-lg font-vietnam"
							onClick={() => void handleSaveDevice()}
							disabled={savingDevice || voucherLoading || metadataLoading || uploadingImage}
						>
							{savingDevice ? (
								<Loader2 className="animate-spin size-3.5 mr-1.5" />
							) : deviceDialogMode === "create" ? (
								<Plus className="size-3.5 mr-1.5" />
							) : (
								<Check className="size-3.5 mr-1.5" /> // ✨ Đổi sang icon Check trực quan khi lưu thay đổi thành công
							)}

							{deviceDialogMode === "create" ? "Tạo sản phẩm ngay" : "Cập nhật thay đổi"}
						</Button>

					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
				<Card>
					<CardHeader className="gap-2 px-8 py-5">
						<CardDescription>Thiết bị trong bộ lọc hiện tại</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl"><Boxes className="size-6 text-sky-500" />{totalDevices}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-2 px-8 py-5">
						<CardDescription>Thiết bị sắp hết hàng</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl text-amber-600">{lowStockCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-2 px-8 py-5">
						<CardDescription>Đang bảo trì</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl"><Wrench className="size-6 text-staff-primary" />{maintenanceCount}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="gap-2 px-8 py-5">
						<CardDescription>Đã hết hàng</CardDescription>
						<CardTitle className="flex items-center gap-3 text-3xl text-rose-600">{outOfStockCount}</CardTitle>
					</CardHeader>
				</Card>
			</div>


			{/* 🌟 ĐÃ SỬA: Loại bỏ class "overflow-hidden" tại đây để dropdown hiển thị tự do */}
			<Card className="border border-gray-100 shadow-sm bg-white rounded-xl font-vietnam relative">

				{/* Header chính: Thêm "rounded-t-xl" để giữ bo góc phía trên của Card */}
				<CardHeader className="border-b border-gray-50/60 bg-white px-8 pt-5 pb-3 rounded-t-xl">
					{/* Vùng bên trái: Nội dung tiêu đề */}
					<div className="shrink-0">
						<CardTitle className="text-[20px] font-bold text-gray-800 tracking-tight">
							Bộ lọc thiết bị vận hành
						</CardTitle>
						<CardDescription className="text-[14px] text-gray-400 mt-1">
							Lọc nhanh thiết bị cần staff xử lý ngay trong ngày.
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="px-8 pt-3 pb-4 font-vietnam">
					<div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">

						{/* 1. Ô tìm kiếm thông minh tích hợp Icon kính lúp */}
						<div className="relative flex-1 min-w-0 group">
							<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
								<Search className="w-4 h-4 text-gray-400 group-focus-within:text-staff-primary transition-colors" />
							</div>
							<input
								type="text"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Tìm theo tên, SKU hoặc slug..."
								className="h-9.5 w-full rounded-md border border-gray-100 bg-white pl-9 pr-4 text-[14px] font-medium text-gray-700 placeholder-gray-400 outline-none shadow-sm transition-all duration-300 hover:border-gray-200 focus:border-staff-primary"
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
											className={`px-3 py-2.5 text-[13px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${statusFilter === option.value ? 'text-staff-primary font-bold bg-gray-50' : 'text-gray-700 hover:bg-gray-50'}`}
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
									? "bg-blue-50 border-staff-primary-50 text-staff-primary font-bold"
									: "bg-white border-gray-100 text-gray-600 hover:border-gray-200 hover:bg-gray-50"
							)}
						>
							<Wrench className={cn("w-3.5 h-3.5", maintenanceOnly ? "text-staff-primary" : "text-gray-400")} />
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
				<CardContent className=" font-vietnam">
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
						<div className="overflow-x-auto rounded-lg">
							<Table className="w-full border-collapse">

								<TableHeader className="bg-[#052962] text-white">
									<TableRow className="border-none hover:bg-[#052962]">
										<TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-[#FFE500] pl-4">Thiết bị</TableHead>
										<TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">SKU / Thương hiệu</TableHead>
										<TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">Tồn kho</TableHead>
										<TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">Giá vận hành</TableHead>
										<TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">Trạng thái</TableHead>
										<TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-white/90">Thông tin bảo trì</TableHead>
										<TableHead className="h-10 text-xs font-bold uppercase tracking-wider text-[#FFE500] pr-4 text-right">Thao tác</TableHead>
									</TableRow>
								</TableHeader>


								<TableBody className="divide-y divide-gray-50">
									{devices.map((device) => {
										const isActing = actionDeviceId === device.id;
										return (
											<TableRow key={device.id} className="hover:bg-gray-50/30 transition-colors group">

												{/* CỘT 1: HÌNH ẢNH THIẾT BỊ & TÊN */}
												<TableCell className="py-3.5 pl-4">
													<div className="flex items-center gap-3">
														{/* Box Ảnh thiết bị tỉ lệ 1:1 có shadow mượt */}
														<div className="relative w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 shrink-0  shadow-inner">
															<Image
																src={device.image || "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=96&q=80"}
																alt={device.name}
																fill
																sizes="48px"
																className="object-cover transition-transform duration-500 group-hover:scale-105"
															/>
														</div>
														<div className="min-w-0">
															<p className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-staff-primary transition-colors">
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
												<TableCell className="py-3.5 ">
													{device.maintenanceReason ? (
														<div className="max-w-fit space-y-0.5 rounded-lg border border-gray-100/50 bg-gray-50/60 p-2 text-[11px] font-medium text-gray-500">
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
														<span className=" px-3 text-[12px] text-gray-300 italic">Sẵn sàng vận hành</span>
													)}
												</TableCell>


												{/* 🌟 CỘT 7: ĐÃ CHUYỂN SANG PORTAL DROPDOWN (HẾT BỊ LẤP HOÀN TOÀN) */}
												<TableCell className="py-3.5 pr-6 text-right font-vietnam">
													{/* Thêm modal={false} để không bị vô hiệu hóa thanh cuộn trang khi mở menu */}
													<DropdownMenu modal={false}>

														{/* Nút Ba Chấm kích hoạt menu - Cần bọc trong DropdownMenuTrigger asChild */}
														<DropdownMenuTrigger asChild>
															<button
																disabled={isActing}
																className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-md transition-all active:scale-90 border border-transparent hover:border-gray-200 shadow-sm outline-none"
															>
																{isActing ? (
																	<Loader2 className="w-4 h-4 animate-spin text-primary" />
																) : (
																	<MoreHorizontal className="w-4 h-4" />
																)}
															</button>
														</DropdownMenuTrigger>

														{/* Menu tự động bay ra ngoài body, align="end" để mép phải menu thẳng hàng với nút bấm */}
														<DropdownMenuContent
															align="end"
															sideOffset={4}
															className="w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 font-vietnam z-50 pointer-events-auto"
														>

															{/* 1. Nhập kho */}
															<DropdownMenuItem
																onClick={() => void requestInventoryAdjustment(device.id, "IMPORT")}
																className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 cursor-pointer outline-none transition-colors"
															>
																<ArrowDownToLine className="w-3.5 h-3.5 text-gray-400" /> Nhập số lượng
															</DropdownMenuItem>

															{/* 2. Xuất kho */}
															<DropdownMenuItem
																onClick={() => void requestInventoryAdjustment(device.id, "EXPORT")}
																className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 cursor-pointer outline-none transition-colors"
															>
																<ArrowUpFromLine className="w-3.5 h-3.5 text-gray-400" /> Xuất hàng đi
															</DropdownMenuItem>

															{/* 3. Kiểm kê */}
															<DropdownMenuItem
																onClick={() => void requestInventoryAdjustment(device.id, "AUDIT_ADJUSTMENT")}
																className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 cursor-pointer outline-none transition-colors"
															>
																<ClipboardCheck className="w-3.5 h-3.5 text-gray-400" /> Kiểm kê kho
															</DropdownMenuItem>

															{/* 4. Điều phối bảo trì */}
															<DropdownMenuItem
																onClick={() => void handleMaintenance(device)}
																className={cn(
																	"flex items-center gap-2 px-3 py-2 text-[12.5px] font-semibold border-t border-gray-50 cursor-pointer outline-none transition-colors",
																	device.status === "MAINTENANCE" ? "text-emerald-600 hover:bg-emerald-50/50" : "text-staff-primary hover:bg-blue-50/50"
																)}
															>
																<Wrench className="w-3.5 h-3.5 text-current" />
																{device.status === "MAINTENANCE" ? "Hoàn tất sửa" : "Yêu cầu bảo trì"}
															</DropdownMenuItem>

															{/* ĐƯỜNG KẺ NGĂN CÁCH KHỐI HÀNH ĐỘNG NGUY HIỂM */}
															<DropdownMenuSeparator className="h-px bg-gray-100 my-1" />

															{/* 5. Chỉnh sửa */}
															<DropdownMenuItem
																onClick={() => void openEditDialog(device)}
																className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-gray-600 hover:bg-gray-50 cursor-pointer outline-none transition-colors"
															>
																<Pencil className="w-3.5 h-3.5 text-gray-400" /> Chỉnh sửa thông tin
															</DropdownMenuItem>

															{/* 6. Xóa bỏ */}
															<DropdownMenuItem
																onClick={() => void handleDeleteDevice(device)}
																className="flex items-center gap-2 px-3 py-2 text-[12.5px] font-medium text-rose-600 hover:bg-rose-50 cursor-pointer outline-none transition-colors"
															>
																<Trash2 className="w-3.5 h-3.5 text-rose-400" /> Xóa thiết bị
															</DropdownMenuItem>

														</DropdownMenuContent>
													</DropdownMenu>
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
						<div className="rounded-lg overflow-hidden border border-gray-100">
							<Table>
								<TableHeader className="bg-[#052962] text-white">
									<TableRow className="border-none hover:bg-[#052962]">
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-[#FFE500] pl-4">Thời gian</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">Thiết bị</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">Loại giao dịch</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">Biến động</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-white/90">Kết quả</TableHead>
										<TableHead className="h-10 text-xs font-vietnam font-bold uppercase tracking-wider text-[#FFE500] pr-4 text-right">Ghi chú</TableHead>
									</TableRow>
								</TableHeader>


								<TableBody className="font-vietnam">
									{transactions.map((transaction) => (
										<TableRow key={transaction.id}>
											<TableCell className="pl-4" >{formatDateTime(transaction.createdAt)}</TableCell>
											<TableCell>
												<div className="font-medium">{transaction.deviceName}</div>
												<div className="text-xs text-muted-foreground">{transaction.createdBy || "system"}</div>
											</TableCell>
											<TableCell>{TRANSACTION_LABELS[transaction.transactionType]}</TableCell>
											<TableCell className={transaction.quantityChange >= 0 ? "text-emerald-600" : "text-rose-600"}>{transaction.quantityChange >= 0 ? "+" : ""}{transaction.quantityChange}</TableCell>
											<TableCell>{transaction.previousStock} → {transaction.newStock}</TableCell>
											<TableCell className="text-right pr-4">
												<div className="font-medium">{transaction.reason}</div>
												<div className="text-xs text-muted-foreground">{transaction.note || "Không có ghi chú"}</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}