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
      {/* ── Hero Profile Card ── */}
      <Card className="border-none overflow-hidden shadow-lg">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-500 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 right-24 w-28 h-28 rounded-full bg-white/10" />
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16">
            {/* Avatar with upload overlay */}
            <div className="relative group shrink-0">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="w-28 h-28 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-teal-100">
                {authUser.avatar_url ? (
                  <img
                    src={authUser.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal-600 text-4xl font-black">
                    {authUser.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isAvatarUploading}
                className="absolute inset-0 rounded-3xl bg-black/50 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                {isAvatarUploading ? (
                  <RefreshCw className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="h-6 w-6 text-white" />
                    <span className="text-white text-[10px] font-bold">Đổi ảnh</span>
                  </>
                )}
              </button>
            </div>

            {/* User info */}
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-gray-900">{authUser.username}</h2>
                <Badge className="bg-teal-100 text-teal-700 border-none capitalize">{authUser.role}</Badge>
                {authUser.membership_level && (
                  <Badge className="bg-orange-100 text-orange-700 border-none">
                    <Award size={11} className="mr-1" /> {authUser.membership_level}
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 text-sm">{authUser.email}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-orange-400 fill-orange-400" />
                  <span className="text-sm font-bold text-gray-700">{authUser.loyalty_points || 0} CarePoints</span>
                </div>
                {authUser.client_code && (
                  <span className="text-sm text-gray-400">
                    Mã KH: <span className="font-bold text-gray-600">{authUser.client_code}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Logout shortcut */}
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-500 hover:bg-red-50 shrink-0"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <LogOut size={14} className="mr-1.5" /> Đăng xuất
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Info Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-teal-600 uppercase flex items-center gap-2">
              <User size={14} /> Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoField label="Username" value={authUser.username} placeholder="" />
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Role</p>
              <Badge variant="outline" className="capitalize text-teal-600 border-teal-200">
                {authUser.role}
              </Badge>
            </div>
            <InfoField label="Client Code" value={authUser.client_code || "N/A"} placeholder="" />
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-teal-600 uppercase flex items-center gap-2">
              <Phone size={14} /> Contact & Delivery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoField label="Phone" value={authUser.phone} placeholder="Add phone number" />
            <InfoField label="Address" value={authUser.address} placeholder="Add shipping address" />
            <InfoField label="Birth Date" value={authUser.birth_date} placeholder="Add your birthday" />
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-teal-600 uppercase flex items-center gap-2">
              <Sparkles size={14} /> Skin & Loyalty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Skin Type</p>
              {authUser.skin_type ? (
                <Badge className="bg-teal-600">{authUser.skin_type}</Badge>
              ) : (
                <span className="text-xs text-gray-400 italic">Chưa cập nhật</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Skin Concerns</p>
              {authUser.skin_concerns ? (
                <p className="text-sm text-gray-700 font-medium">{authUser.skin_concerns}</p>
              ) : (
                <span className="text-xs text-gray-400 italic">Chưa cập nhật</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">CarePoints</p>
              <p className="text-xl font-black text-orange-500">{authUser.loyalty_points || 0} pts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address Book */}

      <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white mt-10 overflow-hidden rounded-[32px]">
        <CardHeader className="px-8 pt-8 pb-4 border-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-[16px] font-black tracking-tight text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                Sổ địa chỉ nhận hàng
              </CardTitle>
              <p className="text-gray-400 text-sm font-medium ml-1">Quản lý danh sách địa chỉ giao hàng của bạn</p>
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
                "font-bold py-3.5 px-7 rounded-2xl transition-all duration-500 shadow-lg shadow-primary/10"
              )}
            >
              {/* Lớp nền trượt màu Primary từ trái sang phải */}
              <span className="absolute inset-y-0 left-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />

              {/* Nội dung nút - Phải có z-10 để nổi lên trên lớp nền màu */}
              <div className="relative text-[16px] z-10 flex items-center gap-2 transition-colors group-hover:text-white">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {authUser.addresses.map((address) => {
                  // Ưu tiên dùng ID từ database, nếu không có mới dùng index
                  const addressKey = address._id || address._id;

                  return (
                    <motion.div
                      key={addressKey}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className={`group relative p-6 rounded-[28px] border-2 transition-all duration-500 ${address.isDefault
                        ? "border-primary bg-primary/[0.03] shadow-md shadow-primary/5"
                        : "border-gray-100 bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-gray-200/40"
                        }`}
                    >
                      {address.isDefault && (
                        <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-full shadow-lg shadow-primary/20">
                          <Check size={12} strokeWidth={4} /> Mặc định
                        </div>
                      )}

                      <div className="flex items-start gap-5">
                        <div
                          className={`mt-1 p-4 rounded-2xl transition-all duration-300 ${address.isDefault
                            ? "bg-primary text-white shadow-lg shadow-primary/30"
                            : "bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white"
                            }`}
                        >
                          <Home size={22} />
                        </div>

                        <div className="space-y-2 pr-10">
                          <h4 className="font-bold text-gray-900 text-xl leading-tight tracking-tight">
                            {address.street}
                          </h4>
                          <div className="space-y-1">
                            <p className="text-gray-500 font-medium text-[15px]">
                              {address.ward}, {address.district}
                            </p>
                            <div className="inline-block px-2.5 py-1 bg-primary/10 rounded-lg text-[11px] font-black text-primary uppercase tracking-widest">
                              {address.city}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Sửa lại logic ID */}
                      <div className="mt-8 pt-5 border-t border-gray-100/60 flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={() => {
                            setEditingAddress(address);
                            setSelectedAddressId(addressKey); // Dùng ID thật
                            addressForm.reset(address);
                            setIsAddressModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl transition-all font-bold text-sm"
                        >
                          <Edit2 size={16} /> Sửa
                        </button>

                        <div className="w-px h-4 bg-gray-200 mx-1" />

                        <button
                          onClick={() => {
                            setSelectedAddressId(addressKey); // Dùng ID thật
                            setIsDeleteModalOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
                        >
                          <Trash2 size={16} /> Xóa
                        </button>
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
      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-gray-50/30">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-teal-700">
            <Save size={16} /> Cập nhật hồ sơ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4 max-w-lg">
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600 font-bold text-xs uppercase">Họ và tên</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600 font-bold text-xs uppercase">Số điện thoại</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />                  
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="skinType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600 font-bold text-xs uppercase">Loại da</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="skinConcerns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600 font-bold text-xs uppercase">Vấn đề về da</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-600 font-bold text-xs uppercase">
                      Mật khẩu mới (Để trống nếu không đổi)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
                {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-red-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
            <LogOut size={16} /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Log out of your account</p>
            <p className="text-sm text-gray-500">You will need to sign in again to access your account.</p>
          </div>
          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => setIsLogoutModalOpen(true)}
          >
            <LogOut size={14} className="mr-2" /> Log Out
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
