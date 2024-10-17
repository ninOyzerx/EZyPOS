"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Import the hook to access query parameters

export default function ProductActivation() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token'); // Get JWT token from the URL
  
  const [inputKey, setInputKey] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  const [error, setError] = useState('');


  
  const handleActivation = async () => {
    try {
      const response = await fetch('/api/verify-activation-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, product_activation_key: inputKey }), // ส่ง token และ key ไปตรวจสอบ
      });
      
      const data = await response.json();
      if (data.success) {
        setIsActivated(true);
        setError('');
      } else {
        setError(data.error || 'Invalid activation key.');
        setIsActivated(false);
      }
    } catch (error) {
      console.error('Error verifying activation key:', error);
      setError('Error verifying activation key.');
    }
  };

  if (isActivated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4 animate-fade-in font-thai">
        <div className="card w-full max-w-lg shadow-2xl bg-base-100">
          <div className="card-body text-center">
            <h1 className="text-4xl font-bold text-success animate-bounce">
              ผลิตภัณฑ์ของคุณได้รับการเปิดใช้งานแล้ว!
            </h1>
            <div className="mt-6">
              <button
                className="btn btn-primary btn-wide animate-pop-up text-2xl"
                onClick={() => window.location.href = '/session/sign-in'}
              >
                ไปที่หน้า เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4 animate-fade-in font-thai">
      <div className="card w-full max-w-lg shadow-2xl bg-base-100">
        <div className="card-body text-center">
          <h1 className="text-4xl font-bold text-primary">ใส่รหัสเปิดใช้งานผลิตภัณฑ์</h1>
          <div className="mt-4">
            <input
              type="text"
              className="input input-bordered w-full text-2xl"
              placeholder="กรอกรหัสเปิดใช้งาน"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 mt-2 text-2xl">{error}</p>}
          <div className="mt-6">
            <button
              className="btn btn-success btn-wide animate-pop-up text-2xl"
              onClick={handleActivation}
            >
              เปิดใช้งาน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
