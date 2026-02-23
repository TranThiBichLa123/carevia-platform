
"use client";

import React from "react";
import PremiumFeature from "@/components/common/PremiumFeature";
import { Search } from "lucide-react";

const TopSearchesPage = () => {
  return (
    <PremiumFeature
      icon={Search}
      title="Top Searches & Trends"
      description="Discover trending products and popular search terms. This premium feature provides insights into what customers are searching for, helping you stay ahead of trends and find the most sought-after items."
      features={[
        "Real-time trending search terms",
        "Popular product categories",
        "Seasonal trend analysis",
        "Customer interest insights",
        "Smart search recommendations",
        "Historical trend data",
        "Personalized search suggestions",
        "Advanced search analytics",
      ]}
    />
  );
};

export default TopSearchesPage;
