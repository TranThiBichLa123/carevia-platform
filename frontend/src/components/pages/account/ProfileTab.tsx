"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Save,
  MapPin,
  Plus,
  Eye,
  EyeOff,
  LogOut,
  Phone,
  PlusCircle,
  Sparkles,
  Edit2,
  Trash2,
  Check,
  Home,
  RefreshCw,
  Camera,
  Award,
  Star,
  ShieldCheck,
} from "lucide-react";
import authApi from "@/lib/authApi";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../OrdersPage";

const updateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  skinType: z.string().optional(),
  skinConcerns: z.string().optional(),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      "Password must be at least 8 characters or empty"
    ),
});
const addressSchema = z.object({
  street: z.string().min(1, "Vui lòng nhập số nhà"),
  ward: z.string().min(1, "Vui lòng nhập xã/phường"),
  district: z.string().min(1, "Vui lòng nhập quận/huyện"),
  city: z.string().min(1, "Vui lòng nhập tỉnh/thành phố"),
  // Sử dụng .default(false) để đảm bảo giá trị luôn là boolean, không phải undefined
  isDefault: z.boolean().default(false),
});


// Tạo type từ schema
type AddressFormValues = z.infer<typeof addressSchema>;

type FormData = z.infer<typeof updateSchema>;
type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  skinType?: string;
  skinConcerns?: string;
  role: string;
  addresses?: (AddressFormValues & { _id: string })[];
};

const ProfileTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<AddressFormValues | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { authUser, updateUser, logoutUser, verifyAuth, refreshProfile } = useUserStore();


  const updateForm = useForm<FormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: authUser?.username || "",
      phone: authUser?.phone || "",
      skinType: authUser?.skin_type || "",
      skinConcerns: authUser?.skin_concerns || "",
      password: "",
    },
  });
  useEffect(() => {
    verifyAuth();
  }, []);


  useEffect(() => {
    if (authUser) {
      updateForm.reset({
        name: authUser.username,
        phone: authUser.phone,
        skinType: authUser.skin_type,
        skinConcerns: authUser.skin_concerns,
        password: ""
      });
    }
  }, [authUser]);

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema) as any,
    defaultValues: {
      street: "",
      ward: "",
      district: "",
      city: "",
      isDefault: false,
    },
  });

  if (!authUser) return null;

  const onUpdateSubmit = async (data: FormData) => {
    setIsLoading(true);
    const updateData: Record<string, unknown> = {
      fullName: data.name,
      phone: data.phone || undefined,
      skinType: data.skinType || undefined,
      skinConcerns: data.skinConcerns || undefined,
    };

    try {
      const response = await authApi.put("/accounts/me", updateData);
      if (response.success) {
        await refreshProfile();
        toast.success("Cập nhật hồ sơ thành công.");
        updateForm.reset({
          name: data.name,
          phone: data.phone,
          skinType: data.skinType,
          skinConcerns: data.skinConcerns,
          password: ""
        });
      } else {
        throw new Error(response.error?.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile.");
    }
    setIsLoading(false);
  };

  const onAddressSubmit = async (data: AddressFormValues) => {
    setIsLoading(true);
    try {
      let response;

      // Kiểm tra xem là đang Sửa hay Thêm mới
      if (editingAddress && selectedAddressId !== null) {
        // 1. CẬP NHẬT: dùng selectedAddressId là ID thật từ database
        response = await authApi.put(
          `/accounts/me/addresses/${selectedAddressId}`,
          data
        );
      } else {
        // 2. THÊM MỚI
        response = await authApi.post(
          `/accounts/me/addresses`,
          data
        );
      }

      if (response.success) {
        await refreshProfile();
        toast.success(editingAddress ? "Cập nhật thành công" : "Đã thêm địa chỉ mới");
        setIsAddressModalOpen(false);
        addressForm.reset();
        setEditingAddress(null);
        setSelectedAddressId(null);
      } else {
        throw new Error(response.error?.message || "Không thể lưu địa chỉ");
      }
    } catch (error: any) {
      // In toàn bộ lỗi ra console - Hãy mở F12 > Console để xem dòng này
      console.error("Address Submit Error FULL:", error);

      toast.error("Lỗi Validation", {
        // Hiển thị nội dung chi tiết lỗi để bạn biết trường nào sai
        description: error.message,
        duration: 10000, // Để lâu một chút để kịp đọc
      });
    } finally {
      setIsLoading(false);
    }

  };

  const handleDeleteAddress = async () => {
    if (selectedAddressId === null) return;
    setIsLoading(true);
    try {
      // Dùng selectedAddressId là ID thật từ database (không phải index)
      const response = await authApi.delete(`/accounts/me/addresses/${selectedAddressId}`);
      if (response.success) {
        await refreshProfile();
        toast.success("Đã xóa địa chỉ.");
        setIsDeleteModalOpen(false);
        setSelectedAddressId(null);
      } else {
        throw new Error(response.error?.message || "Không thể xóa địa chỉ.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa địa chỉ.");
    }
    setIsLoading(false);
  };

  const confirmLogout = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.post("/auth/logout", {});
      if (response.success) {
        logoutUser();
        toast.success("Logged out successfully.");
        router.push("/");
      }
    } catch {
      toast.error("Failed to log out.");
    }
    setIsLoading(false);
    setIsLogoutModalOpen(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 5MB.");
      return;
    }

    setIsAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await authApi.upload<{ avatarUrl: string }>("/accounts/me/avatar", formData);
      if (response.success) {
        await refreshProfile();
        toast.success("Cập nhật ảnh đại diện thành công!");
      } else {
        throw new Error(response.error?.message || "Không thể tải ảnh lên.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải ảnh lên.");
    } finally {
      setIsAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const InfoField = ({ label, value, placeholder }: { label: string; value?: string; placeholder: string }) => (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
      {value ? (
        <p className="text-gray-800 font-semibold">{value}</p>
      ) : (
        <span className="text-sm text-gray-300 italic flex items-center gap-1">
          <PlusCircle size={12} /> {placeholder}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">


      {/* ── Personal Details Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card 1: Thông tin tài khoản */}
        <div className="group p-6 bg-white rounded-[32px] border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <User size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[11px] font-black font-vietnam text-primary uppercase tracking-[0.15em]">Hồ sơ</h3>
              <p className="text-sm font-bold font-vietnam text-gray-900">Tài khoản</p>
            </div>
          </div>

          <div className="space-y-5 font-vietnam">
            <InfoField label="Tên người dùng" value={authUser.username} placeholder="Chưa cập nhật" />

            <div className="space-y-1.5">
              <p className="text-[10px] font-black font-vietnam text-gray-400 uppercase tracking-widest">Vai trò hệ thống</p>
              <div className="inline-flex px-3 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-bold font-vietnam uppercase tracking-tighter">
                {authUser.role}
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-gray-100">
              <p className="text-[10px] font-black font-vietnam text-gray-400 uppercase tracking-widest mb-1">Mã định danh</p>
              <p className="text-sm font-mono font-bold font-vietnam text-primary">{authUser.client_code || "---"}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Liên hệ & Giao hàng */}
        <div className="group p-6 bg-white rounded-[32px] border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Phone size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[11px] font-black font-vietnam text-primary uppercase tracking-[0.15em]">Liên hệ</h3>
              <p className="text-sm font-bold font-vietnam text-gray-900">Giao nhận</p>
            </div>
          </div>

          <div className="space-y-5 font-vietnam">
            <InfoField label="Số điện thoại" value={authUser.phone} placeholder="Chưa cập nhật" />
            <InfoField label="Địa chỉ chính" value={authUser.address} placeholder="Chưa cập nhật" />
            <InfoField label="Ngày sinh" value={authUser.birth_date} placeholder="-- / -- / ----" />
          </div>
        </div>

        {/* Card 3: Đặc điểm da & Tích điểm */}
        <div className="group p-6 bg-white rounded-[32px] border border-gray-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Sparkles size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[11px] font-black font-vietnam text-primary uppercase tracking-[0.15em]">Chăm sóc</h3>
              <p className="text-sm font-bold font-vietnam text-gray-900">Đặc quyền</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black font-vietnam text-gray-400 uppercase tracking-widest mb-2">Tình trạng da</p>
              <div className="flex flex-wrap gap-2">
                {authUser.skin_type ? (
                  <Badge className="bg-primary text-white border-none text-[10px] font-bold font-vietnam">{authUser.skin_type}</Badge>
                ) : (
                  <span className="text-xs text-gray-400 italic">Chưa xác định</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black font-vietnam text-primary uppercase tracking-widest mb-1">CarePoints</p>
                  <p className="text-2xl font-black font-vietnam text-gray-900 leading-none">
                    {authUser.loyalty_points || 0} <span className="text-sm font-bold font-vietnam text-primary">pts</span>
                  </p>
                </div>
                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Award size={20} className="text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Address Book */}

      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white mt-10 overflow-hidden rounded-[32px]">
        <CardHeader className="px-8 pt-8 pb-4 border-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-[14px] font-black font-vietnam tracking-tight text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                Sổ địa chỉ nhận hàng
              </CardTitle>
              <p className="text-gray-400 text-sm font-medium font-vietnam ml-1">Quản lý danh sách địa chỉ giao hàng của bạn</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                addressForm.reset();
                setEditingAddress(null);
                setSelectedAddressId(null);
                setIsAddressModalOpen(true);
              }}
              className={cn(
                "group relative overflow-hidden", // Cực kỳ quan trọng để nền trượt không tràn ra ngoài
                "flex items-center justify-center gap-2",
                "bg-white border-2 border-primary text-primary", // Trạng thái mặc định: nền trắng, viền & chữ primary
                "font-bold py-2 px-3 rounded-2xl transition-all duration-500 shadow-lg shadow-primary/10"
              )}
            >
              {/* Lớp nền trượt màu Primary từ trái sang phải */}
              <span className="absolute inset-y-0 left-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />

              {/* Nội dung nút - Phải có z-10 để nổi lên trên lớp nền màu */}
              <div className="relative text-[14px] z-10 flex  items-center gap-1 transition-colors group-hover:text-white">
                <Plus
                  size={16}
                  strokeWidth={3}
                  className="transition-transform duration-500 group-hover:rotate-90" // Xoay icon Plus khi hover cho xịn
                />
                <span>Thêm địa chỉ mới</span>
              </div>
            </motion.button>

          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* 1. Kiểm tra nếu authUser chưa tồn tại (đang fetch) */}
          {!authUser ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !(authUser.addresses && authUser.addresses.length > 0) ? (
            /* 2. Trường hợp thực sự không có địa chỉ */
            <div className="text-center py-20 bg-[#F9FAFB] rounded-[40px] border-2 border-dashed border-gray-200">
              <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MapPin className="h-10 w-10 text-gray-200" />
              </div>
              <h3 className="text-gray-900 font-bold text-[16px]">Chưa có thông tin địa chỉ</h3>
              <p className="text-gray-400 text-[14px] mt-2 max-w-[250px] mx-auto">
                Hãy cập nhật địa chỉ để chúng tôi có thể giao hàng nhanh nhất cho bạn.
              </p>
            </div>
          ) : (
            /* 3. Hiển thị danh sách địa chỉ */
            <div className="grid grid-cols-1 gap-4"> {/* Chuyển sang dạng danh sách dọc để dễ đọc như Shopee */}
              <AnimatePresence mode="popLayout">
                {authUser.addresses.map((address) => {
                  const addressKey = address._id;

                  return (
                    <motion.div
                      key={addressKey}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`group relative p-5 rounded-2xl border transition-all duration-300 ${address.isDefault
                        ? "border-primary bg-white shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          {/* Header: Tên & SĐT (Shopee thường để thông tin liên hệ lên đầu) */}
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900 border-r pr-3 py-0.5">
                              {authUser.full_name || authUser.username}
                            </span>
                            <span className="text-gray-500 text-sm">
                              (+84) {authUser.phone || "Chưa cập nhật SĐT"}
                            </span>
                            {address.isDefault && (
                              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20 uppercase tracking-wider">
                                Mặc định
                              </span>
                            )}
                          </div>

                          {/* Body: Địa chỉ chi tiết */}
                          <div className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                            <p className="font-medium text-gray-800">{address.street}</p>
                            <p>{address.ward}, {address.district}, {address.city}</p>
                          </div>

                          {/* Loại địa chỉ Badge (Nhà riêng/Văn phòng) */}
                          <div className="flex gap-2 pt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded border border-gray-200 text-gray-400 font-medium">
                              Nhà Riêng
                            </span>
                          </div>
                        </div>

                        {/* Actions: Góc trên bên phải như các web lớn */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-4 text-sm">
                            <button
                              onClick={() => {
                                setEditingAddress(address);
                                setSelectedAddressId(addressKey);
                                addressForm.reset(address);
                                setIsAddressModalOpen(true);
                              }}
                              className="text-blue-500 hover:text-blue-700 transition-colors font-medium"
                            >
                              Cập nhật
                            </button>
                            {!address.isDefault && (
                              <button
                                onClick={() => {
                                  setSelectedAddressId(addressKey);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="text-red-400 hover:text-red-600 transition-colors font-medium"
                              >
                                Xóa
                              </button>
                            )}
                          </div>

                          {/* Nút Thiết lập mặc định (Chỉ hiện nếu không phải mặc định) */}
                          {!address.isDefault && (
                            <button className="text-xs px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 transition-all text-gray-600">
                              Thiết lập mặc định
                            </button>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

          )}
        </CardContent>

      </Card>


      {/* Update Profile Form */}
      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white mt-10 overflow-hidden rounded-[32px]">
        <CardHeader className="px-8 pt-8 pb-4 border-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-[14px] font-black font-vietnam tracking-tight text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <User className="h-6 w-6 text-primary" />
                </div>
                Thiết lập hồ sơ cá nhân
              </CardTitle>
              <p className="text-gray-400 text-sm font-medium font-vietnam ml-1">
                Cập nhật thông tin của bạn để có trải nghiệm tốt nhất
              </p>
            </div>

            {/* Nút Reset Form hoặc Quay lại nếu cần, hoặc bỏ trống để giữ khoảng cách */}
            <div className="hidden md:block">
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1.5 rounded-xl font-bold">
                <ShieldCheck size={14} className="mr-2" /> Tài khoản xác thực
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-8">

              {/* Lưới thông tin - Đồng bộ kiểu grid của Address list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField
                  control={updateForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-black text-gray-400 font-vietnam uppercase tracking-widest ml-1">Họ và tên khách hàng</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} value={field.value ?? ""} className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-primary/20 transition-all font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={updateForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-black text-gray-400 font-vietnam uppercase tracking-widest ml-1">Số điện thoại liên lạc</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} value={field.value ?? ""} className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-primary/20 transition-all font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Khối chuyên sâu về Da - Đồng bộ style Badge & Background */}
              <div className="p-6 bg-primary/[0.02] rounded-[28px] border-2 border-dashed border-primary/10">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={18} className="text-primary animate-pulse" />
                  <h4 className="text-xs font-black font-vietnam text-primary uppercase tracking-widest">Phân tích đặc điểm làn da</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={updateForm.control}
                    name="skinType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold font-vietnam text-gray-500 uppercase ml-1">Loại da</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} value={field.value ?? ""} className="h-11 rounded-xl border-white bg-white shadow-sm focus:ring-primary/20 transition-all font-medium" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={updateForm.control}
                    name="skinConcerns"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold font-vietnam text-gray-500 uppercase ml-1">Vấn đề quan tâm</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} value={field.value ?? ""} className="h-11 rounded-xl border-white bg-white shadow-sm focus:ring-primary/20 transition-all font-medium" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Password field - Tối giản */}
              <div className="max-w-md">
                <FormField
                  control={updateForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[11px] font-black text-red-400 font-vietnam uppercase tracking-widest ml-1">Mật khẩu bảo mật</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                            disabled={isLoading}
                            value={field.value ?? ""}
                            placeholder="••••••••"
                            className="h-12 rounded-2xl border-gray-100 bg-gray-50/50 pr-12 focus:bg-white transition-all font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <p className="text-[10px] text-gray-400 mt-2 ml-1 italic font-medium">* Để trống nếu bạn không muốn thay đổi mật khẩu hiện tại</p>
                    </FormItem>
                  )}
                />
              </div>

              {/* Nút bấm Lưu - Áp dụng hiệu ứng trượt giống nút "Thêm địa chỉ" */}
              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="group relative overflow-hidden flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary font-black px-10 py-3 rounded-2xl transition-all duration-500 shadow-xl shadow-primary/10 min-w-[200px]"
                >
                  {/* Lớp nền trượt màu Primary */}
                  <span className="absolute inset-y-0 left-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />

                  <div className="relative z-10 flex items-center gap-2 transition-colors group-hover:text-white uppercase text-xs tracking-widest">
                    {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    <span>{isLoading ? "Đang xử lý..." : "Lưu thay đổi hồ sơ"}</span>
                  </div>
                </motion.button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>



      {/* Danger Zone */}
      <Card className="border border-red-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
            <LogOut size={16} /> Vùng nguy hiểm
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Đăng xuất khỏi tài khoản của bạn</p>
            <p className="text-sm text-gray-500">Bạn sẽ cần đăng nhập lại để truy cập vào tài khoản của mình.</p>
          </div>
          <Button
            variant="outline"
            className="relative group overflow-hidden border-red-300 text-red-600 transition-colors duration-500"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            {/* Lớp nền trượt từ trái sang phải */}
            <span className="absolute inset-y-0 left-0 w-0 bg-red-500 transition-all duration-500 ease-out group-hover:w-full" />

            {/* Nội dung bên trên - z-10 để không bị che, transition để đổi màu chữ */}
            <span className="relative z-10 flex items-center transition-colors duration-500 group-hover:text-white">
              <LogOut size={14} className="mr-2" />
              Đăng xuất
            </span>
          </Button>

        </CardContent>
      </Card>

      {/* Address Dialog */}

      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[24px] border-none shadow-2xl p-0 overflow-hidden">
          {/* Header trang trí */}
          <div className="bg-primary p-6 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <MapPin size={80} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-white">
                {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ nhận hàng"}
              </DialogTitle>
              <p className="text-white/80 text-sm">Vui lòng điền chính xác thông tin để chúng tôi giao hàng tận nơi.</p>
            </DialogHeader>
          </div>

          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tỉnh / Thành phố */}
                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-gray-700">Tỉnh / Thành phố</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Hà Nội" {...field} className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Quận / Huyện */}
                <FormField
                  control={addressForm.control}
                  name="district" // Thay cho country vì không cần thiết cho nội địa
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-gray-700">Quận / Huyện</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Quận Cầu Giấy" {...field} className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Phường / Xã */}
              <FormField
                control={addressForm.control}
                name="ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-700">Phường / Xã</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Phường Dịch Vọng" {...field} className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Địa chỉ chi tiết */}
              <FormField
                control={addressForm.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-gray-700">Số nhà, tên đường</FormLabel>
                    <FormControl>
                      <Input placeholder="Số 123, đường ABC..." {...field} className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Checkbox Mặc định */}
              <FormField
                control={addressForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-bold text-gray-800 cursor-pointer">
                        Đặt làm địa chỉ mặc định
                      </FormLabel>
                      <p className="text-xs text-gray-400">Các đơn hàng sau sẽ tự động sử dụng địa chỉ này.</p>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                >
                  Hủy bỏ
                </Button>

                {/* Nút bấm hiệu ứng nền trượt Primary */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "group relative overflow-hidden flex-1",
                    "bg-white border-2 border-primary text-primary font-bold py-6 rounded-xl transition-all duration-500 shadow-lg shadow-primary/10"
                  )}
                >
                  <span className="absolute inset-y-0 left-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />
                  <div className="relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-500">
                    {isLoading ? (
                      <RefreshCw className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        <Save size={18} />
                        <span>{editingAddress ? "Lưu thay đổi" : "Lưu địa chỉ"}</span>
                      </>
                    )}
                  </div>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>


      {/* Delete Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa địa chỉ</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Bạn có chắc chắn không? Hành động này không thể hoàn tác.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Hủy</Button>
            <Button onClick={handleDeleteAddress} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận đăng xuất</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Bạn có chắc chắn muốn đăng xuất không?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>Hủy</Button>
            <Button onClick={confirmLogout} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? "Đang đăng xuất..." : "Đăng xuất"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileTab;
