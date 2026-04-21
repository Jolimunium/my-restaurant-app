import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

/**
 * หน้าแจ้งเตือนสมัครสมาชิกสำเร็จ (Route: /auth/sign-up-success)
 * 
 * หน้าแสดงผลสำหรับแนะนำให้ผู้ใช้ทำการยืนยันบัญชีผ่านอีเมลที่สมัครไว้
 */
export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        <div className="flex flex-col gap-6">
          <Card className="bg-black/40 border-white/10 text-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-brand-yellow">
                Thank you for signing up!
              </CardTitle>
              <CardDescription className="text-center text-gray-400">
                Check your email to confirm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-center text-gray-200">
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
