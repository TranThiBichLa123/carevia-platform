import React from "react";
import PriceFormatter from "./PriceFormatter";

interface Props {
  price: number;         // Giá hiện tại (35.00)
  originalPrice: number;  // Giá gốc (50.00)
}

const PriceContainer = ({ price, originalPrice }: Props) => {
  // Chỉ hiện giá gốc gạch ngang nếu nó thực sự lớn hơn giá bán
  const isDiscounted = originalPrice > price;

  return (
    <div className="flex items-center gap-2">
      {isDiscounted && (
        <PriceFormatter
          amount={originalPrice}
          className="text-gray-400 line-through text-sm font-normal"
        />
      )}
      <PriceFormatter
        amount={price}
        className="text-red-600 font-bold text-base"
      />
    </div>
  );
};

export default PriceContainer;
