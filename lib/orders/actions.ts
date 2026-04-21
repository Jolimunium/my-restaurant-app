"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * CartItem: โครงสร้างข้อมูลตะกร้าสินค้าสำหรับออเดอร์
 */
interface CartItem {
  /** ID ของสินค้า */
  id: number;
  /** ชื่อสินค้า */
  name: string;
  /** ราคาต่อหน่วย */
  price: number;
  /** จำนวนที่สั่ง */
  quantity: number;
  /** หมายเหตุเพิ่มเติม */
  note?: string;
}

/**
 * TableSession: โครงสร้างข้อมูล Table Session สำหรับออเดอร์
 */
interface TableSession {
  /** ID ของโต๊ะอาหาร */
  table_id: number;
  /** สถานะปัจจุบันของเซสชัน (เช่น active, completed) */
  status: string;
}

/**
 * สร้างและบันทึกรายการออเดอร์จากตะกร้าลงฐานข้อมูล (Server Action)
 *
 * ผูก Order กับลูกค้าและเซสชันโต๊ะ พร้อมคำนวณยอดเงินรวมอย่างถูกต้อง
 *
 * @param items รายการอาหารที่ลูกค้าสั่งจากตะกร้า
 */
export async function createOrder(items: CartItem[]) {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const tableSessionId = cookieStore.get("table_session_id")?.value;

  // ตรวจสอบสิทธิ์ Table Session เบื้องต้น
  if (!tableSessionId) {
    return {
      success: false,
      message: "No active session found. Please scan QR code again.",
    };
  }

  try {
    // ตรวจสอบเซสชันบนฐานข้อมูล (Database Session Override)
    const session = await validateTableSession(supabase, tableSessionId);
    if (!session) {
      return {
        success: false,
        message: "Session expired or invalid. Please scan QR code again.",
      };
    }

    // ตรวจสอบข้อมูลผู้ใช้งานเพื่อเก็บบันทึกประวัติ
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. ตรวจสอบความถูกต้องของข้อมูล (Input Validation) - จำนวนต้องมากกว่า 0
    const hasInvalidQuantity = items.some((item) => item.quantity <= 0);
    if (hasInvalidQuantity || items.length === 0) {
      return {
        success: false,
        message: "Invalid quantity or empty cart.",
      };
    }

    // ค้นหาหรือสร้าง Order ID สำหรับโต๊ะนี้
    const orderResult = await getOrCreateOrder(supabase, session, user);
    if (!orderResult.success) {
      return {
        success: false,
        message:
          orderResult.message || "Failed to process order. Please try again.",
      };
    }
    const orderId = orderResult.orderId as string;

    // บันทึกรายการที่สั่งทั้งหมดลง Order Items
    const itemsSuccess = await insertOrderItems(supabase, items, orderId);
    if (!itemsSuccess) {
      return { success: false, message: "Failed to add items to order" };
    }

    // คำนวณและล็อกยอดราคารวมทั้งหมดของ Order
    await calculateAndUpdateOrderTotal(supabase, orderId);

    return {
      success: true,
      message: "Order placed successfully!",
      orderId: orderId,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

/**
 * ตรวจสอบความถูกต้องของเซสชันโต๊ะ (Database check) เพื่อยืนยันว่าโต๊ะนี้ยังเปิกการสั่งซื้อได้ (Active)
 */
async function validateTableSession(
  supabase: SupabaseClient,
  tableSessionId: string | undefined,
) {
  const { data: session, error: sessionError } = await supabase
    .from("table_sessions")
    .select("table_id, status")
    .eq("id", tableSessionId)
    .single();

  if (sessionError || session?.status !== "active") {
    return null;
  }
  return session;
}

/**
 * ค้นหา Order ที่ยังเปิดชำระเงินเดิมอยู่ หรือสร้าง Order ใหม่สำหรับโต๊ะนี้แทน
 */
async function getOrCreateOrder(
  supabase: SupabaseClient,
  session: TableSession,
  user: User | null,
) {
  // ดึง Order ที่ทำรายการล่าสุดบนโต๊ะ
  const { data: latestOrder } = await supabase
    .from("orders")
    .select(
      "id, total_amount, status, payment_status, order_id, customer_id, updated_at",
    )
    .eq("table_id", session.table_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 2. ระบบจำกัดความถี่ในการสั่ง (Rate Limiting) - ห้ามสั่งรัวๆ ภายใน 1 วินาที
  if (latestOrder?.updated_at) {
    const lastUpdate = new Date(latestOrder.updated_at).getTime();
    const now = Date.now();
    const secondsSinceLastOrder = (now - lastUpdate) / 1000;

    if (secondsSinceLastOrder < 1) {
      return {
        success: false,
        message: `กรุณารอสักครู่ ${Math.ceil(
          1 - secondsSinceLastOrder,
        )} วินาที ก่อนสั่งอาหาร`,
      };
    }
  }

  // ตรวจสอบสถานะที่ยังไม่ถูกชำระเงินหรือยกเลิก
  const activeOrder =
    latestOrder?.payment_status === "unpaid" &&
    latestOrder.status !== "cancelled" &&
    latestOrder.status !== "completed"
      ? latestOrder
      : null;

  if (activeOrder) {
    // สั่งเพิ่มอาหารไปยังบิลเดิม
    const orderId = activeOrder.order_id;

    if (activeOrder.status === "cooking" || activeOrder.status === "served") {
      await supabase
        .from("orders")
        .update({ status: "pending" })
        .eq("order_id", orderId);
    }

    if (user?.id && !activeOrder.customer_id) {
      await supabase
        .from("orders")
        .update({ customer_id: user.id })
        .eq("order_id", orderId);
    }

    return { success: true, orderId };
  } else {
    // เริ่มสร้างการสั่งซื้อหรือบิลใหม่
    const orderId = await generateOrderId(supabase);

    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        table_id: session.table_id,
        customer_id: user?.id || null,
        total_amount: 0,
        status: "pending",
        payment_status: "unpaid",
        order_id: orderId,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return {
        success: false,
        message: "Failed to create order. Please try again.",
      };
    }

    return { success: true, orderId };
  }
}

/**
 * บันทึกรายการสั่งอาหารทีละรายการ (Batch Insert) เข้าสู่ Order ใน Database
 */
async function insertOrderItems(
  supabase: SupabaseClient,
  items: CartItem[],
  orderId: string,
) {
  // ดึงราคาจริงจากฐานข้อมูลเพื่อป้องกันการแก้ราคาจาก Client (Price Manipulation Protection)
  const itemIds = items.map((item) => item.id);
  const { data: menuItems, error: menuError } = await supabase
    .from("menu_items")
    .select("id, price")
    .in("id", itemIds);

  if (menuError || !menuItems) {
    console.error(
      "Error fetching menu items for price verification:",
      menuError,
    );
    return false;
  }

  // สร้าง Map เพื่อให้ค้นหาราคาได้ง่ายขึ้น
  const priceMap = new Map(menuItems.map((mi) => [mi.id, mi.price]));

  const orderItems = items.map((item) => ({
    order_id: orderId,
    menu_item_id: item.id,
    quantity: item.quantity,
    // ใช้ราคาจาก DB เสมอ เพื่อความปลอดภัย
    price: priceMap.get(item.id) ?? 0,
    notes: item.note || null,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    return false;
  }
  return true;
}

/**
 * คำนวณราคารวมทั้งหมดฝั่ง Server (Server-Side Recalculation) เพื่อความปลอดภัย
 */
async function calculateAndUpdateOrderTotal(
  supabase: SupabaseClient,
  orderId: string,
) {
  // ดึงรายการ Order ทั้่งหมดที่เกี่ยวข้องจากตาราง order_items
  const { data: allItems, error: fetchItemsError } = await supabase
    .from("order_items")
    .select("price, quantity")
    .eq("order_id", orderId);

  if (fetchItemsError) {
    console.error(
      "Error fetching order items for total calculation:",
      fetchItemsError,
    );
    return;
  }

  // คำนวณราคายอดรวม
  const grandTotal = allItems.reduce(
    (sum: number, item: { price: number; quantity: number }) =>
      sum + item.price * item.quantity,
    0,
  );

  // อัปเดตยอดจริงเข้าออเดอร์ในตารางหลัก
  const { error: finalUpdateError } = await supabase
    .from("orders")
    .update({
      total_amount: grandTotal,
      updated_at: new Date().toISOString(),
    })
    .eq("order_id", orderId);

  if (finalUpdateError) {
    console.error("Error updating final order total:", finalUpdateError);
  }
}

/**
 * สร้างและรันหมายเลขออเดอร์ (Generate Order ID) แบบ Pattern เวลา (Asia/Bangkok)
 * Format: OR-DDMMYY-XXXX
 */
async function generateOrderId(supabase: SupabaseClient) {
  const now = new Date();
  const thaiDate: Date = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }),
  );

  const day = String(thaiDate.getDate()).padStart(2, "0");
  const month = String(thaiDate.getMonth() + 1).padStart(2, "0");
  const year = String(thaiDate.getFullYear()).slice(-2);
  const datePrefix = `OR-${day}${month}${year}`;

  const { data: lastOrderData } = await supabase
    .from("orders")
    .select("order_id")
    .ilike("order_id", `${datePrefix}-%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let nextRunNumber = 1;
  if (lastOrderData?.order_id) {
    const parts = lastOrderData.order_id.split("-");
    const lastNum = Number.parseInt(parts[parts.length - 1]);
    if (!Number.isNaN(lastNum)) {
      nextRunNumber = lastNum + 1;
    }
  }

  return `${datePrefix}-${String(nextRunNumber).padStart(4, "0")}`;
}
