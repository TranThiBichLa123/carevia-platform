"use client";
import { Button } from "../../../components/ui/button";
import { useCartStore, useUserStore } from "../../../lib/store";
import { cn } from "../../../lib/utils";
import { Product } from "../../../types_enum/devices";
import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addToCart, syncCartFromServer } = useCartStore(); // Remove isLoading from here
  const { isAuthenticated } = useUserStore();
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();

 const handleAddToCart = async (e: React.MouseEvent) => {
  e.preventDefault();
  if (!isAuthenticated) {
    toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
    router.push("/auth/signin");
    return;
  }

  setLocalLoading(true);
  try {
    // 1. Gửi dữ liệu lên Server
    await addToCart(product, 1); 
    
    // 2. Ép Store gọi lại API GET để cập nhật số lượng mới nhất từ DB
    if (typeof syncCartFromServer === 'function') {
      await syncCartFromServer(); 
    }

    toast.success("Thêm vào giỏ hàng thành công!");
  } catch (error) {
    toast.error("Thêm vào giỏ hàng thất bại");
  } finally {
    setLocalLoading(false);
  }
};

  return (
    <Button
      onClick={handleAddToCart}
      variant="outline"
      disabled={localLoading} // Only use localLoading
      className={cn("rounded-lg px-4 mt-1 font-vietnam hover:bg-primary-light hover:text-primary transition-colors", className)}
    >
      {localLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Đang thêm...
        </>
      ) : (
        <>
          <ShoppingCart className=" h-4" />
          Thêm vào giỏ hàng
        </>
      )}
    </Button>
  );
};

export default AddToCartButton;
