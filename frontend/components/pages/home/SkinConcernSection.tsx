"use client";
import { useState, useEffect } from "react";
import { fetchData } from "@/lib/api";
import { Product } from "@/type";
import ProductCard from "@/components/common/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Star, ArrowRight, Sparkles } from "lucide-react";
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
            <Target className="w-5 h-5 text-primary" />
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
            {/* Mảng dữ liệu giả để map cho gọn code và dễ quản lý */}
            {[
              {
                title: "Da khô thiếu ẩm",
                desc: "Thiết bị dưỡng ẩm chuyên sâu",
                img: "https://file.hstatic.net/1000041114/article/dull-skin_57004436aa1b45208777c428192e0ac4_1024x1024.png",
                link: "/shop?search=dry-skin"
              },
              {
                title: "Chống lão hóa",
                desc: "Công nghệ nâng cơ xóa nhăn",
                img: "https://citrinedermaclinic.vn/wp-content/uploads/2025/12/Nang-Co-Xoa-Nhan-Toan-Dien-So-Sanh-Tac-Dong-Cua-2-Cong-Nghe-HIFU-RF.jpg",
                link: "/shop?search=anti-aging"
              },
              {
                title: "Trị mụn, thâm",
                desc: "Ánh sáng blue light & LED",
                img: "https://dalieudhyd.vn/wp-content/uploads/2020/12/Blue-Light-Therapy.jpg",
                link: "/shop?search=acne"
              },
              {
                title: "Sáng da đều màu",
                desc: "Thiết bị làm sáng da hiệu quả",
                img: "https://media.vov.vn/sites/default/files/styles/large/public/2026-03/da_sam_mau.jpg",
                link: "/shop?search=brightening"
              }
            ].map((item, index) => (
              <Card key={index} className="flex flex-col group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-gray-200 hover:border-primary/50 p-0 h-full">
                {/* Header Image: Tràn viền giống mẫu */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                {/* Content Area: Dùng flex-grow để đẩy nút xuống dưới */}
                <CardContent className="p-6 flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Nút bấm nằm sát đáy card */}
                  <div className="mt-auto">
                    <Link href={item.link}>
                      <Button className="w-full text-white bg-primary hover:bg-primary-hover">
                        Mua ngay
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
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
