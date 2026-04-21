import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * กำหนดเส้นทาง (Paths) ทั้งหมดที่ต้องการให้ Middleware ตรวจสอบ ยกเว้น:
     * - _next/static (ไฟล์ Static)
     * - _next/image (ไฟล์รูปภาพที่ผ่านการ Optimize)
     * - favicon.ico (ไฟล์ไอคอนของเว็บ)
     * - ไฟล์รูปภาพตระกูลอื่นๆ - .svg, .png, .jpg, .jpeg, .gif, .webp
     * สามารถปรับแต่ง Pattern นี้เพื่อเพิ่มเส้นทางอื่นๆ ที่ต้องการผ่านการตรวจสอบ (Skip) ได้
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
