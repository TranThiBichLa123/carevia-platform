"use client";

import { Building2, MapPin, Phone, Save, Store } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  backofficeApi,
  type BusinessSettings,
} from "@/lib/backofficeApi";
import { getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";

const EMPTY_SETTINGS: BusinessSettings = {
  businessName: "",
  hotline: "",
  supportEmail: "",
  storeAddress: "",
  storeHours: "",
  supportNote: "",
};

export default function AdminSettingsPage() {
  const { authUser, isAuthenticated } = useUserStore();
  const [form, setForm] = useState<BusinessSettings>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const settings = await backofficeApi.getBusinessSettings();
      setForm(settings);
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải cấu hình doanh nghiệp."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadSettings();
  }, [isAuthenticated, loadSettings]);

  const updateField = <Key extends keyof BusinessSettings>(key: Key, value: BusinessSettings[Key]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await backofficeApi.updateBusinessSettings(form);
      setForm(updated);
      toast.success("Đã cập nhật cấu hình hiển thị doanh nghiệp.");
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể lưu cấu hình doanh nghiệp."));
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản admin để quản lý cấu hình hệ thống.</div>;
  }

  if (authUser?.role !== "ADMIN") {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ admin mới truy cập được trang này.</div>;
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cấu hình thông tin doanh nghiệp</h1>
        <p className="text-sm text-muted-foreground">Những thông tin này sẽ được hiển thị ở footer và các điểm liên hệ ngoài client để đồng bộ trải nghiệm O2O.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Hotline hiện tại</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl"><Phone className="size-5 text-sky-600" />{form.hotline || "Chưa cấu hình"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Email hỗ trợ</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl"><Building2 className="size-5 text-emerald-600" />{form.supportEmail || "Chưa cấu hình"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Showroom / spa</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl"><MapPin className="size-5 text-amber-600" />{form.storeHours || "Chưa cấu hình"}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Biểu mẫu cấu hình</CardTitle>
            <CardDescription>Thay đổi xong là phần hiển thị công khai của client sẽ đọc dữ liệu mới từ backend.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Đang tải cấu hình doanh nghiệp...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Tên doanh nghiệp</span>
                    <input value={form.businessName} onChange={(event) => updateField("businessName", event.target.value)} className="h-11 w-full rounded-md border border-slate-200 px-3 outline-none transition focus:border-slate-400" />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Hotline</span>
                    <input value={form.hotline} onChange={(event) => updateField("hotline", event.target.value)} className="h-11 w-full rounded-md border border-slate-200 px-3 outline-none transition focus:border-slate-400" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Email hỗ trợ</span>
                    <input type="email" value={form.supportEmail} onChange={(event) => updateField("supportEmail", event.target.value)} className="h-11 w-full rounded-md border border-slate-200 px-3 outline-none transition focus:border-slate-400" />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-slate-700">
                    <span>Giờ hoạt động</span>
                    <input value={form.storeHours} onChange={(event) => updateField("storeHours", event.target.value)} className="h-11 w-full rounded-md border border-slate-200 px-3 outline-none transition focus:border-slate-400" />
                  </label>
                </div>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Địa chỉ showroom / spa</span>
                  <input value={form.storeAddress} onChange={(event) => updateField("storeAddress", event.target.value)} className="h-11 w-full rounded-md border border-slate-200 px-3 outline-none transition focus:border-slate-400" />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Ghi chú hỗ trợ</span>
                  <textarea value={form.supportNote} onChange={(event) => updateField("supportNote", event.target.value)} rows={4} className="w-full rounded-md border border-slate-200 px-3 py-2 outline-none transition focus:border-slate-400" />
                </label>
                <div className="flex justify-end">
                  <Button onClick={() => void handleSave()} disabled={saving}>
                    <Save className="mr-2 size-4" />{saving ? "Đang lưu..." : "Lưu cấu hình"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-950 text-white">
          <CardHeader>
            <CardDescription className="text-slate-400">Preview client-facing</CardDescription>
            <CardTitle className="text-white">Cách website sẽ hiển thị</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/80">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-white">
                <Store className="size-5 text-sky-300" />
                <span className="font-semibold">{form.businessName || "Tên doanh nghiệp"}</span>
              </div>
              <p className="mt-3">Hotline: {form.hotline || "Chưa cấu hình"}</p>
              <p>Email: {form.supportEmail || "Chưa cấu hình"}</p>
              <p>Địa chỉ: {form.storeAddress || "Chưa cấu hình"}</p>
              <p>Khung giờ: {form.storeHours || "Chưa cấu hình"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
              <p className="leading-6">{form.supportNote || "Ghi chú hỗ trợ sẽ xuất hiện ở footer công khai để hướng dẫn khách đặt lịch hoặc liên hệ spa trước khi đến."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}