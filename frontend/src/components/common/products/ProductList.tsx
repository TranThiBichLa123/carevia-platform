"use client";

import { Product } from "@/types_enum/devices";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
}

const ProductList = ({ products }: Props) => {
  return (
    <div className="w-full p-5 grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {products?.map((product, index) => (
        <ProductCard key={product?.id || index} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
