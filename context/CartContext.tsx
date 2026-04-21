"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * CartItem: โครงสร้างข้อมูลของสินค้าในตะกร้า
 */
export interface CartItem {
  /** ID ของสินค้า */
  id: number;
  /** ชื่อสินค้า */
  name: string;
  /** ราคาสินค้าต่อหน่วย */
  price: number;
  /** จำนวนที่สั่ง */
  quantity: number;
  /** รูปภาพสินค้า */
  image: string | null;
  /** หมายเหตุเพิ่มเติมจากลูกค้า */
  note?: string;
}

/**
 * CartContextType: รูปแบบของข้อมูลและฟังก์ชันที่ Context จัดเตรียมไว้
 */
interface CartContextType {
  /** รายการสินค้าทั้งหมดในตะกร้า */
  cartItems: CartItem[];
  /** เพิ่มสินค้าลงตะกร้า (ค้นหาและรวมจำนวนหากมีสินค้าเดิมอยู่แล้ว) */
  addToCart: (item: CartItem) => void;
  /** ลบสินค้าออกจากตะกร้าตาม ID และ Note */
  removeFromCart: (itemId: number, note?: string) => void;
  /** ปรับเปลี่ยนจำนวนสินค้าในตะกร้า (จำนวนต่ำสุดคือ 1) */
  updateCartItem: (itemId: number, quantity: number, note?: string) => void;
  /** ล้างรายการสินค้าทั้งหมดออกจากตะกร้า */
  clearCart: () => void;
  /** จำนวนสินค้าทั้งหมดชิ้นในตะกร้า */
  cartCount: number;
  /** ราคารวมของสินค้าทั้งหมดในตะกร้า (บาท) */
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * CartProvider: Context Provider สำหรับการจัดการตะกร้าสินค้า
 *
 * จัดการ State การเพิ่ม ลบ และอัปเดตจำนวนสินค้า รวมถึงเก็บข้อมูลชั่วคราวผ่าน LocalStorage
 */
export function CartProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // โหลดข้อมูลตะกร้าจาก Local Storage เมื่อเริ่มต้น
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from local storage", error);
      }
    }
  }, []);

  // บันทึกข้อมูลตะกร้าลง Local Storage อัตโนมัติเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ฟังก์ชันเพิ่มสินค้า
  const addToCart = React.useCallback((newItem: CartItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === newItem.id && item.note === newItem.note,
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + newItem.quantity,
        };
        return newItems;
      } else {
        return [...prevItems, newItem];
      }
    });
  }, []);

  // ฟังก์ชันลบสินค้า
  const removeFromCart = React.useCallback((itemId: number, note?: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId || item.note !== note),
    );
  }, []);

  // ฟังก์ชันอัปเดตจำนวน
  const updateCartItem = React.useCallback(
    (itemId: number, quantity: number, note?: string) => {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId && item.note === note
            ? { ...item, quantity: Math.max(1, quantity) }
            : item,
        ),
      );
    },
    [],
  );

  // ฟังก์ชันล้างตะกร้า
  const clearCart = React.useCallback(() => {
    setCartItems([]);
  }, []);

  // คำนวณยอดรวม (Derived Data)
  const { cartCount, cartTotal } = cartItems.reduce(
    (acc, item) => {
      acc.cartCount += item.quantity;
      acc.cartTotal += item.price * item.quantity;
      return acc;
    },
    { cartCount: 0, cartTotal: 0 },
  );

  // Provide Value (Memoized)
  const value = React.useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      cartCount,
      cartTotal,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      updateCartItem,
      clearCart,
      cartCount,
      cartTotal,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * useCart Hook: เข้าถึง Context ของตะกร้าสินค้า
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
