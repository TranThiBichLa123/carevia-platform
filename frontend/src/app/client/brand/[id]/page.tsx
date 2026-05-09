"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Container from "@/components/common/Container";
import ProductCard from "@/components/common/products/ProductCard";
import { deviceApi, BrandData, DeviceData } from "@/lib/deviceApi";
import { mapDeviceToProduct } from "@/lib/mappers";
import { Loader2, Package, Star, TrendingUp, ChevronRight, ChevronLeft, Tag } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";

const PAGE_SIZE = 12;

const SORT_MAP: Record<string, string> = {
  popular: "sold,desc",
  newest: "createdAt,desc",
  "price-asc": "price,asc",
  "price-desc": "price,desc",
  rating: "averageRating,desc",
};

const BrandDetailPage = () => {
  const params = useParams();
  const brandId = params.id as string;

  const [brand, setBrand] = useState<BrandData | null>(null);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);

  useEffect(() => {
    deviceApi.getBrands().then((brands) => {
      const found = brands.find((b) => String(b.id) === brandId);
      if (found) setBrand(found);
    }).catch(() => { });
  }, [brandId]);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await deviceApi.getAll({
        brandId: Number(brandId),
        size: PAGE_SIZE,
        page,
        sort: SORT_MAP[sortBy] ?? "sold,desc",
        onlyDiscounted: onlyDiscounted || undefined,
      });
      setDevices(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (e) {
      console.error("Error fetching brand devices:", e);
    } finally {
      setLoading(false);
    }
  }, [brandId, sortBy, page, onlyDiscounted]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(0);
  };

  const handleDiscountToggle = () => {
    setOnlyDiscounted((prev) => !prev);
    setPage(0);
  };

  return (
    <Container className="bg-white font-vietnam min-h-screen pb-20 ">
      {/* Breadcrumb */}
      <div className="my-4 " >
        <PageBreadcrumb
          items={[{ label: " Tất cả thương hiệu", href: "/client/brand" }]}
          currentPage={brand?.name || "Thương hiệu"}
          showSocialShare={false}
        />
      </div>

      {/* Brand Hero */}
      {brand && (
        <div className="container mx-auto mb-6">
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="relative bg-blue-50 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {brand.image && (
                  /* 1. Xóa p-4 để ảnh sát viền, thêm overflow-hidden để bo góc ảnh theo khung */
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={brand.image}
                      alt={brand.name}
                      /* 2. Đổi object-contain thành object-cover để ảnh lấp đầy khung hình */
                      className="w-full h-full object-cover"
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
                  <div className="flex items-center gap-6 mt-4 justify-center md:justify-start flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Package size={14} className="text-primary" />
                      <span className="font-bold">{totalItems}</span> sản phẩm
                    </div>
                    {brand.isFeatured && (
                      <div className="flex items-center gap-1.5 text-sm text-amber-600">
                        <Star size={14} fill="currentColor" />
                        <span className="font-bold">Thương hiệu nổi bật</span>
                      </div>
                    )}
                    {brand.maxDiscountPercentage != null && brand.maxDiscountPercentage > 0 && (
                      <div className="flex items-center gap-1.5 text-sm text-red-500">
                        <Tag size={14} />
                        <span className="font-bold">Giảm đến {Math.round(brand.maxDiscountPercentage)}%</span>
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
      <div className="container mx-auto">
        <div className="bg-white border border-gray-200 p-6">
          {/* Toolbar */}
          <div className="flex flex-wrap justify-between items-end mb-6 pb-4 border-b border-gray-200 gap-4">
            <div>
              <h2 className="text-[13px] font-black uppercase tracking-wider text-gray-900">
                Sản phẩm của {brand?.name || "thương hiệu"}
              </h2>
              <p className="text-[13px] text-gray-500 font-medium mt-1">
                <span className="text-gray-900 font-bold">{totalItems}</span> sản phẩm
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleDiscountToggle}
                className={`flex items-center gap-1.5 text-[12px] font-bold px-3 py-2 border transition-colors ${onlyDiscounted
                  ? "bg-yellow-400 border-yellow-400 text-gray-900"
                  : "border-gray-200 text-gray-600 hover:border-yellow-400"
                  }`}
              >
                <Tag size={12} />
                Đang giảm giá
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-vietnam font-bold text-gray-900 uppercase tracking-tighter">Sắp xếp:</span>

                <div className="relative group min-w-[160px]">
                  {/* Hiển thị giá trị đang chọn */}
                  <div className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md cursor-pointer hover:border-primary transition-all">
                    <span className="text-[13px] font-vietnam font-medium text-gray-700">
                      {sortBy === 'popular' && "Phổ biến nhất"}
                      {sortBy === 'newest' && "Mới nhất"}
                      {sortBy === 'price-asc' && "Giá: Thấp → Cao"}
                      {sortBy === 'price-desc' && "Giá: Cao → Thấp"}
                      {sortBy === 'rating' && "Đánh giá cao nhất"}
                    </span>
                    <svg className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Menu lựa chọn */}
                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="flex flex-col whitespace-nowrap">
                      {[
                        { v: 'popular', l: 'Phổ biến nhất' },
                        { v: 'newest', l: 'Mới nhất' },
                        { v: 'price-asc', l: 'Giá: Thấp → Cao' },
                        { v: 'price-desc', l: 'Giá: Cao → Thấp' },
                        { v: 'rating', l: 'Đánh giá cao nhất' }
                      ].map((item) => (
                        <div
                          key={item.v}
                          onClick={() => handleSortChange(item.v)}
                          className={`px-3 py-2.5 text-[13px] font-vietnam cursor-pointer transition-colors border-b border-gray-50 last:border-0 
              ${sortBy === item.v ? 'text-primary bg-primary/10' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {item.l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-16">
              <TrendingUp className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-500">
                {onlyDiscounted ? "Không có sản phẩm đang giảm giá" : "Chưa có sản phẩm"}
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                {onlyDiscounted
                  ? "Thương hiệu này hiện chưa có sản phẩm giảm giá."
                  : "Thương hiệu này chưa có sản phẩm nào."}
              </p>
              {onlyDiscounted ? (
                <button
                  onClick={() => setOnlyDiscounted(false)}
                  className="mt-6 px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all"
                >
                  Xem tất cả sản phẩm
                </button>
              ) : (
                <Link href="/client/devices">
                  <button className="mt-6 px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary-dark transition-all">
                    Xem tất cả sản phẩm
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {devices.map((device) => (
                  <ProductCard key={device.id} product={mapDeviceToProduct(device)} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 border border-gray-200 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-9 h-9 text-[13px] font-bold border transition-colors ${i === page
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 hover:border-primary text-gray-700"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="p-2 border border-gray-200 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
};

export default BrandDetailPage;