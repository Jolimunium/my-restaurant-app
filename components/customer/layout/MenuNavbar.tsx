"use client";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Category: โครงสร้างข้อมูลหมวดหมู่อาหาร
 */
interface Category {
  /** ID ของหมวดหมู่ */
  id: number;
  /** ชื่อของหมวดหมู่ */
  name: string;
}

/**
 * MenuNavbarProps: Props ของคอมโพเนนต์ MenuNavbar
 */
interface MenuNavbarProps {
  /** รายการหมวดหมู่ทั้งหมด */
  categories: Category[];
  /** ID ของหมวดหมู่ที่ถูกเลือกอยู่ปัจจุบัน */
  activeCategory: number;
  /** ฟังก์ชันสำหรับเปลี่ยนหมวดหมู่ที่เลือก */
  setActiveCategory: (id: number) => void;
}

/**
 * MenuNavbar: คอมโพเนนต์แถบเมนูหมวดหมู่อาหาร (Category Navbar)
 * สำหรับเลื่อนซ้าย-ขวาเลือกหมวดหมู่ที่ต้องการ (เช่น อาหารตามสั่ง, เครื่องดื่ม)
 * จะคอยติดตามสถานะหมวดหมู่ปัจจุบันที่ผู้ใช้เลือก (activeCategory)
 */
export default function MenuNavbar({
  categories,
  activeCategory,
  setActiveCategory,
}: Readonly<MenuNavbarProps>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // ตรวจสอบตำแหน่งการเลื่อน (Scroll Position) เพื่อตัดสินใจว่าจะแสดงปุ่มลูกศรซ้าย/ขวาหรือไม่
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0); // มีเนื้อหาด้านซ้ายให้เลื่อนกลับได้
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10); // มีเนื้อหาด้านขวาให้เลื่อนต่อได้
    }
  };

  // เช็คตำแหน่ง Scroll ใหม่ทุกครั้งและลงทะเบียน Listener เมื่อหน้าจอเปลี่ยนขนาด (Responsive)
  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories]);

  // เลื่อนแถบหมวดหมู่ไปทางซ้ายหรือขวาครั้งละ 200px เมื่อกดปุ่มลูกศร
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // เลื่อนแถบหมวดหมู่อัตโนมัติให้ปุ่มที่ Active อยู่ตรงกลางจอเสมอ (Auto-scroll to active category)
  useEffect(() => {
    const activeBtn = document.getElementById(`nav-cat-${activeCategory}`);
    if (activeBtn && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // คำนวณตำแหน่งให้ปุ่มที่เลือกอยู่กึ่งกลางของ Container
      const scrollLeft =
        activeBtn.offsetLeft -
        container.offsetLeft -
        container.clientWidth / 2 +
        activeBtn.clientWidth / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-[66px] z-40 mx-auto max-w-7xl">
      <div className="relative flex items-center bg-brand-dark-red rounded-lg shadow-lg overflow-hidden group">
        {/* ปุ่มเลื่อนไปทางซ้าย (Left Scroll) */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brand-dark-red to-transparent z-10 flex items-center justify-start pl-2 transition-opacity duration-300 ${
            showLeftScroll ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={() => scroll("left")}
            className="p-1 rounded-full bg-brand-dark-red/80 text-brand-yellow hover:bg-brand-yellow hover:text-white transition-all border border-brand-yellow/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex items-center gap-4 overflow-x-auto w-full px-4 py-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-brand-yellow/50 [&::-webkit-scrollbar-track]:bg-brand-dark-red/20 hover:[&::-webkit-scrollbar-thumb]:bg-brand-yellow transition-colors"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              id={`nav-cat-${category.id}`}
              className={`px-4 py-2 rounded-md border border-brand-yellow text-sm font-medium transition-colors whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-brand-yellow text-white"
                  : "bg-brand-dark-red text-brand-yellow hover:bg-brand-yellow/80"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* ปุ่มเลื่อนไปทางขวา (Right Scroll) */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brand-dark-red to-transparent z-10 flex items-center justify-end pr-2 transition-opacity duration-300 ${
            showRightScroll ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            onClick={() => scroll("right")}
            className="p-1 rounded-full bg-brand-dark-red/80 text-brand-yellow hover:bg-brand-yellow hover:text-white transition-all border border-brand-yellow/30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
