import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * createClient (Server): สร้าง Supabase Client สำหรับฝั่ง Server
 * ใช้เฉพาะใน Server Components, Server Actions, และ API Routes
 *
 * ข้อควรระวัง: ต้องเรียกฟังก์ชันนี้ใหม่ทุกครั้งก่อนเข้าถึงฐานข้อมูล
 * ห้ามสร้างเป็น Global เพื่อป้องกัน Request Pollution ระหว่าง Users
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // อ่านคุกกี้ทั้งหมดจาก Request ปัจจุบัน
        getAll() {
          return cookieStore.getAll();
        },
        // เขียนคุกกี้กลับไปยัง Response
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Next.js ไม่อนุญาตให้ Set Cookie บน Server Component โดยตรง
            // การ catch ไว้ที่นี่ป้องกันแอปพลิเคชันล่ม เนื่องจากการจัดการ Session
            // ใช้ Middleware (proxy.ts) เป็นหลักอยู่แล้ว
          }
        },
      },
    },
  );
}
