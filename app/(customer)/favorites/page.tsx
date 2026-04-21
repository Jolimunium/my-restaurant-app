import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FavoritesClient from "@/components/customer/favorites/FavoritesClient";
import { MenuItem } from "@/components/customer/cart/AddToCartModal";

/**
 * หน้ารายการเมนูอาหารสุดโปรด (Route: /favorites)
 * 
 * ทำหน้าที่ดึงข้อมูล Auth เช็คการล็อกอินและแสดงข้อมูลรายการเมนูที่ผู้ใช้บันทึกเป็นรายการโปรดเอาไว้
 */
export default async function FavoritesPage() {
  const supabase = await createClient();

  // ตรวจสอบข้อมูลผู้ใช้งานที่กำลังล็อกอินอยู่
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ดึงข้อมูลรายการโปรดพร้อมรายละเอียดเมนู (Nested Join)
  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(
      `
      menu_item_id,
      menu_items (*)
    `
    )
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching favorites:", error);
    return <div>Error loading favorites</div>;
  }

  // จัดเรียงรูปแบบข้อมูลให้พร้อมแสดงผลในส่วนฝั่ง Client
  const formattedFavorites = favorites
    .map((item) => item.menu_items)
    .filter((item) => item !== null) as unknown as MenuItem[];

  return <FavoritesClient initialFavorites={formattedFavorites} />;
}
