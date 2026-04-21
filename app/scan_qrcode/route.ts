import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * ยืนยันสิทธิ์การเปิดโต๊ะและออก Session Cookie (Scan QR Code)
 *
 * รับ Request จากการแสกน QR Code เพื่อยืนยันสิทธ์ความถูกต้องผ่าน Supabase
 * พร้อมสร้าง HTTP-only cookie ป้องกันความปลอดภัย
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("t");

  if (!token) return NextResponse.redirect(new URL("/", request.url));

  // ตรวจสอบ Token จาก Database
  const { data: session } = await supabase
    .from("table_sessions")
    .select("*")
    .eq("token", token)
    .single();

  // ตรวจสอบวันหมดอายุและสถานะการใช้งาน
  if (
    !session ||
    new Date() > new Date(session.expires_at) ||
    session.status !== "active"
  ) {
    return NextResponse.redirect(new URL("/expired", request.url));
  }

  // ออก Session Cookie และ Redirect ไปหน้าหลักของเมนู
  const response = NextResponse.redirect(new URL("/main", request.url));

  response.cookies.set("table_session_id", session.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 2,
    sameSite: "lax",
  });

  return response;
}
