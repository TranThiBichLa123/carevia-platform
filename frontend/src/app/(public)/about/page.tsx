
"use client";

import React from "react";
import PremiumFeature from "@/components/common/PremiumFeature";
import { Info } from "lucide-react";

const AboutPage = () => {
  return (
    <PremiumFeature
      icon={Info}
      title="About Us"
      description="Learn about our story, mission, and values. This comprehensive About Us page is part of our premium package, featuring detailed company information, team profiles, and our commitment to excellence."
      features={[
        "Complete company history and story",
        "Team member profiles and bios",
        "Mission and vision statements",
        "Core values and principles",
        "Company milestones and achievements",
        "Community involvement and CSR",
        "Awards and certifications",
        "Behind-the-scenes content",
      ]}
    />
  );
};

export default AboutPage;
