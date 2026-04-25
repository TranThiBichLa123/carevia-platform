import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { Be_Vietnam_Pro } from 'next/font/google';

// Cấu hình font
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese'], // Bắt buộc có cái này để không bị lỗi dấu
  weight: ['400', '700'],  // Chọn các độ dày bạn cần
  variable: '--font-be-vietnam', // Đặt tên biến để dùng trong Tailwind
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carevia - Platform",
  description: "Nền tảng bán thiết bị chăm sóc da và đặt lịch trải nghiệm thực tế",
  icons: {
    icon: "/icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} antialiased`}
        suppressHydrationWarning
      >
        <ReactQueryProvider>
          {children}

          {/* TOASTER DUY NHẤT TOÀN APP: Đặt ở đây để tránh lặp thông báo */}
          <Toaster
            richColors
            position="top-right"
            closeButton
            expand={false}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
