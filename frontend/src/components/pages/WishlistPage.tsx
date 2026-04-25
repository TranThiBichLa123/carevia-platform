"use client";
import React, { useEffect, useState } from "react";
import Container from "@/components/common/Container";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUserStore, useWishlistStore } from "@/lib/store";
import {
  getUserWishlist,
  getWishlistProducts,
  removeFromWishlist,
  clearWishlist,
} from "@/lib/wishlistApi";
import { Product } from "@/types_enum/devices";
import Image from "next/image";
import Link from "next/link";
import PriceFormatter from "@/components/common/PriceFormatter";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "../ui/breadcrumb";
import ProductCard from "../common/products/ProductCard";
import { motion } from "framer-motion";

const WishlistPage = () => {
  const [mounted, setMounted] = useState(false); // BƯỚC 1: Xử lý Hydration
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const router = useRouter();
  const { isAuthenticated, auth_token } = useUserStore();
  const {
    wishlistItems,
    setWishlistItems,
    setWishlistIds,
    removeFromWishlist: removeFromWishlistStore,
    clearWishlist: clearWishlistStore,
  } = useWishlistStore();

  // Đảm bảo chỉ render nội dung sau khi đã mount vào Client
  useEffect(() => {
    setMounted(true);
    if (isAuthenticated === false) { // Kiểm tra rõ ràng giá trị false
      router.push("/auth/signin");
      return;
    }
    fetchWishlistData();
  }, [isAuthenticated, auth_token]);

  const fetchWishlistData = async () => {
    if (!auth_token) return;
    try {
      setLoading(true);
      const wishlistResponse = await getUserWishlist(auth_token);
      if (wishlistResponse.success && wishlistResponse.wishlist.length > 0) {
        setWishlistIds(wishlistResponse.wishlist);
        const productsResponse = await getWishlistProducts(wishlistResponse.wishlist, auth_token);
        if (productsResponse.success) {
          setWishlistItems(productsResponse.products);
        }
      } else {
        setWishlistIds([]);
        setWishlistItems([]);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!auth_token) return;
    try {
      setRemoving(productId);
      await removeFromWishlist(productId, auth_token);

      // BƯỚC 2: Cập nhật UI ngay lập tức
      removeFromWishlistStore(productId);
      // Lọc trực tiếp mảng items để biến mất khỏi màn hình ngay
      setWishlistItems(wishlistItems.filter((item) => item.id !== productId));

      toast.success("Đã xóa khỏi danh sách");
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm");
    } finally {
      setRemoving(null);
    }
  };

  const handleClearWishlist = async () => {
    if (!auth_token) return;
    try {
      await clearWishlist(auth_token);
      clearWishlistStore();
      setWishlistItems([]); // Clear UI
      toast.success("Đã dọn sạch danh sách");
    } catch (error) {
      toast.error("Lỗi khi dọn dẹp");
    }
  };

  // Tránh lỗi Hydration: Render khung rỗng ở Server
  if (!mounted) {
    return <Container className="py-8"><div className="h-screen" /></Container>;
  }

  if (loading) {
    return (
      <Container className="">
        {/* Thay PageBreadcrumb cũ bằng Breadcrumb tự động */}
        <Breadcrumb />

        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    );
  }


  return (
    <Container className="py-5">
      <PageBreadcrumb
        // items={[{ label: "User", href: "/user/profile" }]}
        items={[]}
        currentPage="Wishlist"
        showSocialShare={false}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          {/* <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "item" : "items"} in your wishlist
            </p>
          </div> */}
          {wishlistItems.length > 0 && (
            <Button
              onClick={handleClearWishlist}
              variant="outline"
              className="group relative ml-auto border-red-500 bg-transparent px-6 py-2 text-red-600 transition-colors duration-300 hover:text-white"
            >
              <span className="absolute inset-0 w-0 bg-red-600 transition-all duration-300 ease-out group-hover:w-full"></span>
              <span className="relative flex items-center">
                <Trash2 size={16} className="mr-2 group-hover:animate-bounce" />
                Xóa tất cả
              </span>
            </Button>


          )}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center"
          >
            {/* Icon với hiệu ứng nhịp đập */}
            <div className="relative mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="bg-red-50 p-6 rounded-full"
              >
                <Heart size={64} className="text-red-400 fill-red-100" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-1 -right-1 bg-white p-2 rounded-full shadow-sm"
              >
                {/* <ShoppingBag size={20} className="text-primary" /> */}
              </motion.div>
            </div>

            {/* Nội dung văn bản */}
            <h2 className="text-2xl font-bold font-vietnam text-gray-900 mb-3 tracking-tight">
              Danh sách yêu thích đang trống
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 leading-relaxed font-vietnam text-[15px]">
              Hãy lấp đầy trái tim bằng những thiết bị chăm sóc da tuyệt vời. Chúng tôi sẽ giúp bạn lưu giữ chúng tại đây!
            </p>

            {/* Nút bấm với hiệu ứng trượt nền (như đã làm ở trên) */}
            <Button
              asChild
              className="group relative overflow-hidden bg-primary px-10 py-6 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            >
              <Link href="/shop" className="flex items-center text-white">
                <span className="absolute inset-0 w-0 bg-white/10 transition-all duration-300 group-hover:w-full" />
                <ShoppingBag size={18} className="mr-2 group-hover:animate-bounce" />
                <span className="font-semibold tracking-wide">Khám phá cửa hàng</span>
              </Link>
            </Button>
          </motion.div>
        )
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((product: Product) => (
                <div key={product.id || (product as any).deviceId}>
                  <ProductCard product={product} />

                  {/* Nút xóa riêng biệt của trang Wishlist (nếu bạn muốn giữ lại bên ngoài Card) */}
                  {/* <div className="mt-2">
                    <Button
                      onClick={() => handleRemoveItem(product.id)}
                      disabled={removing === product.id}
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 text-xs gap-2"
                    >
                      {removing === product.id ? (
                        <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Trash2 size={12} />
                          Bỏ yêu thích
                        </>
                      )}
                    </Button>
                  </div> */}
                </div>
              ))}
            </div>)

        }
      </div>
    </Container>
  );
};

export default WishlistPage;
