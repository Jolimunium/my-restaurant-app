import { UpdatePasswordForm } from "@/components/UpdatePasswordForm";

/**
 * หน้าตั้งรหัสผ่านใหม่ (Route: /auth/update-password)
 * 
 * ให้ผู้ใช้สามารถระบุรหัสผ่านใหม่ได้ทันทีผ่านลิงก์บนอีเมล
 */
export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
