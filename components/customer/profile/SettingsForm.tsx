"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  Camera,
  Loader2,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Profile {
  /** ID ของผู้ใช้งาน */
  id: string;
  /** ชื่อผู้ใช้งาน (Username) */
  username: string | null;
  /** ชื่อ-นามสกุลจริง */
  full_name?: string | null;
  /** URL รูปภาพ Avatar */
  avatar_url: string | null;
}

interface SettingsFormProps {
  /** ข้อมูลบัญชีผู้ใช้จริงจาก Auth */
  user: User;
  /** ข้อมูลโปรไฟล์เพิ่มเติมจากฐานข้อมูล */
  profile: Profile | null;
}

/**
 * SettingsForm: คอมโพเนนต์หน้าการตั้งค่าโปรไฟล์ผู้ใช้งานบัญชี (Profile Settings)
 * ให้ผู้ใช้สามารถแก้ไขชื่อผู้ใช้, เปลี่ยนแปลงรูปโปรไฟล์ (อัปโหลดเข้า Storage), 
 * และตั้งรหัสผ่านใหม่ได้อย่างปลอดภัย
 */
export default function SettingsForm({
  user,
  profile: initialProfile,
}: Readonly<SettingsFormProps>) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [username, setUsername] = useState(initialProfile?.username || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // สถานะสำหรับการเปลี่ยนรหัสผ่าน
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ส่งข้อมูลเปลี่ยนแปลงโปรไฟล์ (ชื่อผู้ใช้) ไปอัปเดตที่เซิร์ฟเวอร์
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: (error as Error).message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  // ลอจิกสำหรับการแก้ไขและอัปโหลดรูปภาพใหม่ทีละขั้นตอน
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    setLoading(true);
    setMessage(null);

    try {
      // สร้าง Supabase Client ภายในฟังก์ชันเพื่อประหยัดทรัพยากร
      const supabase = createClient();
      // ขั้นที่ 1: อัปโหลดรูปจริงขึ้นระบบ Storage ของ Supabase
      const { error: uploadError } = await supabase.storage
        .from("profiles_avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // ขั้นที่ 2: ขอลิงก์สาธารณะ (Public URL) สำหรับนำไปใช้โชว์หน้าเว็บ
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles_avatars").getPublicUrl(filePath);

      // ขั้นที่ 3: เอาลิงก์ใหม่ที่ได้นำไปอัปเดตลงตาราง Profiles ของผู้ใช้
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
      setMessage({ type: "success", text: "Avatar updated successfully!" });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setMessage({
        type: "error",
        text: (error as Error).message || "Failed to upload avatar",
      });
    } finally {
      setLoading(false);
    }
  };

  // เปลี่่ยนแปลงรหัสผ่าน (ใช้ระบบ Auth ของ Supabase)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "New password and confirm password do not match",
      });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setPasswordLoading(true);
    setMessage(null);

    try {
      // สร้าง Supabase Client ภายในฟังก์ชันเพื่อประหยัดทรัพยากร
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({
        type: "error",
        text: (error as Error).message || "Failed to update password",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">
          Manage your profile and security preferences
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-500 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-brand-yellow" />
          Profile Information
        </h2>

        <div className="flex flex-col sm:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-700 ring-4 ring-white/5 group">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-yellow/20 text-brand-yellow text-3xl font-bold">
                  {user.email?.[0].toUpperCase() || "U"}
                </div>
              )}

              {/* Hover Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                disabled={loading}
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="text-sm text-brand-yellow hover:underline"
            >
              Change Picture
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleUpdateProfile}
            className="flex-1 w-full space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow placeholder-gray-600 transition-all"
                placeholder="Enter your username"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-brand-yellow text-black px-6 py-3 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-brand-yellow" />
          Password
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow placeholder-gray-600 transition-all"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow placeholder-gray-600 transition-all"
                  placeholder="Retype password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
