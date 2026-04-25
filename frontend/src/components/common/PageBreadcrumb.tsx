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
    <div className="mb-4 flex items-center justify-between">
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

      {/* Phần Share tối giản */}
      {/* {showSocialShare && shareData && (
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-medium text-gray-400 mr-1 uppercase tracking-wider">Share:</span>
          <Button variant="ghost" size="icon" onClick={() => handleShare("facebook")} className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
            <Facebook className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleShare("twitter")} className="h-8 w-8 text-gray-400 hover:text-sky-500 hover:bg-sky-50">
            <Twitter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleShare("copy")} className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-gray-100">
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>
      )} */}
    </div>
  );
};

export default PageBreadcrumb;



// "use client"; import React from "react"; import Link from "next/link"; import { Home, Facebook, Instagram, Twitter, Link as LinkIcon, } from "lucide-react"; import { Button } from "../../components/ui/button"; import { toast } from "sonner"; interface BreadcrumbItem { label: string; href?: string; } interface PageBreadcrumbProps { items: BreadcrumbItem[]; currentPage: string; showSocialShare?: boolean; shareData?: { title: string; text: string; url: string; }; } const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({ items, currentPage, showSocialShare = false, shareData, }) => { const handleShare = async (platform: string) => { if (!shareData) { toast.error("No share data available"); return; } const { title, text, url } = shareData; const shareText = `${title} - ${text}`; try { let shareUrl = ""; switch (platform) { case "facebook": shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent( url )}&quote=${encodeURIComponent(shareText)}`; break; case "twitter": shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent( shareText )}&url=${encodeURIComponent(url)}`; break; case "instagram": // Instagram doesn't support direct URL sharing, so we'll copy to clipboard await navigator.clipboard.writeText(`${shareText} ${url}`); toast.success( "Copied to clipboard! You can now paste it on Instagram" ); return; case "copy": await navigator.clipboard.writeText(`${shareText} ${url}`); toast.success("Link copied to clipboard!"); return; default: return; } if (shareUrl) { window.open(shareUrl, "_blank", "width=600,height=400"); } } catch (error) { console.error("Share failed:", error); toast.error("Failed to share. Please try again."); } }; return ( <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8"> <div className="flex items-center justify-between"> {/* Breadcrumb Navigation */} <div className="flex items-center gap-2 text-sm text-gray-500"> {/* Home Icon */} <Link href="/" className="hover:text-gray-700 transition-colors"> <Home className="w-4 h-4" /> </Link> {/* Dynamic Breadcrumb Items */} {items.map((item, index) => ( <React.Fragment key={index}> <span>/</span> {item.href ? ( <Link href={item.href} className="hover:text-gray-700 transition-colors" > {item.label} </Link> ) : ( <span>{item.label}</span> )} </React.Fragment> ))} {/* Current Page */} <span>/</span> <span className="text-gray-900 font-medium">{currentPage}</span> </div> {/* Social Share Icons */} {showSocialShare && shareData && ( <div className="flex items-center gap-2"> <span className="text-xs text-gray-500 mr-2">Share:</span> <Button variant="ghost" size="sm" onClick={() => handleShare("facebook")} className="w-8 h-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Share on Facebook" > <Facebook className="w-4 h-4" /> </Button> <Button variant="ghost" size="sm" onClick={() => handleShare("twitter")} className="w-8 h-8 p-0 hover:bg-sky-50 hover:text-sky-600 transition-colors" title="Share on Twitter" > <Twitter className="w-4 h-4" /> </Button> <Button variant="ghost" size="sm" onClick={() => handleShare("instagram")} className="w-8 h-8 p-0 hover:bg-pink-50 hover:text-pink-600 transition-colors" title="Share on Instagram" > <Instagram className="w-4 h-4" /> </Button> <Button variant="ghost" size="sm" onClick={() => handleShare("copy")} className="w-8 h-8 p-0 hover:bg-gray-50 hover:text-gray-700 transition-colors" title="Copy Link" > <LinkIcon className="w-4 h-4" /> </Button> </div> )} </div> </div> ); }; export default PageBreadcrumb;