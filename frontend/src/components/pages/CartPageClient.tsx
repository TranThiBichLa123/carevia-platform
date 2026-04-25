"use client";
import React, { useState, useEffect } from "react";
import { useCartStore, useUserStore } from "@/lib/store";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import PriceFormatter from "@/components/common/PriceFormatter";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "./OrdersPage";
import { Button } from "../ui/button";

type CartProduct = {
  id?: string;
  _id?: string;
  deviceId?: string | number;
  name: string;
  image?: string;
  price: number;
};

const getCartProductId = (product: CartProduct) =>
  product.id || product._id || (product.deviceId ? String(product.deviceId) : "");

const CartPageClient = () => {
  const {
    cartItemsWithQuantities,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    syncCartFromServer,
  } = useCartStore();
  const { auth_token } = useUserStore();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeCart = async () => {
      if (auth_token) {
        try {
          await syncCartFromServer();
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
      setIsLoading(false);
    };

    initializeCart();
  }, [auth_token, syncCartFromServer]);

  const calculateSubtotal = () => {
    return cartItemsWithQuantities.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 100 ? 0 : 15; // Free shipping over $100
    const tax = subtotal * 0.08; // 8% tax
    return subtotal + shipping + tax;
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(itemId);
      return;
    }
    try {
      await updateCartItemQuantity(itemId, newQuantity);
      toast.success("Quantity updated");
    } catch (error) {
      console.error("Failed to update quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Failed to remove item:", error);
      toast.error("Failed to remove item from cart");
    }
  };

  const handleClearCart = () => {
    setShowClearDialog(true);
  };

  const confirmClearCart = async () => {
    try {
      await clearCart();
      setShowClearDialog(false);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      if (!auth_token) {
        toast.error("You must be logged in to place an order.");
        setIsCheckingOut(false);
        return;
      }

      // Redirect to checkout page with cart items
      router.push(`/client/user/checkout`);
      toast.success("Redirecting to checkout...");
    } catch (error) {
      console.error("Error navigating to checkout:", error);
      toast.error("Failed to navigate to checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <Container className="py-5">
        {/* Breadcrumb Skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <span>/</span>
              <Skeleton className="h-4 w-8" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>

        {/* Title Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-24 mb-2" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Cart Items Section Skeleton */}
          <div className="xl:col-span-3">
            <div className="bg-babyshopWhite rounded-2xl border border-gray-100 shadow-sm p-6">
              {/* Table Header Skeleton - Desktop */}
              <div className="hidden lg:grid grid-cols-12 gap-4 py-4 border-b border-gray-200 mb-6">
                <div className="col-span-6">
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="col-span-2 text-center">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </div>
                <div className="col-span-2 text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
                <div className="col-span-2 text-center">
                  <Skeleton className="h-4 w-16 mx-auto" />
                </div>
              </div>

              {/* Cart Items Skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 lg:p-0 lg:border-0 lg:rounded-none"
                  >
                    {/* Mobile Layout Skeleton */}
                    <div className="block lg:hidden">
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-20 h-20 rounded-lg" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-8" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout Skeleton */}
                    <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                      <div className="lg:col-span-6 flex items-center gap-4">
                        <Skeleton className="w-20 h-20 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <div className="lg:col-span-2 text-center">
                        <Skeleton className="h-5 w-16 mx-auto" />
                      </div>
                      <div className="lg:col-span-2 flex justify-center">
                        <Skeleton className="h-10 w-32" />
                      </div>
                      <div className="lg:col-span-2 text-center">
                        <Skeleton className="h-5 w-20 mx-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions Skeleton */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-200">
                <Skeleton className="h-12 w-full sm:w-48" />
                <Skeleton className="h-12 w-full sm:w-32" />
              </div>
            </div>
          </div>

          {/* Cart Totals Skeleton */}
          <div className="xl:col-span-1">
            <div className="bg-babyshopWhite rounded-2xl p-6 sticky top-4 border border-gray-100 shadow-sm">
              <Skeleton className="h-6 w-24 mb-6" />

              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2"
                  >
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}

                <div className="my-4">
                  <Skeleton className="h-px w-full" />
                </div>

                <div className="flex justify-between items-center py-2">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>

              <Skeleton className="h-12 w-full mt-6" />

              <div className="mt-4 text-center">
                <Skeleton className="h-3 w-32 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (cartItemsWithQuantities.length === 0) {
    return (
      <Container className="py-5">
        <div className="bg-babyshopWhite rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col items-center justify-center min-h-125 text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-8">
              <ShoppingCart className="w-16 h-16 text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Giỏ hàng của bạn đang trống.
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md">
              Bạn có thể xem tất cả các sản phẩm có sẵn và mua một số sản phẩm trong cửa hàng.
            </p>
            <Link href="/shop">
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium"
              >
                Quay lại cửa hàng
              </Button>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl w-full">
              {/* Item 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2"> {/* Giảm xuống text-sm */}
                  Lựa chọn chất lượng cao
                </h3>
                <p className="text-[13px] text-gray-600"> {/* Giảm mô tả xuống 13px để phân cấp rõ rệt */}
                  Kiểm soát chất lượng sản phẩm tổng thể để yên tâm
                </p>
              </div>

              {/* Item 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowLeft className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2"> {/* Thêm text-sm */}
                  Giá cả phải chăng
                </h3>
                <p className="text-[13px] text-gray-600">
                  Giá trực tiếp từ nhà máy để tiết kiệm tối đa
                </p>
              </div>

              {/* Item 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-2"> {/* Thêm text-sm */}
                  Giao hàng nhanh
                </h3>
                <p className="text-[13px] text-gray-600">
                  Giao hàng nhanh, đáng tin cậy từ kho hàng toàn cầu
                </p>
              </div>
            </div>

          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Breadcrumb */}
      <PageBreadcrumb
        items={[]}
        currentPage="Giỏ hàng"
        showSocialShare={true}
        shareData={{
          title: "Giỏ hàng của tôi",
          text: `Xem giỏ hàng của tôi với ${cartItemsWithQuantities.length} sản phẩm${cartItemsWithQuantities.length !== 1 ? "s" : ""
            } từ Carevia!`,
          url: typeof window !== "undefined" ? window.location.href : "",
        }}
      />



      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Cart Items Section */}
        <div className="xl:col-span-3">
          <div className="bg-babyshopWhite rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Cart Table Header - Only visible on larger screens */}
            <div className="hidden lg:grid grid-cols-12 gap-4 py-4 border-b border-gray-200 mb-6">
              <div className="col-span-6 text-sm font-medium text-gray-900 uppercase tracking-wide">
                Sản phẩm
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-900 uppercase tracking-wide text-center">
                Giá
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-900 uppercase tracking-wide text-center">
                Số lượng
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-900 uppercase tracking-wide text-center">
                Tổng cộng
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItemsWithQuantities.map((cartItem, index) => (
                <div

                  key={getCartProductId(cartItem.product) || `temp-key-${index}`}
                  className="border border-gray-100 rounded-lg p-4 lg:p-0 lg:border-0 lg:rounded-none"
                >
                  {/* Mobile Layout */}
                  <div className="block lg:hidden">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <Link href={`/product/${getCartProductId(cartItem.product)}`}>
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 hover:scale-105 transition-transform duration-200 cursor-pointer">
                          {cartItem.product.image ? (
                            <Image
                              src={cartItem.product.image}
                              alt={cartItem.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ShoppingCart className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${cartItem.product.id}`}>
                          <h3 className="font-medium text-gray-900 mb-2 text-sm leading-5 hover:text-blue-600 transition-colors cursor-pointer">
                            {cartItem.product.name}
                          </h3>
                        </Link>

                        {/* Price and Quantity Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Giá
                            </span>
                            <PriceFormatter
                              amount={cartItem.product.price}
                              className="text-sm font-medium text-gray-900"
                            />
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(
                                  cartItem.product.id,
                                  cartItem.quantity - 1
                                )
                              }
                              className="h-8 w-8 p-0 hover:bg-gray-50 border-0 rounded-none"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <div className="h-8 w-10 flex items-center justify-center border-x border-gray-300 bg-gray-50 text-xs font-medium">
                              {cartItem.quantity}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleQuantityChange(
                                getCartProductId(cartItem.product),
                                cartItem.quantity + 1
                              )}

                              className="h-8 w-8 p-0 hover:bg-gray-50 border-0 rounded-none"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Subtotal and Remove */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-gray-500 block">
                              Tổng cộng
                            </span>
                            <PriceFormatter
                              amount={
                                cartItem.product.price * cartItem.quantity
                              }
                              className="text-sm font-semibold text-gray-900"
                            />
                          </div>

                          <Button
                            variant="clean"
                            size="sm"
                            onClick={() => handleRemoveItem(getCartProductId(cartItem.product) || `temp-key-${index}`)}

                            className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 h-auto text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100">
                    {/* Product Info */}
                    <div className="lg:col-span-6 flex items-center gap-4">
                      <Link href={`/product/${cartItem.product.id}`}>
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 hover:scale-105 transition-transform duration-200 cursor-pointer">
                          {cartItem.product.image ? (
                            <Image
                              src={cartItem.product.image}
                              alt={cartItem.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <ShoppingCart className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${cartItem.product.id}`}>
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                            {cartItem.product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="clean"
                            size="sm"
                            onClick={() =>
                              handleRemoveItem(cartItem.product.id)
                            }
                            className="text-red-500  p-0 h-auto text-xs"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="lg:col-span-2 text-center">
                      <PriceFormatter
                        amount={cartItem.product.price}
                        className="text-base font-medium text-gray-900"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="lg:col-span-2 flex justify-center">
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              getCartProductId(cartItem.product) || `temp-key-${index}`,
                              cartItem.quantity - 1
                            )
                          }
                          className="h-10 w-10 p-0 hover:bg-gray-50 border-0 rounded-none"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <div className="h-10 w-12 flex items-center justify-center border-x border-gray-300 bg-gray-50 text-sm font-medium">
                          {cartItem.quantity}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleQuantityChange(
                              cartItem.product.id,
                              cartItem.quantity + 1
                            )
                          }
                          className="h-10 w-10 p-0 hover:bg-gray-50 border-0 rounded-none"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="lg:col-span-2 text-center">
                      <PriceFormatter
                        amount={cartItem.product.price * cartItem.quantity}
                        className="text-base font-semibold text-gray-900"
                      />
                    </div>
                  </div>
                </div>

              ))}
            </div>

            {/* Cart Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-8 pt-6 border-t border-gray-200">
              <Link href="/client" className="flex-1 sm:flex-initial">
                <Button
                  variant="outline"
                  size="lg"
                  className={cn(
                    "group relative w-full sm:w-auto rounded-full px-5 py-6 overflow-hidden",
                    "font-vietnam font-bold tracking-tight text-primary border-primary",
                    "bg-white transition-all duration-500 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-primary/30"
                  )}
                >
                  {/* Lớp nền trượt màu Primary */}
                  <span className="absolute inset-y-0 left-0 w-0 bg-primary transition-all duration-500 ease-out group-hover:w-full" />

                  {/* Nội dung bên trên lớp nền */}
                  <div className="relative z-10 flex items-center justify-center transition-colors duration-500 group-hover:text-white">
                    <ArrowLeft
                      className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-2"
                    />
                    <span>Tiếp tục mua sắm</span>
                  </div>
                </Button>
              </Link>

              <Button
                onClick={handleClearCart}
                variant="outline"
                size="lg"
                className={cn(
                  "group relative w-full sm:w-auto rounded-full px-10 py-6 overflow-hidden",
                  "font-vietnam font-bold tracking-tight text-red-600 border-red-200",
                  "bg-white transition-all duration-500 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-red-200"
                )}
              >
                {/* Lớp nền trượt màu Đỏ (Danger) */}
                <span className="absolute inset-y-0 left-0 w-0 bg-red-600 transition-all duration-500 ease-out group-hover:w-full" />

                {/* Nội dung bên trên lớp nền */}
                <div className="relative z-10 flex items-center justify-center transition-colors duration-500 group-hover:text-white">
                  <Trash2
                    className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                  />
                  <span>Xóa giỏ hàng</span>
                </div>
              </Button>

            </div>
          </div>
        </div>

        {/* Tổng giỏ hàng */}
        <div className="xl:col-span-1">
          <div className="bg-babyshopWhite rounded-2xl p-6 sticky top-4 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Tổng giỏ hàng
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Tạm tính</span>
                <PriceFormatter
                  amount={calculateSubtotal()}
                  className="text-base font-medium text-gray-900"
                />
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Vận chuyển</span>
                <span className="text-base font-medium">
                  {calculateSubtotal() > 100 ? (
                    <span className="text-green-600">Miễn phí vận chuyển</span>
                  ) : (
                    <PriceFormatter
                      amount={15}
                      className="text-base font-medium text-gray-900"
                    />
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Thuế</span>
                <PriceFormatter
                  amount={calculateSubtotal() * 0.08}
                  className="text-base font-medium text-gray-900"
                />
              </div>

              {calculateSubtotal() > 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm font-medium">
                    🎉 Bạn đủ điều kiện để được miễn phí vận chuyển!
                  </p>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                <PriceFormatter
                  amount={calculateTotal()}
                  className="text-xl font-bold text-gray-900"
                />
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={isCheckingOut || cartItemsWithQuantities.length === 0}
              className="w-full mt-6 bg-black hover:bg-gray-800 text-white rounded-full py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCheckingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang tạo đơn hàng...
                </>
              ) : (
                "Tiến hành thanh toán"
              )}
            </Button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Thanh toán an toàn • Mã hóa SSL
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <AlertDialog
        open={showClearDialog}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setShowClearDialog(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa giỏ hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa giỏ hàng của mình không? Hành động này không thể
              hoàn tác và tất cả các mặt hàng sẽ bị xóa khỏi giỏ hàng của bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowClearDialog(false)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClearCart}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Có, Xóa giỏ hàng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default CartPageClient;
