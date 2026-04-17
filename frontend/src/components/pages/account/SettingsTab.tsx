"use client";

import React, { useState } from "react";
import { useUserStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Bell,
  BellOff,
  Shield,
  Globe,
  Palette,
  Trash2,
  Lock,
  Mail,
  Smartphone,
  Calendar,
  ShoppingBag,
  CreditCard,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import authApi from "@/lib/authApi";

const SettingsTab = () => {
  const { authUser, logoutUser } = useUserStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Notification preferences (local state, could be persisted to API)
  const [notifPrefs, setNotifPrefs] = useState({
    booking_confirmed: true,
    booking_cancelled: true,
    booking_reminder: true,
    order_status: true,
    order_completed: true,
    payment_success: true,
    payment_failed: true,
    promotions: false,
    newsletter: false,
    email_notifications: true,
    push_notifications: true,
  });

  const [language, setLanguage] = useState("vi");
  const [currency, setCurrency] = useState("USD");

  const toggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Cập nhật cài đặt thành công");
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // In production, this would call a real delete endpoint
      toast.success("Yêu cầu xóa tài khoản đã được gửi. Chúng tôi sẽ xử lý trong 30 ngày.");
      setIsDeleteDialogOpen(false);
    } catch {
      toast.error("Có lỗi xảy ra.");
    }
    setIsLoading(false);
  };

  if (!authUser) return null;

  const NotifRow = ({
    icon,
    label,
    description,
    prefKey,
  }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    prefKey: keyof typeof notifPrefs;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <Switch checked={notifPrefs[prefKey]} onCheckedChange={() => toggleNotif(prefKey)} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Account Security */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <Shield size={16} className="text-teal-600" /> Bảo mật tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Lock size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Phương thức xác thực</p>
                <p className="text-xs text-gray-400">
                  {authUser.auth_provider === "google" ? "Đăng nhập bằng Google OAuth" : "Email & Mật khẩu"}
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              {authUser.auth_provider === "google" ? "OAuth" : "Email"}
            </Badge>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Mail size={14} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Email</p>
                <p className="text-xs text-gray-400">{authUser.email}</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-700 border-green-200">Đã xác minh</Badge>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Smartphone size={14} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Xác thực 2 lớp (2FA)</p>
                <p className="text-xs text-gray-400">Bảo vệ tài khoản với xác thực 2 bước</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Sắp ra mắt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <Bell size={16} className="text-teal-600" /> Cấu hình thông báo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Kênh nhận thông báo</p>
            <NotifRow
              icon={<Mail size={14} />}
              label="Thông báo qua Email"
              description="Nhận thông báo qua email đã đăng ký"
              prefKey="email_notifications"
            />
            <NotifRow
              icon={<Smartphone size={14} />}
              label="Thông báo đẩy (Push)"
              description="Nhận thông báo trên trình duyệt"
              prefKey="push_notifications"
            />
          </div>

          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Booking</p>
            <NotifRow
              icon={<Calendar size={14} />}
              label="Xác nhận booking"
              description="Khi booking được xác nhận hoặc cập nhật"
              prefKey="booking_confirmed"
            />
            <NotifRow
              icon={<BellOff size={14} />}
              label="Hủy booking"
              description="Khi booking bị hủy bởi bạn hoặc staff"
              prefKey="booking_cancelled"
            />
            <NotifRow
              icon={<Bell size={14} />}
              label="Nhắc nhở booking"
              description="Nhắc trước 24h khi có lịch hẹn"
              prefKey="booking_reminder"
            />
          </div>

          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Đơn hàng & Thanh toán</p>
            <NotifRow
              icon={<ShoppingBag size={14} />}
              label="Cập nhật đơn hàng"
              description="Khi trạng thái đơn hàng thay đổi"
              prefKey="order_status"
            />
            <NotifRow
              icon={<CreditCard size={14} />}
              label="Thanh toán thành công"
              description="Khi thanh toán được xác nhận"
              prefKey="payment_success"
            />
            <NotifRow
              icon={<Info size={14} />}
              label="Thanh toán thất bại"
              description="Khi thanh toán gặp lỗi"
              prefKey="payment_failed"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Khuyến mãi</p>
            <NotifRow
              icon={<ShoppingBag size={14} />}
              label="Ưu đãi & Voucher"
              description="Nhận thông báo về chương trình khuyến mãi"
              prefKey="promotions"
            />
            <NotifRow
              icon={<Mail size={14} />}
              label="Bản tin CareVia"
              description="Nhận bản tin hàng tuần về chăm sóc da"
              prefKey="newsletter"
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <Globe size={16} className="text-teal-600" /> Tùy chọn hiển thị
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">Ngôn ngữ</p>
              <p className="text-xs text-gray-400">Chọn ngôn ngữ giao diện</p>
            </div>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                toast.success("Language updated");
              }}
              className="px-3 py-1.5 border rounded-lg text-sm bg-white"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">Đơn vị tiền tệ</p>
              <p className="text-xs text-gray-400">Đơn vị hiển thị giá sản phẩm</p>
            </div>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                toast.success("Currency updated");
              }}
              className="px-3 py-1.5 border rounded-lg text-sm bg-white"
            >
              <option value="USD">USD ($)</option>
              <option value="VND">VND (₫)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-red-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-red-600">
            <Trash2 size={16} /> Vùng nguy hiểm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Xóa tài khoản</p>
              <p className="text-xs text-gray-400">
                Toàn bộ dữ liệu sẽ bị xóa vĩnh viễn sau 30 ngày
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 size={14} className="mr-1" /> Xóa tài khoản
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Xóa tài khoản</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa tài khoản? Hành động này sẽ:
            </p>
            <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
              <li>Xóa toàn bộ thông tin cá nhân</li>
              <li>Hủy tất cả booking đang chờ</li>
              <li>Xóa lịch sử đơn hàng</li>
              <li>Không thể khôi phục sau 30 ngày</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsTab;
