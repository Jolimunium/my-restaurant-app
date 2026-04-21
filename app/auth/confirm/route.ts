import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

/**
 * ยืนยันตัวตนผ่านอีเมล (Email OTP Validation)
 *
 * รับ Hash Token จากลิงก์และตรวจสอบความถูกต้องผ่าน Supabase
 * ก่อนเปลี่ยนเส้นทางไปยังหน้าเป้าหมาย
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  let next = searchParams.get("next") ?? "/";

  // ป้องกัน Open Redirect: ตรวจสอบว่า `next` เป็น Relative Path เท่านั้น ไม่ใช่ URL ภายนอก (เช่น //malicious.com)
  if (!next.startsWith("/") || next.startsWith("//")) {
    next = "/";
  }

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (error) {
      // หากพบข้อผิดพลาด (เช่น โทเค็นหมดอายุ) ให้เด้งไปหน้าแจ้ง Error
      redirect(`/auth/error?error=${error?.message}`);
    } else {
      // หากยืนยันสำเร็จ ให้พาไปหน้า URL เป้าหมาย หรือกลับหน้าแรกสุด
      redirect(next);
    }
  }

  // หากไม่มีข้อมูล Token มาแต่แรก ให้เด้งไปหน้าแจ้ง Error เช่นกัน
  redirect(`/auth/error?error=No token hash or type`);
}
