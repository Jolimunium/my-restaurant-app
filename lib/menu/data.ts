import { createClient } from "../supabase/server";

/**
 * ดึงรายการหมวดหมู่ (Categories) ทั้งหมด
 * 
 * เรียงลำดับการแสดงผลตามฟิลด์ display_order
 */
export async function getCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return categories;
}

/**
 * ดึงรายการเมนูอาหารทั้งหมดที่หน้าเว็บใช้แสดงผล (พร้อมขายเท่านั้น)
 * 
 * @param query ข้อความค้นหาเพื่อกรองเมนู (ชื่อหรือคำอธิบายแบบไม่สนใจพิมพ์เล็กพิมพ์ใหญ่)
 */
export async function getMenuItems(query?: string) {
  const supabase = await createClient();

  let queryBuilder = supabase
    .from("menu_items")
    .select(
      `
      *,
      categories (name)
    `
    )
    .eq("is_available", true);

  // กรองเมนูตามคำค้นหา
  if (query) {
    const cleanQuery = decodeURIComponent(query).trim().replaceAll(/\s+/g, " ");
    if (cleanQuery) {
      const searchPattern = `%${cleanQuery}%`;
      queryBuilder = queryBuilder.or(
        `name.ilike.${searchPattern},description.ilike.${searchPattern}`
      );
    }
  }

  const { data: menu_items, error } = await queryBuilder.order("id", {
    ascending: true,
  });

  if (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }

  return menu_items;
}

/**
 * ดึงรายการเมนูเฉพาะที่เป็นเมนูแนะนำ (Recommended)
 * 
 * ใช้ดึงเมนูที่ถูกตั้งค่า `is_recommended=true`
 */
export async function getMenuItemsByCategory() {
  const supabase = await createClient();

  const { data: menu_items, error } = await supabase
    .from("menu_items")
    .select(
      `
      *
    `
    )
    .eq("is_available", true)
    .eq("is_recommended", true)
    .order("id", { ascending: true });

  if (error) {
    console.error(`Error fetching menu items for category:`, error);
    return [];
  }
  return menu_items;
}
