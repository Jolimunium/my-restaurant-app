"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { X, ShoppingCart } from "lucide-react";
import { createOrder } from "@/lib/orders/actions";
import { toast } from "sonner";
import CartItemList from "./CartItemList";

/**
 * CartSheet: UI สำหรับตะกร้าสินค้าแบบ Sidebar บนคอม (Bottom Sheet บนมือถือ)
 *
 * แสดงรายการอาหาร, ราคารวม และจัดการการสั่งซื้อ
 */
export default function CartSheet() {
  const {
    cartItems,
    removeFromCart,
    updateCartItem,
    cartCount,
    cartTotal,
    clearCart,
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ส่งคำสั่งซื้อไปยัง Server Action และจัดการผลลัพธ์
  const handleOrder = async () => {
    try {
      setIsLoading(true); // ล็อก UI ป้องกันการกดซ้ำ

      const result = await createOrder(cartItems);

      if (result.success) {
        toast.success(result.message);
        clearCart();
        setIsOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Order failed", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ล็อก Scroll พื้นหลังเมื่อ Cart Sheet เปิดอยู่ เพื่อ UX ที่ดีขึ้น
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* ปุ่มลอยสำหรับเปิดตะกร้าสินค้า (Floating Button) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-16 h-16 bg-brand-yellow rounded-full shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:scale-105 active:scale-95 transition-all"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6 text-black" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-[#202020]">
              {cartCount}
            </span>
          )}
        </div>
      </button>

      {/* ส่วนพื้นหลังโปร่งแสง (Backdrop) */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity border-0 cursor-default"
          onClick={() => setIsOpen(false)}
          aria-label="Close cart"
        />
      )}

      {/* เนื้อหาตะกร้าสินค้า (Bottom Sheet) */}
      <div
        className={`fixed z-50 bg-[#202020] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          bottom-0 left-0 right-0 rounded-t-3xl max-h-[85vh]
          md:top-0 md:right-0 md:bottom-auto md:left-auto md:h-full md:w-[400px] md:rounded-l-3xl md:rounded-tr-none md:max-h-full
          ${
            isOpen
              ? "translate-y-0 md:translate-x-0"
              : "translate-y-full md:translate-x-full md:translate-y-0"
          }`}
      >
        {/* แถบสำหรับลากปิด - แสดงเฉพาะบนมือถือ */}
        <button
          type="button"
          className="w-full flex justify-center pt-3 pb-1 md:hidden focus:outline-none"
          onClick={() => setIsOpen(false)}
          aria-label="Close cart sheet"
        >
          <div className="w-12 h-1.5 bg-gray-600 rounded-full cursor-pointer" />
        </button>

        {/* ส่วนหัวของตะกร้า */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white">Your Order</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* รายการอาหารที่สั่งในตะกร้า */}
        <CartItemList
          cartItems={cartItems}
          removeFromCart={removeFromCart}
          updateCartItem={updateCartItem}
        />

        {/* ส่วนสรุปยอดชำระและปุ่มสั่งอาหาร */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-[#202020] border-t border-white/10 shrink-0 safe-area-bottom">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-bold text-white">
                {cartTotal.toFixed(2)} ฿
              </span>
            </div>
            <button
              onClick={handleOrder}
              disabled={isLoading}
              className="w-full py-4 bg-brand-yellow text-black font-bold text-lg rounded-xl hover:bg-white transition-all shadow-[0_4px_20px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Order Now"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
