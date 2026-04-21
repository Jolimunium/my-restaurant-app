/**
 * BackgroundImage: คอมโพเนนต์จัดการพื้นหลัง
 * 
 * เรนเดอร์สีพื้นหลังหลัก (brand-dark-red) ของแอปพลิเคชัน
 * เพื่อความสอดคล้องของสไตล์และการนำกลับมาใช้ซ้ำ (Reusability)
 */
export default function BackgroundImage() {
  return (
    <div className="absolute inset-0 bg-brand-dark-red bg-cover bg-center bg-no-repeat z-0">
      <div className="absolute inset-0 bg-black/40"></div>
    </div>
  );
}
