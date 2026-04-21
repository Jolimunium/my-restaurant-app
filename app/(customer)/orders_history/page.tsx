import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrdersList from "@/components/customer/orders/OrdersList";

/**
 * หน้าประวัติการสั่งซื้อ (Route: /orders_history)
 * 
 * ทำหน้าที่ดึงข้อมูลออเดอร์ย้อนหลังทั้งหมดของลูกค้า ควบคู่กับรายการอาหารด้านในแบบครบถ้วน
 */
export default async function OrdersPage() {
  const supabase = await createClient();

  // ตรวจสอบสถานะการล็อกอิน
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ดึงประวัติออเดอร์ทั้งหมดและรายการย่อย (Nested Join)
  const { data: orders, error } = await supabase
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
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", JSON.stringify(error, null, 2));
    return <div>Error loading orders</div>;
  }

  return <OrdersList orders={orders || []} />;
}
