"use client";
import { Star, MessageSquare, Store, Package, MapPin, Award, Send, Loader2, ImagePlus, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types_enum/devices';
import { reviewApi, ReviewData, ReviewEligibilityData } from '@/lib/deviceApi';
import { notifyDeviceRecommendationReviewUpdated } from '@/lib/recommendationPreferences';
import { useUserStore } from '@/lib/store';

interface ProductDescriptionProps {
  product?: Product;
}

type ReviewAspectKey = 'effectivenessRating' | 'safetyRating' | 'ergonomicsRating' | 'durabilityRating';

const reviewAspectFields: Array<{
  key: ReviewAspectKey;
  label: string;
  description: string;
}> = [
  {
    key: 'effectivenessRating',
    label: 'Hiệu quả sử dụng',
    description: 'Máy có cho kết quả nhanh và rõ rệt hay không.',
  },
  {
    key: 'safetyRating',
    label: 'Độ an toàn / Dịu nhẹ',
    description: 'Độ êm, ít kích ứng và thân thiện với da nhạy cảm.',
  },
  {
    key: 'ergonomicsRating',
    label: 'Thiết kế & Độ tiện dụng',
    description: 'Cảm giác cầm nắm, bố cục nút bấm và trải nghiệm thao tác.',
  },
  {
    key: 'durabilityRating',
    label: 'Độ bền / Chất liệu',
    description: 'Cảm nhận về độ chắc chắn, hoàn thiện và độ bền tổng thể.',
  },
];

const reviewPromptOptions: Record<ReviewAspectKey, string[]> = {
  effectivenessRating: ['Hiệu quả thấy rõ sau vài lần dùng', 'Da sạch và mịn hơn', 'Kết quả ổn định', 'Cần kiên trì mới thấy rõ'],
  safetyRating: ['Êm da, không rát', 'Phù hợp da nhạy cảm', 'Không gây đỏ da kéo dài', 'Cần test trước khi dùng thường xuyên'],
  ergonomicsRating: ['Dễ cầm và dễ thao tác', 'Nút bấm trực quan', 'Thiết kế đẹp mắt', 'Mang đi tiện'],
  durabilityRating: ['Máy chắc chắn, cứng cáp', 'Chất liệu hoàn thiện tốt', 'Dùng lâu vẫn ổn định', 'Phụ kiện đi kèm ổn'],
};

const reviewImageLimit = 4;

const createEmptyPromptSelection = (): Record<ReviewAspectKey, string[]> => ({
  effectivenessRating: [],
  safetyRating: [],
  ergonomicsRating: [],
  durabilityRating: [],
});

const buildStructuredComment = (
  selectedPrompts: Record<ReviewAspectKey, string[]>,
  comment: string
) => {
  const sections = reviewAspectFields
    .map((field) => {
      const values = selectedPrompts[field.key];
      if (!values.length) return null;
      return `${field.label}: ${values.join(', ')}`;
    })
    .filter(Boolean);

  const freeText = comment.trim();
  return [...sections, freeText].filter(Boolean).join('\n');
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    const responseMessage = (error as {
      response?: { data?: { message?: unknown } };
    }).response?.data?.message;

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }
  }

  return fallback;
};

export default function ProductDescription({ product }: ProductDescriptionProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'brand' | 'reviews'>('description');

  // Reviews state
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(product?.averageRating ?? 0);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const [hasNextReviews, setHasNextReviews] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState<ReviewEligibilityData | null>(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [reviewLoadError, setReviewLoadError] = useState('');

  // Review form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [aspectRatings, setAspectRatings] = useState<Record<ReviewAspectKey, number>>({
    effectivenessRating: 5,
    safetyRating: 5,
    ergonomicsRating: 5,
    durabilityRating: 5,
  });
  const [selectedPrompts, setSelectedPrompts] = useState<Record<ReviewAspectKey, string[]>>(createEmptyPromptSelection);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const user = useUserStore((s) => s.authUser);
  const reviewerName = user?.full_name || user?.username || 'Khách hàng Carevia';
  const reviewerAvatar = user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&background=159fd8&color=fff`;
  const reviewTotal = totalReviews || product?.reviewCount || 0;
  const shouldHideReviewComposer = Boolean(user && reviewEligibility?.alreadyReviewed);

  const fetchReviews = useCallback(async (page: number, append = false) => {
    if (!product?.id) return;
    setLoadingReviews(true);
    setReviewLoadError('');
    try {
      const data = await reviewApi.getByDevice(product.id, { page, size: 5 });
      setReviews(prev => append ? [...prev, ...data.items] : data.items);
      setTotalReviews(data.totalItems);
      setHasNextReviews(data.hasNext);
      setReviewPage(page);
    } catch (error: unknown) {
      setReviews([]);
      setHasNextReviews(false);
      setReviewLoadError(getErrorMessage(error, 'Không thể tải danh sách đánh giá lúc này.'));
    } finally {
      setLoadingReviews(false);
    }
  }, [product?.id]);

  const fetchReviewEligibility = useCallback(async () => {
    if (!product?.id || !user) {
      setReviewEligibility(null);
      return;
    }

    setLoadingEligibility(true);
    try {
      const eligibility = await reviewApi.getEligibility(product.id);
      setReviewEligibility(eligibility);
    } catch (error: unknown) {
      setReviewEligibility({
        canReview: false,
        alreadyReviewed: false,
        hasCompletedOrder: false,
        completedOrderId: null,
        completedOrderCode: null,
        message: getErrorMessage(error, 'Không thể kiểm tra điều kiện viết đánh giá.'),
      });
    } finally {
      setLoadingEligibility(false);
    }
  }, [product?.id, user]);

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews(0);
      void fetchReviewEligibility();
    }
  }, [activeTab, fetchReviewEligibility, fetchReviews]);

  const togglePrompt = (key: ReviewAspectKey, option: string) => {
    setSelectedPrompts((current) => {
      const currentValues = current[key];
      const nextValues = currentValues.includes(option)
        ? currentValues.filter((value) => value !== option)
        : [...currentValues, option];
      return {
        ...current,
        [key]: nextValues,
      };
    });
  };

  const handleReviewImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!product?.id) return;

    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const remainingSlots = reviewImageLimit - reviewImages.length;
    if (remainingSlots <= 0) {
      setSubmitError(`Bạn chỉ có thể tải tối đa ${reviewImageLimit} ảnh cho mỗi đánh giá.`);
      event.target.value = '';
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);
    setUploadingImages(true);
    setSubmitError('');

    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedFiles) {
        const uploaded = await reviewApi.uploadImage(product.id, file);
        uploadedUrls.push(uploaded.imageUrl);
      }
      setReviewImages((current) => [...current, ...uploadedUrls].slice(0, reviewImageLimit));
      if (files.length > remainingSlots) {
        setSubmitError(`Chỉ giữ lại ${reviewImageLimit} ảnh đầu tiên cho đánh giá này.`);
      }
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, 'Tải ảnh đánh giá thất bại. Vui lòng thử lại.'));
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const removeReviewImage = (imageUrl: string) => {
    setReviewImages((current) => current.filter((url) => url !== imageUrl));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const finalComment = buildStructuredComment(selectedPrompts, comment);
      const newReview = await reviewApi.create(product.id, {
        rating,
        ...aspectRatings,
        comment: finalComment,
        mediaUrls: reviewImages,
      });
      setReviews(prev => [newReview, ...prev]);
      const newTotal = totalReviews + 1;
      setAverageRating((averageRating * totalReviews + rating) / newTotal);
      setTotalReviews(newTotal);
      setComment('');
      setReviewImages([]);
      setRating(5);
      setAspectRatings({
        effectivenessRating: 5,
        safetyRating: 5,
        ergonomicsRating: 5,
        durabilityRating: 5,
      });
      setSelectedPrompts(createEmptyPromptSelection());
      setReviewEligibility((current) => current ? {
        ...current,
        canReview: false,
        alreadyReviewed: true,
        message: 'Bạn đã gửi đánh giá cho sản phẩm này rồi.',
      } : current);
      notifyDeviceRecommendationReviewUpdated(product.id);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error: unknown) {
      setSubmitError(getErrorMessage(error, 'Gửi đánh giá thất bại. Vui lòng thử lại.'));
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
      label: `ĐÁNH GIÁ (${reviewTotal})`
    },
  ];


  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('vi-VN'); } catch { return iso; }
  };

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
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
            {reviewTotal > 0 && (
              <div className="bg-linear-to-r from-accent/5 to-secondary/10 border-b border-border/70 p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="text-center md:border-r-2 md:border-border md:pr-8">
                  <div className="text-accent text-5xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground mt-1">trên 5</div>
                  <div className="flex text-secondary mt-2 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} fill={i < Math.round(averageRating) ? 'currentColor' : 'none'} size={20} />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">{reviewTotal} đánh giá</div>
                </div>
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
            )}

            {/* Review Form */}
            {!shouldHideReviewComposer && (
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
                ) : loadingEligibility ? (
                  <div className="rounded-xl border border-border bg-white px-4 py-4 text-sm text-muted-foreground">
                    Đang kiểm tra điều kiện viết đánh giá...
                  </div>
                ) : reviewEligibility?.canReview === false ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                    <p className="font-semibold">{reviewEligibility.message}</p>
                    {reviewEligibility.hasCompletedOrder && reviewEligibility.completedOrderCode && (
                      <p className="mt-2 text-xs text-amber-800">
                        Đơn liên quan: {reviewEligibility.completedOrderCode}
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
                    <img
                      src={reviewerAvatar}
                      alt={reviewerName}
                      className="h-12 w-12 rounded-full border border-border object-cover"
                    />
                    <div>
                      <p className="text-sm font-bold text-foreground">{reviewerName}</p>
                      <p className="text-xs text-muted-foreground">Đánh giá của bạn sẽ hiển thị cùng avatar, tên và ảnh thực tế nếu có.</p>
                    </div>
                  </div>

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

                  <div className="grid gap-3 md:grid-cols-2">
                    {reviewAspectFields.map((field) => (
                      <div key={field.key} className="rounded-xl border border-border bg-white p-4">
                        <div className="mb-3">
                          <p className="text-sm font-bold text-foreground">{field.label}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{field.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              type="button"
                              key={value}
                              onClick={() => setAspectRatings((current) => ({ ...current, [field.key]: value }))}
                              className="text-secondary transition-transform hover:scale-110"
                            >
                              <Star
                                size={20}
                                fill={value <= aspectRatings[field.key] ? 'currentColor' : 'none'}
                                strokeWidth={1.5}
                              />
                            </button>
                          ))}
                          <span className="ml-2 text-xs font-medium text-muted-foreground">
                            {ratingLabels[aspectRatings[field.key]]}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {reviewPromptOptions[field.key].map((option) => {
                            const active = selectedPrompts[field.key].includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => togglePrompt(field.key, option)}
                                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${active
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-dashed border-border bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-foreground">Ảnh thực tế khi sử dụng</p>
                        <p className="mt-1 text-xs text-muted-foreground">Bạn có thể tải tối đa 4 ảnh để người khác dễ hình dung hơn về trải nghiệm thật.</p>
                      </div>
                      <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary ${uploadingImages ? 'pointer-events-none opacity-60' : ''}`}>
                        {uploadingImages ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                        {uploadingImages ? 'Đang tải ảnh...' : 'Thêm ảnh'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={uploadingImages || reviewImages.length >= reviewImageLimit}
                          onChange={(event) => void handleReviewImageChange(event)}
                        />
                      </label>
                    </div>

                    {reviewImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {reviewImages.map((imageUrl) => (
                          <div key={imageUrl} className="relative overflow-hidden rounded-xl border border-border bg-muted/20">
                            <img src={imageUrl} alt="Ảnh đánh giá" className="h-28 w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeReviewImage(imageUrl)}
                              className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white transition hover:bg-black"
                              aria-label="Xóa ảnh đánh giá"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Phần tự do như Shopee: chia sẻ thêm cảm nhận thật, cách bạn dùng máy, tình trạng da trước/sau khi dùng..."
                    rows={4}
                    className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                  />
                  {submitError && <p className="text-sm text-red-500">{submitError}</p>}
                  {submitSuccess && <p className="text-sm text-emerald-600 font-medium">✓ Đánh giá của bạn đã được gửi!</p>}
                    <button
                      type="submit"
                      disabled={submitting || uploadingImages}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {reviewLoadError && (
              <div className="border-b border-border bg-rose-50 px-6 py-4 text-sm text-rose-700">
                {reviewLoadError}
              </div>
            )}

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
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                                Hiệu quả {review.effectivenessRating}/5
                              </span>
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                An toàn {review.safetyRating}/5
                              </span>
                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                Tiện dụng {review.ergonomicsRating}/5
                              </span>
                              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                                Độ bền {review.durabilityRating}/5
                              </span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-foreground leading-relaxed bg-muted/20 p-4 rounded-lg border border-border">
                              {review.comment}
                            </p>
                          )}
                          {review.mediaUrls?.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                              {review.mediaUrls.map((imageUrl, index) => (
                                <a
                                  key={`${review.id}-${index}`}
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="overflow-hidden rounded-xl border border-border bg-muted/20"
                                >
                                  <img src={imageUrl} alt={`Ảnh review ${index + 1}`} className="h-28 w-full object-cover transition-transform hover:scale-105" />
                                </a>
                              ))}
                            </div>
                          )}
                          {review.adminReply?.trim() && (
                            <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-lg text-sm">
                              <div className="mb-1 flex flex-wrap items-center gap-2">
                                <p className="font-bold text-primary text-xs">Phản hồi từ Carevia:</p>
                                {(review.adminReplyEditedAt || review.adminReplyCreatedAt) && (
                                  <p className="text-[11px] text-muted-foreground">
                                    {formatDateTime(review.adminReplyEditedAt || review.adminReplyCreatedAt!)}
                                    {review.adminReplyEdited ? <span className="italic"> (Đã chỉnh sửa)</span> : null}
                                  </p>
                                )}
                              </div>
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
