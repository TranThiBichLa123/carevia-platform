"use client";
import React, { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useUserStore, useWishlistStore } from "../../../lib/store";
import { addToWishlist, removeFromWishlist } from "../../../lib/wishlistApi";
import { Product } from "@/types_enum/devices";
import { useIsHydrated } from "../../../hooks";
import { cn } from "@/lib/utils";
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
    removeFromWishlist: removeFromWishlistStore
  } = useWishlistStore();

  const [isLoading, setIsLoading] = useState(false);
  const isHydrated = useIsHydrated();

  const productId = (product.id || (product as any).value?.id || (product as any)._id)?.toString() || null;
  const isInWishlistState = isHydrated && productId ? isInWishlist(productId) : false;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      toast.error("Thiếu ID sản phẩm");
      return;
    }

    if (!isAuthenticated || !auth_token) {
      toast.error("Vui lòng đăng nhập để thực hiện");
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlistState) {
        await removeFromWishlist(productId, auth_token);
        removeFromWishlistStore(productId);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlist(productId, auth_token);
        const productToStore = { ...product, id: productId };
        addToWishlistStore(productToStore);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // Hydration Fix: Giữ nguyên cấu trúc thẻ để Server/Client khớp nhau
  if (!isHydrated) {
    return (
      <div className={cn("p-2 rounded-full text-gray-200", className)}>
        <Heart size={20} />
      </div>
    );
  }

  if (!productId || !isAuthenticated) return null;

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
