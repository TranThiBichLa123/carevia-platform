"use client";

import { Loader2, MessageSquareMore, RefreshCw, Search, SendHorizontal, ShieldAlert, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { backofficeApi } from "@/lib/backofficeApi";
import { formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { reviewApi, type ReviewData } from "@/lib/deviceApi";
import { useUserStore } from "@/lib/store";

const STAFF_REPLY_EDIT_WINDOW_MINUTES = 30;
const STAFF_REPLY_EDIT_WINDOW_MS = STAFF_REPLY_EDIT_WINDOW_MINUTES * 60 * 1000;
const STAFF_REPLY_MAX_EDITS = 2;

function getReplyEditState(review: ReviewData) {
  const hasReply = Boolean(review.adminReply?.trim());

  if (!hasReply) {
    return {
      canEdit: true,
      reason: `Sau khi đăng, phản hồi chỉ được chỉnh sửa trong ${STAFF_REPLY_EDIT_WINDOW_MINUTES} phút và tối đa ${STAFF_REPLY_MAX_EDITS} lần.`,
    };
  }

  const editCount = review.adminReplyEditCount ?? 0;
  if (editCount >= STAFF_REPLY_MAX_EDITS) {
    return {
      canEdit: false,
      reason: `Phản hồi này đã dùng hết ${STAFF_REPLY_MAX_EDITS} lần chỉnh sửa.`,
    };
  }

  if (review.adminReplyCreatedAt) {
    const editableUntil = new Date(review.adminReplyCreatedAt).getTime() + STAFF_REPLY_EDIT_WINDOW_MS;
    if (Date.now() > editableUntil) {
      return {
        canEdit: false,
        reason: `Phản hồi chỉ được chỉnh sửa trong vòng ${STAFF_REPLY_EDIT_WINDOW_MINUTES} phút kể từ khi đăng.`,
      };
    }
  }

  return {
    canEdit: true,
    reason: `Bạn còn ${STAFF_REPLY_MAX_EDITS - editCount} lần chỉnh sửa trong khoảng ${STAFF_REPLY_EDIT_WINDOW_MINUTES} phút kể từ lúc đăng phản hồi.`,
  };
}

type StaffReviewItem = ReviewData & {
  deviceId: number;
  deviceName: string;
  brandName: string | null;
};

export default function StaffReviewsPage() {
  const { authUser, isAuthenticated } = useUserStore();
  const [reviews, setReviews] = useState<StaffReviewItem[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<number | null>(null);
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
      setReplyDrafts(
        Object.fromEntries(
          mergedReviews.map((review) => [review.id, review.adminReply ?? ""])
        )
      );
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải review của catalog brand."));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReplyChange = useCallback((reviewId: number, value: string) => {
    setReplyDrafts((current) => ({
      ...current,
      [reviewId]: value,
    }));
  }, []);

  const handleReplySubmit = useCallback(async (review: StaffReviewItem) => {
    const trimmedReply = (replyDrafts[review.id] ?? "").trim();

    if (!trimmedReply) {
      toast.error("Vui lòng nhập nội dung phản hồi trước khi gửi.");
      return;
    }

    try {
      setSubmittingReviewId(review.id);
      const updatedReview = await backofficeApi.replyToStaffReview(review.id, { adminReply: trimmedReply });
      setReviews((current) => current.map((item) => item.id === review.id ? { ...item, ...updatedReview } : item));
      setReplyDrafts((current) => ({
        ...current,
        [review.id]: updatedReview.adminReply ?? trimmedReply,
      }));
      toast.success(review.adminReply?.trim() ? "Đã cập nhật phản hồi cho khách hàng." : "Đã gửi phản hồi cho khách hàng.");
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể gửi phản hồi cho khách hàng."));
    } finally {
      setSubmittingReviewId(null);
    }
  }, [replyDrafts]);

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
        <button
          type="button" // Đảm bảo không bị kích hoạt submit form ngoài ý muốn
          onClick={() => void loadReviews()}
          disabled={loading}
          className="group relative h-9 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white px-4 text-[13px]  whitespace-nowrap text-gray-700 shadow-xs transition-all duration-500 hover:border-staff-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer font-vietnam"
        >
          {/* Lớp nền màu xanh trượt mượt mà từ trái sang phải khi hover chuột vào */}
          <span className="absolute inset-y-0 left-0 w-0 bg-staff-primary transition-all duration-500 ease-out group-hover:w-full" />

          {/* Khung nội dung chữ nổi lên trên nền xanh nhờ lớp z-10 */}
          <div className="relative z-10 flex items-center justify-center text-gray-700 transition-colors duration-500 group-hover:text-white">
            <RefreshCw
              className={`mr-2 h-3.5 w-3.5 text-gray-400 transition-transform duration-700 ease-in-out group-hover:text-white ${loading ? "animate-spin" : "group-hover:rotate-180"
                }`}
            />
            <span className="relative">Làm mới review</span>
          </div>
        </button>

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
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-staff-primary"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 font-vietnam">
          {loading ? (
            <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-staff-primary" />
              <span className="text-sm font-medium text-gray-400">Đang tải danh sách đánh giá...</span>
            </div>
          ) : filteredReviews.length ? (
            filteredReviews.map((review) => (
              /* 🌟 NÂNG CẤP KHỐI ĐÁNH GIÁ: Bo góc rounded-2xl mềm mại, viền gray-100 tinh tế và hiệu ứng hover nhẹ */
              <div key={`${review.deviceId}-${review.id}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                {(() => {
                  const draftReply = replyDrafts[review.id] ?? review.adminReply ?? "";
                  const normalizedDraftReply = draftReply.trim();
                  const normalizedExistingReply = review.adminReply?.trim() ?? "";
                  const isSubmittingReply = submittingReviewId === review.id;
                  const hasExistingReply = Boolean(normalizedExistingReply);
                  const isReplyUnchanged = normalizedDraftReply === normalizedExistingReply;
                  const replyEditState = getReplyEditState(review);
                  const replyTimestamp = review.adminReplyEditedAt || review.adminReplyCreatedAt;
                  const shouldLockReplyEditing = hasExistingReply && !replyEditState.canEdit;
                  const disableSubmit = isSubmittingReply
                    || !normalizedDraftReply
                    || (hasExistingReply && (isReplyUnchanged || shouldLockReplyEditing));

                  return (
                    <>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div>
                      <p className="font-bold text-gray-900 tracking-tight text-base">{review.deviceName}</p>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">{review.brandName || "Brand chưa xác định"}</p>
                    </div>

                    {/* Căn chỉnh thông tin người dùng và Badge Đã mua hàng (Cân đối không lỗi dính dấu) */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                      <span className="font-semibold text-gray-700">{review.accountName}</span>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-100 bg-emerald-50 text-emerald-700 uppercase tracking-wider leading-normal">
                          Đã mua hàng
                        </span>
                      )}
                    </div>

                    {/* Cụm sao đánh giá màu hổ phách sang trọng */}
                    <div className="flex items-center gap-0.5 pt-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`size-4 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>

                  {/* Thời gian căn phải ở màn hình lớn, chữ mờ nhẹ nhàng */}
                  <div className="text-xs font-medium text-gray-400 md:text-right">{formatDateTime(review.createdAt)}</div>
                      </div>

                {/* Khung nội dung bình luận của khách hàng */}
                <div className="mt-4 rounded-xl bg-gray-50/70 p-3.5 text-[13.5px] font-medium text-gray-700 leading-relaxed border border-gray-50">
                  {review.comment || "Khách hàng chưa để lại bình luận."}
                </div>

                      <div className="mt-3.5 rounded-xl border border-blue-100/50 bg-blue-50/30 p-3.5 text-[13.5px] text-gray-800 leading-relaxed">
                        <div className="font-bold text-staff-primary text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <div className="size-1.5 rounded-full bg-staff-primary animate-pulse" />
                          {hasExistingReply ? "Phản hồi công khai với khách hàng" : "Phản hồi khách hàng"}
                        </div>
                        {replyTimestamp && (
                          <p className="text-[11px] text-gray-500">
                            {formatDateTime(replyTimestamp)}
                            {review.adminReplyEdited ? <span className="italic"> (Đã chỉnh sửa)</span> : null}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">Nội dung này sẽ hiển thị công khai với khách trên phần đánh giá sản phẩm.</p>
                        <Textarea
                          value={draftReply}
                          onChange={(event) => handleReplyChange(review.id, event.target.value)}
                          placeholder="Nhập nội dung phản hồi để giải đáp hoặc cảm ơn khách hàng..."
                          rows={4}
                          maxLength={2000}
                          disabled={isSubmittingReply || shouldLockReplyEditing}
                          className="mt-3 resize-none border-blue-100 bg-white/90 text-sm leading-relaxed focus-visible:ring-staff-primary"
                        />
                        <div className="mt-3 flex flex-col gap-2 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
                          <span>{replyEditState.reason}</span>
                          <span>{normalizedDraftReply.length}/2000 ký tự • Đã sửa {review.adminReplyEditCount ?? 0}/{STAFF_REPLY_MAX_EDITS} lần</span>
                          <Button
                            type="button"
                            onClick={() => void handleReplySubmit(review)}
                            disabled={disableSubmit}
                            className="min-w-36 bg-staff-primary text-white hover:bg-staff-primary/90"
                          >
                            {isSubmittingReply ? <Loader2 className="mr-2 size-4 animate-spin" /> : <SendHorizontal className="mr-2 size-4" />}
                            {hasExistingReply ? "Cập nhật phản hồi" : "Gửi phản hồi"}
                          </Button>
                        </div>
                      </div>
                    </>
                  );
                })()}
                  </div>
            ))
          ) : (
            /* Khung thông báo trống mềm mại với viền nét đứt gray-200 */
            <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-12 text-center text-sm text-gray-400 font-medium">
              Chưa có review nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </CardContent>

      </Card>
    </div>
  );
}