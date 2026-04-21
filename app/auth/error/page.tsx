import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Suspense } from "react";

/**
 * รับและแสดงข้อความข้อผิดพลาด (Error Content)
 * 
 * ประมวลผลจากข้อมูลที่ได้รับใน Search Parameters 
 */
async function ErrorContent({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error: string }>;
}>) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          Code error: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

/**
 * หน้าจอข้อผิดพลาดของระบบยืนยันตัวตน (Route: /auth/error)
 * 
 * แสดงผลเมื่อการยืนยันอีเมลล้มเหลว หรือโทเค็นหมดอายุ
 */
export default function Page({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ error: string }>;
}>) {
  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm z-10">
        <div className="flex flex-col gap-6">
          <Card className="bg-black/40 border-white/10 text-white backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
