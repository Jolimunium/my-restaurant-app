import { createBrowserClient } from "@supabase/ssr";

/**
 * createClient (Browser): สร้าง Supabase Client สำหรับฝั่ง Browser (Client Components)
 * ใช้ตัวแปร Environment ที่ขึ้นต้นด้วย `NEXT_PUBLIC_` เพื่ออนุญาตให้ Browser เข้าถึงได้อย่างปลอดภัย
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
