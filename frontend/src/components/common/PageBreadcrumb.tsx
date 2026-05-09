"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Facebook, Instagram, Twitter, Link as LinkIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  currentPage: string;
  showSocialShare?: boolean;
  shareData?: { title: string; text: string; url: string };
}

const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  items,
  currentPage,
  showSocialShare = false,
  shareData,
}) => {
  const handleShare = async (platform: string) => {
    if (!shareData) {
      toast.error("Không có thông tin chia sẻ");
      return;
    }
    const { title, text, url } = shareData;
    const shareText = `${title} - ${text}`;
    try {
      let shareUrl = "";
      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
          break;
        case "instagram":
        case "copy":
          await navigator.clipboard.writeText(`${shareText} ${url}`);
          toast.success(platform === "instagram" ? "Đã chép link! Bạn có thể dán lên Instagram." : "Đã sao chép liên kết!");
          return;
      }
      if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=400");
    } catch (error) {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className=" flex items-center justify-between">
      {/* Cấu trúc Breadcrumb chuẩn như hình */}
      <nav className="flex items-center space-x-2 font-vietnam text-[13px]">
        <Link 
          href="/client" 
          className="text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          Trang chủ
        </Link>

        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-muted-foreground">{item.label}</span>
            )}
          </React.Fragment>
        ))}

        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="font-bold text-primary tracking-tight">
          {currentPage}
        </span>
      </nav>

     
    </div>
  );
};

export default PageBreadcrumb;



