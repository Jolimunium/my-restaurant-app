"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * ดึงรายการเมนูยอดนิยม (Best Selling) ตามหมวดหมู่ผ่าน Chatbot
 * 
 * เรียกใช้งาน RPC `get_best_selling_menu_items` บน Supabase เพื่อคำนวณและส่งเมนูขายดีคืนค่า
 * 
 * @param categoryKeyword คำค้นหาของหมวดหมู่เมนูที่ต้องการ (เช่น "เครื่องดื่ม")
 */
export async function getRecommendedMenus(categoryKeyword: string) {
  const supabase = await createClient();

  // ดึงเมนูยอดนิยมตามหมวดหมู่โดยใช้งานผ่าน RPC
  const { data: menuItems, error } = await supabase.rpc(
    "get_best_selling_menu_items",
    {
      category_keyword: categoryKeyword,
    }
  );

  if (error) {
    console.error("Error fetching chatbot menu:", error);
    return [];
  }

  return menuItems || [];
}
