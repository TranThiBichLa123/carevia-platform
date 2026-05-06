"use client";

import { useState, useEffect } from "react";
import { getUserWishlist } from "@/lib/wishlistApi";

export default function FavoriteBadge({ productId }: { productId: string | number }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Hàm lấy token từ cookie (vì đây là client side)
    const getToken = () => {
      const cookies = document.cookie.split(";").reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split("=");
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      return cookies.auth_token;
    };

    const checkWishlist = async () => {
      const token = getToken();
      if (!token) return;

      const res = await getUserWishlist(token);
      if (res.success) {
        const exists = res.wishlist.includes(String(productId));
        setIsFavorite(exists);
      }
    };

    checkWishlist();
  }, [productId]);

  if (!isFavorite) return null;

  return (
    <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-md mb-3 shadow-sm animate-fade-in">
      YÊU THÍCH
    </span>
  );
}
