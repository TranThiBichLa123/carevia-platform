import React from "react";
import Container from "../Container";
import { topHelpCenter } from "@/constants/data";
import Link from "next/link";
import TopSocialLinks from "./TopSocialLinks";
import SelectCurrency from "./SelectCurrency";

const TopBanner = () => {
  return (
    <div className="w-full bg-[#A96BDE] text-white py-1 text-sm font-medium">
      <Container className="grid grid-cols-1 md:grid-cols-3">
        <div className="flex items-center gap-5">
          {topHelpCenter?.map((item) => (
              <Link
                key={item?.title}
                href={item?.href}
                className="hover:text-white hoverEffect"
              >
                {item?.title}
              </Link>
          ))}
        </div>
        <p className="text-center hidden md:inline-flex items-center justify-center">
          100% an toàn và bảo mật khi mua sắm tại Carevia
        </p>
        <div className="hidden md:inline-flex items-center justify-end">
          <SelectCurrency />
          <TopSocialLinks />
        </div>
      </Container>
    </div>
  );
};

export default TopBanner;
