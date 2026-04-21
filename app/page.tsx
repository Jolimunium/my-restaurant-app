import { ScanQrCode } from "lucide-react";

/**
 * หน้าจอเริ่มต้น (Root Page)
 * 
 * แสดงผลในกรณีผู้ใช้งานเข้าใช้งานโดยไม่ได้สแกน QR Code เพื่อแจ้งให้สแกนก่อนสั่งอาหาร
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-dark-red p-4 text-center">
      <div className="flex max-w-sm flex-col items-center gap-6 rounded-2xl bg-black/40 p-8 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="rounded-full bg-brand-yellow/10 p-4 ring-1 ring-brand-yellow/20">
          <ScanQrCode className="h-12 w-12 text-brand-yellow" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">ยินดีต้อนรับ</h1>
          <p className="text-gray-200">
            กรุณาสแกน QR Code 
            <br />
            เพื่อเริ่มสั่งอาหาร
          </p>
        </div>

        <div className="text-sm text-white/50">
          หากพบปัญหา กรุณาติดต่อพนักงาน
        </div>
      </div>
    </div>
  );
}
