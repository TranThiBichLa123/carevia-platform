"use client";
import { Heart } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useUserStore, useWishlistStore } from "../../../lib/store";
import { useIsHydrated } from "../../../hooks";

const WishlistIcon = () => {
  const { isAuthenticated, authUser } = useUserStore();
  const { wishlistIds } = useWishlistStore();
  const isHydrated = useIsHydrated();

  // Only show for authenticated users and after hydration
  if (!isAuthenticated || !authUser || !isHydrated) {
    return null;
  }

  return (
    <Link
      href="/user/wishlist"
      className="relative hover:text-babyshopSky hoverEffect"
      title="My Wishlist"
    >
      <Heart size={24} />
      {wishlistIds.length > 0 && (
        <span className="absolute -right-2 -top-2 bg-babyshopSky text-babyshopWhite text-[11px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
          {wishlistIds.length > 99 ? "99+" : wishlistIds.length}
        </span>
      )}
    </Link>
  );
};

export default WishlistIcon;
