import { LoginForm } from "@/components/LoginForm";

/**
 * หน้าเข้าสู่ระบบ (Route: /auth/login)
 * 
 * แสดงฟอร์มให้ผู้ใช้กรอกอีเมลและรหัสผ่านเพื่อเข้าใช้งาน
 */
export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        <LoginForm />
      </div>
    </div>
  );
}
