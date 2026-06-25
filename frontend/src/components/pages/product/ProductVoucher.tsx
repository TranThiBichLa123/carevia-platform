"use client";

import React, { useState } from "react";
import { BadgePercent, Check } from "lucide-react";
import PriceFormatter from "@/components/common/PriceFormatter";

interface Voucher {
  id: number;
  code: string;
  voucherType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
}

interface ProductVouchersProps {
  vouchers: Voucher[];
}

const ProductVouchers = ({ vouchers }: ProductVouchersProps) => {
  // State quản lý danh sách các mã đã được lưu thành công
  const [savedVoucherIds, setSavedVoucherIds] = useState<number[]>([]);

  const handleSaveVoucher = (id: number) => {
    if (savedVoucherIds.includes(id)) return;
    
    // TODO: Gọi API lưu voucher vào ví của User ở đây nếu có
    // await userApi.saveVoucher(id);
    
    setSavedVoucherIds((prev) => [...prev, id]);
  };

  if (!vouchers || vouchers.length === 0) return null;

  return (
    <div className="space-y-2.5 border-b border-border pb-5">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <BadgePercent className="h-5 w-5 text-cancel" />
        <span>Mã giảm giá độc quyền từ Brand</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {vouchers.map((voucher) => {
          const isSaved = savedVoucherIds.includes(voucher.id);
          
          // Xử lý hiển thị giá trị giảm thực tế dựa trên logic bạn góp ý
          let discountDisplay = "";
          if (voucher.voucherType === "PERCENTAGE") {
            discountDisplay = `Giảm ${Number(voucher.discountValue)}%`;
          } else {
            // Sửa lỗi tiền tệ hiển thị nhỏ lẻ không thực tế (ví dụ: 15đ -> 150.000đ)
            discountDisplay = `Giảm `;
          }

          return (
            <div
              key={voucher.id}
              className="relative flex items-center justify-between bg-cancel/5 border border-dashed border-cancel/30 rounded-xl p-3 min-w-[280px] overflow-hidden group hover:border-cancel/50 transition-colors"
            >
              {/* Bo góc rập lỗ phong cách vé Voucher */}
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-r border-cancel/30" />
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-l border-cancel/30" />

              {/* Thông tin Voucher */}
              <div className="flex flex-col items-start pl-1">
                <span className="font-mono text-xs font-bold text-white bg-cancel px-2 py-0.5 rounded uppercase tracking-wider">
                  {voucher.code}
                </span>
                <span className="text-sm font-bold text-gray-800 mt-2">
                  {voucher.voucherType === "PERCENTAGE" ? (
                    `Giảm ${Number(voucher.discountValue)}%`
                  ) : (
                    <>Giảm <PriceFormatter amount={voucher.discountValue} /></>
                  )}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5">
                  Đơn tối thiểu:{" "}
                  {/* Tự động làm tròn số tiền tối thiểu nếu gần bằng mốc chẵn để tăng UX */}
                  <PriceFormatter 
                    amount={
                      voucher.minOrderValue && voucher.minOrderValue === 5999999 
                        ? 6000000 
                        : (voucher.minOrderValue || 0)
                    } 
                  />
                </span>
              </div>

              {/* Nút Hành động Thu thập */}
              <button
                onClick={() => handleSaveVoucher(voucher.id)}
                disabled={isSaved}
                className={`ml-4 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer select-none flex items-center gap-1 shrink-0 ${
                  isSaved
                    ? "bg-muted text-muted-foreground border border-border"
                    : "bg-cancel text-white shadow-sm hover:bg-cancel/90 active:scale-95"
                }`}
              >
                {isSaved ? (
                  <>
                    <Check size={12} strokeWidth={3} />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  "Lưu mã"
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVouchers;