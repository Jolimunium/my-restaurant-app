import { getCategories, getMenuItems } from "@/lib/menu/data";
import MenuClient from "@/components/customer/menu/MenuClient";

export const revalidate = 0; // ปิดการทำ Caching เพื่อดึงข้อมูลใหม่เสมอ

/**
 * หน้าแสดงหมวดหมู่และรายการอาหาร (Route: /menu)
 *
 * ดึงข้อมูลสดจาก Database (Dynamic Rendering) ตามเงื่อนไขการค้นหา ก่อนเรนเดอร์ UI เพื่อแสดงผล
 */
export default async function MenuPage(
  props: Readonly<{ searchParams: Promise<{ [key: string]: string | string[] | undefined }> }>
) {
  // อ่านพารามิเตอร์ URL ว่ามีการค้นหาชื่ออาหารหรือไม่ (ตัวแปร ?q=...)
  const searchParams = await props.searchParams;
  const q = searchParams.q;
  const query = typeof q === "string" ? q : undefined;

  // ดึงข้อมูลหมวดหมู่ (Categories) และรายการอาหาร (Menu Items)
  const categories = await getCategories();
  const menuItems = await getMenuItems(query);

  return (
    <MenuClient categories={categories || []} menuItems={menuItems || []} />
  );
}
