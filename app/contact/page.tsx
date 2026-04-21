import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { MapPin, Phone } from "lucide-react";

/**
 * หน้าช่องทางการติดต่อร้าน (Route: /contact)
 *
 * แสดงบัตรข้อมูลที่อยู่เบอร์โทรศัพท์ของร้านอาหาร
 */
export default function Contact() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ส่วนแสดงข้อมูลการติดต่อ */}
        <div className="w-full max-w-lg">
          <Card className="bg-black/40 border-white/10 text-white backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-2xl text-brand-yellow text-center">
                Contact Information
              </CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Find us at the following location or reach out via phone/email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-6 w-6 text-brand-yellow shrink-0" />
                <div>
                  <h3 className="font-semibold text-white">Address</h3>
                  <p className="text-gray-400">
                    ร้านไก่ย่างพังโคน 126/30 หมู่ 3 ตำบลบ่อวิน อำเภอศรีราชา
                    จังหวัดชลบุรี 20230
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="mt-1 h-6 w-6 text-brand-yellow shrink-0" />
                <div>
                  <h3 className="font-semibold text-white">Phone</h3>
                  <p className="text-gray-400">089-5710103</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
