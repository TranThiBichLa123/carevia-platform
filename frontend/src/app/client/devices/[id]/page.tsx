import BackToHome from "@/components/common/buttons/BackToHome";
import Container from "@/components/common/Container";
import PriceFormatter from "@/components/common/PriceFormatter";
import ProductCard from "@/components/common/products/ProductCard";
import ProductDescription from "@/components/pages/product/ProductDescription";
import ProductActions from "@/components/pages/product/ProductActions";
import { deviceApi, DeviceData } from "@/lib/deviceApi";
import { fetchWithConfig } from "@/lib/config";
import { mapDeviceToProduct } from "@/lib/mappers";
import { Product } from "@/types_enum/devices";

interface FuzzyRankedDevice {
  rank: number;
  deviceId: string;
  closenessCoefficient: number;
  recommended: boolean;
}
interface DeviceRankResponse {
  rankings: FuzzyRankedDevice[];
}
import {
  Share2,
  Star,
  Truck,
  Heart,
  ShieldCheck,
  ChevronRight,
  PackageCheck,
  BadgePercent,
} from "lucide-react";
import Image from "next/image";
import React from "react";
import FavoriteBadge from "@/components/common/FavoriteBadge";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

const ProductDetails = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  let product: Product | undefined;
  try {
    const deviceData = await deviceApi.getById(id);
    product = mapDeviceToProduct(deviceData);
  } catch (error) {
    console.log("Failed to fetch device:", id, error);
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

  // 1. Thu thập các thiết bị ứng viên (tương tự + phổ biến fallback)
  let candidateDevices: DeviceData[] = [];
  try {
    const similarData = await deviceApi.getSimilar(id, 8);
    candidateDevices = similarData.filter(d => String(d.id) !== String(id));
  } catch (error) {
    console.log("Failed to fetch similar products:", error);
  }
  if (candidateDevices.length < 2) {
    try {
      const popularData = await deviceApi.getPopular(8);
      const popularFiltered = popularData.filter(d => String(d.id) !== String(id));
      const existingIds = new Set(candidateDevices.map(d => String(d.id)));
      for (const d of popularFiltered) {
        if (!existingIds.has(String(d.id))) candidateDevices.push(d);
      }
    } catch (error) {
      console.log("Failed to fetch popular products:", error);
    }
  }
  candidateDevices = candidateDevices.slice(0, 6);

  // 2. Xếp hạng bằng Fuzzy TOPSIS
  let rankedDeviceIds: string[] = candidateDevices.map(d => String(d.id));
  let fuzzyRankings: FuzzyRankedDevice[] = [];
  if (candidateDevices.length >= 2) {
    try {
      const fuzzyRequest = {
        scenarioName: "Gợi ý sản phẩm dành cho bạn",
        criteria: [
          { id: "price", name: "Giá", preference: "COST", weight: { linguisticTerm: "VERY_HIGH" } },
          { id: "averageRating", name: "Đánh giá", preference: "BENEFIT", weight: { linguisticTerm: "HIGH" } },
          { id: "sold", name: "Lượt bán", preference: "BENEFIT", weight: { linguisticTerm: "MEDIUM_HIGH" } },
          { id: "reviewCount", name: "Lượt review", preference: "BENEFIT", weight: { linguisticTerm: "MEDIUM" } },
        ],
        alternatives: candidateDevices.map(d => ({
          optionId: String(d.id),
          deviceId: String(d.id),
          name: d.name,
          criteriaScores: {
            price: { value: d.price ?? 0 },
            averageRating: { value: d.averageRating ?? 0 },
            sold: { value: d.sold ?? 0 },
            reviewCount: { value: d.reviewCount ?? 0 },
          },
        })),
      };
      const rankResponse = await fetchWithConfig<DeviceRankResponse>(
        "/api/v1/recommendations/devices/fuzzy-topsis/rank",
        { method: "POST", body: JSON.stringify(fuzzyRequest), next: { revalidate: 0 } }
      );
      if (rankResponse?.rankings?.length) {
        fuzzyRankings = rankResponse.rankings;
        rankedDeviceIds = fuzzyRankings.map(r => r.deviceId);
      }
    } catch (error) {
      console.log("Fuzzy TOPSIS ranking failed:", error);
    }
  }

  // 3. Sắp xếp sản phẩm theo thứ hạng Fuzzy TOPSIS
  const deviceMap = new Map(candidateDevices.map(d => [String(d.id), d]));
  const rankMap = new Map(fuzzyRankings.map(r => [r.deviceId, r]));
  const displayProducts: (Product & { fuzzyRank?: number; closenessCoefficient?: number; isBest?: boolean })[] =
    rankedDeviceIds
      .map(did => {
        const d = deviceMap.get(did);
        if (!d) return null;
        const r = rankMap.get(did);
        return { ...mapDeviceToProduct(d), fuzzyRank: r?.rank, closenessCoefficient: r?.closenessCoefficient, isBest: r?.recommended };
      })
      .filter(Boolean) as (Product & { fuzzyRank?: number; closenessCoefficient?: number; isBest?: boolean })[];

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
              <div className="aspect-square bg-background rounded-xl overflow-hidden border-2 border-border shadow-sm group relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">

                <button className="flex items-center gap-2 hover:text-primary hoverEffect">
                  <Heart size={18} />
                  <span>
                    Yêu thích ({product.wishlistCount > 999
                      ? `${(product.wishlistCount / 1000).toFixed(1)}k`
                      : product.wishlistCount})
                  </span>                </button>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">

              {/* Product Name */}
              <div>
                {/* <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-md mb-3 shadow-sm">
                  YÊU THÍCH
                </span> */}
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
                        -{product.discountPercentage}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Vouchers */}
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
                  <p className="mt-2 text-sm text-muted-foreground">
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
        {/* --- GỢI Ý DÀNH CHO BẠN (Fuzzy TOPSIS) --- */}
        {displayProducts.length > 0 && (
          <div className=" mx-auto mt-10">
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-7 bg-primary rounded-full"></span>
                  GỢI Ý DÀNH CHO BẠN
                </h2>
                <div className="flex items-center gap-2 mt-1 ml-4">
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    Fuzzy TOPSIS
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Xếp hạng theo đánh giá · giá · loại da · lượt bán
                  </span>
                </div>
              </div>
              <a href="/client/devices" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={16} />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayProducts.map((item) => (
                <div key={item.id} className="relative h-full">
                  {item.fuzzyRank === 1 && (
                    <div className="absolute top-2 left-2 z-10 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5">
                      ⭐ #1
                    </div>
                  )}
                  {item.fuzzyRank === 2 && (
                    <div className="absolute top-2 left-2 z-10 bg-slate-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                      #2
                    </div>
                  )}
                  {item.fuzzyRank === 3 && (
                    <div className="absolute top-2 left-2 z-10 bg-orange-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                      #3
                    </div>
                  )}
                  {item.closenessCoefficient != null && item.closenessCoefficient > 0 && (
                    <div className="absolute bottom-2 right-2 z-10 bg-primary/90 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full shadow">
                      CC {(item.closenessCoefficient * 100).toFixed(0)}%
                    </div>
                  )}
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        )}


      </Container>
    </div >
  );
};

export default ProductDetails;