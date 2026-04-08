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
import React, { useState } from "react";

/*
  SelectCurrency.tsx

  Mục đích:
  - Hiển thị bộ chọn tiền tệ nhỏ ở khu vực header/top bar.
  - Cho phép người dùng chọn tiền tệ hiển thị (ví dụ: USD, EUR).
  - Sử dụng thành phần `Select` của ứng dụng (dựa trên Radix) để có
    hành vi dropdown truy cập được và styling nhất quán.

  Ghi chú hành vi:
  - Lưu tiền tệ đang được chọn trong state cục bộ của component.
  - `SelectTrigger` được style trong suốt (không viền / không nền)
    để hòa vào giao diện header.
  - Danh sách tiền tệ được render trong `SelectContent`.
  - Có thể mở rộng component này để lưu lựa chọn vào localStorage
    hoặc store toàn cục và cập nhật giá / locale khi thay đổi tiền tệ.

  Cách sử dụng:
  - Import và render trong header/top-banner để người dùng chuyển
    đổi tiền tệ nhanh chóng.
*/

const SelectCurrency = () => {
  // State cục bộ lưu tiền tệ đang chọn.
  // Nếu các phần khác của app cần phản ứng khi đổi tiền tệ, có thể
  // nâng state này lên store toàn cục.
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  // Danh sách tiền tệ mẫu. Bạn có thể mở rộng hoặc tải từ API/store.
  // Trường `rate` có thể dùng để chuyển đổi giá nếu cần.
  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", rate: 1.0 },
    { code: "EUR", name: "Euro", symbol: "€", rate: 0.85 },
    { code: "GBP", name: "British Pound", symbol: "£", rate: 0.73 },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", rate: 110.0 },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", rate: 1.25 },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", rate: 1.35 },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF", rate: 0.92 },
  ];

  return (
    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
      {/**
        Trigger được style không viền và trong suốt để hòa vào header.
        Thành phần vẫn giữ được giá trị đã chọn và tính năng truy cập
        bàn phím từ Radix Select bên dưới.
      */}
      <SelectTrigger className="border-none bg-transparent text-white focus:ring-0 focus:outline-none shadow-none flex items-center justify-between px-2 py-1 data-[size=default]:h-6 dark:bg-transparent dark:hover:transparent ">
        {/* Hiển thị chỉ mã tiền tệ (ví dụ: USD) khi đã chọn */}
        <SelectValue>{selectedCurrency}</SelectValue>
      </SelectTrigger>

      {/* Nội dung dropdown: nhóm + các mục. Thêm/bớt tiền tệ ở đây. */}
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Currencies</SelectLabel>
          {currencies.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.code} - {c.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectCurrency;
