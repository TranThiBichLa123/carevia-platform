"use client"; // Bắt buộc vì có dùng hooks

import SectionView from "@/components/common/SectionView";
import { Brand } from "@/type";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

interface Props {
  brands: Brand[];
}

const HomeBrand = ({ brands }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cấu hình màu nền cho các card
  const bgColors = ["bg-[#2b2b2b]", "bg-[#1a3a4a]", "bg-[#3b2a1a]", "bg-[#2d3436]"];

  // Logic tự động chuyển slide sau mỗi 3 giây
  useEffect(() => {
    if (!brands?.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % brands.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [brands.length]);

  if (!brands?.length) return null;

  // Lấy ra 4 brand để hiển thị cùng lúc (hoặc tùy biến số lượng)
  // Ở đây tôi hiển thị 4 brands và cho chúng lướt theo vòng lặp
  const displayedBrands = [];
  for (let i = 0; i < 4; i++) {
    displayedBrands.push(brands[(currentIndex + i) % brands.length]);
  }

  return (
    <div className="mt-1">
      <SectionView title="Thương hiệu nổi bật" href="/shop" hrefTitle="Xem tất cả" />

      {/* Container chính với hiệu ứng mượt */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 transition-all duration-700 ease-in-out">
        {displayedBrands.map((brand, index) => {
          const color = bgColors[(currentIndex + index) % bgColors.length];
          return (
            <Link
              key={`${brand?._id}-${index}`}
              href={`/shop?brand=${brand?._id}`}
              className={`${color} rounded-4xl overflow-hidden relative h-52 group hover:scale-[1.03] transition-all duration-500 shadow-xl`}
            >
              {/* Background Image Overlay */}
              {brand?.image && (
                <Image
                  src={brand.image}
                  alt={brand.name || "Brand Image"}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw" // Thêm sizes để tối ưu hiệu năng
                  className="object-cover opacity-10 group-hover:opacity-20 transition-opacity"
                // unoptimized // Bật cái này nếu bạn không muốn cấu hình remotePatterns trong next.config.js
                />
              )}

              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                {/* gap là khoảng cách của tên brand và hình của brand */}
                <div className="flex items-center gap-4">
                  {/* <!-- Bỏ p-2 và đổi thành object-cover --> */}
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-2xl transform group-hover:rotate-3 transition-transform">
                    <Image
                      src={brand?.image || ""}
                      alt={brand?.name || ""}
                      width={80}
                      height={80}
                       className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <span className="text-white font-bold text-lg">{brand?.name}</span>
                </div>

                <div className="mt-auto">
                  <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-lg font-black text-xs mb-2 shadow-lg">
                    UP TO 80% OFF
                  </div>
                  <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Khám phá ngay</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination Dots - Tự động nhảy theo currentIndex */}
      <div className="flex justify-center items-center gap-3 mt-10">
        {brands.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`transition-all duration-500 rounded-full ${i === currentIndex
              ? "w-10 h-2.5 bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"
              : "w-2.5 h-2.5 bg-gray-200 hover:bg-gray-400"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeBrand;
