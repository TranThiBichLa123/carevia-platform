"use client";

import React, { useEffect, useState } from "react";
import TopFooter from "./TopFooter";
import HrLine from "../HrLine";
import Container from "../Container";
import { Title } from "../text";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { payment } from "../../../assets/image";
import { backofficeApi, type BusinessSettings } from "@/lib/backofficeApi";

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

const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "Carevia SkinTech Center",
  hotline: "1900 6868",
  supportEmail: "support@carevia.vn",
  storeAddress: "12 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City",
  storeHours: "08:00 - 21:00 | Mon - Sun",
  supportNote: "Dat lich trai nghiem truoc khi den cua hang de duoc chuan bi may demo va ky thuat vien phu hop.",
};

const Footer = () => {
  const [businessInfo, setBusinessInfo] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);

  useEffect(() => {
    let active = true;

    const loadBusinessSettings = async () => {
      try {
        const settings = await backofficeApi.getBusinessSettings();
        if (active) {
          setBusinessInfo(settings);
        }
      } catch {
        if (active) {
          setBusinessInfo(DEFAULT_BUSINESS_SETTINGS);
        }
      }
    };

    void loadBusinessSettings();

    return () => {
      active = false;
    };
  }, []);

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
          <Title className="text-[15px] font-semibold font-vietnam mb-3">Liên hệ Carevia</Title>
          <div className="space-y-3 text-black/70 font-vietnam">
            <div>
              <p className="font-semibold text-black">{businessInfo.businessName}</p>
              <p className="mt-1 text-xs leading-5">{businessInfo.supportNote}</p>
            </div>
            <div className="space-y-2 text-[13px]">
              <a href={`tel:${businessInfo.hotline}`} className="flex items-start gap-2 hover:text-[#159fd8] transition-colors">
                <Phone size={14} className="mt-0.5 shrink-0" />
                <span>{businessInfo.hotline}</span>
              </a>
              <a href={`mailto:${businessInfo.supportEmail}`} className="flex items-start gap-2 hover:text-[#159fd8] transition-colors">
                <Mail size={14} className="mt-0.5 shrink-0" />
                <span>{businessInfo.supportEmail}</span>
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>{businessInfo.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-black/50">
                <ArrowRight size={14} className="shrink-0" />
                <span>{businessInfo.storeHours}</span>
              </div>
            </div>
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
