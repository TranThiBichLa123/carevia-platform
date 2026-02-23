
"use client";

import React from "react";
import PremiumFeature from "@/components/common/PremiumFeature";
import { Handshake } from "lucide-react";

const ProgramsPage = () => {
  return (
    <PremiumFeature
      icon={Handshake}
      title="Partnership Programs"
      description="Explore our comprehensive partnership and affiliate programs. This premium feature includes detailed information about wholesale opportunities, associate programs, and business collaboration options."
      features={[
        "Affiliate program enrollment",
        "Wholesale pricing tiers",
        "Partner dashboard access",
        "Commission tracking system",
        "Marketing materials and assets",
        "Exclusive partner benefits",
        "Performance analytics",
        "Dedicated partnership support",
      ]}
    />
  );
};

export default ProgramsPage;
