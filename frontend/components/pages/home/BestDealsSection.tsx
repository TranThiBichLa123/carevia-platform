"use client";
import { useState, useEffect } from "react";
import { fetchData } from "@/lib/api";
import { Product } from "@/type";
import ProductCard from "@/components/common/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag } from "lucide-react";
import Link from "next/link";

const BestDealsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchData<Product[]>("/products?limit=8");
        // Filter products with discounts
        const discountedProducts = response.filter(
          (product) => product.discountPercentage > 0
        );
        setProducts(discountedProducts.slice(0, 6));
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-babyshopRed" />
            <Badge
              variant="outline"
              className="text-babyshopRed border-babyshopRed"
            >
              Limited Time
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Best Deals Today
          </h2>
          <p className="text-gray-600">
            Don&apos;t miss out on these amazing deals - while supplies last!
          </p>
        </div>
        <Link href="/shop">
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 hover:bg-babyshopSky hover:text-white hover:border-babyshopSky transition-colors"
          >
            Shop All Items
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/shop">
              <Button className="w-full bg-babyshopSky hover:bg-babyshopSky/90">
                Shop All Items
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Deals Available
          </h3>
          <p className="text-gray-600 mb-6">
            Check back soon for amazing deals and discounts!
          </p>
          <Link href="/shop">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default BestDealsSection;
