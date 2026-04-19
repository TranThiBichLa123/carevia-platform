"use client";
import React, { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useUserStore, useWishlistStore } from "../../../lib/store";
import { addToWishlist, removeFromWishlist } from "../../../lib/wishlistApi";
import { Product } from "@/types_enum/devices";
import { useIsHydrated } from "../../../hooks";

interface WishlistButtonProps {
  product: Product;
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  className = "",
}) => {
  const { isAuthenticated, auth_token } = useUserStore();
  const {
    isInWishlist,
    addToWishlist: addToWishlistStore,
    removeFromWishlist: removeFromWishlistStore,
  } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(false);
  const isHydrated = useIsHydrated();
  // --- BƯỚC 1: LẤY ID CHUẨN ---
  // Đảm bảo productId là một chuỗi có giá trị, hoặc null
  const productId = (product.id || (product as any).value?.id || (product as any)._id)?.toString() || null;

  // --- BƯỚC 2: CHECK TRẠNG THÁI ---
  // Chỉ check khi productId tồn tại, nếu không có ID thì không bao giờ đỏ
  const isInWishlistState = (isHydrated && productId) ? isInWishlist(productId) : false;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      console.error("Product data is missing ID:", product);
      toast.error("Missing product ID");
      return;
    }

    if (!isAuthenticated || !auth_token) {
      toast.error("Please sign in to add items to wishlist");
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlistState) {
        await removeFromWishlist(productId, auth_token);
        removeFromWishlistStore(productId);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(productId, auth_token);

        // Đảm bảo object lưu vào store có trường .id khớp với productId đã tìm
        const productToStore = { ...product, id: productId };
        addToWishlistStore(productToStore);

        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  // --- BƯỚC 3: RENDER ---
  if (!isAuthenticated || !isHydrated || !productId) {
    return null;
  }

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors hover:bg-gray-100 ${isInWishlistState ? "text-red-500" : "text-gray-400"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      title={isInWishlistState ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={20}
        fill={isInWishlistState ? "currentColor" : "none"}
        className={isLoading ? "animate-pulse" : ""}
      />
    </button>
  );
};

export default WishlistButton;
