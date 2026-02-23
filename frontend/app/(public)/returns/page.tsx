
"use client";

import React from "react";
import PremiumFeature from "@/components/common/PremiumFeature";
import { PackageOpen } from "lucide-react";

const ReturnsExchangePage = () => {
  return (
    <PremiumFeature
      icon={PackageOpen}
      title="Returns & Exchange Center"
      description="Complete returns and exchange management system. This premium feature provides a streamlined process for handling returns, exchanges, and refunds with automated workflows and tracking."
      features={[
        "Easy return request submission",
        "Automated return labels generation",
        "Real-time return tracking",
        "Exchange product selection",
        "Refund status monitoring",
        "Return policy documentation",
        "Customer support integration",
        "Return analytics and reporting",
      ]}
    />
  );
};

export default ReturnsExchangePage;
