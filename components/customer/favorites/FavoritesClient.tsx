"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Heart } from "lucide-react";
import AddToCartModal, {
  MenuItem,
} from "@/components/customer/cart/AddToCartModal";
import Link from "next/link";

interface FavoritesClientProps {
  /** รายการเมนูโปรดเริ่มต้นที่ดึงมาจาก Server */
  initialFavorites: MenuItem[];
}

/**
 * FavoritesClient: คอมโพเนนต์สำหรับแสดงหน้ารายการ "เมนูโปรด" (Favorites) ของผู้ใช้
 * ดึงรายการอาหารที่ผู้ใช้เคยกดหัวใจไว้มาแสดงผล
 * และสามารถกดเปิด Modal เพื่อเพิ่มลงตะกร้าสินค้าจากหน้านี้ได้ทันที
 */
export default function FavoritesClient({
  initialFavorites,
}: Readonly<FavoritesClientProps>) {
  const [favorites] = useState<MenuItem[]>(initialFavorites);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (item: MenuItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Favorites</h1>
        <p className="text-gray-400">Your saved delicious items appear here</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-black/40 rounded-2xl border border-white/5">
          <Heart className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            No favorites yet
          </h2>
          <p className="text-gray-400 mb-6">
            Start adding items to your favorites list!
          </p>
          <Link
            href="/menu"
            className="px-6 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-white transition-all"
          >
            Go to Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="bg-black/40 rounded-2xl overflow-hidden shadow-lg group hover:ring-2 hover:ring-brand-yellow/50 transition-all"
            >
              <div className="relative aspect-[4/3] w-full">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="(max-width: 420px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4 z-20">
                <h3 className="relative text-lg font-semibold line-clamp-1 z-20 text-white">
                  {item.name}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-brand-yellow text-lg font-bold">
                    {item.price} ฿
                  </span>
                  <button
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
      )}

      <AddToCartModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
}
