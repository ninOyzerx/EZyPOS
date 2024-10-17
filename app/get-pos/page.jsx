'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import './styles.css';

export default function Pricing() {
  const [darkMode, setDarkMode] = useState(false);
  const totalAmount = 10000; 

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);


  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-thai">
<header className="bg-primary dark:bg-gray-800 text-primary-foreground py-5 md:py-8 lg:py-10 mb-[-50px]">
  <div className="container mx-auto px-4 md:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto text-center space-y-4">
      <h1 className={`text-3xl md:text-2xl lg:text-4xl font-bold ${darkMode ? 'text-gray-300' : 'text-white-300'}`}>
        ยกระดับธุรกิจของคุณด้วยระบบ POS ที่มีประสิทธิภาพ
      </h1>
      <p className={`text-xl md:text-2xl lg:text-3xl text-primary-foreground/80 ${darkMode ? 'text-gray-300' : 'text-white-300'}`}>
        ปรับปรุงการดำเนินงานของคุณ เพิ่มยอดขาย และมอบประสบการณ์ลูกค้าที่ดีเยี่ยมด้วยโซลูชัน POS ที่ล้ำสมัยของเรา
      </p>
    </div>
  </div>
</header>

      <main className="flex-1 py-12 md:py-16 lg:py-13">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-3 lg:mb-5">แผนราคา</h2>
          <div className="flex justify-center">
            <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden w-full max-w-md transition-transform hover:scale-105 hover:shadow-xl hover:animate-bounce">
              <div className="bg-gray-300 px-6 py-8 text-center">
                <h3 className="text-3xl font-bold mb-2 text-black">พื้นฐาน : Standard</h3>
                <p className="text-black mb-6 text-2xl">เหมาะสำหรับธุรกิจร้านขายของ</p>
                <div className="flex items-baseline justify-center mb-6 text-4xl ">
                  <span className="font-bold text-black">฿10,000</span>
                  <span className="text-black">/ถาวร</span>
                </div>
                <Link
  href="/get-pos/payment"
  className="text-3xl inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
  prefetch={false}
>
  เริ่มต้นสมัครสมาชิก
</Link>

              </div>
              <div className="px-6 py-6 text-2xl ">
                <ul className="space-y-2 text-black">
                  <li className="flex items-center gap-2 font-bold">
                    <CheckIcon className="w-7 h-7 text-green-500" />
                    <span>ระบบ Point Of Sale</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold">
                    <CheckIcon className="w-7 h-7 text-green-500" />
                    <span>การจัดการสินค้าคงคลังพื้นฐาน</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold">
                    <CheckIcon className="w-7 h-7 text-green-500" />
                    <span>รายงานพื้นฐาน</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold">
                    <CheckIcon className="w-7 h-7 text-green-500" />
                    <span>อัพเดทตลอดอายุการใช้งาน</span>
                  </li>
                  <li className="flex items-center gap-2 font-bold">
                    <CheckIcon className="w-7 h-7 text-green-500" />
                    <span>บริการลูกค้าตลอด 24/7</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
