import React from "react";
import PriceFormatter from "./PriceFormatter";

interface Props {
  price: number;
  discountPercentage: number;
}

const PriceContainer = ({ price, discountPercentage }: Props) => {
  const discountedPrice = price * (1 - discountPercentage / 100);
  return (
    <div className="flex items-center gap-2 text-sm">
      <PriceFormatter
        amount={price}
        className="text-gray-500 line-through font-medium"
      />
      <PriceFormatter amount={discountedPrice} className="text-red-600" />
    </div>
  );
};

export default PriceContainer;
