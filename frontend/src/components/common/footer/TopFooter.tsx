import { footerTopData } from "@/constants/data";
import Image from "next/image";
import React from "react";
import Container from "../Container"; // Đảm bảo Container đã có sẵn padding/margin auto

const TopFooter = () => {
  return (
    /* 1. Thẻ div này sẽ tạo đường kẻ xám chạy hết chiều ngang màn hình */
    <div className="w-full border-t border-gray-200 border-b"> 
      
      {/* 2. Thẻ Container này sẽ bóp nội dung vào giữa (có margin left/right) */}
      <Container className="py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {footerTopData?.map((item) => (
          <div
            key={item?.title}
            className="flex items-center gap-4 lg:border-r lg:border-gray-300 last:border-r-0"
          >
            <Image 
              src={item?.image} 
              alt="footerOneImage" 
              width={40} 
              height={40} 
              className="object-contain"
            />
            <div>
              <h3 className="text-[15px] font-semibold capitalize mb-0.5">
                {item?.title}
              </h3>
              <p className="text-[13px] font-medium text-babyshopBlack/60 leading-tight">
                {item?.subTitle}
              </p>
            </div>
          </div>
        ))}
      </Container>

    </div>
  );
};

export default TopFooter;
