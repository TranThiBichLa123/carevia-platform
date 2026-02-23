
"use client";

import React from "react";
import PremiumFeature from "@/components/common/PremiumFeature";
import { FileText } from "lucide-react";

const TermsConditionsPage = () => {
  return (
    <PremiumFeature
      icon={FileText}
      title="Terms and Conditions"
      description="Detailed terms of service and conditions of use. This premium legal documentation includes comprehensive terms, conditions, warranties, liabilities, and dispute resolution procedures."
      features={[
        "Complete terms of service",
        "User agreements and obligations",
        "Product warranties and guarantees",
        "Limitation of liability clauses",
        "Dispute resolution procedures",
        "Refund and cancellation policies",
        "Intellectual property rights",
        "Legal compliance documentation",
      ]}
    />
  );
};

export default TermsConditionsPage;
