"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Cancel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const clearSession = async () => {
      if (sessionId) {
        try {
          const response = await fetch('/api/clear-payment-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });
          
          const result = await response.json();
          
          if (result.success) {
            console.log('Session cleared successfully.');
          } else {
            console.error('Failed to clear session:', result.error);
          }
        } catch (error) {
          console.error('Error clearing payment session:', error);
        }
      }
    };

    clearSession();
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">การชำระเงินถูกยกเลิก</h1>
      <p className="text-lg mt-4">การชำระเงินของคุณถูกยกเลิก กรุณาลองใหม่อีกครั้ง.</p>
      <button 
        className="btn btn-primary mt-6"
        onClick={() => router.push('/')}
      >
        กลับไปหน้าแรก
      </button>
    </div>
  );
}
