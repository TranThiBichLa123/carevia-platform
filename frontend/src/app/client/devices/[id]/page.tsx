import BackToHome from "@/components/common/buttons/BackToHome";
import Container from "@/components/common/Container";
import PriceFormatter from "@/components/common/PriceFormatter";
import ProductActions from "@/components/pages/product/ProductActions";
import ProductVouchers from "@/components/pages/product/ProductVoucher";
import { deviceApi } from "@/lib/deviceApi";
import { mapDeviceToProduct } from "@/lib/mappers";
import { formatDiscountPercentage } from "@/lib/utils";
import { Product } from "@/types_enum/devices";
import { cookies } from "next/headers";
import {
  Share2,
  Star,
  Truck,
  Heart,
  ShieldCheck,
  PackageCheck,
  BadgePercent,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import React from "react";
import FavoriteBadge from "@/components/common/FavoriteBadge";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

const ProductDescription = dynamic(
  () => import("@/components/pages/product/ProductDescription"),
  {
    loading: () => (
      <div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">
        Đang tải nội dung sản phẩm...
      </div>
    ),
  }
);

const PersonalizedRecommendationShelf = dynamic(
  () => import("@/components/pages/product/PersonalizedRecommendationShelf"),
  {
    loading: () => (
      <div className="mt-10 rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">
        Đang tải gợi ý dành cho bạn...
      </div>
    ),
  }
);

const ProductDetails = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  let product: Product | undefined;
  let vouchers: any[] = [];

  try {
    // Gọi đồng thời cả 2 API để tối ưu tốc độ tải trang
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const [deviceData, voucherData] = await Promise.all([
      deviceApi.getById(id),
      deviceApi.getVouchersByDeviceId(id) // 🌟 Giờ đã có thể gọi trực tiếp an tâm
    ]);

    product = mapDeviceToProduct(deviceData);
    vouchers = voucherData || [];
  } catch (error) {
    console.log("Failed to fetch device or vouchers:", id, error);
  }
  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col gap-4 items-center justify-center p-10 text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Không tìm thấy sản phẩm với ID:
          <span className="font-semibold text-primary underline ml-2">{id}</span>
        </h2>
        <BackToHome />
      </div>
    );
  }

  const currentPrice = product.price;
  const hasDiscount = product.originalPrice > currentPrice;
  const displayTags = product.tags?.length
    ? product.tags.slice(0, 3)
    : ["Chính hãng", "Giao nhanh", "Hỗ trợ booking"];

  return (
    <div className=" bg-white ">
      <Container>
        {/* Breadcrumb */}
        <div className="my-4">
          <PageBreadcrumb
            items={[{ label: "Tất cả sản phẩm", href: "/client/devices" }]}
            currentPage={product.name}
          />
        </div>
        <div className=" mx-auto bg-white rounded-2xl shadow-xl font-vietnam overflow-hidden border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">

            {/* Left: Image Section */}
            <div className="space-y-4">
              <div className="aspect-square bg-background rounded-xl overflow-hidden border-2 border-border shadow-sm group relative p-4 md:p-6">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <button className="flex items-center gap-2 hover:text-primary hoverEffect">
                  <Heart size={18} />
                  <span>
                    Yêu thích ({product.wishlistCount > 999
                      ? `${(product.wishlistCount / 1000).toFixed(1)}k`
                      : product.wishlistCount})
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <FavoriteBadge productId={product.id} />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating & Stats */}
              <div className="flex items-center gap-4 text-sm border-b border-border pb-4">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-cancel">{product.averageRating.toFixed(1)}</span>
                  <div className="flex text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  <span className="font-bold text-foreground">{product.reviewCount}</span>
                  <span className="text-muted-foreground ml-1">Đánh giá</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  <span className="font-bold text-foreground">{product.sold}</span>
                  <span className="text-muted-foreground ml-1">Đã bán</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-linear-to-r from-cancel/5 to-cancel/10 rounded-xl p-6 border border-cancel/20">
                <div className="flex items-baseline gap-4">
                  <PriceFormatter
                    amount={currentPrice}
                    className="text-4xl font-bold text-cancel"
                  />
                  {hasDiscount && (
                    <>
                      <PriceFormatter
                        amount={product.originalPrice}
                        className="text-lg text-muted-foreground line-through"
                      />
                      <span className="bg-cancel text-white text-sm font-bold px-3 py-1 rounded-md shadow-sm">
                        -{formatDiscountPercentage(product.discountPercentage)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              {/* Voucher section */}
              <ProductVouchers vouchers={vouchers} />

              {/* Điểm nổi bật */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Điểm nổi bật</p>
                <div className="flex flex-wrap gap-2">
                  {displayTags.map((tag, i) => (
                    <div
                      key={i}
                      className="relative bg-cancel/5 text-cancel px-4 py-2 text-sm font-medium border border-dashed border-cancel/40 rounded-lg hover:bg-cancel/10 hoverEffect"
                    >
                      {tag}
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full border border-cancel/40" />
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full border border-cancel/40" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <PackageCheck size={16} className="text-primary" />
                    Tình trạng
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground uppercase">
                    {product.condition}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck size={16} className="text-primary" />
                    Bảo hành
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground font-vietnam">
                    {product.warranty.period > 0
                      ? `${product.warranty.period} tháng`
                      : "Liên hệ tư vấn"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <BadgePercent size={16} className="text-primary" />
                    Xuất xứ
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {product.origin || "Đang cập nhật"}
                  </p>
                </div>
              </div>

              {/* Shipping & Policy */}
              <div className="space-y-3 border-y border-border py-5">
                <div className="flex items-center gap-3">
                  <Truck size={20} className="text-emerald-600" />
                  <span className="text-sm text-foreground">Miễn phí vận chuyển</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-primary" />
                  <span className="text-sm text-foreground">7 ngày đổi trả miễn phí</span>
                </div>
              </div>

              {/* Product Actions (Quantity + Add to Cart) */}
              <ProductActions product={product} />

            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-6 bg-white shadow-xl rounded-2xl p-6 md:p-8 border border-border">
          <ProductDescription product={product} />
        </div>
        <PersonalizedRecommendationShelf currentDeviceId={id} currentDeviceName={product.name} />

      </Container>
    </div >
  );
};

export default ProductDetails;