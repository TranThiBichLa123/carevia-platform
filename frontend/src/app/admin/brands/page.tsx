"use client";

import Link from "next/link";
import { Building2, CheckCircle2, Clock3, RefreshCcw, ShieldAlert, Store } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backofficeApi, type AdminAccount } from "@/lib/backofficeApi";
import { formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { deviceApi, type BrandData } from "@/lib/deviceApi";
import { useUserStore } from "@/lib/store";

export default function AdminBrandsPage() {
  const { authUser, isAuthenticated } = useUserStore();
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [brandData, accountData] = await Promise.all([
        deviceApi.getBrands(),
        backofficeApi.getAdminAccounts({ page: 0, size: 200 }),
      ]);
      setBrands(brandData || []);
      setAccounts(accountData.items || []);
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải dữ liệu brand marketplace."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadData();
  }, [isAuthenticated, loadData]);

  if (!isAuthenticated) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản Platform Admin để quản lý brand.</div>;
  }

  if (authUser?.role !== "ADMIN") {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ Platform Admin mới truy cập được trang này.</div>;
  }

  const pendingSellerAccounts = accounts.filter(
    (account) => account.role === "STAFF" && account.status === "PENDING_APPROVAL"
  );
  const featuredBrands = brands.filter((brand) => brand.isFeatured);
  const activeBrands = brands.filter((brand) => brand.isActive);

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Brand</h1>
          <p className="text-sm text-muted-foreground">Theo dõi brand đã hiển thị ngoài marketplace và hàng đợi seller staff đang chờ duyệt.</p>
        </div>
        <Button variant="outline" onClick={() => void loadData()} disabled={loading}>
          <RefreshCcw className={loading ? "animate-spin" : ""} />
          Làm mới
        </Button>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Brand entity đã tồn tại trong catalog public. Luồng xét duyệt hiện vẫn đi qua hàng đợi <span className="font-semibold">seller staff</span>; bước gắn hồ sơ brand riêng và khóa/mở brand theo admin cần backend API chuyên dụng để hoàn tất.
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Tổng brand trên marketplace</CardDescription>
            <CardTitle className="flex items-center gap-3 text-3xl"><Store className="size-6 text-sky-600" />{brands.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Brand đang hoạt động</CardDescription>
            <CardTitle className="flex items-center gap-3 text-3xl"><CheckCircle2 className="size-6 text-emerald-600" />{activeBrands.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Seller staff chờ duyệt</CardDescription>
            <CardTitle className="flex items-center gap-3 text-3xl"><Clock3 className="size-6 text-amber-600" />{pendingSellerAccounts.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Brand đang hiển thị</CardTitle>
            <CardDescription>Danh sách lấy từ catalog hiện có trên website khách hàng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Đang tải danh sách brand...</div>
            ) : brands.length ? (
              brands.slice(0, 12).map((brand) => (
                <div key={brand.id} className="flex items-start justify-between gap-4 rounded-xl border p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">{brand.name}</p>
                      {brand.isFeatured && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">Featured</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{brand.description || "Chưa có mô tả brand."}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${brand.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {brand.isActive ? "Đang hoạt động" : "Đang ẩn"}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Chưa có brand nào được công khai trên marketplace.</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hàng đợi seller onboarding</CardTitle>
              <CardDescription>Các tài khoản Brand Staff đang chờ platform admin xét duyệt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingSellerAccounts.length ? (
                pendingSellerAccounts.slice(0, 6).map((account) => (
                  <div key={account.accountId} className="rounded-xl border p-3">
                    <div className="font-semibold text-slate-900">{account.username}</div>
                    <div className="text-sm text-slate-600">{account.email}</div>
                    <div className="mt-1 text-xs text-slate-500">Tạo lúc: {formatDateTime(account.createdAt)}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Không có seller staff nào đang chờ duyệt.</div>
              )}
              <Button asChild className="w-full">
                <Link href="/admin/users">Mở danh sách duyệt seller</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quy tắc marketplace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border bg-slate-50 p-3">Brand Staff chỉ nên thao tác trên dữ liệu thuộc brand của mình.</div>
              <div className="rounded-xl border bg-slate-50 p-3">Platform Admin duyệt brand, giám sát moderation và không trực tiếp vận hành shop.</div>
              <div className="rounded-xl border bg-slate-50 p-3">Client chỉ nhìn thấy brand và sản phẩm sau khi brand được duyệt hiển thị.</div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <ShieldAlert className="mb-2 size-4" />
                Commission, khóa brand và hồ sơ pháp lý brand cần API admin riêng để hoàn chỉnh RBAC marketplace.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!!featuredBrands.length && (
        <Card>
          <CardHeader>
            <CardTitle>Brand nổi bật</CardTitle>
            <CardDescription>{featuredBrands.length} brand đang được đánh dấu featured trên website khách hàng.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {featuredBrands.map((brand) => (
              <span key={brand.id} className="rounded-full border bg-white px-3 py-1 text-sm text-slate-700">
                {brand.name}
              </span>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}