import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/customer/layout/Navbar";
import { CartProvider } from "@/context/CartContext";
import CartSheet from "@/components/customer/cart/CartSheet";
import Chat from "@/components/customer/chatbot/Chatbot";
import BackgroundImage from "@/components/customer/layout/BackgroundImage";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "ร้านไก่ย่างพังโคน",
  description: "ร้านไก่ย่างพังโคน",
};

/**
 * โครงสร้างหลัก (Root Layout) ของแอปพลิเคชัน
 *
 * ควบคุมการแสดงผลฟอนต์, ตะกร้าสินค้าข้ามหน้าเว็บ (Context), Navbar และ Global Components อื่นๆ
 * ซึ่งหน้าตางต่างๆ จะถูก Render ต่อเนื่องกันภายในโครงสร้างนี้
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${workSans.variable} antialiased font-display`}>
        <CartProvider>
          <div className="relative flex min-h-screen w-full flex-col items-center font-display text-white">
            <Navbar />
            <BackgroundImage />

            <div className="mt-[66px] w-full relative z-10">{children}</div>

            <CartSheet />
            <Chat />
          </div>

          <Toaster position="top-center" richColors />

          {/* ระบบเก็บสถิติความเร็วเว็บบน Vercel */}
          <SpeedInsights />
        </CartProvider>
      </body>
    </html>
  );
}
