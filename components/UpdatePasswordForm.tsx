"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * UpdatePasswordForm: ฟอร์มสำหรับตั้งรหัสผ่านใหม่ (หลังจากคลิกลิงก์จากอีเมล Reset Password มาแล้ว)
 */
export function UpdatePasswordForm({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * ฟังก์ชันจัดการเมื่อกดบันทึกรหัสผ่านใหม่ไปยังบัญชีระบบของ Supabase
   * (ถึงแม้ฟังก์ชันต้นทางตั้งชื่อเป็น handleForgotPassword แต่มันคือการอัปเดตรหัสผ่านใหม่ updateUser({ password }))
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/main");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-black/40 border-white/10 text-white backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-brand-yellow">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-gray-200">
                  New password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-brand-yellow/50 focus:ring-brand-yellow/50"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-brand-yellow text-brand-dark-red hover:bg-brand-yellow/90 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save new password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
