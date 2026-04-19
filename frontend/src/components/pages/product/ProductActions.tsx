"use client";
import React, { useState } from "react";
import {
  Minus,
  Plus,
  Loader2,
  ShoppingCart,
  CalendarCheck,
  Check,
  X,
  ArrowRight,
  Package,
} from "lucide-react";
import { Product } from "@/types_enum/devices";
import { toast } from "sonner";
import { useCartStore, useUserStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProductWithLegacyId = Product & {
  deviceId?: string | number;
};

const getProductId = (product: ProductWithLegacyId) =>
  product.id || product._id || (product.deviceId ? String(product.deviceId) : "");

interface ProductActionsProps {
  product: Product;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [localLoading, setLocalLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const { addToCart, cartItemsWithQuantities } = useCartStore();
  const { isAuthenticated } = useUserStore();
  const router = useRouter();
  const safeProductId = getProductId(product as ProductWithLegacyId);
  const isOutOfStock = product.stock <= 0;

  const updateQuantity = (nextQuantity: number) => {
    const maxQuantity = Math.max(1, product.stock || 1);
    setQuantity(Math.max(1, Math.min(nextQuantity, maxQuantity)));
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      router.push("/auth/signin");
      return;
    }

    if (!safeProductId || isOutOfStock) {
      toast.error("Sản phẩm hiện không thể thêm vào giỏ hàng");
      return;
    }

    setLocalLoading(true);
    try {
      await addToCart(product, quantity);
      toast.success("Đã thêm vào giỏ hàng!", {
        description: `${product.name} x${quantity}`,
        duration: 3000,
      });
      setShowMiniCart(true);
      setTimeout(() => setShowMiniCart(false), 4000);
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Thêm vào giỏ thất bại, vui lòng thử lại.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      router.push("/auth/signin");
      return;
    }

    if (!safeProductId || isOutOfStock) {
      toast.error("Sản phẩm hiện đã hết hàng");
      return;
    }

    setBuyNowLoading(true);
    try {
      await addToCart(product, quantity);
      router.push("/client/user/checkout");
    } catch (error) {
      console.error("Buy now error:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setBuyNowLoading(false);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để đặt lịch trải nghiệm");
      router.push("/auth/signin");
      return;
    }

    if (!safeProductId) {
      toast.error("Không xác định được sản phẩm để đặt lịch");
      return;
    }

    router.push(`/client/booking?deviceId=${safeProductId}`);
  };

  return (
    <>
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">
          Số lượng
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => updateQuantity(quantity - 1)}
            disabled={localLoading || buyNowLoading || isOutOfStock}
            className="w-10 h-10 flex items-center justify-center border-2 border-border rounded-lg hover:border-primary hover:text-primary hoverEffect disabled:opacity-50"
          >
            <Minus size={18} />
          </button>
          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
          <button
            onClick={() => updateQuantity(quantity + 1)}
            disabled={localLoading || buyNowLoading || isOutOfStock}
            className="w-10 h-10 flex items-center justify-center border-2 border-border rounded-lg hover:border-primary hover:text-primary hoverEffect disabled:opacity-50"
          >
            <Plus size={18} />
          </button>
        </div>
        <span className="text-sm text-muted-foreground">
          {isOutOfStock ? "Tạm hết hàng" : `${product.stock} sản phẩm có sẵn`}
        </span>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex gap-4">
          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={localLoading || buyNowLoading || isOutOfStock}
            className="flex-1 h-14 flex items-center justify-center gap-2 bg-background text-primary font-bold border-2 border-primary rounded-xl hover:bg-primary/5 hoverEffect shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {localLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ShoppingCart size={20} />
            )}
            {localLoading ? "Đang thêm..." : isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
          </button>

          {/* Buy Now */}
          <button
            onClick={handleBuyNow}
            disabled={localLoading || buyNowLoading || isOutOfStock}
            className="flex-1 h-14 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 hoverEffect shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {buyNowLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ArrowRight size={20} />
            )}
            {buyNowLoading ? "Đang xử lý..." : isOutOfStock ? "Hết hàng" : "Mua ngay"}
          </button>
        </div>

        {/* Booking Experience Button */}
        {product.isBookingAvailable && (
          <>
            <button
              onClick={handleBooking}
              className="w-full h-14 flex items-center justify-center gap-2 bg-linear-to-r from-primary to-primary/80 text-white font-bold rounded-xl hover:shadow-lg hoverEffect border-2 border-primary/20"
            >
              <CalendarCheck size={20} />
              Đặt Lịch Trải Nghiệm Sản Phẩm (Miễn Phí)
            </button>
            <p className="text-xs text-center text-muted-foreground italic">
              ✨ Xem và trải nghiệm sản phẩm thực tế tại cửa hàng trước khi
              quyết định mua
            </p>
          </>
        )}
      </div>

      {/* Mini Cart Popup */}
      {showMiniCart && cartItemsWithQuantities.length > 0 && (
        <div className="fixed top-20 right-4 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl animate-in slide-in-from-right-5 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-green-50 rounded-t-xl">
            <div className="flex items-center gap-2 text-green-700">
              <Check size={16} className="bg-green-600 text-white rounded-full p-0.5" />
              <span className="text-sm font-bold">Đã thêm vào giỏ hàng</span>
            </div>
            <button
              onClick={() => setShowMiniCart(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Cart Items Preview (last 3) */}
          <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
            {cartItemsWithQuantities.slice(-3).map((item) => {
              const safeId = getProductId(item.product as ProductWithLegacyId);
              return (
                <div
                  key={safeId}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {item.product.image ? (
                      <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    x{item.quantity} · ${item.product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            )})}
          </div>

          {/* Footer */}
          <div className="p-3 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                {cartItemsWithQuantities.length} sản phẩm trong giỏ
              </span>
              <span className="font-bold text-gray-900">
                $
                {cartItemsWithQuantities
                  .reduce(
                    (s, i) => s + i.product.price * i.quantity,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex gap-2">
              <Link href="/client/user/cart" className="flex-1">
                <button className="w-full py-2.5 text-xs font-bold border-2 border-gray-200 rounded-lg hover:border-primary hover:text-primary transition-all">
                  Xem giỏ hàng
                </button>
              </Link>
              <Link href="/client/user/checkout" className="flex-1">
                <button className="w-full py-2.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                  Thanh toán
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductActions;
