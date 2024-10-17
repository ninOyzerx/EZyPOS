"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FaSun, FaMoon } from 'react-icons/fa';
import AlertBanner from '../../components/alert-banner';
import Note from '../../components/note'; 

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true); 
  const [showAlert, setShowAlert] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  useEffect(() => {
    const userPreference =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(userPreference);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const sessionToken = data.sessionToken;
        const storeId = data.storeId;
  
        localStorage.setItem('session', sessionToken);
  
        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ !',
          text: 'กรุณาออกจาก Session ให้เรียบร้อยหลังจากใช้งานเสร็จสิ้นเพื่อป้องกันการเข้าระบบแอบแฝง หรือ Man-in-the-Middle(MitM)',
          confirmButtonText: 'ยอมรับ',
        }).then(() => {
          router.push(`/pos?session_token=${encodeURIComponent(sessionToken)}`);
        });

        setShowAlert(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถเข้าสู่ระบบได้',
          text: data.error || 'Something went wrong!',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <header className="flex justify-between items-center p-4">
        <div className="absolute top-4 left-4 cursor-pointer" onClick={toggleTheme}>
          {darkMode ? <FaSun className="text-yellow-500 text-2xl" /> : <FaMoon className="text-gray-800 text-2xl" />}
        </div>
      </header>

      <main className="flex flex-grow justify-center items-center">
        <div className={`card w-96 shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="card-body">
            <h1 className={`text-3xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              POS & Inventory Management System
            </h1>
            <h2 className={`card-title text-center mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              เข้าสู่ระบบเพื่อเริ่ม Session ของคุณ
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className={`label-text ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    ชื่อผู้ใช้งาน หรือ อีเมล
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Username or Email"
                  className={`input input-bordered ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-black'}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className={`label-text ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    รหัสผ่าน
                  </span>
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className={`input input-bordered ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-black'}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-control mt-6">
                <button
                  className={`btn ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-200 text-black'}`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'ยืนยันการเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
              </div>
            </form>
            <p className="mt-4 text-center">
              <a
                href="/forgot-password"
                className={`link ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
              >
                ลืมรหัสผ่าน ?
              </a>
            </p>
            <p className="mt-4 text-center">
              <a
                href="/pricing"
                className={`link ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
              >
                รับการใช้งานระบบ
              </a>
            </p>
          </div>
        </div>
      </main>

      {showAlert && (
        <AlertBanner 
          message="กรุณาออกจาก Session ให้เรียบร้อยหลังจากใช้งานเสร็จสิ้นเพื่อป้องกันการเข้าระบบแอบแฝง หรือ Man-in-the-Middle(MitM)"
          onClose={() => setShowAlert(false)}
        />
      )}

      <Note /> {/* แสดงโน้ต */}

      <footer className="footer footer-center bg-base-300 text-base-content p-4 mt-auto">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - All right reserved by Supernatural Co. Ltd</p>
        </aside>
      </footer>
    </div>
  );
};

export default Login;
