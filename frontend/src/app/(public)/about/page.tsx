
"use client";

import React from "react";
import PremiumFeature from "@/components/common/PremiumFeature";
import { Info } from "lucide-react";

const AboutPage = () => {
  return (
    <PremiumFeature
      icon={Info}
      title="Về chúng tôi"
      description="Tìm hiểu về câu chuyện, sứ mệnh và giá trị của chúng tôi. Trang Giới thiệu này là một phần của gói cao cấp, bao gồm thông tin chi tiết về công ty, hồ sơ đội ngũ và cam kết của chúng tôi đối với sự xuất sắc."
      features={[
        "Lịch sử và câu chuyện đầy đủ của công ty",
        "Hồ sơ và tiểu sử thành viên đội ngũ",
        "Tuyên bố sứ mệnh và tầm nhìn",
        "Giá trị cốt lõi và nguyên tắc",
        "Cột mốc và thành tựu của công ty",
        "Tham gia cộng đồng và CSR",
        "Giải thưởng và chứng nhận",
        "Nội dung hậu trường",
      ]}
    />
  );
};

export default AboutPage;
