"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/common/Container";
import ProductCard from "@/components/common/products/ProductCard";
import { deviceApi, BrandData, DeviceData } from "@/lib/deviceApi";
import { mockProducts } from "@/constants/data";
import { Product } from "@/types_enum/devices";
import { Loader2, Package, Star, TrendingUp, ChevronRight } from "lucide-react";

const BrandDetailPage = () => {
  const params = useParams();
  const brandId = params.id as string;

  const [brand, setBrand] = useState<BrandData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [apiDevices, setApiDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [useApi, setUseApi] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    const fetchBrandData = async () => {
      setLoading(true);
      try {
        // Try fetching brand info and products from API
        const [brandsRes, devicesRes] = await Promise.allSettled([
          deviceApi.getBrands(),
          deviceApi.getAll({ brandId: Number(brandId), size: 20 }),
        ]);

        if (brandsRes.status === "fulfilled") {
          const found = brandsRes.value.find((b) => String(b.id) === brandId);
          if (found) setBrand(found);
        }

        if (devicesRes.status === "fulfilled" && devicesRes.value.items.length > 0) {
          setApiDevices(devicesRes.value.items);
          setUseApi(true);
          setLoading(false);
          return;
        }
      } catch {}

      // Fallback: use mock data
      const mockBrandProducts = mockProducts.filter(
        (p) => p.brand._id === brandId || p.brand.slug === brandId
      );
      setProducts(mockBrandProducts);

      if (mockBrandProducts.length > 0) {
        const b = mockBrandProducts[0].brand;
        setBrand({
          id: Number(b._id) || 0,
          name: b.name,
          slug: b.slug,
          image: b.image,
          description: "",
          isFeatured: b.isFeatured || false,
          isActive: true,
        });
      }
      setLoading(false);
    };

    fetchBrandData();
  }, [brandId]);

  const getSortedProducts = () => {
    const items = [...products];
    switch (sortBy) {
      case "price-asc":
        return items.sort((a, b) => a.price - b.price);
      case "price-desc":
        return items.sort((a, b) => b.price - a.price);
      case "newest":
        return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "rating":
        return items.sort((a, b) => b.averageRating - a.averageRating);
      default:
        return items.sort((a, b) => b.sold - a.sold);
    }
  };

  if (loading) {
    return (
      <Container className="min-h-screen flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </Container>
    );
  }

  const totalProducts = useApi ? apiDevices.length : products.length;

  return (
    <Container className="bg-[#f4f4f4] min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <nav className="text-[13px] tracking-wider text-gray-500 flex items-center gap-2">
          <Link href="/client" className="hover:text-teal-600 transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={12} />
          <Link href="/client/brand" className="hover:text-teal-600 transition-colors">
            Thương hiệu
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-900">{brand?.name || "Thương hiệu"}</span>
        </nav>
      </div>

      {/* Brand Hero */}
      {brand && (
        <div className="container mx-auto px-4 mb-6">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="relative bg-gradient-to-r from-teal-50 to-cyan-50 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {brand.image && (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-sm border flex items-center justify-center p-4 flex-shrink-0">
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
                    {brand.name}
                  </h1>
                  {brand.description && (
                    <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed">
                      {brand.description}
                    </p>
                  )}
                  <div className="flex items-center gap-6 mt-4 justify-center md:justify-start">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Package size={14} className="text-teal-600" />
                      <span className="font-bold">{totalProducts}</span> sản phẩm
                    </div>
                    {brand.isFeatured && (
                      <div className="flex items-center gap-1.5 text-sm text-amber-600">
                        <Star size={14} fill="currentColor" />
                        <span className="font-bold">Thương hiệu nổi bật</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="container mx-auto px-4">
        <div className="bg-white border border-gray-200 p-6">
          {/* Toolbar */}
          <div className="flex flex-wrap justify-between items-end mb-6 pb-4 border-b border-gray-200 gap-4">
            <div>
              <h2 className="text-[13px] font-black uppercase tracking-wider text-gray-900">
                Sản phẩm của {brand?.name || "thương hiệu"}
              </h2>
              <p className="text-[13px] text-gray-500 font-medium mt-1">
                <span className="text-gray-900 font-bold">{totalProducts}</span> sản phẩm
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[13px] border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:border-teal-400"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp → Cao</option>
                <option value="price-desc">Giá: Cao → Thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {totalProducts === 0 ? (
            <div className="text-center py-16">
              <TrendingUp className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-500">Chưa có sản phẩm</h3>
              <p className="text-sm text-gray-400 mt-2">
                Thương hiệu này chưa có sản phẩm nào. Hãy quay lại sau nhé!
              </p>
              <Link href="/client/devices">
                <button className="mt-6 px-6 py-3 bg-teal-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-teal-700 transition-all">
                  Xem tất cả sản phẩm
                </button>
              </Link>
            </div>
          ) : useApi ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {apiDevices.map((device) => (
                <Link key={device.id} href={`/client/devices/${device.id}`}>
                  <div className="group border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all bg-white overflow-hidden">
                    <div className="aspect-square bg-gray-100 overflow-hidden relative">
                      <img
                        src={device.image}
                        alt={device.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {device.discountPercentage > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5">
                          -{device.discountPercentage}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">
                        {device.category?.name || brand?.name}
                      </p>
                      <h3 className="text-[13px] font-bold text-gray-800 line-clamp-2 leading-snug min-h-[36px]">
                        {device.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900">
                          {device.price.toLocaleString("vi-VN")}₫
                        </span>
                        {device.originalPrice > device.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {device.originalPrice.toLocaleString("vi-VN")}₫
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={10} fill="#facc15" className="text-yellow-400" />
                        <span className="text-[11px] text-gray-500">
                          {device.averageRating.toFixed(1)} ({device.sold} đã bán)
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getSortedProducts().map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default BrandDetailPage;