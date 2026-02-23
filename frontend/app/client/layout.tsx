
import type { Metadata } from "next";
import Header from "@/components/common/header/Header";
import Footer from "@/components/common/footer/Footer";
import { Toaster } from "sonner";
import AuthInitializer from "@/components/pages/auth/AuthInitializer";

export const metadata: Metadata = {
  title: "Babyshop | Online shopping places",
  description: "Babyshop for onlne shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <AuthInitializer />
        <Header />
        <div className="bg-babyshopLightBg min-h-screen pb-20">{children}</div>
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
  );
}
