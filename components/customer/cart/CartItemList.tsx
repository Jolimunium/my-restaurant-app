import Image from "next/image";
import { ShoppingBag, Trash2 } from "lucide-react";
import { CartItem } from "@/context/CartContext";

/**
 * Props สำหรับ CartItemList
 */
interface CartItemListProps {
  /** รายการสินค้าทั้งหมดที่อยู่ในตะกร้า */
  cartItems: CartItem[];

  /** ฟังก์ชันสำหรับลบสินค้าออกจากตะกร้า */
  removeFromCart: (id: number, note?: string) => void;

  /** ฟังก์ชันสำหรับอัปเดตจำนวนสินค้าในตะกร้า */
  updateCartItem: (id: number, quantity: number, note?: string) => void;
}

/**
 * CartItemList: แสดงรายการอาหารในตะกร้า
 *
 * ใช้เพื่อเรนเดอร์ UI รายการอาหาร และปุ่มเพิ่ม/ลดตะกร้า
 */
export default function CartItemList({
  cartItems,
  removeFromCart,
  updateCartItem,
}: Readonly<CartItemListProps>) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* 1. กรณีตะกร้าว่าง (Empty State) */}
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">Your cart is empty</p>
        </div>
      ) : (
        /* 2. กรณีมีสินค้า (List Rendering) */
        cartItems.map((item) => (
          <div
            // ใช้ id ร่วมกับ note ผสมเป็น React Key เพื่อแยกออเดอร์เดียวกันที่ระบุหมายเหตุต่างกัน
            key={`${item.id}-${item.note}`}
            className="flex gap-4 bg-black/20 p-4 rounded-xl border border-white/5"
          >
            {/* รูปภาพสินค้า */}
            <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-800">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              )}
            </div>

            {/* รายละเอียดสินค้าและปุ่มจัดการ */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white truncate pr-2">
                  {item.name}
                </h3>

                {/* ลบออเดอร์ */}
                <button
                  onClick={() => removeFromCart(item.id, item.note)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* ข้อความหมายเหตุ */}
              {item.note && (
                <p className="text-sm text-gray-400 italic mt-1 line-clamp-1">
                  &quot;{item.note}&quot;
                </p>
              )}

              {/* ราคาและตัวปรับจำนวน */}
              <div className="flex justify-between items-end mt-3">
                <p className="text-brand-yellow font-bold">
                  {(item.price * item.quantity).toFixed(2)} ฿
                </p>

                <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1">
                  {/* จำนวนต่ำสุดคือ 1 */}
                  <button
                    onClick={() =>
                      updateCartItem(
                        item.id,
                        Math.max(1, item.quantity - 1),
                        item.note,
                      )
                    }
                    className="w-6 h-6 flex items-center justify-center rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateCartItem(item.id, item.quantity + 1, item.note)
                    }
                    className="w-6 h-6 flex items-center justify-center rounded bg-brand-yellow text-black hover:bg-brand-yellow/80 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
