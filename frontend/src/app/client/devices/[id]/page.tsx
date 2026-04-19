import BackToHome from "@/components/common/buttons/BackToHome";
import Container from "@/components/common/Container";
import PriceFormatter from "@/components/common/PriceFormatter";
import ProductCard from "@/components/common/products/ProductCard";
import ProductDescription from "@/components/pages/product/ProductDescription";
import ProductActions from "@/components/pages/product/ProductActions";
import { deviceApi } from "@/lib/deviceApi";
import { mapDeviceToProduct } from "@/lib/mappers";
import { Product } from "@/types_enum/devices";
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

  let relatedProducts: Product[] = [];
  try {
    const similarData = await deviceApi.getSimilar(id, 5);
    relatedProducts = similarData.map(mapDeviceToProduct);
  } catch (error) {
    console.log("Failed to fetch similar products:", error);
  }

  const displayProducts = relatedProducts;

  return (
    <div className=" bg-muted py-8 ">
      <Container>
        <div className=" mx-auto bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
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
                  <Share2 size={18} />
                  <span>Chia sẻ</span>
                </button>
                <button className="flex items-center gap-2 hover:text-accent hoverEffect">
                  <Heart size={18} />
                  <span>Yêu thích (1.2k)</span>
                </button>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="space-y-6">

              {/* Product Name */}
              <div>
                <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-md mb-3 shadow-sm">
                  YÊU THÍCH
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating & Stats */}
              <div className="flex items-center gap-4 text-sm border-b border-border pb-4">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-accent">{product.averageRating.toFixed(1)}</span>
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
              <div className="bg-linear-to-r from-accent/5 to-accent/10 rounded-xl p-6 border border-accent/20">
                <div className="flex items-baseline gap-4">
                  <PriceFormatter
                    amount={currentPrice}
                    className="text-4xl font-bold text-accent"
                  />
                  {hasDiscount && (
                    <>
                      <PriceFormatter
                        amount={product.originalPrice}
                        className="text-lg text-muted-foreground line-through"
                      />
                      <span className="bg-accent text-white text-sm font-bold px-3 py-1 rounded-md shadow-sm">
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
                      className="relative bg-accent/5 text-accent px-4 py-2 text-sm font-medium border border-dashed border-accent/40 rounded-lg hover:bg-accent/10 hoverEffect"
                    >
                      {tag}
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full border border-accent/40" />
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full border border-accent/40" />
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
        <div className="mt-6 bg-card shadow-xl rounded-2xl p-6 md:p-8 border border-border">
          <ProductDescription product={product} />
        </div>
        {/* --- PHẦN MỚI: CÓ THỂ BẠN CŨNG THÍCH --- */}
        <div className=" mx-auto mt-10">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-7 bg-primary rounded-full"></span>
              CÓ THỂ BẠN CŨNG THÍCH
            </h2>
            <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayProducts.map((item) => (
              <div key={item.id} className="h-full">
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </div>


      </Container>
    </div>
  );
};

export default ProductDetails;