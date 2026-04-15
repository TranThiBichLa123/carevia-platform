"use client"; // Thêm dòng này nếu bạn dùng các Component phía dưới

import Header from "@/components/common/header/Header";
import Footer from "@/components/common/footer/Footer";
import AuthInitializer from "@/components/pages/auth/AuthInitializer";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* 1. Giữ lại logic khởi tạo và giao diện đặc thù cho trang Client */}
      <AuthInitializer />
      <Header />

      <div className="bg-white min-h-screen pb-20">
        {children}
      </div>

      <Footer />

      {/* ❌ ĐÃ XÓA: <html>, <body> và <Toaster /> 
          Những cái này phải để ở src/app/layout.tsx (file gốc) 

          <html lang="vi">
      <body className={`antialiased`}>
        <AuthInitializer />
        <Header />
        <div className="bg-white min-h-screen pb-20">{children}</div>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "rounded-lg shadow-lg border",
            duration: 4000,
          }}
        />
      </body>
    </html>
      */}
    </>
  );
}
