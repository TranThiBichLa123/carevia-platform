import BackToHome from "@/components/common/buttons/BackToHome";
import Container from "@/components/common/Container";
import PriceFormatter from "@/components/common/PriceFormatter";
import ProductCard from "@/components/common/products/ProductCard";
import ProductDescription from "@/components/pages/product/ProductDescription";
import ProductActions from "@/components/pages/product/ProductActions";
import { fetchData } from "@/lib/api";
import { mockProducts } from "@/constants/data";
import { Product } from "@/type";
import { Share2, Star, Truck, Heart, ShieldCheck, ChevronRight } from "lucide-react";
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
    product = await fetchData(`/products/${id}`);
  } catch (error) {
    console.log("Chưa có API, đang dùng mock data cho ID:", id);
  }

  if (!product) {
    product = mockProducts.find((p) => p._id === id);
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

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);

  const getCategoryId = (category: Product["category"] | string | undefined) => {
    if (!category) {
      return undefined;
    }

    return typeof category === "object" ? category._id : category;
  };

  const relatedProducts = mockProducts.filter((p) => {
    const pCatId = getCategoryId(p.category);
    const currentCatId = getCategoryId(product.category);

    return pCatId === currentCatId && p._id !== product._id;
  });

  const displayProducts = relatedProducts.length > 0
    ? relatedProducts
    : mockProducts.filter((item) => item._id !== product._id).slice(0, 5);

  return (
    <div className="min-h-screen bg-muted py-8 px-4">
      <Container>
        <div className="max-w-6xl mx-auto bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
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
                  <span className="font-bold text-accent">{product.averageRating}</span>
                  <div className="flex text-secondary">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  <span className="font-bold text-foreground">1.2k</span>
                  <span className="text-muted-foreground ml-1">Đánh giá</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div>
                  <span className="font-bold text-foreground">3.5k</span>
                  <span className="text-muted-foreground ml-1">Đã bán</span>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-linear-to-r from-accent/5 to-accent/10 rounded-xl p-6 border border-accent/20">
                <div className="flex items-baseline gap-4">
                  <PriceFormatter
                    amount={discountedPrice}
                    className="text-4xl font-bold text-accent"
                  />
                  {product.discountPercentage > 0 && (
                    <>
                      <PriceFormatter
                        amount={product.price}
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
                <p className="text-sm font-medium text-muted-foreground">Mã giảm giá của shop</p>
                <div className="flex flex-wrap gap-2">
                  {["Giảm 10k", "Giảm 15%", "Giảm 50k"].map((voucher, i) => (
                    <button
                      key={i}
                      className="relative bg-accent/5 text-accent px-4 py-2 text-sm font-medium border border-dashed border-accent/40 rounded-lg hover:bg-accent/10 hoverEffect"
                    >
                      {voucher}
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full border border-accent/40" />
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full border border-accent/40" />
                    </button>
                  ))}
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
        <div className="max-w-6xl mx-auto bg-card shadow-xl rounded-2xl p-6 md:p-8 mt-6 border border-border">
          <ProductDescription product={product} />
        </div>
        {/* --- PHẦN MỚI: CÓ THỂ BẠN CŨNG THÍCH --- */}
        <div className="max-w-6xl mx-auto mt-10">
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
              <div key={item._id} className="h-full">
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