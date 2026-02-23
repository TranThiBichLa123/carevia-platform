
"use client";

import React from "react";
import PremiumFeature from "@/components/common/PremiumFeature";
import { MessageSquareQuote } from "lucide-react";

const TestimonialsPage = () => {
  return (
    <PremiumFeature
      icon={MessageSquareQuote}
      title="Customer Testimonials"
      description="Showcase authentic customer reviews and success stories. This premium feature displays comprehensive testimonials, ratings, and customer experiences to build trust and credibility."
      features={[
        "Verified customer testimonials",
        "Star ratings and reviews",
        "Customer success stories",
        "Video testimonials and interviews",
        "Before/after case studies",
        "Product-specific reviews",
        "Trust badges and certifications",
        "Social proof integration",
      ]}
    />
  );
};

export default TestimonialsPage;
