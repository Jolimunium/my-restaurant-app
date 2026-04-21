import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

/**
 * หน้าลืมรหัสผ่าน (Route: /auth/forgot-password)
 * 
 * แสดงฟอร์มให้ผู้ใช้ระบุอีเมลสำหรับดำเนินการตั้งรหัสผ่านใหม่
 */
export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
