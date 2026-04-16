"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "../../../lib/store";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";

const CartIcon = () => {
  const { cartItemsWithQuantities } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering cart count on server
  if (!mounted) {
    return (
      <Link
        href={"/client/user/cart"}
        /* Thêm group để kiểm soát hover và set màu primary cố định */
        // nó không hover được là vì không gọi api được nên lỗi á
        className="relative group text-primary hover:text-primary-hover hoverEffect"
      >
        {/* Icon giỏ hàng */}
        <ShoppingBag size={24} />

        {/* Vòng tròn chứa số 0: Bỏ border-white và giữ bg-primary */}
        <span
          className="absolute -right-2 -top-2 
                   bg-primary text-white 
                   text-[10px] font-bold 
                   w-4 h-4 rounded-full 
                   flex items-center justify-center 
                   hoverEffect"
        >
          0
        </span>
      </Link>
    );
  }


  const totalItems = cartItemsWithQuantities.length; // Number of unique products instead of total quantity

  return (
    <Link
      href={"/client/user/cart"}
      className="relative hover:text-babyshopSky hoverEffect"
    >
      <ShoppingBag />
      <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
        {totalItems > 99 ? "99+" : totalItems}
      </span>
    </Link>
  );
};

export default CartIcon;
