"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import bcrypt from 'bcryptjs';
import Swal from 'sweetalert2';
import jwt from 'jsonwebtoken'; // Add this import for JWT

export default function Success() {
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

  const handleActivation = async () => {
    if (!sessionData) {
      console.error('Session data is not available');
      return;
    }
  
    setLoading(true);
  
    const userData = {
      fname: fname || 'Unknown',
      lname: lname || 'Unknown',
      email,
      username: username || 'Unknown',
      password: password,
      phone: phone || 'Unknown',
    };
  
    console.log('User Data:', userData); // Debugging: Log user data before insertion
  
    // Generate session_token and product_activation_key
    const session_token = `tvo${Math.random().toString(36).substring(2, 15)}`;
    const product_activation_key = `pkey${Math.random().toString(36).substring(2, 15)}`;

    const salt = await bcrypt.genSalt(10);
    const product_activation_hash_key = await bcrypt.hash(product_activation_key, salt);
  
    try {
      // Insert store data into the stores table
      const storeResponse = await fetch('/api/insert-payment-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: `${userData.username}'s Store`, // Example store name
          store_address: 'Unknown address', // You can pass relevant data here
          store_code: 'Test',
          store_img: 'Test',
          store_phone_no: 'Test'
        }),
      });
  
      if (!storeResponse.ok) {
        throw new Error('Error inserting store data');
      }
  
      const { store_id } = await storeResponse.json();
  
      console.log('Inserted Store ID:', store_id);
  
      const dataToInsert = {
        fname: userData.fname,
        lname: userData.lname,
        email: userData.email,
        username: userData.username,
        phone_no: userData.phone,
        password: userData.password,
        product_activation_hash_key,
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
  
        // // สร้าง JWT token โดยเก็บข้อมูล email และตั้งค่าหมดอายุ
        // const token = jwt.sign({ email: userData.email }, process.env.NEXT_PUBLIC_JWT_SECRET_KEY, {
        //   expiresIn: '1h', // ตั้งค่าหมดอายุภายใน 1 ชั่วโมง
        // });

        // แจ้งผู้ใช้ว่ารหัสเปิดใช้งานได้ถูกส่งไปยังอีเมลแล้ว
        Swal.fire({
          icon: 'success',
          title: 'การยืนยันการเปิดใช้งานได้ถูกส่งไปยังอีเมลแล้ว!',
          text: 'โปรดตรวจสอบอีเมลของคุณสำหรับรหัสเปิดใช้งาน',
          confirmButtonText: 'ตกลง'
        })
      } else {
        console.error('Error inserting user data:', userResponse.statusText);
      }
    } catch (error) {
      console.error('Error inserting store or user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <progress className="progress w-56"></progress>
        <p className="mt-4 text-lg">กำลังโหลดข้อมูลการสั่งซื้อ...</p>
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
          <div className="mt-6">
            <button
              className="btn btn-primary btn-wide animate-pop-up text-2xl"
              onClick={handleActivation}
              disabled={loading} // Disable button during loading
            >
              {loading ? 'กำลังประมวลผล...' : 'ส่งอีเมลสำหรับเปิดใช้งานผลิตภัณฑ์'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
