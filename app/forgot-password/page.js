"use client";
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import PhoneInput from 'react-phone-input-2';
import '../../node_modules/react-phone-input-2/lib/style.css';

export default function ForgotPassword() {
  const [phoneNumber, setPhoneNumber] = useState('66'); // Store the number without the '+' sign
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: `+${phoneNumber}` }), // Prefix '+' before sending
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'OTP Sent!',
          text: data.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed!',
          text: data.error || 'Something went wrong!',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="card w-96 shadow-xl bg-white">
        <div className="card-body">
          <h1 className="text-3xl font-bold text-center mb-6 text-black">Forgot Password</h1>
          <form onSubmit={handleSendOtp}>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text text-black">เบอร์โทรศัพท์มือถือ</span>
              </label>
              <PhoneInput
                country={'th'}
                onlyCountries={['th']}
                value={phoneNumber}
                onChange={(phone) => {
                  if (!phone.startsWith('66')) {
                    phone = '66';
                  }
                  setPhoneNumber(phone);
                }}
                inputClass="input input-bordered w-full"
                containerClass="w-full"
                inputStyle={{
                  width: '100%',
                  borderRadius: '0.375rem',
                  borderColor: '#d1d5db',
                  color: 'black', // Set text color to black
                }}
                placeholder="ใส่เบอร์มือถือ"
              />
            </div>
            <div className="form-control mt-6">
              <button
                className="btn btn-primary w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
