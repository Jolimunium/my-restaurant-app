"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
} from "lucide-react";
import Image from "next/image";

interface OrderItem {
  /** ID ของรายการอาหารในออเดอร์ */
  id: number;
  /** ID ของออเดอร์หลัก */
  order_id: number;
  /** ID ของสินค้า */
  menu_item_id: number;
  /** จำนวนที่สั่ง */
  quantity: number;
  /** ราคาต่อหน่วย ณ ขณะที่สั่ง */
  price: number;
  /** หมายเหตุเพิ่มเติม */
  notes?: string;
  /** ข้อมูลรายละเอียดสินค้าเพิ่มเติม */
  menu_items?: {
    /** ชื่อสินค้า */
    name: string;
    /** URL รูปภาพสินค้า */
    image_url: string | null;
  };
}

interface Order {
  /** ID ภายในระบบฐานข้อมูล */
  id: number;
  /** รหัสออเดอร์สำหรับแสดงผล (Public Order ID) */
  order_id: string;
  /** วันที่และเวลาที่สั่งซื้อ */
  created_at: string;
  /** ราคารวมทั้งหมด */
  total_amount: number;
  /** สถานะของออเดอร์ */
  status: "pending" | "cooking" | "served" | "completed" | "cancelled";
  /** สถานะการชำระเงิน */
  payment_status: string;
  /** รายการอาหารย่อยในออเดอร์นี้ */
  order_items?: OrderItem[];
}

interface OrdersListProps {
  /** รายการออเดอร์ทั้งหมดที่ต้องการแสดงผล */
  orders: Order[];
}

/**
 * OrdersList: คอมโพเนนต์หน้ารายการประวัติการสั่งอาหาร (Order History)
 * แสดงรายการออเดอร์ที่เคยสั่งไปทั้งหมด ผู้ใช้สามารถกดเปิด (Accordion) 
 * เพื่อดูรายการย่อยที่อยู่ในแต่ละออเดอร์ได้ รวมถึงยอดรวมและสถานะการพิมพ์ชำระเงิน
 */
export default function OrdersList({
  orders: initialOrders,
}: Readonly<OrdersListProps>) {
  const [orders] = useState<Order[]>(initialOrders);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // สลับการเปิด/ปิด Accordion เพื่อดูรายละเอียดแต่ละออเดอร์
  const toggleOrder = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // กำหนดสีของสถานะออเดอร์ (เช่น รอคิว=เหลือง, กำลังทำ=ฟ้า, เสิร์ฟ=เขียว)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-500 bg-yellow-500/10";
      case "cooking":
        return "text-blue-500 bg-blue-500/10";
      case "served":
        return "text-green-500 bg-green-500/10";
      case "completed":
        return "text-gray-400 bg-gray-500/10";
      case "cancelled":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cooking":
        return <ChefHat className="w-4 h-4" />;
      case "served":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // ฟังก์ชันคำนวณยอดรวมของออเดอร์ (ถ้าไม่ได้ระบุ total_amount มาจาก Database ให้บวกเองจากรายการข้างใน)
  const calculateTotal = (order: Order) => {
    if (order.total_amount && Number(order.total_amount) > 0) {
      return Number(order.total_amount);
    }
    return (
      order.order_items?.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ) || 0
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Order History</h1>
        <p className="text-gray-400">Track and view your past orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-black/40 rounded-2xl border border-white/5">
          <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No orders found</h2>
          <p className="text-gray-400">
            You haven&apos;t placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden"
            >
              {/* ส่วนหัวของออเดอร์ (คลิกเพื่อขยายดูรายละเอียด) */}
              <button
                type="button"
                onClick={() => toggleOrder(order.id)}
                className="w-full text-left p-6 cursor-pointer hover:bg-white/5 transition-colors focus:outline-none focus:bg-white/5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <ShoppingBag className="w-6 h-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Order #{order.order_id}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {format(
                          new Date(order.created_at),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div
                      className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                    <p className="text-xl font-bold text-brand-yellow w-24 text-right">
                      {calculateTotal(order).toFixed(2)} ฿
                    </p>
                    {expandedOrderId === order.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* รายรายละเอียดรายการอาหารย่อย (เมื่อขยาย Accordion) */}
              {expandedOrderId === order.id && (
                <div className="border-t border-white/10 p-6 bg-black/20">
                  <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">
                    Order Items
                  </h4>
                  <div className="space-y-4">
                    {order.order_items && order.order_items.length > 0 ? (
                      order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-800">
                              {item.menu_items?.image_url ? (
                                <Image
                                  src={item.menu_items.image_url}
                                  alt={item.menu_items.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                  No img
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                <span className="text-brand-yellow font-bold mr-2">
                                  {item.quantity}x
                                </span>
                                {item.menu_items?.name || "Unknown Item"}
                              </p>
                              {item.notes && (
                                <p className="text-sm text-gray-500 italic">
                                  &quot;{item.notes}&quot;
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="font-medium text-white">
                            {(item.price * item.quantity).toFixed(2)} ฿
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">
                        No items details available
                      </p>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <p className="text-gray-400">Payment Status</p>
                    <p
                      className={`font-medium ${
                        order.payment_status === "Paid"
                          ? "text-green-500"
                          : "text-yellow-500"
                      }`}
                    >
                      {order.payment_status}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
