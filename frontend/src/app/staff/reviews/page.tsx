"use client";

import { Loader2, MessageSquareMore, RefreshCw, Search, ShieldAlert, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { backofficeApi } from "@/lib/backofficeApi";
import { formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { reviewApi, type ReviewData } from "@/lib/deviceApi";
import { useUserStore } from "@/lib/store";

type StaffReviewItem = ReviewData & {
  deviceId: number;
  deviceName: string;
  brandName: string | null;
};

export default function StaffReviewsPage() {
  const { authUser, isAuthenticated } = useUserStore();
  const [reviews, setReviews] = useState<StaffReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const devicesResponse = await backofficeApi.getStaffDevices({ page: 0, size: 24 });
      const devices = devicesResponse.items || [];

      const reviewGroups = await Promise.all(
        devices.map(async (device) => {
          const response = await reviewApi.getByDevice(device.id, { page: 0, size: 5 });
          return (response.items || []).map((review) => ({
            ...review,
            deviceId: device.id,
            deviceName: device.name,
            brandName: device.brand?.name || null,
          }));
        })
      );

      const mergedReviews = reviewGroups
        .flat()
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

      setReviews(mergedReviews);
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải review của catalog brand."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadReviews();
  }, [isAuthenticated, loadReviews]);

  if (!isAuthenticated) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản Brand Staff để xem review.</div>;
  }

  if (authUser?.role !== "STAFF") {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ Brand Staff mới truy cập được trang này.</div>;
  }

  const normalizedSearch = search.trim().toLowerCase();
  const filteredReviews = reviews.filter((review) => {
    if (!normalizedSearch) {
      return true;
    }

    const haystack = [review.deviceName, review.brandName, review.accountName, review.comment, review.adminReply]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const verifiedCount = filteredReviews.filter((review) => review.isVerifiedPurchase).length;
  const deviceCount = new Set(filteredReviews.map((review) => review.deviceId)).size;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM & Đánh giá</h1>
          <p className="text-sm text-muted-foreground">Brand Staff theo dõi phản hồi khách hàng trên catalog đang quản lý thay vì để platform admin đi trả lời review.</p>
        </div>
        <Button variant="outline" onClick={() => void loadReviews()} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Làm mới review
        </Button>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Trang này hiện đang ở chế độ <span className="font-semibold">read-only</span>. Kiến trúc role đã chuyển quyền sở hữu review sang Brand Staff, nhưng backend chưa có API brand-scoped để phản hồi hoặc ẩn spam theo từng brand.
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Review đang hiển thị</CardDescription>
            <CardTitle className="flex items-center gap-3 text-3xl"><MessageSquareMore className="size-6 text-sky-600" />{filteredReviews.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Đã xác minh mua hàng</CardDescription>
            <CardTitle className="flex items-center gap-3 text-3xl"><ShieldAlert className="size-6 text-emerald-600" />{verifiedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Sản phẩm có review</CardDescription>
            <CardTitle className="flex items-center gap-3 text-3xl"><Star className="size-6 text-amber-500" />{deviceCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Danh sách review</CardTitle>
              <CardDescription>Hiển thị review theo catalog mà workspace seller đang quản lý.</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo sản phẩm, khách hàng hoặc nội dung..."
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-sky-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex min-h-[30vh] items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : filteredReviews.length ? (
            filteredReviews.map((review) => (
              <div key={`${review.deviceId}-${review.id}`} className="rounded-2xl border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-slate-900">{review.deviceName}</p>
                      <p className="text-sm text-slate-500">{review.brandName || "Brand chưa xác định"}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="font-medium">{review.accountName}</span>
                      {review.isVerifiedPurchase && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Đã mua hàng</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`size-4 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">{formatDateTime(review.createdAt)}</div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                  {review.comment || "Khách hàng chưa để lại bình luận."}
                </div>

                {review.adminReply?.trim() && (
                  <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-900">
                    <div className="font-semibold">Phản hồi công khai hiện có</div>
                    <div className="mt-1">{review.adminReply}</div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Chưa có review nào phù hợp với bộ lọc hiện tại.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}