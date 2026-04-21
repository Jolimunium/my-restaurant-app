"use server";

import { createClient } from "../supabase/server";

/**
 * ดึงข้อมูลแนะนำคำค้นหา (Search Suggestions)
 * 
 * ค้นหาเมนูอาหารผ่านช่องค้นหาที่ตรงกับเงื่อนไขในฐานข้อมูล
 * 
 * @param query ข้อความการค้นหาจากผู้ใช้ (ความยาว 2 ตัวอักษรขึ้นไป)
 */
export async function getSearchSuggestions(query: string) {
  // บล็อกการประมวลผลหากข้อมูลค้นหาสั้นเกินไป
  if (!query || query.length < 2) return [];

  const supabase = await createClient();
  
  // ถอดรหัส URL (Handling Thai) และยุบเว้นวรรคที่ซ้ำซ้อนกันให้เหลือช่องเดียว (Normalization)
  const cleanQuery = decodeURIComponent(query).trim().replaceAll(/\s+/g, " ");
  const searchPattern = `%${cleanQuery}%`;

  // ค้นหารายการเมนูพร้อมแสดงผลสูงสุด 50 รายการ
  const { data, error } = await supabase
    .from("menu_items")
    .select("id, name, image_url, price")
    .eq("is_available", true)
    .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
    .limit(50);

  if (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }

  return data;
}
