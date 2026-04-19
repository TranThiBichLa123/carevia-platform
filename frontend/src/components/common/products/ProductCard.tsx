import { Product } from "@/types_enum/devices";
import Image from "next/image";
import React, { memo } from "react";
import PriceContainer from "../PriceContainer";
import Link from "next/link";
import DiscountBadge from "../DiscountBadge";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";

const ProductCard = ({ product }: { product: Product }) => {
  // 1. Tạo biến ID an toàn (kiểm tra cả id, _id và deviceId)
  const safeId = product?.id || (product as any)?._id || (product as any)?.deviceId;
  return (
    /* 1. Đổi hover:border thành primary-light (hoặc primary nếu muốn đậm hơn) */
    <div className="border border-gray-100 rounded-xl group overflow-hidden w-full relative bg-white hover:border-primary hover:shadow-lg transition-all duration-300">
      <Link
        href={`/client/devices/${safeId}`} // Sử dụng safeId ở đây
        className="overflow-hidden relative block"
      >
        <Image
          src={product?.image}
          width={500}
          height={500}
          alt="productImage"
          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {product?.discountPercentage > 0 && (
          <DiscountBadge discountPercentage={product.discountPercentage} />
        )}
      </Link>

      <div className="absolute top-2 left-2 z-20">
        <WishlistButton
          product={product}
          /* 2. WishlistButton hover có thể dùng primary-light cho nhẹ nhàng */
          className="bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 hover:bg-primary-light hover:text-primary transition-colors"
        />
      </div>

      <hr className="border-gray-50" />

      <div className="px-4 py-3 space-y-1">
        <p className="uppercase text-[10px] tracking-wider font-semibold text-gray-400">
          {product?.category?.name}
        </p>

        {/* 3. Tên sản phẩm khi hover sẽ đổi sang màu primary-hover */}
        <p className="line-clamp-2 text-sm h-10 font-medium text-gray-800 group-hover:text-primary-hover transition-colors">
          {product?.name}
        </p>

        <hr className="border-gray-100 my-1" />

        <div className="pt-1">
          <PriceContainer
            price={product?.price}
            originalPrice={product?.originalPrice}
          />
        </div>

        <AddToCartButton
          product={{
            ...product,
            // Kiểm tra mọi khả năng tên trường ID từ Backend trả về
            id: product.id || (product as any).deviceId || (product as any).device_id
          }}
        />
      </div>
    </div>
  );
};

export default memo(ProductCard);
