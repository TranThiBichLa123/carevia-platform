"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Plus, MapPin, Edit, Trash2, Check, Globe } from "lucide-react";
import { toast } from "sonner";
import { Address, AddressInput } from "@/types_enum/devices";
import { addAddress, updateAddress, deleteAddress } from "../../lib/addressApi";
import { useUserStore } from "../../lib/store";
import { motion } from "framer-motion";

interface AddressSelectionProps {
  selectedAddress: Address | null;
  onAddressSelect: (address: Address) => void;
  addresses: Address[];
  onAddressesUpdate: (addresses: Address[]) => void;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  selectedAddress,
  onAddressSelect,
  addresses,
  onAddressesUpdate,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressInput>({
    street: "",
    city: "",
    country: "",
    postalCode: "",
    isDefault: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { authUser, auth_token } = useUserStore();

  // Update form when dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      setFormData({
        street: "",
        city: "",
        country: "",
        postalCode: "",
        isDefault: addresses.length === 0,
      });
    }
  }, [isAddDialogOpen, addresses.length]);

  const resetForm = () => {
    setFormData({
      street: "",
      city: "",
      country: "",
      postalCode: "",
      isDefault: addresses.length === 0, // Auto-check if this is the first address
    });
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !auth_token) return;

    setIsLoading(true);
    try {
      const result = await addAddress(authUser._id, formData, auth_token);
      onAddressesUpdate(result.addresses);
      toast.success(result.message);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !auth_token || !editingAddress) return;

    setIsLoading(true);
    try {
      const result = await updateAddress(
        authUser._id,
        editingAddress._id,
        formData,
        auth_token
      );
      onAddressesUpdate(result.addresses);
      toast.success(result.message);
      setIsEditDialogOpen(false);
      setEditingAddress(null);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!authUser || !auth_token) return;

    setIsLoading(true);
    try {
      const result = await deleteAddress(authUser._id, addressId, auth_token);
      onAddressesUpdate(result.addresses);
      toast.success(result.message);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete address"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Địa chỉ giao hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white  p-12 text-center  relative overflow-hidden group">
              {/* Trang trí nền mờ */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

              {/* Icon MapPin với hiệu ứng sóng nháy */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-full h-full bg-primary/10 rounded-[30px] flex items-center justify-center relative z-10"
                >
                  <MapPin className="w-12 h-12 text-primary" />
                </motion.div>
                <div className="absolute inset-0 bg-primary/20 rounded-[30px] animate-ping opacity-30" />
              </div>

              <h3 className="text-2xl font-bold font-vietnam text-gray-900 mb-3 tracking-tight">
                Chưa có địa chỉ giao hàng
              </h3>
              <p className="text-gray-500 font-vietnam max-w-sm mx-auto mb-10 leading-relaxed">
                Thêm địa chỉ giao hàng của bạn để Carevia có thể gửi những thiết bị chăm sóc da tốt nhất đến tận tay bạn.
              </p>

              {/* Nút mở Dialog với hiệu ứng trượt nền */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="group relative overflow-hidden h-14 px-10 rounded-full bg-primary text-white font-bold font-vietnam shadow-lg shadow-primary/25 active:scale-95 transition-all">
                    <span className="absolute inset-0 w-0 bg-white/10 transition-all duration-500 ease-out group-hover:w-full" />
                    <div className="relative z-10 flex items-center">
                      <Plus className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" />
                      Thêm địa chỉ đầu tiên
                    </div>
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-xl rounded-[32px] p-0 border-none shadow-2xl overflow-hidden">
                  {/* Header Form */}
                  <div className="bg-primary p-8 text-white relative">
                    <div className="relative z-10">
                      <DialogTitle className="text-2xl font-bold font-vietnam">Thêm địa chỉ mới</DialogTitle>
                      <DialogDescription className="text-white/70 text-sm font-vietnam mt-1">Vui lòng điền chính xác thông tin nhận hàng</DialogDescription>
                    </div>
                    <Globe className="absolute right-6 bottom-4 w-24 h-24 text-white/10 rotate-12" />
                  </div>

                  <form onSubmit={handleAddAddress} className="p-8 space-y-6 bg-white">
                    <div className="grid grid-cols-1 gap-5">
                      {/* Mỗi Input sẽ trượt nhẹ khi hiện */}
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <Label className="text-xs font-bold uppercase font-vietnam tracking-widest text-gray-400 mb-2 block ml-1">Địa chỉ nhà / Tên đường</Label>
                        <Input
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          placeholder="Ví dụ: 123 Đường ABC, Phường X..."
                          className="h-12 rounded-xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                      </motion.div>

                      <div className="grid grid-cols-2 gap-4">
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                          <Label className="text-xs font-bold uppercase font-vietnam tracking-widest text-gray-400 mb-2 block ml-1">Thành phố</Label>
                          <Input
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="h-12 rounded-xl bg-gray-50 border-none"
                          />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                          <Label className="text-xs font-bold uppercase font-vietnam tracking-widest text-gray-400 mb-2 block ml-1">Mã bưu điện</Label>
                          <Input
                            value={formData.postalCode}
                            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                            className="h-12 rounded-xl bg-gray-50 border-none"
                          />
                        </motion.div>
                      </div>
                    </div>

                    {/* Toggle Mặc định - Thiết kế như một thẻ nhỏ */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${formData.isDefault ? 'bg-primary' : 'border-2 border-gray-300'}`}>
                          {formData.isDefault && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <Label htmlFor="isDefault" className="text-sm font-semibold font-vietnam text-gray-700 cursor-pointer select-none">Đặt làm mặc định</Label>
                        <input type="checkbox" id="isDefault" className="hidden" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />
                      </div>
                      {addresses.length === 0 && <span className="text-[10px] font-bold font-vietnam text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-tighter">Địa chỉ đầu tiên</span>}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-[2] h-13 rounded-2xl bg-primary hover:bg-primary-hover font-bold text-white shadow-lg shadow-primary/20"
                      >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Xác nhận thêm"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAddDialogOpen(false)}
                        className="flex-1 h-13 rounded-2xl text-gray-400 hover:bg-gray-100 font-medium font-vietnam"
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>
        ) : (
          <>
            {addresses.length === 1 && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-vietnam text-green-800">
                  ✓ Địa chỉ của bạn đã được tự động chọn để giao hàng
                </p>
              </div>
            )}

            <RadioGroup
              value={selectedAddress?._id || ""}
              onValueChange={(value) => {
                const address = addresses.find((addr) => addr._id === value);
                if (address) {
                  onAddressSelect(address);
                }
              }}
            >
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address._id}
                    className={`relative p-4 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${selectedAddress?._id === address._id
                        ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Radio Button */}
                      <RadioGroupItem
                        value={address._id}
                        id={address._id}
                        className="mt-1 shrink-0"
                      />

                      {/* Address Content */}
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={address._id}
                          className="cursor-pointer block"
                        >
                          {/* Address Header */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="font-semibold font-vietnam text-gray-900">
                                Địa chỉ giao hàng
                              </span>
                            </div>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium font-vietnam bg-green-100 text-green-800">
                                ✓ Mặc định
                              </span>
                            )}
                          </div>

                          {/* Address Details */}
                          <div className="space-y-1">
                            <div className="font-medium font-vietnam text-gray-900">
                              {address.street}
                            </div>
                            <div className="text-sm font-vietnam text-gray-600 flex flex-wrap gap-1">
                              <span>{address.city},</span>
                              <span>{address.country}</span>
                              <span>{address.postalCode}</span>
                            </div>
                          </div>
                        </Label>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(address)}
                          className="p-2 h-8 w-8 hover:bg-gray-100"
                          title="Edit Address"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address._id)}
                          disabled={isLoading}
                          className="p-2 h-8 w-8 hover:bg-red-50 hover:text-red-600"
                          title="Delete Address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {selectedAddress?._id === address._id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-4 h-12 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 font-vietnam"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Thêm địa chỉ mới
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm địa chỉ mới</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div>
                    <Label htmlFor="street">Địa chỉ đường phố</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Thành phố</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Quốc gia</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      placeholder="United States"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Mã bưu điện</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDefault: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="isDefault" className="font-vietnam">Set as default address</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Add Address"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Address</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditAddress} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-street">Địa chỉ đường phố</Label>
                    <Input
                      id="edit-street"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-city">Thành phố</Label>
                    <Input
                      id="edit-city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-country">Quốc gia</Label>
                    <Input
                      id="edit-country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      placeholder="United States"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-postalCode">Mã bưu điện</Label>
                    <Input
                      id="edit-postalCode"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-isDefault"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isDefault: e.target.checked,
                        })
                      }
                    />
                    <Label htmlFor="edit-isDefault" className="font-vietnam">
                      Đặt làm địa chỉ mặc định
                    </Label>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Đang cập nhật..." : "Cập nhật địa chỉ"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      Hủy
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};
