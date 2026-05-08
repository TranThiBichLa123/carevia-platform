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
  { title: "Về chúng tôi", href: "/about" },
  { title: "Tìm kiếm hàng đầu", href: "/search" },
  { title: "Chính sách bảo mật", href: "/privacy" },
  { title: "Điều khoản và điều kiện", href: "/terms" },
  { title: "Lời chứng thực", href: "/testimonials" },
];
const CustomerTab = [
  { title: "Tài khoản của tôi", href: "/client/user/profile" },
  { title: "Theo dõi đơn hàng", href: "/client/account?tab=orders" },
  { title: "Cửa hàng", href: "/shop" },
  { title: "Danh sách yêu thích", href: "/client/user/wishlist" },
  { title: "Trả hàng/Đổi hàng", href: "/returns" },
];
const OthersTab = [
  { title: "Chương trình đối tác", href: "/programs" },
  { title: "Chương trình cộng tác", href: "/programs" },
  { title: "Bán buôn tất", href: "/programs" },
  { title: "Bán buôn tất hài hước", href: "/programs" },
  { title: "Khác", href: "/others" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-white text-[13px]">
      <TopFooter />
      <HrLine />
      {/* FooterMiddle - Giảm py-10 xuống py-8 để gọn hơn */}
      <Container className="py-4 hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div>
          {/* Title text-[15px] khớp với TopFooter */}
          <Title className="text-[15px] font-semibold font-vietnam mb-3">Thông tin</Title>
          <div className="flex flex-col gap-2">
            {informationTab?.map((item) => (
              <Link
                href={item?.href}
                key={item?.title}
                className="text-black/70 hover:text-[#159fd8] transition-colors font-vietnam"
              >
                {item?.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <Title className="text-[15px] font-semibold font-vietnam mb-3">Chăm sóc khách hàng</Title>
          <div className="flex flex-col gap-2">
            {CustomerTab?.map((item) => (
              <Link
                href={item?.href}
                key={item?.title}
                className="text-black/70 hover:text-[#159fd8] transition-colors font-vietnam"
              >
                {item?.title}
              </Link>
            ))}
          </div>
        </div>{" "}
        <div>
          <Title className="text-[15px] font-semibold font-vietnam mb-3">Doanh nghiệp khác</Title>
          <div className="flex flex-col gap-2">
            {OthersTab?.map((item) => (
              <Link
                href={item?.href}
                key={item?.title}
                className="text-black/70 hover:text-[#159fd8] transition-colors font-vietnam"
              >
                {item?.title}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <Title className="text-[15px] font-semibold font-vietnam mb-3">Bản tin</Title>
          <div className="flex flex-col gap-2 relative">
            {/* Thu nhỏ chiều cao input từ h-14 xuống h-12 cho cân đối */}
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="border border-gray-200 focus:border-[#159fd8] outline-none rounded-full pl-4 pr-14 h-12 placeholder:text-black/40 text-[13px] transition-all"
            />
            <button className="bg-[#159fd8] text-white w-12 h-12 rounded-full flex items-center justify-center absolute top-0 right-0 hover:bg-[#1a8e91] transition-colors">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Container>
      <HrLine />
      {/* FooterBottom - Giảm khoảng cách dọc */}
      <Container className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-black/60">
        <p className="font-vietnam">© 2026 Carevia. Tất cả quyền được bảo lưu.</p>
        <div className="flex items-center gap-3">
          <p className="font-vietnam">Chúng tôi sử dụng phương thức thanh toán an toàn cho</p>
          <Image src={payment} alt="paymentImage" className="h-5 w-auto object-contain" />
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
