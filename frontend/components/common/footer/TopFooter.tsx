import { footerTopData } from "@/constants/data";
import Image from "next/image";
import React from "react";
import Container from "../Container";

const TopFooter = () => {
  return (
    <Container className="py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {footerTopData?.map((item) => (
        <div
          key={item?.title}
          className="flex items-center gap-4 lg:border-r lg:border-gray-300 last:border-r-0"
        >
          {/* Giảm nhẹ kích thước icon nếu cần bằng cách thêm width/height */}
          <Image 
            src={item?.image} 
            alt="footerOneImage" 
            width={40} 
            height={40} 
            className="object-contain"
          />
          <div>
            {/* Chuyển text-lg thành text-base (16px) */}
            <h3 className="text-base font-semibold capitalize mb-0.5">
              {item?.title}
            </h3>
            {/* Giảm subtitle xuống một chút (13px) để phân cấp với tiêu đề 16px */}
            <p className="text-[13px] font-medium text-babyshopBlack/60 leading-tight">
              {item?.subTitle}
            </p>
          </div>
        </div>
      ))}
    </Container>
  );
};

export default TopFooter;
