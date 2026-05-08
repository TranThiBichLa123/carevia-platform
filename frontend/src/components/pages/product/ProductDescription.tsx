"use client";
import { Star, MessageSquare, Store, Package, MapPin, Award, Send, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types_enum/devices';
import { reviewApi, ReviewData } from '@/lib/deviceApi';
import { useUserStore } from '@/lib/store';

interface ProductDescriptionProps {
  product?: Product;
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'brand' | 'reviews'>('description');

  // Reviews state
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(product?.averageRating ?? 0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const [hasNextReviews, setHasNextReviews] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const user = useUserStore((s) => s.authUser);

  const fetchReviews = useCallback(async (page: number, append = false) => {
    if (!product?.id) return;
    setLoadingReviews(true);
    try {
      const data = await reviewApi.getByDevice(product.id, { page, size: 5 });
      setReviews(prev => append ? [...prev, ...data.items] : data.items);
      setTotalReviews(data.totalItems);
      setHasNextReviews(data.hasNext);
      setReviewPage(page);
    } catch {
      // ignore
    } finally {
      setLoadingReviews(false);
    }
  }, [product?.id]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews(0);
    }
  }, [activeTab, fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const newReview = await reviewApi.create(product.id, { rating, comment });
      setReviews(prev => [newReview, ...prev]);
      const newTotal = totalReviews + 1;
      setAverageRating((averageRating * totalReviews + rating) / newTotal);
      setTotalReviews(newTotal);
      setComment('');
      setRating(5);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    {
      id: 'description' as const,
      label: 'MÔ TẢ SẢN PHẨM'
    },
    {
      id: 'brand' as const,
      label: 'THÔNG TIN THƯƠNG HIỆU'
    },
    {
      id: 'reviews' as const,
      label: `ĐÁNH GIÁ (${totalReviews || product?.reviewCount || 0})`
    },
  ];


  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('vi-VN'); } catch { return iso; }
  };

  const ratingLabels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'];

  return (
    <div className="w-full font-vietnam bg-white">
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b-2 border-border bg-card overflow-x-auto scrollbar-hide ">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-all relative ${activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-card">

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="space-y-6 p-6">
            {/* Product Specifications */}
            <div className="bg-white rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Package size={20} className="text-primary" />
                Chi tiết sản phẩm
              </h3>
              <div className="grid grid-cols-1 gap-0 text-sm divide-y divide-border">
                {product?.category?.name && (
                  <div className="grid grid-cols-3 py-3">
                    <span className="text-muted-foreground font-medium">Danh mục</span>
                    <span className="col-span-2 text-foreground font-medium">{product.category.name}</span>
                  </div>
                )}
                {product?.brand?.name && (
                  <div className="grid grid-cols-3 py-3">
                    <span className="text-muted-foreground font-medium">Thương hiệu</span>
                    <span className="col-span-2 text-primary font-bold">{product.brand.name}</span>
                  </div>
                )}
                {product?.origin && (
                  <div className="grid grid-cols-3 py-3">
                    <span className="text-muted-foreground font-medium">Xuất xứ</span>
                    <span className="col-span-2 text-foreground font-medium flex items-center gap-2">
                      <MapPin size={14} className="text-accent" />
                      {product.origin}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-3 py-3">
                  <span className="text-muted-foreground font-medium">Kho hàng</span>
                  <span className={`col-span-2 font-medium ${product?.stock === 0 ? 'text-red-500' : 'text-foreground'}`}>
                    {product?.stock === 0 ? 'Hết hàng' : `${product?.stock ?? 0} sản phẩm`}
                  </span>
                </div>
                {product?.warranty && product.warranty.period !== undefined && (
                  <div className="grid grid-cols-3 py-3">
                    <span className="text-muted-foreground font-medium">Bảo hành</span>
                    <span className="col-span-2 text-foreground font-medium">
                      {product.warranty.period > 0 ? `${product.warranty.period} tháng` : 'Liên hệ tư vấn'}
                      {product.warranty.policy ? ` â€” ${product.warranty.policy}` : ''}
                    </span>
                  </div>
                )}
                {product?.specifications?.map((spec, i) => (
                  <div key={i} className="grid grid-cols-3 py-3">
                    <span className="text-muted-foreground font-medium">{spec.label}</span>
                    <span className="col-span-2 text-foreground font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground">Mô tả sản phẩm</h3>
              <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
                {product?.description && <p>{product.description}</p>}
                {product?.content && (
                  <div
                    className="prose prose-sm max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: product.content }}
                  />
                )}
                {!product?.description && !product?.content && (
                  <p className="italic text-muted-foreground">Chưa có mô tả cho sản phẩm này.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Brand Tab */}
        {activeTab === 'brand' && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6 border-2 border-border p-8 rounded-xl items-center shadow-sm bg-linear-to-br from-muted/20 to-background">
              <div className="relative w-24 h-24 rounded-full border-4 border-primary overflow-hidden bg-muted shrink-0 shadow-lg">
                <img
                  src={product?.brand?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.brand?.name || 'Brand')}&background=159fd8&color=fff&size=200`}
                  alt={product?.brand?.name || 'Brand'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h4 className="font-bold text-2xl text-foreground flex items-center gap-2 justify-center md:justify-start">
                    {product?.brand?.name || 'Thương hiệu'}
                    <Award size={20} className="text-primary" />
                  </h4>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Thương hiệu chính hãng
                    </span>
                    {(averageRating > 0 || (product?.averageRating ?? 0) > 0) && (
                      <span className="flex items-center gap-1 text-secondary font-bold">
                        <Star size={14} fill="currentColor" />
                        {averageRating.toFixed(1)} ({totalReviews || product?.reviewCount || 0} đánh giá)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 justify-center md:justify-start pt-2">
                  <a
                    href={`/client/devices?brandId=${product?.brand?.id}`}
                    className="flex items-center gap-2 border-2 border-primary text-primary px-6 py-2.5 rounded-lg font-bold hover:bg-primary/5 transition-colors shadow-sm"
                  >
                    <Store size={18} />
                    Xem sản phẩm của {product?.brand?.name || 'thương hiệu'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-0">
            {/* Summary */}
            <div className="bg-linear-to-r from-accent/5 to-secondary/10 border-b border-accent/20 p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="text-center md:border-r-2 md:border-border md:pr-8">
                <div className="text-accent text-5xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground mt-1">trên 5</div>
                <div className="flex text-secondary mt-2 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} fill={i < Math.round(averageRating) ? 'currentColor' : 'none'} size={20} />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{totalReviews || product?.reviewCount || 0} đánh giá</div>
              </div>
              {/* Star breakdown */}
              <div className="flex flex-col gap-1.5 w-full max-w-xs">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-right text-muted-foreground">{star} ★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Review Form */}
            <div className="p-6 border-b border-border bg-muted/20">
              <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare size={18} className="text-primary" />
                Viết đánh giá của bạn
              </h4>
              {!user ? (
                <p className="text-sm text-muted-foreground">
                  Vui lòng{' '}
                  <a href="/auth/sign-in" className="text-primary font-bold underline">đăng nhập</a>
                  {' '}để gửi đánh giá.
                </p>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-secondary transition-transform hover:scale-125"
                      >
                        <Star
                          size={28}
                          fill={s <= (hoverRating || rating) ? 'currentColor' : 'none'}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {ratingLabels[hoverRating || rating]}
                    </span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    rows={4}
                    className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                  />
                  {submitError && <p className="text-sm text-red-500">{submitError}</p>}
                  {submitSuccess && <p className="text-sm text-emerald-600 font-medium">✓ Đánh giá của bạn đã được gửi!</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </form>
              )}
            </div>

            {/* Reviews List */}
            {loadingReviews && reviews.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">Đang tải đánh giá...</div>
            ) : reviews.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Star size={40} className="mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex gap-4">
                        <img
                          src={review.accountAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.accountName)}&background=159fd8&color=fff`}
                          alt={review.accountName}
                          className="w-12 h-12 rounded-full shrink-0 border-2 border-border shadow-sm"
                        />
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="font-bold text-foreground">{review.accountName}</p>
                            <div className="flex items-center gap-1 text-secondary my-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} fill={i < review.rating ? 'currentColor' : 'none'} size={14} strokeWidth={1.5} />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                              {review.isVerifiedPurchase && (
                                <span className="ml-2 text-emerald-600 font-medium">✓ Đã mua hàng</span>
                              )}
                            </p>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border border-border">
                              {review.comment}
                            </p>
                          )}
                          {review.adminReply && (
                            <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-lg text-sm">
                              <p className="font-bold text-primary text-xs mb-1">Phản hồi từ Carevia:</p>
                              <p className="text-foreground">{review.adminReply}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {hasNextReviews && (
                  <div className="p-4 text-center">
                    <button
                      onClick={() => fetchReviews(reviewPage + 1, true)}
                      disabled={loadingReviews}
                      className="px-6 py-2 border border-border text-sm font-medium rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {loadingReviews ? 'Đang tải...' : 'Xem thêm đánh giá'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
