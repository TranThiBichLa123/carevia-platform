"use client";

import { Eye, EyeOff, MessageSquareReply, RefreshCcw, Star } from "lucide-react";
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

  const handleReply = async (review: AdminReview) => {
    const reply = window.prompt("Nhập phản hồi cho đánh giá", review.adminReply || "");
    if (reply === null) {
      return;
    }

    try {
      setActingId(review.id);
      await backofficeApi.moderateAdminReview(review.id, { adminReply: reply });
      toast.success("Đã cập nhật phản hồi admin.");
      await loadReviews();
    } catch (error) {
      toast.error(getBackofficeErrorMessage(error, "Không thể cập nhật phản hồi."));
    } finally {
      setActingId(null);
    }
  };

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

  if (!isAuthenticated) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Đăng nhập bằng tài khoản admin để quản lý đánh giá.</div>;
  }

  if (authUser?.role !== "ADMIN") {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">Chỉ admin mới truy cập được trang này.</div>;
  }

  const hiddenCount = reviews.filter((review) => review.isHidden).length;
  const repliedCount = reviews.filter((review) => Boolean(review.adminReply?.trim())).length;
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6 px-4 py-6 md:px-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM & đánh giá khách hàng</h1>
        <p className="text-sm text-muted-foreground">Duyệt nội dung review, ẩn đánh giá không phù hợp và phản hồi công khai để tăng độ tin cậy cho phiên trải nghiệm lẫn bán thiết bị.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Đánh giá đang hiển thị</CardDescription>
            <CardTitle className="text-3xl">{reviews.length - hiddenCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Đã phản hồi</CardDescription>
            <CardTitle className="text-3xl">{repliedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Điểm trung bình trong bộ lọc</CardDescription>
            <CardTitle className="flex items-center gap-2 text-3xl"><Star className="size-6 text-amber-500" />{averageRating.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Danh sách đánh giá</CardTitle>
              <CardDescription>{reviews.length} đánh giá trong kết quả hiện tại.</CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo thiết bị, khách hàng hoặc nội dung"
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 sm:w-80"
              />
              <Select value={visibilityFilter} onValueChange={(value) => setVisibilityFilter(value as VisibilityFilter)}>
                <SelectTrigger className="w-full bg-white sm:w-44"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="VISIBLE">Đang hiển thị</SelectItem>
                  <SelectItem value="HIDDEN">Đang ẩn</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => void loadReviews()} disabled={loading}>
                <RefreshCcw className="mr-2 size-4" />Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Đang tải đánh giá...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thiết bị / khách hàng</TableHead>
                  <TableHead>Nội dung</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Phản hồi admin</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => {
                  const isActing = actingId === review.id;
                  return (
                    <TableRow key={review.id}>
                      <TableCell className="align-top">
                        <div className="font-medium">{review.deviceName || "Thiết bị không xác định"}</div>
                        <div className="text-xs text-muted-foreground">{review.accountName}</div>
                        <div className="mt-2 flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star key={index} className={`size-3.5 ${index < review.rating ? "fill-current" : ""}`} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-sm align-top">
                        <p className="line-clamp-4 text-sm text-slate-700">{review.comment || "Khách hàng không để lại bình luận."}</p>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex flex-col gap-2">
                          <Badge variant={review.isHidden ? "destructive" : "default"}>{review.isHidden ? "Đang ẩn" : "Đang hiển thị"}</Badge>
                          {review.isVerifiedPurchase ? <Badge variant="secondary">Verified purchase</Badge> : null}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-sm align-top text-sm text-slate-600">
                        {review.adminReply?.trim() || "Chưa có phản hồi."}
                      </TableCell>
                      <TableCell className="align-top text-sm text-slate-500">
                        <div>{formatDateTime(review.createdAt)}</div>
                        <div className="mt-1 text-xs">Cập nhật {formatDateTime(review.updatedAt)}</div>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" disabled={isActing} onClick={() => void handleReply(review)}>
                            <MessageSquareReply className="mr-2 size-4" />Phản hồi
                          </Button>
                          <Button size="sm" variant={review.isHidden ? "default" : "destructive"} disabled={isActing} onClick={() => void handleToggleVisibility(review)}>
                            {review.isHidden ? <Eye className="mr-2 size-4" /> : <EyeOff className="mr-2 size-4" />}
                            {review.isHidden ? "Hiện lại" : "Ẩn"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}