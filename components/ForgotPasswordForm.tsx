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
import Link from "next/link";
import { useState } from "react";

/**
 * ForgotPasswordForm: ฟอร์มสำหรับให้ผู้ใช้กรอกอีเมลเพื่อขอ "ลิงก์รีเซ็ตรหัสผ่าน" (Forgot Password)
 */
export function ForgotPasswordForm({
  className,
  ...props
}: Readonly<React.ComponentPropsWithoutRef<"div">>) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * ฟังก์ชันเรียกใช้งาน API เพื่อส่งอีเมลรีเซ็ตรหัสผ่านผ่านระบบ Supabase Auth
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // URL ที่จะส่งไปในอีเมลต้องถูกตั้งค่าใน Supabase Dashboard -> Auth -> URL Configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${globalThis.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="bg-black/40 border-white/10 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-brand-yellow">
              Check Your Email
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Password reset instructions sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-300 text-center">
              If you registered using your email and password, you will receive
              a password reset email.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-black/40 border-white/10 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-brand-yellow">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-center text-gray-400">
              Type in your email and we&apos;ll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-brand-yellow/50 focus:ring-brand-yellow/50"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-brand-yellow text-brand-dark-red hover:bg-brand-yellow/90 font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send reset email"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4 text-brand-yellow hover:text-brand-yellow/80"
                >
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
