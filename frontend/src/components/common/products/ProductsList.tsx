import { fetchData, hasExplicitApiEndpoint } from "../../../lib/api";
import { Product } from "@/types_enum/devices";
import React from "react";
import ProductCard from "./ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { mockProducts } from "@/constants/data";

interface ProductsResponse {
  products: Product[];
}

const ProductsList = async () => {
  let products: Product[] = [];

  if (hasExplicitApiEndpoint()) {
    try {
      const data = await fetchData<ProductsResponse>("/products?perPage=10");
      products = data.products;
    } catch {
      products = [];
    }
  }

  if (products?.length === 0) {
    products = mockProducts;
  }

  return (
    <div className="w-full py-10 bg-white">
      {/* 1. Header Section */}
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
        {products?.map((product) => (
          <div key={product?._id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;