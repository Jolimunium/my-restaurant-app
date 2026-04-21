# My Restaurant App

คู่มือการติดตั้งและรันโปรเจกต์

## สิ่งที่ต้องเตรียม (Prerequisites)

ก่อนเริ่มติดตั้ง ตรวจสอบให้แน่ใจว่าเครื่องของคุณมีสิ่งเหล่านี้แล้ว:

- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 LTS หรือใหม่กว่า)
- [Git](https://git-scm.com/)
- โปรแกรม Editor เช่น [VS Code](https://code.visualstudio.com/)

## ขั้นตอนการติดตั้ง (Installation Steps)

ทำตามขั้นตอนทีละข้อเพื่อให้มั่นใจว่าโปรแกรมจะทำงานได้ถูกต้อง

### 1. Clone Repository

ดึงโค้ดลงมาที่เครื่องของคุณ (ข้ามขั้นตอนนี้หากมีไฟล์อยู่แล้ว)

```bash
git clone <repository_url>
cd my-restaurant-app
```

### 2. ติดตั้ง Dependencies

รันคำสั่งเพื่อดาวน์โหลด library ต่างๆ ที่โปรเจกต์ต้องใช้

```bash
npm install
```

_(หรือถ้าใช้ yarn/pnpm ให้ใช้ `yarn install` หรือ `pnpm install`)_

### 3. ตั้งค่า Environment Variables (.env)

โปรเจกต์นี้เชื่อมต่อกับฐานข้อมูล **Supabase** จำเป็นต้องใส่ Key ให้ถูกต้องก่อนรัน

1. มองหาไฟล์ชื่อ `.env.example` ในโฟลเดอร์หลัก
2. สร้างไฟล์ใหม่ชื่อ `.env.local` (หรือ copy จาก .env.example)

    ```bash
    # คำสั่งสำหรับ copy ไฟล์ (Mac/Linux)
    cp .env.example .env.local

    # คำสั่งสำหรับ copy ไฟล์ (Windows Command Prompt)
    copy .env.example .env.local
    ```

3. เปิดไฟล์ `.env.local` และแก้ไขค่าดังนี้:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=ใส่_URL_ของ_Supabase_Project_ที่นี่
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=ใส่_Anon_Key_ของ_Supabase_ที่นี่
    ```

    > **วิธีหา Key:**
    >
    > - เข้าไปที่ [Supabase Dashboard](https://supabase.com/dashboard)
    > - เลือก Project ของร้านอาหาร
    > - ไปที่ **Settings** (ไอคอนเฟือง) -> **API**
    > - ก๊อปปี้ **Project URL** และ **Project API keys (anon public)** มาใส่

### 4. รันโปรแกรม (Run Development Server)

เมื่อตั้งค่าทุกอย่างเสร็จแล้ว ให้รันคำสั่ง:

```bash
npm run dev
```

รอจนกว่าจะขึ้นข้อความว่า `Ready in ... ms` และบอกว่ารันอยู่ที่ port ไหน (ปกติคือ 3000)

### 5. เริ่มทดสอบ (Start Testing)

เปิด Web Browser (Chrome, Edge, etc.) แล้วเข้า URL:

[http://localhost:3000](http://localhost:3000)

---

## ปัญหาที่พบบ่อย (Troubleshooting)

- **Error: "Missing Supabase URL" หรือเชื่อมต่อ Database ไม่ได้**

  - ตรวจสอบไฟล์ `.env.local` ว่าใส่ค่าถูกต้องหรือไม่ และชื่อตัวแปรถูกต้องตามตัวอย่าง
  - ตรวจสอบว่าได้กด Save ไฟล์ `.env.local` แล้ว
  - ลอง Stop server (Ctrl+C) แล้วรัน `npm run dev` ใหม่

- **หน้าเว็บไม่โหลด หรือมี Error สีแดง**
  - ลองเช็ค Terminal ว่ามี Error อะไรแจ้งเตือน
  - ตรวจสอบว่า `npm install` ผ่านโดยไม่มี Error
