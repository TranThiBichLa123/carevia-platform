"use client";

import { ChevronUp, Eye, EyeOff, RefreshCcw, Star, ChevronDown, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  backofficeApi,
  type AdminReview,
} from "@/lib/backofficeApi";
import { formatDateTime, getBackofficeErrorMessage } from "@/lib/backofficeUtils";
import { useUserStore } from "@/lib/store";
import { cn } from "@/components/pages/OrdersPage";

type VisibilityFilter = "ALL" | "VISIBLE" | "HIDDEN";

export default function AdminReviewsPage() {
  const { authUser, isAuthenticated } = useUserStore();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("ALL");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await backofficeApi.getAdminReviews({
        search: search.trim() || undefined,
        hidden:
          visibilityFilter === "ALL"
            ? undefined
            : visibilityFilter === "HIDDEN",
        page: 0,
        size: 100,
      });
      setReviews(response.items || []);
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể tải danh sách đánh giá."));
    } finally {
      setLoading(false);
    }
  }, [search, visibilityFilter]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void loadReviews();
  }, [isAuthenticated, loadReviews]);

  const handleToggleVisibility = async (review: AdminReview) => {
    try {
      setActingId(review.id);
      await backofficeApi.moderateAdminReview(review.id, { hidden: !review.isHidden });
      toast.success(review.isHidden ? "Đã hiển thị lại đánh giá." : "Đã ẩn đánh giá khỏi client.");
      await loadReviews();
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật trạng thái hiển thị."));
    } finally {
      setActingId(null);
    }
  };
  // Hook Quản lý các ô đang được mở rộng (Sử dụng Object Record để lưu trạng thái mở cho từng id)
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  if (!isAuthenticated) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản admin để quản lý đánh giá.</div>;
  }

  if (authUser?.role !== "ADMIN") {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ admin mới truy cập được trang này.</div>;
  }
  const handleRefresh = useCallback(() => {
    setVisibilityFilter("ALL");
    setSearch("");
    void loadReviews();
  }, [loadReviews]);

  const hiddenCount = reviews.filter((review) => review.isHidden).length;
  const visibleCount = reviews.length - hiddenCount;
  const legacyReplyCount = reviews.filter((review) => Boolean(review.adminReply?.trim())).length;
  const verifiedCount = reviews.filter((review) => review.isVerifiedPurchase).length;
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kiểm duyệt nội dung đánh giá</h1>
        <p className="text-sm text-muted-foreground">Platform Admin chỉ kiểm duyệt review toàn sàn, xử lý nội dung vi phạm và theo dõi trạng thái hiển thị. Phản hồi review thông thường thuộc về Brand Staff.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Đánh giá đang hiển thị</CardDescription>
            <CardTitle className="text-3xl">{visibleCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Đánh giá đang bị ẩn</CardDescription>
            <CardTitle className="text-3xl">{hiddenCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Đã xác minh mua hàng</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl"><Star className="size-6 text-amber-500" />{verifiedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* {legacyReplyCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Có {legacyReplyCount} review vẫn đang chứa phản hồi công khai từ phiên bản cũ. Trang này chỉ hiển thị để admin theo dõi lịch sử moderation, không tạo phản hồi mới.
        </div>
      )} */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Danh sách đánh giá</CardTitle>
              <CardDescription>{reviews.length} đánh giá trong kết quả hiện tại.</CardDescription>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center font-vietnam">

              {/* 1. Ô tìm kiếm thông minh tích hợp Icon */}
              <div className="relative w-full sm:w-80 group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400 group-focus-within:text-admin-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm theo thiết bị, khách hàng, nội dung..."
                  className="h-9.5 w-full rounded-md border border-gray-100 bg-white pl-9 pr-4 text-[13px] font-medium text-gray-700 placeholder-gray-400 outline-none shadow-sm hover:border-gray-200 focus:border-admin-primary transition-all duration-300"
                />
              </div>

              {/* 2. Bộ lọc Trạng thái Custom Hover (Không dùng Select thô cứng) */}
              <div className="relative group min-w-40 w-full sm:w-auto">
                {/* Nút hiển thị */}
                <div className="flex h-9.5 items-center justify-between rounded-md border border-gray-100 bg-white px-3 py-2 shadow-sm transition-all hover:border-gray-200">
                  <span className="text-[13px] font-medium text-gray-700 whitespace-nowrap">
                    {visibilityFilter === "ALL" && "Tất cả trạng thái"}
                    {visibilityFilter === "VISIBLE" && "Đang hiển thị"}
                    {visibilityFilter === "HIDDEN" && "Đang ẩn"}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Danh sách lựa chọn ẩn/hiện mượt mà khi hover chuột qua */}
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="flex flex-col whitespace-nowrap">
                    {[
                      { value: "ALL", label: "Tất cả trạng thái" },
                      { value: "VISIBLE", label: "Đang hiển thị" },
                      { value: "HIDDEN", label: "Đang ẩn" }
                    ].map((item) => (
                      <div
                        key={item.value}
                        onClick={() => setVisibilityFilter(item.value as VisibilityFilter)}
                        className={`px-3 py-2.5 text-[13px] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${visibilityFilter === item.value ? 'text-admin-primary font-bold bg-gray-50' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Nút Làm mới: Trượt nền màu Primary và giữ nguyên sắc độ khi chuột ở đó */}
              <button
                onClick={() => void handleRefresh()} // Bạn có thể đổi lại thành loadReviews() nếu không muốn reset ô input tìm kiếm
                disabled={loading}
                className={cn(
                  "group relative overflow-hidden w-full sm:w-auto",
                  "text-[13px] font-medium whitespace-nowrap",
                  "border border-gray-100 bg-white text-gray-700",
                  "hover:border-admin-primary transition-all duration-500",
                  "h-9.5 shrink-0 rounded-md px-4 shadow-sm active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {/* Lớp nền trượt màu Primary thương hiệu */}
                <span className="absolute inset-y-0 left-0 w-0 bg-admin-primary transition-all duration-500 ease-out group-hover:w-full" />

                {/* Nội dung chữ và Icon xoay chuyển màu trắng mượt mà */}
                <div className="relative z-10 flex items-center justify-center text-gray-700 group-hover:text-white transition-colors duration-500">
                  <RefreshCcw
                    className={cn(
                      "w-3.5 h-3.5 mr-2 transition-transform duration-700 ease-in-out text-gray-400 group-hover:text-white",
                      loading ? "animate-spin" : "group-hover:rotate-180"
                    )}
                  />
                  <span className="relative">Làm mới</span>
                </div>
              </button>

            </div>

          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Đang tải đánh giá...</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
              <Table className="w-full border-collapse font-vietnam">
                <TableHeader className="bg-admin-primary border-b border-gray-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-55 py-3.5 pl-6 text-[12px] font-bold font-vietnam text-[#FFE500]">THIẾT BỊ / KHÁCH HÀNG</TableHead>
                    <TableHead className="min-w-70 py-3.5 text-[12px] font-bold font-vietnam text-white">NỘI DUNG ĐÁNH GIÁ</TableHead>
                    <TableHead className="text-[12px] font-bold font-vietnam text-white py-3.5">TRẠNG THÁI</TableHead>
                    <TableHead className="min-w-70 py-3.5 text-[12px] font-bold font-vietnam text-white">PHẢN HỒI CÔNG KHAI HIỆN CÓ</TableHead>
                    <TableHead className="text-[12px] font-bold font-vietnam text-white py-3.5">THỜI GIAN</TableHead>
                    <TableHead className="text-[12px] font-bold font-vietnam text-[#FFE500] py-3.5 pr-6 text-right">THAO TÁC</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-50">
                  {reviews.map((review) => {
                    const isActing = actingId === review.id;
                    const isExpanded = !!expandedRows[review.id];

                    return (
                      <TableRow key={review.id} className="hover:bg-gray-50/30 transition-colors group">

                        {/* 🌟 CỘT 1: THIẾT BỊ (CÓ ẢNH) & KHÁCH HÀNG (CÓ AVATAR) */}
                        <TableCell className="py-4 pl-6 align-top">
                          <div className="flex flex-col gap-3">
                            {/* Phần Thiết bị: Ảnh vuông góc trái */}
                            <div className="flex items-center gap-2.5">
                              {/* <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 shrink-0 overflow-hidden shadow-inner">
                                <img
                                  src={review.deviceImage || undefined} // Thay bằng thuộc tính ảnh thiết bị từ DB của bạn
                                  alt={review.deviceName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.currentTarget.src = "https://unsplash.com"; }}
                                />
                              </div> */}
                              <p className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-admin-primary transition-colors">
                                {review.deviceName || "Thiết bị không xác định"}
                              </p>
                            </div>

                            {/* Phần Khách hàng: Avatar tròn phía dưới */}
                            <div className="flex items-center gap-2 border-t border-gray-50 pt-2">
                              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200/50 bg-linear-to-br from-gray-100 to-gray-200 text-[10px] font-bold text-gray-500 shadow-sm">
                                {review.accountAvatar ? (
                                  <img
                                    src={review.accountAvatar || undefined} // Thay bằng thuộc tính avatar của khách hàng
                                    alt={review.accountName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                ) : null}
                                <span className="absolute z-0">{review.accountName?.charAt(0).toUpperCase()}</span>
                              </div>
                              <p className="text-[12px] text-gray-500 font-medium truncate">
                                By: <span className="text-gray-700 font-semibold">{review.accountName}</span>
                              </p>
                            </div>

                            {/* Số sao đánh giá */}
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={cn("w-3 h-3", index < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200")}
                                />
                              ))}
                            </div>
                          </div>
                        </TableCell>

                        {/* 🌟 CỘT 2: NỘI DUNG BÌNH LUẬN (TỰ ĐỘNG THU GỌN - CLICK ĐỂ MỞ) */}
                        <TableCell className="py-4 align-top max-w-sm">
                          <div
                            onClick={() => toggleRowExpansion(review.id)}
                            className={cn(
                              "bg-gray-50/50 border border-gray-100/50 rounded-lg p-3 hover:bg-white hover:border-gray-200 cursor-pointer transition-all relative overflow-hidden group/box",
                              isExpanded ? "max-h-none pb-8" : "max-h-19"
                            )}
                          >
                            <p className={cn(
                              "text-[13px] text-gray-600 font-medium leading-relaxed whitespace-pre-line",
                              !isExpanded && "line-clamp-2"
                            )}>
                              {review.comment || <span className="text-gray-300 italic">Khách hàng không để lại bình luận.</span>}
                            </p>

                            {/* Icon mũi tên nhỏ báo hiệu có thể click mở rộng */}
                            {review.comment && (
                              <div className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[10px] font-bold text-gray-400 group-hover/box:text-admin-primary transition-colors">
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* CỘT 3: TRẠNG THÁI */}
                        <TableCell className="py-4 align-top">
                          <div className="flex flex-col gap-1.5 items-start pt-0.5">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-sm",
                              review.isHidden ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            )}>
                              {review.isHidden ? "Đang ẩn" : "Hiển thị"}
                            </span>
                            {review.isVerifiedPurchase && (
                              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-600 uppercase tracking-wide">
                                Đã mua hàng
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* 🌟 CỘT 4: PHẢN HỒI ADMIN (TỰ ĐỘNG THU GỌN - CLICK ĐỂ MỞ) */}
                        <TableCell className="py-4 align-top max-w-sm">
                          {review.adminReply?.trim() ? (
                            <div
                              onClick={() => toggleRowExpansion(review.id)}
                              className={cn(
                                "relative cursor-pointer overflow-hidden rounded-lg border border-primary/10 bg-primary/5 p-3 transition-all hover:bg-primary/8 group/reply",
                                isExpanded ? "max-h-none pb-8" : "max-h-19"
                              )}
                            >
                              <p className={cn(
                                "text-[13px] text-gray-700 font-medium leading-relaxed whitespace-pre-line",
                                !isExpanded && "line-clamp-2"
                              )}>
                                {review.adminReply}
                              </p>
                              <div className="absolute bottom-1 right-2 text-gray-400 group-hover/reply:text-admin-primary">
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </div>
                            </div>
                          ) : (
                            <div className="pt-2 pl-1">
                              <span className="text-gray-300 italic text-[12px]">Chưa có phản hồi.</span>
                            </div>
                          )}
                        </TableCell>

                        {/* CỘT 5: THỜI GIAN */}
                        <TableCell className="py-4 align-top text-[12px] font-medium whitespace-nowrap pt-4.5">
                          <div className="text-gray-600 font-semibold">{formatDateTime(review.createdAt)}</div>
                          <div className="mt-1 text-gray-400 text-[11px]">Sửa: {formatDateTime(review.updatedAt)}</div>
                        </TableCell>

                        {/* CỘT 6: THAO TÁC KIỂM DUYỆT */}
                        <TableCell className="py-4 pr-6 align-top text-right">
                          <div className="flex justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity pt-1">
                            <button
                              disabled={isActing}
                              onClick={() => void handleToggleVisibility(review)}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold active:scale-95 disabled:opacity-50 transition-all",
                                review.isHidden ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "bg-rose-50 hover:bg-rose-100 border border-rose-200/60 text-rose-600"
                              )}
                            >
                              {review.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              {review.isHidden ? "Khôi phục hiển thị" : "Ẩn khỏi client"}
                            </button>
                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}