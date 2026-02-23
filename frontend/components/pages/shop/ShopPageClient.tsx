"use client";

import PremiumFeature from "@/components/common/PremiumFeature";
import { Store } from "lucide-react";
import { Brand, Category } from "@/type";

interface Props {
  categories: Category[];
  brands: Brand[];
}

const ShopPageClient = ({ categories, brands }: Props) => {
  const shopFeatures = [
    "Advanced product filtering by category, brand, and price range",
    "Real-time search functionality with instant results",
    "Multiple product sorting options (price, name, popularity)",
    "Responsive grid layout with optimized product cards",
    "Lazy loading and infinite scroll for better performance",
    "Dynamic price range slider for precise filtering",
    "Mobile-friendly filters with collapsible sidebar",
    "Product quick view with detailed information",
    "Integration with wishlist and cart functionality",
    "SEO-optimized product listings and URLs",
    "Analytics tracking for user behavior insights",
    "Custom pagination with load more feature",
  ];

  return (
    <PremiumFeature
      icon={Store}
      title="Advanced Shop Features"
      description="The Advanced Shop with filtering, sorting, and search capabilities is part of our premium package. Upgrade to unlock a professional shopping experience with powerful product discovery tools."
      features={shopFeatures}
    />
  );
};
export default ShopPageClient;
