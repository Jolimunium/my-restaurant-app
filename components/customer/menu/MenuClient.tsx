"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import MenuNavbar from "@/components/customer/layout/MenuNavbar";
import AddToCartModal from "../cart/AddToCartModal";
import { Plus } from "lucide-react";

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
 * MenuItem: โครงสร้างข้อมูลเมนูอาหาร
 */
interface MenuItem {
  /** ID ของสินค้า */
  id: number;
  /** ชื่อสินค้า */
  name: string;
  /** ราคาต่อหน่วย */
  price: number;
  /** URL รูปภาพสินค้า */
  image_url: string | null;
  /** ID ของหมวดหมู่ที่สินค้าสังกัด */
  category_id: number;
  /** ข้อมูลหมวดหมู่ที่ดึงมาจากความสัมพันธ์ (Relation) */
  categories?: {
    /** ชื่อหมวดหมู่ */
    name: string;
  };
}

/**
 * MenuClientProps: Props ของคอมโพเนนต์ MenuClient
 */
interface MenuClientProps {
  /** รายการหมวดหมู่ทั้งหมด */
  categories: Category[];
  /** รายการสินค้าทั้งหมด */
  menuItems: MenuItem[];
}

/**
 * MenuClient: คอมโพเนนต์หน้าหลักสำหรับแสดงรายการเมนูอาหารทั้งหมด
 * มีระบบ Scroll Spy เพื่อไฮไลท์หมวดหมู่อาหารบนแถบนำทาง (MenuNavbar) ตามตำแหน่งการเลื่อนหน้าจอ
 * และสามารถคลิกที่เมนูเพื่อเปิด AddToCartModal เพิ่มลงตะกร้าได้
 */
export default function MenuClient({
  categories,
  menuItems,
}: Readonly<MenuClientProps>) {
  // จัดกลุ่มเมนูอาหารตาม Category ID และจดจำผลลัพธ์ไว้ (Memoize) เพื่อประสิทธิภาพ
  const itemsByCategoryId = useMemo(() => {
    // ใช้ Map (เหมือน Dictionary) ในการเก็บข้อมูล โดย Key คือ category_id และ Value คืออาร์เรย์ของ MenuItem
    const map = new Map<number, MenuItem[]>();
    for (const item of menuItems) {
      // ดึงอาร์เรย์ของหมวดหมู่นั้นๆ ออกมา
      let items = map.get(item.category_id);
      // ถ้ายังไม่มีกลุ่มนี้อยู่ใน Map ให้สร้างอาร์เรย์ว่างขึ้นมาใหม่และจดทะเบียนไว้
      if (!items) {
        items = [];
        map.set(item.category_id, items);
      }
      // เพิ่มเมนูอาหารจานนี้เข้าไปในกลุ่มที่ถูกต้อง
      items.push(item);
    }
    return map;
  }, [menuItems]);

  const [activeCategory, setActiveCategory] = useState<number>(
    categories[0]?.id || 0,
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // เปิดหน้าต่าง Modal ตะกร้าเพื่อเลือกสินค้าลงตะกร้าพร้อมระบุรายละเอียดเพึ่มได้
  const handleOpenModal = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  // ระบบ Scroll Spy: ติดตามตําแหน่งการเลื่อนจอ เพื่อไฮไลท์แถบหมวดหมู่ใน Navigation ให้ตรงกัน
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // หากหมวดหมู่นั้นๆ เข้ามาในระยะการมองเห็นของจอ
          if (entry.isIntersecting) {
            // ดึงเฉพาะตัวเลข id ออกจาก id (เช่น จาก "category-1" ให้เหลือแค่ 1)
            const id = Number(entry.target.id.replace("category-", ""));
            if (!Number.isNaN(id)) {
              setActiveCategory(id);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px", // กระตุ้นเมื่อหัวข้อเข้าใกล้ขอบบนของจอ
        threshold: 0,
      },
    );

    categories.forEach((category) => {
      const element = document.getElementById(`category-${category.id}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [categories]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="relative w-full min-h-screen bg-brand-dark-red/50 backdrop-blur-sm text-white rounded-lg">
        <MenuNavbar
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={(id: number) => {
            setActiveCategory(id);
            const element = document.getElementById(`category-${id}`);
            if (element) {
              // เผื่อ offset ให้กับ fixed header ด้านบน
              const headerOffset = 180;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition =
                elementPosition + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
              });
            }
          }}
        />
        {/* ส่วนแสดงเนื้อหาเมนูอาหาร (Main Menu) */}
        <main className="relative max-w-7xl mx-auto px-4 py-2 space-y-12">
          {categories.map((category, categoryIndex) => {
            const categoryItems = itemsByCategoryId.get(category.id) || [];

            if (categoryItems.length === 0) return null;

            return (
              <section
                key={category.id}
                id={`category-${category.id}`}
                className=""
              >
                <h2 className="text-2xl font-bold mb-6 text-brand-yellow border-b border-gray-700 pb-2">
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categoryItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-black/40 rounded-2xl overflow-hidden shadow-lg group hover:ring-2 hover:ring-brand-yellow/50 transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        className="relative aspect-[4/3] w-full block overflow-hidden focus:outline-none"
                      >
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="(max-width: 420px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            priority={categoryIndex === 0 && index < 4}
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </button>
                      <div className="p-4 z-20">
                        <h3 className="relative text-lg font-semibold line-clamp-1 z-20">
                          {item.name}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-brand-yellow text-lg font-bold">
                            {item.price} ฿
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(item)}
                            className="bg-brand-yellow text-black p-2 rounded-lg hover:bg-white transition-colors shrink-0"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}
