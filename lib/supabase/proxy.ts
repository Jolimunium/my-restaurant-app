import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * updateSession: ฟังก์ชัน Middleware สำหรับจัดการ Session และควบคุมการเข้าถึงเส้นทาง (Route Guarding)
 * จะถูกเรียกทุกครั้งที่มี Request เข้ามาในระบบ ทำหน้าที่สามส่วนหลัก:
 * 1. รีเฟรช Session ของ Supabase Auth โดยอัตโนมัติ
 * 2. ตรวจสอบสิทธิ์การเข้าถึงหน้าลูกค้า (ต้องมี `table_session_id` cookie)
 * 3. ป้องกันเส้นทางส่วนตัวสำหรับผู้ที่ยังไม่ได้ล็อกอิน
 */
export async function updateSession(request: NextRequest) {
  // เตรียม Response พื้นฐานและสร้าง Supabase Client สำหรับ Middleware
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ดึงข้อมูลผู้ใช้งานปัจจุบัน (null หากยังไม่ได้ล็อกอิน)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ตรวจสอบว่า Request มุ่งหน้าไปยังหน้าของลูกค้าหรือไม่
  const isCustomerPage = request.nextUrl.pathname.startsWith("/menu");

  // ตรวจสอบว่ามี Cookie ของเซสชันโต๊ะอยู่หรือไม่
  const tableSession = request.cookies.get("table_session_id");

  // กฎที่ 1: หากอยู่ที่หน้าแรก (/) และมีเซสชันโต๊ะที่ยัง Active อยู่
  // ให้ Redirect ไปยัง /main ทันที เพื่อไม่ต้องสแกน QR ซ้ำ
  if (request.nextUrl.pathname === "/" && tableSession) {
    const { data: sessionData, error } = await supabase
      .from("table_sessions")
      .select("status")
      .eq("id", tableSession.value)
      .single();

    if (!error && sessionData?.status === "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/main";
      return NextResponse.redirect(url);
    }
  }

  // กฎที่ 2: ตรวจสอบสิทธิ์การเข้าถึงหน้าลูกค้า (Customer Route)
  if (isCustomerPage) {
    // ไม่มี Cookie โต๊ะ → ยังไม่ได้สแกน QR → Redirect กลับหน้าแรก
    if (!tableSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // มี Cookie โต๊ะ → ตรวจสอบความถูกต้องกับฐานข้อมูล
    const { data: sessionData, error } = await supabase
      .from("table_sessions")
      .select("status")
      .eq("id", tableSession.value)
      .single();

    // Session หมดอายุหรือถูกปิดแล้ว → ลบ Cookie และ Redirect กลับหน้าแรก
    if (error || sessionData?.status !== "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      const response = NextResponse.redirect(url);
      response.cookies.delete("table_session_id");
      return response;
    }
  }

  // กฎที่ 3: ป้องกันเส้นทางส่วนตัว (Private Routes) สำหรับผู้ที่ยังไม่ได้ล็อกอิน
  // เส้นทางที่อยู่ใน Whitelist ด้านล่างจะถูกยกเว้น (เข้าได้โดยไม่ต้องมี Session)
  if (
    request.nextUrl.pathname !== "/" &&
    !user &&
    !isCustomerPage &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/contact") &&
    !request.nextUrl.pathname.startsWith("/orders_tracking") &&
    !request.nextUrl.pathname.startsWith("/main") &&
    !request.nextUrl.pathname.startsWith("/scan_qrcode") &&
    !request.nextUrl.pathname.startsWith("/expired")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
