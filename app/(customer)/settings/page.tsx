import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/customer/profile/SettingsForm";

/**
 * หน้าการตั้งค่าบัญชีและโปรไฟล์ (Route: /settings)
 * 
 * ดึงข้อมูลผู้ใช้งาน เพื่อนำไปแสดงบนฟอร์มแก้ไขข้อมูล
 */
export default async function SettingsPage() {
  const supabase = await createClient();

  // ตรวจสอบสถานะการล็อกอิน
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ดึงข้อมูลโปรไฟล์จากระบบ
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 ">
      <SettingsForm user={user} profile={profile} />
    </div>
  );
}
