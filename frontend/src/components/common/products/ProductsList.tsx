import { Product } from "@/types_enum/devices";
import React from "react";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { deviceApi } from "@/lib/deviceApi";
import { mapDeviceToProduct } from "@/lib/mappers";

const ProductsList = async () => {
  let products: Product[] = [];

  try {
    const data = await deviceApi.getPopular(10);
    products = data.map(mapDeviceToProduct);
  } catch {
    try {
      const pageData = await deviceApi.getAll({ size: 10, sort: "sold,desc" });
      products = pageData.items.map(mapDeviceToProduct);
    } catch {
      products = [];
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-2">
        <div className="relative">
          <h2 className="text-base md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            {/* Chuyển class màu xanh (primary) vào chữ Thiết bị */}
            <span className="text-primary">Thiết bị</span> phổ biến
          </h2>

          {/* Thanh gạch chân màu xanh đặc trưng như trong hình */}
          <div className="absolute -bottom-2.25 left-0 w-full h-0.75 bg-sky-500 rounded-full z-10" />
        </div>

        <Link
          href="/client/devices"
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-sky-600 transition-colors"
        >
          Xem tất cả <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products?.map((product, index) => (
          <div key={product?.id || index} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;