import { createClient } from "@/lib/supabase/server";
import OrderTrackingClient from "@/components/customer/orders/OrderTrackingClient";
import { cookies } from "next/headers";

/**
 * หน้าติดตามสถานะออเดอร์ล่าสุด (Route: /orders_tracking)
 *
 * ค้นหาข้อมูลออเดอร์ล่าสุดจากเซสชันของโต๊ะ หรือล็อกอินของสมาชิก
 * เพื่อเตรียมเข้าสู่ระบบ Tracking ทางด้าน Client
 */
export default async function OrderTrackingPage() {
  const supabase = await createClient();

  // อ่านค่าคุกกี้เพื่อตรวจสอบเซสชัน
  const cookieStore = await cookies();
  const tableSessionId = cookieStore.get("table_session_id")?.value;

  let tableId = null;

  // ค้นหาข้อมูล Session ของโต๊ะอาหาร (ครอบคลุมผู้ใช้งานทั่วไป)
  if (tableSessionId) {
    const { data: session } = await supabase
      .from("table_sessions")
      .select("table_id")
      .eq("id", tableSessionId)
      .eq("status", "active") // สนใจเฉพาะคนที่โต๊ะยัง Active (เปิดอยู่)
      .single();

    if (session) {
      tableId = session.table_id;
    }
  }

  // ยกเลิกการติดตามถ้าไม่พบ Table Session
  if (!tableId) {
    return <OrderTrackingClient order={null} />;
  }

  // ดึงออเดอร์ล่าสุดจากฐานข้อมูลเพื่อเตรียมติดตาม
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        menu_items (name, image_url)
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(1);

  if (tableId) {
    query = query.eq("table_id", tableId);
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching order for tracking:", error);
    return <OrderTrackingClient order={null} />;
  }

  const latestOrder = orders && orders.length > 0 ? orders[0] : null;

  return <OrderTrackingClient order={latestOrder} />;
}
