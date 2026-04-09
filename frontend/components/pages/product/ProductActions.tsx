"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Star, Loader2, ShoppingCart, CalendarCheck } from "lucide-react";
import { Product } from "@/type";
import WishlistButton from "@/components/common/products/WishlistButton";
import { toast } from "sonner";
import { useCartStore, useUserStore } from "@/lib/store";
import { useRouter } from "next/navigation";

interface ProductActionsProps {
  product: Product;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [localLoading, setLocalLoading] = useState(false);
  const { addToCart } = useCartStore(); // Remove isLoading from here
  const { isAuthenticated } = useUserStore();
  const router = useRouter();

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to cart");
      router.push("/auth/signin");
      return;
    }

    setLocalLoading(true);
    try {
      await addToCart(product, quantity);
      toast.success("Added to cart successfully!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const isButtonLoading = localLoading; // Only use localLoading

  function setShowBooking(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      {/* Product name with wishlist button */}
      {/* <div className="flex items-center justify-between gap-5">
        <h1 className="text-2xl font-bold line-clamp-1">{product?.name}</h1>
        <div className="flex items-center gap-2">
          <WishlistButton
            product={product}
            className="border border-babyshopTextLight hover:border-babyshopSky"
          />
          <button className="border border-babyshopTextLight p-2.5 rounded-full hover:border-babyshopSky hover:bg-babyshopSky hover:text-babyshopWhite hoverEffect">
            <Star size={20} />
          </button>
        </div>
      </div> */}

      {/* Quantity and Add to Cart */}
      {/* <div>
        <p className="mb-2">Quantity</p>
        <div className="flex items-center gap-5">
          <div className="border flex items-center gap-6 px-5 py-2 rounded-full">
            <button
              onClick={() => handleQuantityChange("decrease")}
              className="border-0 bg-transparent text-babyshopBlack hover:text-babyshopSky hoverEffect"
              disabled={isButtonLoading}
            >
              <Minus size={18} />
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => handleQuantityChange("increase")}
              className="border-0 bg-transparent text-babyshopBlack hover:text-babyshopSky hoverEffect"
              disabled={isButtonLoading}
            >
              <Plus size={18} />
            </button>
          </div>
          <Button
            onClick={handleAddToCart}
            variant="outline"
            disabled={isButtonLoading}
            className="flex-1 py-5 border-babyshopTextLight hover:border-babyshopSky hover:bg-babyshopSky hover:text-babyshopWhite text-base font-medium"
          >
            {isButtonLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              "Add to cart"
            )}
          </Button>
        </div>
      </div> */}

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Số lượng</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center border-2 border-border rounded-lg hover:border-primary hover:text-primary hoverEffect"
          >
            <Minus size={18} />
          </button>
          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center border-2 border-border rounded-lg hover:border-primary hover:text-primary hoverEffect"
          >
            <Plus size={18} />
          </button>
        </div>
        <span className="text-sm text-muted-foreground">{product.stock} sản phẩm có sẵn</span>
      </div>
      <div className="space-y-3 pt-2">
        <div className="flex gap-4">
          <button className="flex-1 h-14 flex items-center justify-center gap-2 bg-background text-primary font-bold border-2 border-primary rounded-xl hover:bg-primary/5 hoverEffect shadow-sm">
            <ShoppingCart size={20} />
            Thêm vào giỏ
          </button>
          <button className="flex-1 h-14 bg-accent text-accent-foreground font-bold rounded-xl hover:bg-accent/90 hoverEffect shadow-lg">
            Mua ngay
          </button>
        </div>

        {/* Booking Experience Button */}
        <button
          onClick={() => setShowBooking(true)}
          className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold rounded-xl hover:shadow-lg hoverEffect border-2 border-primary/20"
        >
          <CalendarCheck size={20} />
          Đặt Lịch Trải Nghiệm Sản Phẩm (Miễn Phí)
        </button>
        <p className="text-xs text-center text-muted-foreground italic">
          ✨ Xem và trải nghiệm sản phẩm thực tế tại cửa hàng trước khi quyết định mua
        </p>
      </div>




 {/* Booking Modal  trong notion */}
    
      




    </>
  );
};

export default ProductActions;
