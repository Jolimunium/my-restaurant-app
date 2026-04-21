"use client";

import { Check, Clock, ChefHat, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

interface OrderItem {
  /** ID ของรายการอาหาร (ออปชันนัล) */
  id?: number;
  /** จำนวนที่สั่ง */
  quantity: number;
  /** ราคาต่อหน่วย */
  price: number;
  /** รายละเอียดสินค้า */
  menu_items?: {
    /** ชื่อสินค้า */
    name: string;
    /** URL รูปภาพสินค้า */
    image_url: string | null;
  };
}

interface Order {
  /** ID ของออเดอร์ในฐานข้อมูล */
  id: number;
  /** รหัสออเดอร์สำหรับแสดงผล (Public Order ID) */
  order_id: string;
  /** เวลาที่สร้างออเดอร์ */
  created_at: string;
  /** เวลาที่อัปเดตล่าสุด */
  updated_at: string;
  /** สถานะปัจจุบันของออเดอร์ */
  status: string;
  /** ราคารวมทั้งหมด */
  total_amount: number;
  /** รายการอาหารในออเดอร์ */
  order_items?: OrderItem[];
}

interface OrderTrackingClientProps {
  /** ข้อมูลออเดอร์ที่จะติดตามสถานะ (ระบุ null หากไม่มีออเดอร์ที่กำลังดำเนินการ) */
  order: Order | null;
}

/** ระบุ Step ทั้ง  4 ขั้นตอน ของกระบวนการของเดลิเวอรี (Delivery Pipeline) */
const STEPS = [
  { id: "pending", label: "Received", icon: Clock },
  { id: "cooking", label: "Cooking", icon: ChefHat },
  { id: "served", label: "Served", icon: Check },
  { id: "completed", label: "Completed", icon: Check },
];

/**
 * OrderTrackingClient: คอมโพเนนต์หน้าติดตามสถานะออเดอร์แบบเรียลไทม์ (Real-time)
 * มีการใช้ Supabase Realtime Channels เพื่อรับข้อมูลการเปลี่ยนสถานะทันที (เช่น ครัวกำลังทำ -> เสิร์ฟแล้ว)
 * และแสดงผลเป็น Progress Bar ของแต่ละออเดอร์
 */
export default function OrderTrackingClient({
  order: initialOrder,
}: Readonly<OrderTrackingClientProps>) {
  const [order, setOrder] = useState<Order | null>(initialOrder);

  useEffect(() => {
    // เซ็ตข้อมูลหาก props เปลี่ยน (Component ช่วยเหลือ mount แค่ครั้งเดียว)
    setOrder(initialOrder);
  }, [initialOrder]);

  const orderId = order?.id;

  useEffect(() => {
    if (!orderId) return;

    // สร้าง Supabase Client ภายใน useEffect เพื่อให้ reference คงที่ ไม่ trigger re-subscribe ซ้ำ
    const supabase = createClient();

    // ฟังก์ชันดึงข้อมูลออเดอร์ล่าสุดและรายการอาหาร (Order Items) พร้อมรูปภาพ
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            menu_items (name, image_url)
          )
        `,
        )
        .eq("id", orderId)
        .single();

      if (!error && data) {
        setOrder(data);
      }
    };

    const channel = supabase
      .channel(`order_tracking_${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          // 1. อัปเดตข้อมูลบนหน้าจอทันทีที่มีการเปลี่ยนแปลง (Optimistic update)
          setOrder((prev) =>
            prev ? { ...prev, ...payload.new } : (payload.new as Order),
          );
          // 2. ซิงค์ข้อมูลขนานใหญ่เพื่อดึงความสัมพันธ์ (เช่น รายการ order_items ด้านใน) ให้สมบูรณ์แบบ
          fetchOrder();
        },
      )
      // ติดตามการเปลี่ยนแปลงในตารางลูก (order_items) ด้วย เผื่อมีการแก้ไขอาหาร
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          fetchOrder();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const computedTotalAmount = useMemo(() => {
    return order?.total_amount && Number(order.total_amount) > 0
      ? Number(order.total_amount)
      : order?.order_items?.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ) || 0;
  }, [order?.total_amount, order?.order_items]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="bg-white/5 p-6 rounded-full mb-4">
          <Clock className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Order</h2>
        <p className="text-gray-400 mb-6">
          Looks like you don&apos;t have any orders in progress.
        </p>
        <Link
          href="/menu"
          className="bg-brand-yellow text-black font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors"
        >
          Order Now
        </Link>
      </div>
    );
  }

  // คำนวณลำดับขั้นตอนปัจจุบัน (เช่น pending = ขั้นแรก, completed = ขั้นสุดท้าย)
  // เพื่อนำไปใช้ควบคุมความยาวของหลอด Progress Bar และสีของไอคอน
  const getCurrentStepIndex = (status: string) => {
    switch (status) {
      case "pending":
        return 0;
      case "cooking":
        return 1;
      case "served":
        return 2;
      case "completed":
        return 3;
      default:
        return 0;
    }
  };

  const currentStep = getCurrentStepIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-32">
      {/* ปุ่มกดกลับไปยังหน้าเมนูอาหาร */}
      <div className="mb-6">
        <Link
          href="/menu"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Menu
        </Link>
      </div>

      <div className="bg-[#202020] rounded-3xl p-6 md:p-8 shadow-2xl border border-white/5">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Order Status
          </h1>
        </div>

        {isCancelled ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center mb-8">
            <p className="text-red-500 font-bold text-lg">
              This order has been cancelled.
            </p>
          </div>
        ) : (
          <div className="relative mb-12">
            {/* เส้นพื้นหลังของ Progress Bar */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-700 rounded-full" />

            {/* เส้นสถานะปัจจุบันของ Progress Bar (สีเหลือง) */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-yellow transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />

            <div className="relative flex justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${
                        isActive
                          ? "bg-brand-yellow text-black shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-110"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p
                      className={`mt-3 text-xs md:text-sm font-medium transition-colors ${
                        isActive ? "text-brand-yellow" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ส่วนแสดงรายละเอียดออเดอร์ย่อย */}
        <div className="bg-black/20 rounded-xl p-4 md:p-6 mb-6">
          <h3 className="font-bold text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-brand-yellow" />
            Estimated Time
          </h3>
          <p className="text-gray-300 mb-6">
            {order.status === "completed"
              ? `Completed at ${format(new Date(order.updated_at), "h:mm a")}`
              : "Usually takes 5-20 minutes"}
          </p>

          <div className="border-t border-white/10 pt-4">
            <h3 className="font-bold text-white mb-3">Order Summary</h3>
            <div className="space-y-3">
              {order.order_items?.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center text-gray-300">
                    <span className="text-brand-yellow font-bold mr-2">
                      {item.quantity}x
                    </span>
                    {item.menu_items?.name}
                  </div>
                  <span className="text-white font-medium">
                    {(item.price * item.quantity).toFixed(2)} ฿
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 mt-4 pt-3 flex justify-between items-center">
              <span className="text-gray-400">Total</span>
              <span className="text-xl font-bold text-brand-yellow">
                {computedTotalAmount.toFixed(2)} ฿
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
