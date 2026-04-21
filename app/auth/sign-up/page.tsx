import { SignUpForm } from "@/components/SignUpForm";

/**
 * หน้าสมัครสมาชิก (Route: /auth/sign-up)
 * 
 * แสดงฟอร์มให้ผู้ใช้ใหม่กรอกข้อมูลส่วนบุคคลเพื่อสมัครสมาชิก
 */
export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        <SignUpForm />
      </div>
    </div>
  );
}
