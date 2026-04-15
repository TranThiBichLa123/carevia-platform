
"use client";

import React from "react";
import PremiumFeature from "@/components/common/PremiumFeature";
import { MoreHorizontal } from "lucide-react";

const OthersPage = () => {
  return (
    <PremiumFeature
      icon={MoreHorizontal}
      title="Additional Services"
      description="Discover our extended services and features. This premium section includes various additional services, tools, and resources that enhance your shopping experience and business operations."
      features={[
        "Custom branding services",
        "Bulk order management",
        "Business account features",
        "API access and integration",
        "White-label solutions",
        "Priority customer support",
        "Custom reporting tools",
        "Advanced customization options",
      ]}
    />
  );
};

export default OthersPage;
