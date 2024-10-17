"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

export default function Success() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const fname = searchParams.get('fname');
  const lname = searchParams.get('lname');
  const email = searchParams.get('email');
  const username = searchParams.get('username');
  const password = searchParams.get('password');
  const phone = searchParams.get('phone');
  
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);
  const [expired, setExpired] = useState(false); // State for expiration

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/get-checkout-session?session_id=${sessionId}`);
        const data = await response.json();
        setSessionData(data);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    // Replace the current URL to prevent the user from using the back button
    window.history.replaceState(null, '', window.location.pathname);

    // Set a 10-second expiration timer
    const expirationTimer = setTimeout(() => {
      setExpired(true);
      Swal.fire({
        icon: 'error',
        title: 'ลิงก์หมดอายุแล้ว',
        text: 'คุณไม่สามารถกลับไปยังหน้านี้ได้อีก',
        confirmButtonText: 'ตกลง',
        customClass: {
          title: 'font-thai',
          htmlContainer: 'font-thai',  // ใช้สำหรับข้อความ
          confirmButton: 'font-thai'
        },
        willOpen: () => {
          // ปรับขนาดฟอนต์และสไตล์ต่างๆ ในที่นี้โดยใช้ inline style
          document.querySelector('.swal2-title').style.fontSize = '35px'; // ขนาดฟอนต์ของ title
          document.querySelector('.swal2-html-container').style.fontSize = '25px'; // ขนาดฟอนต์ของข้อความ
          const confirmButton = document.querySelector('.swal2-confirm');
          confirmButton.style.fontSize = '24px'; // ขนาดฟอนต์ของปุ่ม
          confirmButton.style.padding = '6px 24px'; // ปรับขนาด padding ของปุ่ม
          confirmButton.style.backgroundColor = '#3085d6'; // เปลี่ยนสีพื้นหลังปุ่ม (ถ้าต้องการ)
          confirmButton.style.color = '#fff'; // เปลี่ยนสีข้อความในปุ่ม
        }
      }).then(() => {
        router.push('/session/sign-in');
      });
    }, 20000); // 20 seconds

    return () => clearTimeout(expirationTimer); // Clear timer if the component unmounts
  }, [router]);

  useEffect(() => {
    if (sessionData && !activated && !loading && !expired) {
      handleActivation();
    }
  }, [sessionData, activated, loading, expired]);

  const handleActivation = async () => {
    if (!sessionData || activated || expired) return; // Prevent activation if expired

    setLoading(true);

    const userData = {
      fname: fname || 'Unknown',
      lname: lname || 'Unknown',
      email,
      username: username || 'Unknown',
      password: password,
      phone: phone || 'Unknown',
    };

    // Generate session_token and product_activation_key
    const session_token = `tvo${Math.random().toString(36).substring(2, 15)}`;
    const product_activation_key = `pkey${Math.random().toString(36).substring(2, 15)}`;

    try {
      // Insert store data into the stores table
      const storeResponse = await fetch('/api/insert-payment-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: `${userData.username}'s Store`,
          store_address: 'Unknown address',
          store_code: '',
          store_img: '',
          store_phone_no: ''
        }),
      });

      if (!storeResponse.ok) {
        throw new Error('Error inserting store data');
      }

      const { store_id } = await storeResponse.json();

      const dataToInsert = {
        fname: userData.fname,
        lname: userData.lname,
        email: userData.email,
        username: userData.username,
        phone_no: userData.phone,
        password: userData.password,
        product_activation_key,
        session_token,
        store_id,
      };

      // Insert user data into the database
      const userResponse = await fetch('/api/insert-payment-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToInsert),
      });

      if (userResponse.ok) {
        console.log('User data successfully inserted.');
        setActivated(true);

        Swal.fire({
          icon: 'success',
          title: 'การยืนยันการเปิดใช้งานได้ถูกส่งไปยังอีเมลแล้ว!',
          text: 'โปรดตรวจสอบอีเมลของคุณสำหรับรหัสเปิดใช้งาน',
          confirmButtonText: 'ตกลง',
          customClass: {
            title: 'font-thai',
            htmlContainer: 'font-thai',  // ใช้สำหรับข้อความ
            confirmButton: 'font-thai'
          },
          willOpen: () => {
            // ปรับขนาดฟอนต์และสไตล์ต่างๆ ในที่นี้โดยใช้ inline style
            document.querySelector('.swal2-title').style.fontSize = '35px'; // ขนาดฟอนต์ของ title
            document.querySelector('.swal2-html-container').style.fontSize = '25px'; // ขนาดฟอนต์ของข้อความ
            const confirmButton = document.querySelector('.swal2-confirm');
            confirmButton.style.fontSize = '24px'; // ขนาดฟอนต์ของปุ่ม
            confirmButton.style.padding = '6px 24px'; // ปรับขนาด padding ของปุ่ม
            confirmButton.style.backgroundColor = '#3085d6'; // เปลี่ยนสีพื้นหลังปุ่ม (ถ้าต้องการ)
            confirmButton.style.color = '#fff'; // เปลี่ยนสีข้อความในปุ่ม
          }
        }).then(() => {
          router.push('/session/sign-in');
        });
      } else {
        console.error('Error inserting user data:', userResponse.statusText);
      }
    } catch (error) {
      console.error('Error inserting store or user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (expired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-200">
        <div className="card w-full max-w-lg shadow-2xl bg-base-100">
          <div className="card-body text-center">
            <h1 className="text-4xl font-bold text-red-600">ลิงก์หมดอายุแล้ว</h1>
            <p className="text-xl mt-4">คุณไม่สามารถกลับไปหน้านี้ได้อีก</p>
            <button
              className="btn btn-primary mt-6"
              onClick={() => router.push('/session/sign-in')}
            >
              กลับไปยังหน้าเข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen font-thai">
        <progress className="progress w-56"></progress>
        <p className="mt-4 text-3xl">กำลังโหลดข้อมูลการสั่งซื้อ...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4 animate-fade-in font-thai">
      <div className="card w-full max-w-lg shadow-2xl bg-base-100">
        <div className="card-body text-center">
          <h1 className="text-6xl font-bold text-success animate-bounce">การชำระเงินสำเร็จ!</h1>
          <div className="divider"></div>
          <div className="animate-slide-in">
            <p className="text-3xl font-semibold">รายละเอียดการสั่งซื้อ</p>
            <p className="text-3xl mt-2">
              ยอดรวม <span className="text-primary font-bold text-3xl">{(sessionData.amount_total / 100).toLocaleString()} บาท</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
