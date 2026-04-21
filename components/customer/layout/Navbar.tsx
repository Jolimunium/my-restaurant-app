"use client";

import Link from "next/link";
import Searchbar from "./Searchbar";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Utensils, Menu } from "lucide-react";

/**
 * Navbar: คอมโพเนนต์แถบนำทางด้านบนสุดของแอป (Top Navigation)
 * ประกอบด้วยโลโก้ร้าน, ช่องค้นหา (Searchbar), และปุ่มแฮมเบอร์เกอร์สำหรับเปิดเมนูด้านข้าง (Sidebar)
 */
export default function Navbar() {
  // State สำหรับควบคุมการเปิด-ปิดเมนูด้านข้าง (Sidebar)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 bg-brand-dark-red/90 backdrop-blur-sm z-50 w-full px-4 py-4 sm:px-6 lg:px-8 text-white`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <div className="size-8 text-brand-yellow flex items-center justify-center shrink-0">
                <Utensils className="w-full h-full" />
              </div>
              <h1 className="text-2xl font-bold leading-tight whitespace-nowrap hidden sm:block">
                ร้านไก่ย่างพังโคน
              </h1>
            </Link>
          </div>

          <Searchbar />

          <div className="flex gap-4 shrink-0">
            {/* ปุ่มสำหรับเปิดเมนูด้านข้าง (Hamburger Menu) */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md border border-white px-4 py-1.5 text-sm font-medium hover:bg-brand-yellow/80 focus:outline-none focus:ring-2 focus:ring-brand-yellow bg-transparent active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>
      {/* คอมโพเนนต์เมนูด้านข้าง พร้อมส่งสถานะและฟังก์ชันสำหรับปิด */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
