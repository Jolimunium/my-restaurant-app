import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn: รวม CSS Class Names และขจัด Class ที่ขัดแย้งกัน (Tailwind Merge)
 * @param inputs รายการ Class ที่ต้องการรวม (รองรับ String, Object, Array)
 */
export function cn(...inputs: ClassValue[]) {
  // clsx รวม inputs เป็น string เดียว, twMerge ขจัด Tailwind classes ที่ซ้ำซ้อน
  return twMerge(clsx(inputs));
}

/**
 * hasEnvVars: ตรวจสอบว่าตั้งค่าตัวแปร Environment ของ Supabase ครบถ้วนหรือไม่
 * ใช้แสดงคำเตือนใน UI หากลืมตั้งค่าในไฟล์ `.env.local`
 */
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
