import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
  href: string;
  hrefTitle: string;
}

const SectionView = ({ title, href, hrefTitle }: Props) => {
  // Logic tách chữ: lấy 2 chữ đầu tiên cho màu xanh
  const words = title.split(" ");

  // Lấy 2 từ đầu tiên (ví dụ: "Thương hiệu")
  const firstTwoWords = words.slice(0, 2).join(" ");

  // Lấy tất cả các từ từ vị trí thứ 3 trở đi (ví dụ: "nổi bật")
  const remainingWords = words.slice(2).join(" ");
  return (
    <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-2 relative">
      <div className="relative">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
          {/* Chữ đầu tiên (Thương hiệu) sẽ có màu xanh primary */}
          <span className="text-primary">{firstTwoWords}</span> {remainingWords}
        </h2>


        {/* Thanh gạch chân màu xanh đặc trưng - căn chỉnh chính xác -bottom */}
        <div className="absolute -bottom-[11px] left-0 w-full h-[3px] bg-sky-500 rounded-full z-10" />
      </div>

      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-sky-600 transition-colors group"
      >
        {hrefTitle}{" "}
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
};

export default SectionView;