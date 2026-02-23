"use client";

import React from "react";
import PremiumFeature from "@/components/common/PremiumFeature";
import { Shield } from "lucide-react";

const PrivacyPolicyPage = () => {
  return (
    <PremiumFeature
      icon={Shield}
      title="Privacy Policy"
      description="Comprehensive privacy policy and data protection information. This premium feature includes detailed privacy practices, GDPR compliance, data handling procedures, and customer rights protection."
      features={[
        "Complete privacy policy documentation",
        "GDPR compliance information",
        "Data collection and usage details",
        "Cookie policy and management",
        "Third-party data sharing policies",
        "User rights and data access",
        "Security measures and encryption",
        "Regular policy updates and notifications",
      ]}
    />
  );
};

export default PrivacyPolicyPage;