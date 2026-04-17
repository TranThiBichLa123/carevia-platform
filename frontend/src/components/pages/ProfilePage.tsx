"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useUserStore, useCartStore } from "@/lib/store";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  User,
  ShoppingCart,
  Package,
  Save,
  MapPin,
  Plus,
  Edit,
  Trash,
  Eye,
  EyeOff,
  LogOut,
  Phone,
  PlusCircle,
  Edit3,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import authApi from "@/lib/authApi";
import Link from "next/link";

const updateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      "Password must be at least 8 characters or empty"
    ),
});

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  isDefault: z.boolean(),
});

type FormData = z.infer<typeof updateSchema>;
type AddressFormData = z.infer<typeof addressSchema>;
type ProfileAddress = AddressFormData & { _id: string };
type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  addresses?: ProfileAddress[];
};

const ProfilePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [editingAddress, setEditingAddress] = useState<AddressFormData | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { authUser, updateUser, logoutUser } = useUserStore();
  const { cartItems } = useCartStore();

  const syncProfileUser = (user: ProfileUser) => {
    updateUser({
      _id: user._id,
      username: user.name,
      email: user.email,
      avatar_url: user.avatar,
      role: user.role,
      addresses: user.addresses || [],
    });
  };

  const updateForm = useForm<FormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: authUser?.username || "",
      password: "",
    },
  });

  // Update form defaults when authUser changes
  useEffect(() => {
    if (authUser) {
      console.log("Initializing updateForm with name:", authUser.username);
      updateForm.reset({
        name: authUser.username,
        password: "",
      });
    }
  }, [authUser, updateForm]);

  const addressForm = useForm<AddressFormData, AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      country: "",
      postalCode: "",
      isDefault: false,
    },
  });

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.post("/auth/logout", {});
      if (response.success) {
        logoutUser();
        toast.success("Logged out", {
          description: "You have been logged out successfully.",
          className: "bg-green-50 text-gray-800 border-green-200",
          duration: 5000,
        });
        router.push("/");
      } else {
        throw new Error(response.error?.message || "Failed to log out.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed", {
        description:
          error instanceof Error ? error.message : "Failed to log out.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
    setIsLogoutModalOpen(false);
  };

  if (!authUser) {
    return (
      <div className="text-center py-12">
        Please sign in to view your profile.
      </div>
    );
  }

  const onUpdateSubmit = async (data: FormData) => {
    setIsLoading(true);
    const updateData: { name?: string; password?: string } = {
      name: data.name,
    };
    if (data.password) {
      updateData.password = data.password;
    }

    try {
      const response = await authApi.put<ProfileUser>(
        `/users/${authUser._id}`,
        updateData
      );
      if (response.success && response.data) {
        syncProfileUser(response.data);
        toast.success("Profile updated", {
          description: "Your profile has been updated successfully.",
          className: "bg-green-50 text-gray-800 border-green-200",
          duration: 5000,
        });
        updateForm.reset({ name: response.data.name, password: "" });
      } else {
        throw new Error(response.error?.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Update failed", {
        description:
          error instanceof Error ? error.message : "Failed to update profile.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    const newAddresses = [...(authUser.addresses || [])];
    if (editingAddress && selectedAddressId !== null) {
      // Update existing address
      const index = parseInt(selectedAddressId);
      newAddresses[index] = {
        ...data,
        _id: authUser.addresses?.[index]?._id ?? "",
      };
    } else {
      // Add new address
      newAddresses.push({ ...data, _id: "" });
    }

    // If the new/edited address is default, reset others
    if (data.isDefault) {
      newAddresses.forEach((addr, i) => {
        addr.isDefault =
          i ===
          (editingAddress
            ? parseInt(selectedAddressId!)
            : newAddresses.length - 1);
      });
    }

    try {
      const response = await authApi.put<ProfileUser>(
        `/users/${authUser._id}`,
        {
          addresses: newAddresses,
        }
      );
      if (response.success && response.data) {
        syncProfileUser(response.data);
        toast.success("Address saved", {
          description: editingAddress
            ? "Address updated successfully."
            : "Address added successfully.",
          className: "bg-green-50 text-gray-800 border-green-200",
          duration: 5000,
        });
        setIsAddressModalOpen(false);
        addressForm.reset();
        setEditingAddress(null);
        setSelectedAddressId(null);
      } else {
        throw new Error(response.error?.message || "Failed to save address.");
      }
    } catch (error) {
      console.error("Address save error:", error);
      toast.error("Address save failed", {
        description:
          error instanceof Error ? error.message : "Failed to save address.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
  };

  const handleEditAddress = (address: AddressFormData, index: number) => {
    console.log("Editing address:", address, "Index:", index);
    setEditingAddress(address);
    setSelectedAddressId(index.toString());
    addressForm.reset(address);
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = async () => {
    if (selectedAddressId === null) return;
    setIsLoading(true);
    const newAddresses = (authUser.addresses ?? []).filter(
      (_, i) => i !== parseInt(selectedAddressId)
    );
    try {
      const response = await authApi.put<ProfileUser>(
        `/users/${authUser._id}`,
        {
          addresses: newAddresses,
        }
      );
      if (response.success && response.data) {
        syncProfileUser(response.data);
        toast.success("Address deleted", {
          description: "Address removed successfully.",
          className: "bg-green-50 text-gray-800 border-green-200",
          duration: 5000,
        });
        setIsDeleteModalOpen(false);
        setSelectedAddressId(null);
      } else {
        throw new Error(response.error?.message || "Failed to delete address.");
      }
    } catch (error) {
      console.error("Address delete error:", error);
      toast.error("Address deletion failed", {
        description:
          error instanceof Error ? error.message : "Failed to delete address.",
        className: "bg-red-50 text-gray-800 border-red-200",
        duration: 7000,
      });
    }
    setIsLoading(false);
  };

  const InfoField = ({ label, value, placeholder }: { label: string; value?: string; placeholder: string }) => (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
      {value ? (
        <p className="text-gray-800 font-semibold">{value}</p>
      ) : (
        <button className="text-sm text-gray-300 italic hover:text-teal-400 transition-colors flex items-center gap-1">
          <PlusCircle size={12} /> {placeholder}
        </button>
      )}
    </div>
  );


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-linear-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Information Dashboard */}
        <div className="space-y-6">
          <Card className="shadow-lg border-none overflow-hidden">
            {/* Top Banner & Header */}
            <div className="h-24 bg-gradient-to-r from-teal-500 to-teal-700 flex items-center justify-between px-8">
              <div className="flex items-center gap-4 mt-12">
                <div className="relative group">
                  {authUser.avatar_url ? (
                    <img src={authUser.avatar_url} alt="Avatar" className="h-24 w-24 rounded-2xl border-4 border-white shadow-md object-cover" />
                  ) : (
                    <div className="h-24 w-24 rounded-2xl bg-white flex items-center justify-center text-teal-600 text-3xl font-bold border-4 border-white shadow-md">
                      {authUser.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <button className="absolute -bottom-2 -right-2 p-1.5 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition-all">
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {authUser.full_name || authUser.username}
                    <Badge className="bg-teal-100 text-teal-700 border-none">{authUser.membership_level || 'BASIC'}</Badge>
                  </h2>
                  <p className="text-sm text-gray-500">{authUser.email}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="outline"
                className="mt-6 border-white/50 text-white bg-red-500/20 hover:bg-red-600 hover:text-white backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4 mr-2" /> Log Out
              </Button>
            </div>

            <CardContent className="pt-16 px-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Nhóm 1: Thông tin tài khoản (Account Table) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                    <User className="h-4 w-4" /> Account Info
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Username</p>
                      <p className="text-gray-800 font-semibold">{authUser.username}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Role</p>
                      <Badge variant="outline" className="capitalize text-teal-600 border-teal-200">{authUser.role}</Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Client Code</p>
                      <p className="text-sm font-mono text-gray-600">{authUser.client_code || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Nhóm 2: Thông tin liên lạc (Client Table) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                    <Phone className="h-4 w-4" /> Contact & Delivery
                  </h3>
                  <div className="space-y-3">
                    <InfoField label="Phone" value={authUser.phone} placeholder="Add phone number" />
                    <InfoField label="Address" value={authUser.address} placeholder="Add shipping address" />
                    <InfoField label="Birth Date" value={authUser.birth_date} placeholder="Add your birthday" />
                  </div>
                </div>

                {/* Nhóm 3: Chăm sóc da & Booking (Client Table) */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-teal-600 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                    <Sparkles className="h-4 w-4" /> Skin & Loyalty
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Skin Type</p>
                      {authUser.skin_type ? (
                        <Badge className="bg-teal-600">{authUser.skin_type}</Badge>
                      ) : (
                        <button className="text-xs text-teal-600 font-bold hover:underline">Phân tích da ngay →</button>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">CarePoints</p>
                      <p className="text-xl font-black text-orange-500">{authUser.loyalty_points || 0} pts</p>
                    </div>
                    <Button size="sm" className="w-full bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200">
                      Cập nhật hồ sơ da
                    </Button>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>


        {/* Addresses Section - Tích hợp bên dưới User Information */}
        <Card className="border-none shadow-lg bg-white mt-6">
          <CardHeader className="border-b bg-gray-50/30">
            <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-teal-600" />
                </div>
                Sổ địa chỉ nhận hàng
              </div>
              <Button
                onClick={() => {
                  addressForm.reset();
                  setEditingAddress(null);
                  setSelectedAddressId(null);
                  setIsAddressModalOpen(true);
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 shadow-md transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" /> Thêm địa chỉ mới
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            {!(authUser.addresses && authUser.addresses.length > 0) ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Bạn chưa có địa chỉ nhận hàng nào.</p>
                <p className="text-sm text-gray-400">Hãy thêm địa chỉ để thuận tiện hơn khi đặt mua thiết bị chăm sóc da.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {authUser.addresses.map((address, index) => (
                  <div
                    key={index}
                    className={`relative p-5 rounded-2xl border-2 transition-all ${address.isDefault
                      ? "border-teal-500 bg-teal-50/30"
                      : "border-gray-100 bg-white hover:border-teal-200"
                      }`}
                  >
                    {address.isDefault && (
                      <Badge className="absolute top-4 right-4 bg-teal-500 text-white border-none text-[10px] px-2 py-0">
                        Mặc định
                      </Badge>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${address.isDefault ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <MapPin size={16} />
                      </div>
                      <div className="space-y-1 pr-12">
                        <p className="font-bold text-gray-800 text-base">{address.street}</p>
                        <p className="text-sm text-gray-600">{address.city}, {address.country}</p>
                        <p className="text-xs text-gray-400 font-medium tracking-wider">Mã bưu điện: {address.postalCode}</p>
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAddress(address, index)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAddressId(index.toString());
                          setIsDeleteModalOpen(true);
                        }}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>


        {/* Layout 2 cột cho Update và Cart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* Update Profile Form */}
          <Card className="border-none shadow-lg bg-white h-fit">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-teal-700">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Save className="h-5 w-5" />
                </div>
                Cập nhật hồ sơ
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={updateForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-bold text-xs uppercase">Họ và tên</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} className="border-gray-200 focus:ring-teal-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={updateForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-bold text-xs uppercase">Số điện thoại</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} placeholder="090..." className="border-gray-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={updateForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-600 font-bold text-xs uppercase">Mật khẩu mới (Để trống nếu không đổi)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              {...field}
                              disabled={isLoading}
                              className="border-gray-200 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-600"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 shadow-md transition-all"
                  >
                    {isLoading ? "Đang xử lý..." : "Lưu thay đổi"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* 2. Cart Items - Thiết kế dạng List thay vì Table thô */}
          <Card className="border-none shadow-lg bg-white h-fit">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="flex items-center justify-between text-xl font-bold text-gray-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  Giỏ hàng của bạn
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">{cartItems.length} sản phẩm</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <ShoppingCart size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">Giỏ hàng đang trống</p>
                  <Button variant="link" className="text-teal-600 mt-2">Tiếp tục mua sắm →</Button>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item?._id} className="flex gap-4 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                      <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400"><Package size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm truncate uppercase">{item.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs font-medium text-gray-500">SL: {item.quantity}</p>
                          <p className="font-bold text-teal-600 text-sm">${(item.price * (item.quantity ?? 1)).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-500 font-medium">Tổng tiền ước tính:</span>
                      <span className="text-xl font-black text-gray-900">
                        ${cartItems.reduce((acc, item) => acc + (item.price * (item.quantity ?? 1)), 0).toFixed(2)}
                      </span>
                    </div>
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 shadow-lg">
                      Tiến hành thanh toán
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Orders */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <Package className="h-6 w-6 text-indigo-600" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={"/client/user/orders"}>
              <Button variant={"outline"}>View all orders</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Address Dialog */}
        <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
          <DialogContent className="sm:max-w-137.5 bg-white rounded-xl shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {editingAddress ? "Edit Address" : "Add Address"}
              </DialogTitle>
            </DialogHeader>
            <Form<AddressFormData> {...addressForm}>
              <form
                onSubmit={addressForm.handleSubmit(onAddressSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={addressForm.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Street
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        City
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Country
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Postal Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addressForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="border-gray-300 data-[state=checked]:bg-indigo-600"
                        />
                      </FormControl>
                      <FormLabel className="text-gray-700 font-medium">
                        Set as default address
                      </FormLabel>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-6 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddressModalOpen(false)}
                    disabled={isLoading}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Saving...
                      </span>
                    ) : editingAddress ? (
                      "Update Address"
                    ) : (
                      "Add Address"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Address Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-106.25 bg-white rounded-xl shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Delete Address
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteAddress}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout Confirmation Dialog */}
        <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
          <DialogContent className="sm:max-w-106.25 bg-white rounded-xl shadow-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Confirm Logout
              </DialogTitle>
            </DialogHeader>
            <p className="text-gray-600">
              Are you sure you want to log out? You will need to sign in again
              to access your profile.
            </p>
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLogoutModalOpen(false)}
                disabled={isLoading}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmLogout}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Logging out...
                  </span>
                ) : (
                  "Log Out"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
