import { Product } from "@/type";
import Image from "next/image";
import React, { memo } from "react";
import PriceContainer from "../PriceContainer";
import Link from "next/link";
import DiscountBadge from "../DiscountBadge";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="border rounded-md group overflow-hidden w-full relative">
      <Link
        href={`/product/${product?._id}`}
        className="p-2 overflow-hidden relative block"
      >
        <Image
          src={product?.image}
          width={500}
          height={500}
          alt="productIamge"
          className="w-full h-32 object-cover group-hover:scale-110 hoverEffect"
        />
        <DiscountBadge
          discountPercentage={product?.discountPercentage}
          className="absolute top-4 left-2"
        />
      </Link>

      {/* Wishlist Button */}
      <div className="absolute top-2 right-2 z-10">
        <WishlistButton product={product} className="bg-white shadow-sm" />
      </div>

      <hr />
      <div className="px-4 py-2 space-y-1">
        <p className="uppercase text-xs font-medium text-babyshopTextLight">
          {product?.category?.name}
        </p>
        <p className="line-clamp-2 text-sm">{product?.name}</p>
        <PriceContainer
          price={product?.price}
          discountPercentage={product?.discountPercentage}
        />
        <AddToCartButton product={product} />
      </div>
    </div>
  );
};

export default memo(ProductCard);
