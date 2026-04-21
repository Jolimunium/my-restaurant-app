"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { X, Heart } from "lucide-react";

import { useFavorites } from "@/hooks/useFavorites";

/**
 * MenuItem: โครงสร้างข้อมูลตั้งต้นของสินค้า
 */
export interface MenuItem {
  /** ID ของสินค้า */
  id: number;
  /** ชื่อสินค้า */
  name: string;
  /** ราคาต่อหน่วย */
  price: number;
  /** URL รูปภาพสินค้า */
  image_url: string | null;
  /** รายละเอียดสินค้า (ถ้ามี) */
  description?: string;
}

/**
 * AddToCartModalProps: Props สำหรับคอมโพเนนต์ AddToCartModal
 */
interface AddToCartModalProps {
  /** สถานะการเปิด/ปิด Modal */
  isOpen: boolean;
  /** ฟังก์ชันสำหรับปิด Modal */
  onClose: () => void;
  /** ข้อมูลสินค้าที่จะแสดงใน Modal */
  item: MenuItem | null;
}

/**
 * AddToCartModal: คอมโพเนนต์ป็อปอัปสำหรับการเพิ่มสินค้าลงตะกร้า
 *
 * รองรับการจัดการปริมาณสินค้า หมายเหตุเพิ่มเติม (Special Instruction) และระบบรายการโปรด (Favorite)
 */
export default function AddToCartModal({
  isOpen,
  onClose,
  item,
}: Readonly<AddToCartModalProps>) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const { isFavorite, checkFavoriteStatus, toggleFavorite } = useFavorites(
    item?.id,
  );

  // รีเซ็ตค่าเริ่มต้นและตรวจสอบสถานะ Favorite ทุกครั้งที่ Modal เปิด
  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1);
      setNote("");
      checkFavoriteStatus();
    }
  }, [isOpen, item, checkFavoriteStatus]);

  // ล็อก Scroll พื้นหลังเมื่อ Modal เปิด และคืนค่าเมื่อปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  // เพิ่มสินค้าลงตะกร้าและปิด Modal
  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.image_url,
      note: note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ส่วนพื้นหลังที่กดได้ (Backdrop) */}
      <button
        type="button"
        className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer w-full h-full border-0"
        onClick={onClose}
        aria-label="Close modal background"
      />

      {/* เนื้อหา Modal (Modal Content) */}
      <dialog
        open
        className="relative block w-full max-w-md bg-[#202020] rounded-2xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto p-0"
        aria-labelledby="modal-title"
      >
        {/* ปุ่มกากบาทมุมขวาบน สำหรับปิดหน้าต่าง */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* รูปภาพสินค้า */}
        <div className="relative h-48 w-full">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#202020] to-transparent"></div>
        </div>

        {/* ส่วนรายละเอียดและการกระทำ (Form Actions) */}
        <div className="p-6 space-y-6">
          <div>
            <h2 id="modal-title" className="text-2xl font-bold text-white mb-2">
              {item.name}
            </h2>
            <p className="text-brand-yellow text-xl font-bold">
              {item.price} ฿
            </p>
          </div>

          {/* ปรับปริมาณ */}
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl">
            <span className="text-gray-300 font-medium">Quantity</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                -
              </button>
              <span className="text-xl font-bold text-white w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-brand-yellow text-black hover:bg-brand-yellow/80 flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* หมายเหตุเพิ่มเติม */}
          <div className="space-y-2">
            <label
              htmlFor="note-input"
              className="text-sm text-gray-400 font-medium"
            >
              Special Instructions (Optional)
            </label>
            <textarea
              id="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g., No onions, extra spicy..."
              className="w-full h-24 bg-black/30 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow resize-none"
            />
          </div>

          {/* ปุ่มบันทึกการสั่งซื้อ & รายการโปรด */}
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={handleAddToCart}
              className="col-span-3 w-full py-4 bg-brand-yellow text-black font-bold text-lg rounded-xl hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              Add to Cart - {(item.price * quantity).toFixed(2)} ฿
            </button>
            <button
              onClick={toggleFavorite}
              className="col-span-1 w-full py-4 bg-pink-500 text-black font-bold text-lg rounded-xl hover:bg-white transition-all active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.3)] flex items-center justify-center"
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  isFavorite ? "fill-black" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
