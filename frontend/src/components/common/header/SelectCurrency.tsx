"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import React, { useState, useEffect } from "react";

const SelectCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState("VND");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currencies = [
    { code: "VND", name: "Việt Nam Đồng", symbol: "₫", rate: 1 },
    { code: "USD", name: "US Dollar", symbol: "$", rate: 25450 },
    { code: "EUR", name: "Euro", symbol: "€", rate: 27000 },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 165 },
    { code: "KRW", name: "South Korean Won", symbol: "₩", rate: 18 },
  ];

  // Tìm thông tin tiền tệ hiện tại để hiển thị trên header
  const current = currencies.find((c) => c.code === selectedCurrency);

  if (!mounted) {
    return (
      <div className="flex items-center px-2 py-1 h-6 w-fit text-white text-[14px] font-medium">
        ₫ VND - Việt Nam Đồng
      </div>
    );
  }

  return (
    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
      <SelectTrigger className="border-none bg-transparent focus:ring-0 focus:outline-none shadow-none flex items-center gap-1 px-2 py-1 h-6 w-fit transition-opacity hover:opacity-80 text-white">
        {/* ĐÂY LÀ PHẦN QUAN TRỌNG: Hiển thị thủ công để giữ màu trắng */}
        <div className="flex items-center gap-1 text-[14px]">
          <span className="opacity-80">{current?.symbol}</span>
          <span className="font-bold">{current?.code}</span>
          <span className="opacity-50">-</span>
          <span className="opacity-80 whitespace-nowrap">{current?.name}</span>
        </div>
        
        {/* SelectValue để trống để nó không ghi đè màu đen lên */}
        <div className="hidden">
           <SelectValue placeholder="VND" />
        </div>
      </SelectTrigger>

      <SelectContent className="min-w-[220px] bg-white border-gray-100 shadow-lg rounded-lg">
        <SelectGroup>
          <SelectLabel className="text-gray-400 font-normal text-xs px-3 py-2">
            Currencies
          </SelectLabel>
          {currencies.map((c) => (
            <SelectItem
              key={c.code}
              value={c.code}
              className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50 py-2.5 px-3 transition-colors"
            >
              <div className="flex items-center gap-3 text-[14px]">
                <span className="text-gray-600 w-4 text-center">{c.symbol}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900">{c.code}</span>
                  <span className="text-gray-400 font-normal">-</span>
                  <span className="text-gray-600 font-normal">{c.name}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectCurrency;
