import { AlertOctagon } from "lucide-react";
import Link from "next/link";

/**
 * หน้าจอแจ้งข้อผิดพลาดเมื่อ Session ไม่ถูกต้อง (Route: /expired)
 * 
 * แสดงผลเมื่อผู้ใช้สแกน QR Code ที่หมดอายุ หรือพยายามเข้าถึงระบบโดยไม่มีเซสชันของโต๊ะ
 */
export default function ExpiredPage() {
  return(
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark-red p-4 text-center">
      
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl bg-black/40 p-8 backdrop-blur-md border border-white/10 shadow-2xl">
        
        <div className="rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/20">
          <AlertOctagon className="h-16 w-16 text-red-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-white">QR Code หมดอายุ</h1>
          <p className="text-gray-200">
            เซสชันการสั่งอาหารนี้หมดอายุแล้ว
            <br />
            หรือ QR Code ไม่ถูกต้อง
          </p>
        </div>

        <div className="w-full space-y-4 pt-4">
          <div className="rounded-xl bg-white/5 p-4 text-sm text-gray-300">
            กรุณาติดต่อพนักงาน
            <br />
            เพื่อขอรับ QR Code ใหม่
          </div>

          <Link
            href="/"
            className="block w-full rounded-xl bg-white/10 py-3 font-medium text-white transition-colors hover:bg-white/20 active:bg-white/30"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
}
