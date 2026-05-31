"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 bg-white rounded-xl font-vietnam",
        className
      )}
      classNames={{
        root: "w-fit flex flex-col",

        // Đã sửa: Xóa bỏ khoảng trống pb-14 phía dưới vì nút đã dời lên trên
        months: "flex flex-col relative",

        month: "space-y-4",

        // Đã sửa: Đặt relative để làm điểm tựa cho thanh điều hướng bao trọn dòng tiêu đề tháng
        month_caption:
          "relative flex justify-center items-center h-10 w-full",

        caption_label:
          "text-[14px] font-semibold text-gray-900 z-0",

        // 🌟 ĐÃ SỬA: Đưa thanh nav bao phủ trọn bề ngang dòng top (w-full top-0 left-0)
        // Dùng justify-between để ép nút lùi về góc trái cùng và nút tiến nhảy về góc phải cùng
        nav:
          "absolute inset-x-0 top-0 flex items-center justify-between w-full h-10 z-10 pointer-events-none",

        // Thêm pointer-events-auto để chuột vẫn nhấp chọn kích hoạt nút bấm được bình thường
        button_previous:
          "h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 cursor-pointer active:scale-95 transition-all pointer-events-auto",

        button_next:
          "h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 cursor-pointer active:scale-95 transition-all pointer-events-auto",

        weekdays:
          "grid grid-cols-7 gap-1",

        weekday:
          "text-center text-xs font-medium text-gray-500 h-8 flex items-center justify-center",

        month_grid:
          "grid gap-1",

        week:
          "grid grid-cols-7 gap-1",

        day:
          "h-9 w-9 flex items-center justify-center rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors",

        selected:
          "!bg-staff-primary !text-white hover:!bg-staff-primary/90 font-bold",

        today:
          "border border-staff-primary/30 text-staff-primary font-semibold",

        outside:
          "text-gray-300 opacity-50",

        disabled:
          "text-gray-300 opacity-30 cursor-not-allowed line-through",

        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
