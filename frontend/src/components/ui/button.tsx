import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // 1. Default: Giữ màu xanh sky nhưng hover đậm hơn chút
        default: "bg-sky-500 text-white shadow-sm hover:bg-sky-600 transition-colors",

        // 2. Destructive: Chỉ dùng màu đỏ cho các hành động xóa quan trọng
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600 focus-visible:ring-red-500/20",

        // 3. Outline: SỬA LẠI - Hover dùng màu xám nhạt (slate-100) thay vì accent đỏ
        outline: "border border-input bg-background shadow-sm hover:bg-slate-100 hover:text-slate-900",

        // 4. Secondary: Màu nhẹ nhàng
        secondary: "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200",

        // 5. Ghost: SỬA LẠI - Không dùng accent, dùng slate-100 cho thanh lịch
        ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",

        // 6. Link: Giữ nguyên
        link: "text-sky-600 underline-offset-4 hover:underline",

        // 7. THÊM MỚI - "pure": Dành riêng cho nút xóa nhỏ trong giỏ hàng bạn đang làm
        pure: "p-0 h-auto bg-transparent hover:bg-transparent hover:text-red-600 transition-colors",

        clean: "bg-transparent shadow-none hover:bg-transparent p-0 h-auto text-red-500  transition-colors",
      },

      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
