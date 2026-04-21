"use client";

import { useState } from "react";
import Image from "next/image";
import AddToCartModal, {
  MenuItem as CartMenuItem,
} from "../cart/AddToCartModal";
import { Plus } from "lucide-react";

interface MenuItem {
  /** ID ของสินค้า */
  id: number;
  /** ชื่อสินค้า */
  name: string;
  /** ราคาต่อหน่วย */
  price: number;
  /** URL รูปภาพสินค้า (จากตาราง menu_items) */
  image_url: string | null;
  /** URL รูปภาพสินค้า (Alias สำหรับกรณีอื่น) */
  image?: string | null;
}

interface RecommendedProps {
  /** รายการสินค้าแนะนำ */
  menuItems: MenuItem[];
}

/**
 * Recommended: คอมโพเนนต์แสดงรายการเมนูแนะนำ (แนะนำประจำวันหรือยอดฮิต)
 * มักจะใช้แสดงผลในส่วนบนของหน้าจอให้เด่นชัด และคลิกเพื่อสั่งอาหารได้ทันที
 */
export default function Recommended({ menuItems }: Readonly<RecommendedProps>) {
  const [selectedItem, setSelectedItem] = useState<CartMenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // เมื่อกดปุ่มสั่งอาหารจากเมนูแนะนำ
  const handleOpenModal = (item: MenuItem) => {
    // ต้องทำ Mapping โครงสร้าง Object ใหม่เล็กน้อยให้เข้ากับ Modal (เพราะรูปใช้ชื่อ image_url กับ image)
    const mappedItem: CartMenuItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: (item.image_url || item.image) ?? null,
    };

    setSelectedItem(mappedItem);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 px-4">
        {menuItems.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className="relative w-full overflow-hidden rounded-xl cursor-pointer group shadow-md bg-[#202020] focus:outline-none focus:ring-2 focus:ring-brand-yellow text-left"
            onClick={() => handleOpenModal(item)}
          >
            <div className="relative aspect-square">
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  priority={index < 2}
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-3">
              <p className="text-sm sm:text-base font-bold leading-tight line-clamp-2 drop-shadow-md text-white">
                {item.name}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-brand-yellow text-sm font-bold">
                  {item.price} ฿
                </p>
                <div className="bg-brand-yellow rounded-full p-1">
                  <Plus className="w-4 h-4 text-black" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </>
  );
}
