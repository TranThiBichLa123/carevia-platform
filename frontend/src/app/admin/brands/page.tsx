"use client";

import Link from "next/link";
import { Badge, Building2, CheckCircle2, Clock3, RefreshCcw, ShieldAlert, Store } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backofficeApi, type AdminAccount } from "@/lib/backofficeApi";
import { formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { deviceApi, type BrandData } from "@/lib/deviceApi";
import { useUserStore } from "@/lib/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6 px-4 py-6 md:px-8 font-vietnam">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Brand</h1>
          <p className="text-sm text-muted-foreground">Theo dõi brand đã hiển thị ngoài marketplace và hàng đợi seller staff đang chờ duyệt.</p>
        </div>
        {/*  NÚT LÀM MỚI CHUẨN THEME: Giữ nguyên 100% logic gốc, bọc hiệu ứng trượt nền cao cấp */}
        <button
          type="button" // Đảm bảo an toàn không kích hoạt submit nhầm form
          onClick={() => void loadData()}
          disabled={loading}
          className="group relative h-9.5 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white px-4 text-[13px] font-medium whitespace-nowrap text-gray-700 shadow-sm transition-all duration-500 hover:border-admin-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer font-vietnam"
        >
          {/* Lớp nền màu xanh Primary trượt từ trái sang phải chiếm trọn nút khi hover chuột vào */}
          <span className="absolute inset-y-0 left-0 w-0 bg-admin-primary transition-all duration-500 ease-out group-hover:w-full" />

          {/* Khung nội dung chữ nổi lên trên lớp nền nhờ z-10 */}
          <div className="relative z-10 flex items-center justify-center text-gray-700 transition-colors duration-500 group-hover:text-white">
            <RefreshCcw
              className={`mr-2 h-3.5 w-3.5 text-gray-400 transition-transform duration-700 ease-in-out group-hover:text-white ${loading ? "animate-spin" : "group-hover:rotate-180"
                }`}
            />
            <span className="relative">Làm mới</span>
          </div>
        </button>

      </div>

      {/* <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Brand entity đã tồn tại trong catalog public. Luồng xét duyệt hiện vẫn đi qua hàng đợi <span className="font-semibold">seller staff</span>; bước gắn hồ sơ brand riêng và khóa/mở brand theo admin cần backend API chuyên dụng để hoàn tất.
      </div> */}

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
        <Card className="w-full overflow-hidden border border-gray-100 bg-white shadow-sm rounded-2xl font-vietnam">
          {/* ĐỒNG BỘ HEADER CARD: Tách nền mờ nhẹ nhàng */}
          <CardHeader className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/10 pb-4">
            <CardTitle className="text-lg font-bold text-gray-900 tracking-tight">Brand đang hiển thị</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-0.5">Danh sách lấy từ catalog hiện có trên website khách hàng.</CardDescription>
          </CardHeader>

          <CardContent className="">
            {loading ? (
              <div className="py-16 text-center text-sm text-muted-foreground">Đang tải danh sách brand...</div>
            ) : brands.length ? (
              /*CHỐNG TRÀN BẢNG: Cho phép cuộn ngang ở màn hình nhỏ và ép cố định độ rộng cột bằng table-fixed */
              <div className="w-full overflow-x-auto rounded-lg">
                <Table className="w-full min-w-[700px] table-auto">
                  <TableHeader>
                    {/* Tiêu đề bảng màu xanh đậm, khóa màu nền tuyệt đối chống lỗi chuyển trắng khi hover */}
                    <TableRow className="bg-admin-primary hover:bg-admin-primary-dark border-none">
                      <TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-[#FFE500] pl-6 w-[25%]">Thương hiệu</TableHead>
                      <TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-white/90 w-[45%]">Mô tả chi tiết</TableHead>
                      <TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-white/90 w-[15%]">Loại nhãn</TableHead>
                      <TableHead className="h-11 text-xs font-bold uppercase tracking-wider text-[#FFE500] pr-6 text-right w-[15%]">Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {brands.slice(0, 12).map((brand) => (
                      <TableRow key={brand.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0">

                        {/* Cột 1: Tên thương hiệu + Slug */}
                        <TableCell className="pl-6 py-3.5">
                          <div className="flex items-center gap-3">
                            {/* 
      Khung chứa ảnh:
      - Thêm `rounded-lg` và `overflow-hidden` để ép ảnh bên trong phải bo góc theo 
    */}
                            <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden flex items-center justify-center">
                              <img
                                src={brand.image}
                                alt={brand.name}
                                /* 
                                  Thêm `rounded-lg` trực tiếp vào ảnh để đảm bảo ảnh bo góc mượt mà,
                                  kết hợp với `object-cover` hoặc `object-contain` tùy thuộc vào ảnh gốc
                                */
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src = "https://placehold.co";
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate">
                                {brand.name}
                              </div>
                              {/* <div className="text-xs text-gray-500 truncate">
        {brand.slug}
      </div> */}
                            </div>
                          </div>
                        </TableCell>


                        {/* Cột 2: Mô tả chi tiết (Ép truncate dấu ba chấm chống tràn chữ làm vỡ bảng) */}
                        <TableCell className="py-3.5">
                          <div
                            className="text-[13px] font-medium text-gray-600 truncate max-w-[320px]"
                            title={brand.description || undefined}
                          >
                            {brand.description || "Chưa có mô tả brand."}
                          </div>
                        </TableCell>

                        {/* Cột 3: Loại nhãn (Featured Badge đồng bộ mịn màng, không lỗi dính dấu) */}
                        <TableCell className="py-3.5">
                          {brand.isFeatured ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold border border-blue-100 bg-blue-50 text-sky-700 uppercase tracking-wider leading-normal">
                              Featured
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300 font-medium italic">Thường</span>
                          )}
                        </TableCell>

                        {/* Cột 4: Trạng thái (Căn phải thẳng hàng tuyệt đối với chữ TRẠNG THÁI) */}
                        <TableCell className="pr-6 py-3.5 text-right">
                          <span className={cn(
                            "inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider shadow-xs leading-normal",
                            brand.isActive
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : "bg-gray-50 border-gray-100 text-gray-600"
                          )}>
                            {brand.isActive ? "Đang hoạt động" : "Đang ẩn"}
                          </span>
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Khung thông báo trống nét đứt tinh tế */
              <div className="mx-6 my-8 rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-400 font-medium">
                Chưa có brand nào được công khai trên marketplace.
              </div>
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
              <Button asChild className="w-full bg-admin-primary hover:bg-admin-primary-dark text-white rounded-lg">
                <Link href="/admin/users">Mở danh sách duyệt seller</Link>
              </Button>
            </CardContent>
          </Card>

          {/* <Card>
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
          </Card> */}
        </div>
      </div>

      {!!featuredBrands.length && (
        <Card>
          <CardHeader>
            <CardTitle>Brand nổi bật</CardTitle>
            <CardDescription>
              {featuredBrands.length} thương hiệu đang được ưu tiên hiển thị trên website.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredBrands.map((brand) => (
                <div key={brand.id} className="group aspect-square w-full [perspective:1000px]">

                  {/* Khung xoay chuyển động */}
                  <div className="relative h-full w-full rounded-2xl  border-transparent bg-transparent  transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                    {/* --- MẶT TRƯỚC (HIỂN THỊ CHÍNH) --- */}
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl [backface-visibility:hidden]">
                      <img
                        src={brand.image}
                        alt={brand.name}

                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co{encodeURIComponent(brand.name)}`;
                        }}
                      />
                    </div>


                    {/* --- MẶT SAU (HIỂN THỊ KHI HOVER) --- */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">Thương hiệu</p>
                      <h4 className="text-base font-bold text-white mb-2">{brand.name}</h4>

                      {/* Nút bấm hành động giả định hoặc xem chi tiết */}
                      <button className="rounded-lg bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/20">
                        Xem sản phẩm
                      </button>
                    </div>

                  </div>
                </div>
              ))}


            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}