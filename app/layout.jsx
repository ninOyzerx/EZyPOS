import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EZyPOS",
  description: "EZyPOS เป็นระบบจัดการจุดขาย (POS) และการจัดการสินค้าคงคลังที่ออกแบบมาเพื่อช่วยธุรกิจของคุณให้สามารถติดตามยอดขาย สต็อกสินค้า และการดำเนินงานได้อย่างมีประสิทธิภาพ ง่ายต่อการใช้งาน พร้อมฟีเจอร์ที่ครอบคลุมทุกความต้องการในร้านค้า ช่วยเพิ่มความคล่องตัวและลดความซับซ้อนในการบริหารธุรกิจของคุณ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
