import React from "react";
import TopFooter from "./TopFooter";
import HrLine from "../HrLine";
import Container from "../Container";
import { Title } from "../text";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { payment } from "../../../assets/image";

const informationTab = [
  { title: "About Us", href: "/about" },
  { title: "Top Searches", href: "/search" },
  { title: "Privacy Policy", href: "/privacy" },
  { title: "Terms and Conditions", href: "/terms" },
  { title: "Testimonials", href: "/testimonials" },
];
const CustomerTab = [
  { title: "My Account", href: "/user/profile" },
  { title: "Track Order", href: "/user/orders" },
  { title: "Shop", href: "/shop" },
  { title: "Wishlist", href: "/user/wishlist" },
  { title: "Returns/Exchange", href: "/returns" },
];
const OthersTab = [
  { title: "Partnership Programs", href: "/programs" },
  { title: "Associate Program", href: "/programs" },
  { title: "Wholesale Socks", href: "/programs" },
  { title: "Wholesale Funny Socks", href: "/programs" },
  { title: "Others", href: "/others" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-white text-[13px]">
      <TopFooter />
      <HrLine />
      {/* FooterMiddle - Giảm py-10 xuống py-8 để gọn hơn */}
      <Container className="py-4 hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div>
          {/* Title text-base = 16px khớp với TopFooter */}
          <Title className="text-base font-semibold mb-3">Information</Title>
          <div className="flex flex-col gap-2">
            {informationTab?.map((item) => (
              <Link
                href={item?.href}
                key={item?.title}
                className="text-black/70 hover:text-[#20afb2] transition-colors"
              >
                {item?.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <Title className="text-base font-semibold mb-3">Customer Care</Title>
          <div className="flex flex-col gap-2">
            {CustomerTab?.map((item) => (
              <Link
                href={item?.href}
                key={item?.title}
                className="text-black/70 hover:text-[#20afb2] transition-colors"
              >
                {item?.title}
              </Link>
            ))}
          </div>
        </div>{" "}
        <div>
          <Title className="text-base font-semibold mb-3">Other Business</Title>
          <div className="flex flex-col gap-2">
            {OthersTab?.map((item) => (
              <Link
                href={item?.href}
                key={item?.title}
                className="text-black/70 hover:text-[#20afb2] transition-colors"
              >
                {item?.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <Title className="text-base font-semibold mb-3">Newsletter</Title>
          <div className="flex flex-col gap-2 relative">
            {/* Thu nhỏ chiều cao input từ h-14 xuống h-12 cho cân đối */}
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-gray-200 focus:border-[#20afb2] outline-none rounded-full pl-4 pr-14 h-12 placeholder:text-black/40 text-[13px] transition-all"
            />
            <button className="bg-[#20afb2] text-white w-12 h-12 rounded-full flex items-center justify-center absolute top-0 right-0 hover:bg-[#1a8e91] transition-colors">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Container>
      <HrLine />
      {/* FooterBottom - Giảm khoảng cách dọc */}
      <Container className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-black/60">
        <p>© 2024 Babyshop Theme. All rights reserved.</p>
        <div className="flex items-center gap-3">
          <p>We using safe payment for</p>
          <Image src={payment} alt="paymentImage" className="h-5 w-auto object-contain" />
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
