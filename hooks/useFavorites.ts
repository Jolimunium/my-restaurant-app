"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/**
 * Custom Hook สำหรับจัดการระบบรายการโปรด (Favorites)
 *
 * จัดการสถานะรายการโปรด ฝั่ง Client รวมถึงการตรวจสอบ เพิ่ม และลบเมนูโปรดของผู้ใช้งาน
 * 
 * @param itemId ID ของเมนูอาหารที่ต้องการตรวจสอบสถานะโปรด
 */
export function useFavorites(itemId: number | undefined) {
  const [isFavorite, setIsFavorite] = useState(false);

  // ตรวจสอบสถานะรายการโปรดจากฐานข้อมูล
  const checkFavoriteStatus = useCallback(async () => {
    if (!itemId) return;
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("menu_item_id", itemId)
        .single();

      setIsFavorite(!!data);
    } else {
      setIsFavorite(false);
    }
  }, [itemId]);

  // สลับสถานะเพิ่มหรือลบรายการโปรด (Toggle)
  const toggleFavorite = async () => {
    if (!itemId) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // ต้องเข้าสู่ระบบก่อนทำรายการ
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มรายการโปรด");
      return;
    }

    try {
      if (isFavorite) {
        // ยกเลิกรายการโปรด (Delete record)
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("menu_item_id", itemId);

        if (error) throw error;
        setIsFavorite(false);
        toast.success("ลบออกจากรายการโปรดเรียบร้อยแล้ว");
      } else {
        // เพิ่มรายการโปรด (Insert record)
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          menu_item_id: itemId,
        });

        if (error) throw error;
        setIsFavorite(true);
        toast.success("เพิ่มรายการโปรดเรียบร้อยแล้ว");
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };

  return { isFavorite, checkFavoriteStatus, toggleFavorite };
}
