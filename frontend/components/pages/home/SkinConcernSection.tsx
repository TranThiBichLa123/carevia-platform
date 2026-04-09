"use client";
import { useState, useEffect } from "react";
import { fetchData } from "@/lib/api";
import { Product } from "@/type";
import ProductCard from "@/components/common/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shirt, Star, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface ProductsResponse {
  products: Product[];
  total: number;
}

const SkinConcernSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response: ProductsResponse = await fetchData<ProductsResponse>(
          "/products"
        );
        // Get the last 8 products
        const lastProducts = response.products.slice(-8).reverse(); // Get last 8 and reverse to show newest first
        setProducts(lastProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-background p-5 mt-5 rounded-md border border-border">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shirt className="w-5 h-5 text-primary" />
            <Badge variant="outline" className="text-primary border-primary">
              Giải pháp chuyên biệt
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Giải pháp cho từng vấn đề da
          </h2>
          <p className="text-muted-foreground">
            Tìm thiết bị phù hợp với tình trạng làn da của bạn
          </p>
        </div>
        <Link href="/shop?category=apparel">
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 text-primary-hover hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            Xem tất cả
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <>
            {/* Placeholder products when no apparel products found */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200">
              <CardContent className="p-6">
                <div className="bg-primary-light rounded-lg p-4 mb-4">
                  <Shirt className="w-8 h-8 text-primary mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Da khô thiếu ẩm</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Thiết bị dưỡng ẩm chuyên sâu
                </p>
                <Link href="/shop?search=onesie">
                  <Button className="w-full text-white bg-primary hover:bg-primary-hover">
                    Mua ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200">
              <CardContent className="p-6">
                <div className="bg-primary-light rounded-lg p-4 mb-4">
                  <Star className="w-8 h-8 text-primary mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Chống lão hóa</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Công nghệ nâng cơ xóa nhăn
                </p>
                <Link href="/shop?search=dress">
                  <Button className="w-full text-white bg-primary hover:bg-primary-hover">
                    Mua ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200">
              <CardContent className="p-6">
                <div className="bg-primary-light rounded-lg p-4 mb-4">
                  <Sparkles className="w-8 h-8 text-primary mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Trị mụn, thâm</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Ánh sáng blue light & LED
                </p>
                <Link href="/shop?search=romper">
                  <Button className="w-full text-white bg-primary hover:bg-primary-hover">
                    Mua ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200">
              <CardContent className="p-6">
                <div className="bg-primary-light rounded-lg p-4 mb-4">
                  <Shirt className="w-8 h-8 text-primary mx-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Sáng da đều màu</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Thiết bị làm sáng da hiệu quả
                </p>
                <Link href="/shop?search=pants">
                  <Button className="w-full text-white bg-primary hover:bg-primary-hover">
                    Mua ngay
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Promotional Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Routine chăm sóc ban đêm</h3>
            <p className="text-white/80 mb-4">
              Thiết bị phục hồi da ban đêm
            </p>
            <Link href="/shop?search=sleepwear">
              <Button
                variant="outline"
                className="bg-white text-primary border-white hover:bg-primary-light"
              >
                Khám phá ngay
              </Button>
            </Link>
          </div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"></div>
        </div>

        <div className="bg-gradient-to-r from-secondary to-secondary/80 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Chăm sóc da ban ngày</h3>
            <p className="text-white/80 mb-4">
              Bảo vệ da khỏi tác nhân bên ngoài
            </p>
            <Link href="/shop?search=summer">
              <Button
                variant="outline"
                className="bg-white text-secondary border-white hover:bg-yellow-50"
              >
                Khám phá ngay
              </Button>
            </Link>
          </div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full"></div>
        </div>
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link href="/shop?category=apparel">
          <Button className="w-full bg-primary hover:bg-primary-hover">
            Shop All Apparel
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SkinConcernSection;
