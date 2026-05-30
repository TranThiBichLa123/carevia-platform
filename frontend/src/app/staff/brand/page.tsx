"use client";

import Image from "next/image";
import { Loader2, Save, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { backofficeApi, type StaffDeviceBrand } from "@/lib/backofficeApi";
import { getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";

export default function StaffBrandPage() {
  const { authUser, refreshProfile } = useUserStore();
  const [brand, setBrand] = useState<StaffDeviceBrand | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadBrand = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backofficeApi.getStaffBrand();
      setBrand(response);
      setName(response.name || "");
      setDescription(response.description || "");
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải hồ sơ brand."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBrand();
  }, [loadBrand]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Tên brand không được để trống.");
      return;
    }

    try {
      setSaving(true);
      const updatedBrand = await backofficeApi.updateStaffBrand({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setBrand(updatedBrand);
      await refreshProfile();
      toast.success("Đã cập nhật hồ sơ brand.");
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật hồ sơ brand."));
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const uploadResult = await backofficeApi.uploadStaffBrandImage(file);
      setBrand((current) =>
        current
          ? {
            ...current,
            image: uploadResult.imageUrl,
            imagePublicId: uploadResult.imagePublicId,
          }
          : current
      );
      toast.success("Đã cập nhật avatar brand.");
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải avatar brand lên."));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" /> Đang tải hồ sơ brand...
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Không tìm thấy brand được gán cho tài khoản staff này.
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-1 md:px-8 font-vietnam">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ brand</h1>
        <p className="text-sm text-muted-foreground">
          Cập nhật tên hiển thị, mô tả và avatar cho brand mà bạn đang vận hành.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{brand.name}</CardTitle>
          <CardDescription>
            Workspace hiện tại: {authUser?.brand_name || brand.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {brand.image ? (
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={320}
                  height={320}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-sm text-slate-500">
                  Chưa có avatar brand
                </div>
              )}
            </div>
            <label className="block">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => void handleUpload(event)}
                disabled={uploading}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 border-slate-200 bg-white text-slate-700 font-medium text-sm rounded-lg shadow-sm transition-all duration-200 ease-in-out  hover:border-slate-300 hover:text-slate-900 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm"
                disabled={uploading}
                asChild
              >
                <span className="flex items-center justify-center gap-2">
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin text-slate-400" />
                  ) : (
                    <Upload className="size-4 text-slate-500 transition-transform duration-200 " />
                  )}
                  {uploading ? "Đang tải ảnh..." : "Đổi avatar brand"}
                </span>
              </Button>

            </label>
            <p className="text-xs text-muted-foreground">
              Hỗ trợ JPG, PNG, WEBP. Ảnh mới sẽ ghi đè logo cũ của brand.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tên thương hiệu
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nhập tên thương hiệu..."
                className="h-10 border border-slate-200 bg-white shadow-none transition-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200 placeholder:text-slate-400"
              />
            </div>


            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Đường dẫn tĩnh (Slug)
              </label>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {brand.slug}
              </div>
              <p className="text-xs text-muted-foreground">
                Slug sẽ được backend cập nhật tự động nếu tên brand thay đổi.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Mô tả hoạt động
              </label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Giới thiệu ngắn về thương hiệu, nhóm sản phẩm chính và định vị cốt lõi của bạn trên sàn..."
                className="min-h-[140px] border border-slate-200 bg-white shadow-none resize-none transition-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200 leading-relaxed text-sm placeholder:text-slate-400"
              />
            </div>


            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className="h-10 px-5 bg-[#173E77] text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:bg-[#052962] hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm"
            >
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              {saving ? "Đang lưu..." : "Lưu hồ sơ brand"}
            </Button>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
