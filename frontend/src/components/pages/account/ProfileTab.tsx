"use client";

import React, { useState, useEffect } from "react";
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
  Edit,
  Trash,
  Eye,
  EyeOff,
  LogOut,
  Phone,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import authApi from "@/lib/authApi";

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
type ProfileUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  addresses?: (AddressFormData & { _id: string })[];
};

const ProfileTab = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<AddressFormData | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { authUser, updateUser, logoutUser } = useUserStore();

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

  useEffect(() => {
    if (authUser) {
      updateForm.reset({ name: authUser.username, password: "" });
    }
  }, [authUser, updateForm]);

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { street: "", city: "", country: "", postalCode: "", isDefault: false },
  });

  if (!authUser) return null;

  const onUpdateSubmit = async (data: FormData) => {
    setIsLoading(true);
    const updateData: { name?: string; password?: string } = { name: data.name };
    if (data.password) updateData.password = data.password;

    try {
      const response = await authApi.put<ProfileUser>(`/users/${authUser._id}`, updateData);
      if (response.success && response.data) {
        syncProfileUser(response.data);
        toast.success("Profile updated successfully.");
        updateForm.reset({ name: response.data.name, password: "" });
      } else {
        throw new Error(response.error?.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile.");
    }
    setIsLoading(false);
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    setIsLoading(true);
    const newAddresses = [...(authUser.addresses || [])];
    if (editingAddress && selectedAddressId !== null) {
      const index = parseInt(selectedAddressId);
      newAddresses[index] = { ...data, _id: authUser.addresses?.[index]?._id ?? "" };
    } else {
      newAddresses.push({ ...data, _id: "" });
    }
    if (data.isDefault) {
      newAddresses.forEach((addr, i) => {
        addr.isDefault = i === (editingAddress ? parseInt(selectedAddressId!) : newAddresses.length - 1);
      });
    }
    try {
      const response = await authApi.put<ProfileUser>(`/users/${authUser._id}`, { addresses: newAddresses });
      if (response.success && response.data) {
        syncProfileUser(response.data);
        toast.success(editingAddress ? "Address updated." : "Address added.");
        setIsAddressModalOpen(false);
        addressForm.reset();
        setEditingAddress(null);
        setSelectedAddressId(null);
      } else {
        throw new Error(response.error?.message || "Failed to save address.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save address.");
    }
    setIsLoading(false);
  };

  const handleDeleteAddress = async () => {
    if (selectedAddressId === null) return;
    setIsLoading(true);
    const newAddresses = (authUser.addresses ?? []).filter((_, i) => i !== parseInt(selectedAddressId));
    try {
      const response = await authApi.put<ProfileUser>(`/users/${authUser._id}`, { addresses: newAddresses });
      if (response.success && response.data) {
        syncProfileUser(response.data);
        toast.success("Address deleted.");
        setIsDeleteModalOpen(false);
        setSelectedAddressId(null);
      }
    } catch (error) {
      toast.error("Failed to delete address.");
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
      {/* User Info Cards */}
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
                <button className="text-xs text-teal-600 font-bold hover:underline">
                  Phân tích da ngay →
                </button>
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
      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-gray-50/30">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-teal-600" />
              <span className="font-bold">Sổ địa chỉ nhận hàng</span>
            </div>
            <Button
              onClick={() => {
                addressForm.reset();
                setEditingAddress(null);
                setSelectedAddressId(null);
                setIsAddressModalOpen(true);
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6"
              size="sm"
            >
              <Plus size={14} className="mr-1" /> Thêm địa chỉ
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!(authUser.addresses && authUser.addresses.length > 0) ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Bạn chưa có địa chỉ nhận hàng nào.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {authUser.addresses.map((address, index) => (
                <div
                  key={index}
                  className={`relative p-5 rounded-xl border-2 transition-all ${
                    address.isDefault
                      ? "border-teal-500 bg-teal-50/30"
                      : "border-gray-100 hover:border-teal-200"
                  }`}
                >
                  {address.isDefault && (
                    <Badge className="absolute top-3 right-3 bg-teal-500 text-white text-[10px]">
                      Mặc định
                    </Badge>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${address.isDefault ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                      <MapPin size={14} />
                    </div>
                    <div className="space-y-1 pr-16">
                      <p className="font-bold text-gray-800">{address.street}</p>
                      <p className="text-sm text-gray-600">{address.city}, {address.country}</p>
                      <p className="text-xs text-gray-400">Postal: {address.postalCode}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingAddress(address);
                        setSelectedAddressId(index.toString());
                        addressForm.reset(address);
                        setIsAddressModalOpen(true);
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-teal-600"
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAddressId(index.toString());
                        setIsDeleteModalOpen(true);
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
              ))}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add Address"}</DialogTitle>
          </DialogHeader>
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
              {(["street", "city", "country", "postalCode"] as const).map((field) => (
                <FormField
                  key={field}
                  control={addressForm.control}
                  name={field}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel className="capitalize">{field === "postalCode" ? "Postal Code" : field}</FormLabel>
                      <FormControl>
                        <Input {...f} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={addressForm.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                    </FormControl>
                    <FormLabel>Set as default address</FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddressModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
                  {isLoading ? "Saving..." : editingAddress ? "Update" : "Add"}
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
            <DialogTitle>Delete Address</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteAddress} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Are you sure you want to log out?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>Cancel</Button>
            <Button onClick={confirmLogout} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? "Logging out..." : "Log Out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileTab;
