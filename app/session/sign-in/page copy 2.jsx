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
  const [darkMode, setDarkMode] = useState(false); 
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
      window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
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
        localStorage.setItem('session', sessionToken); 
        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ !',
          // text: 'กรุณาออกจาก Session ให้เรียบร้อยหลังจากใช้งานเสร็จสิ้นเพื่อป้องกันการเข้าระบบแอบแฝง หรือ Man-in-the-Middle(MitM)',
          confirmButtonText: 'ตกลง',
        }).then(() => {
        router.push('/pos');
      }); 
      } else {
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถเข้าสู่ระบบได้',
          confirmButtonText: 'ตกลง',
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
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-black' : 'bg-blue-200'}`}>
      <header className="flex justify-between items-center p-4">
        {/* <div className="absolute top-4 left-4 cursor-pointer" onClick={toggleTheme}>
          {darkMode ? <FaSun className="text-yellow-500 text-2xl" /> : <FaMoon className="text-blue-800 text-2xl" />}
        </div> */}
      </header>

      <main className="flex flex-grow justify-center items-center opacity-90">
      <div className={`card w-96 scale-110 transition-all duration-300 ease-in-out shadow-xl ${darkMode ? 'bg-gray-900' : 'bg-blue-500'}`}>
  <div className="card-body">
    <h1 className={`text-3xl font-bold text-center ${darkMode ? 'text-blue-300' : 'text-black'} mb-6`}>
      POS & Inventory Management System
    </h1>
    {/* <h2 className={`card-title text-center mb-4 ${darkMode ? 'text-blue-400' : 'text-black'}`}>
      เข้าสู่ระบบเพื่อเริ่ม Session ของคุณ
    </h2> */}
    <form onSubmit={handleSubmit}>
      <div className="form-control relative mb-4">
        <input
          type="text"
          placeholder=" "
          className={`peer input input-bordered w-full px-4 py-3 rounded-md border-2 transition-all duration-200 ease-in-out 
                      ${darkMode ? 'bg-gray-800 text-blue-200 border-gray-600 focus:border-blue-500' : 'bg-blue-100 text-black border-gray-300 focus:border-blue-500'}`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label
          className={`absolute left-4 top-0 transform -translate-y-1/2 transition-all duration-200 ease-in-out pointer-events-none z-10 px-1
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:-translate-y-1/2 
                      peer-focus:top-[-16px] peer-focus:text-xs peer-focus:translate-y-0 peer-focus:text-black 
                      peer-valid:top-[-16px] peer-valid:text-xs peer-valid:translate-y-0 peer-valid:text-black
                      ${darkMode ? 'text-blue-400' : 'text-gray-500'}`}
        >
          Username or Email
        </label>
      </div>

      <div className="form-control relative mb-4 mt-6">
        <input
          type="password"
          placeholder=" "
          className={`peer input input-bordered w-full px-4 py-3 rounded-md border-2 transition-all duration-200 ease-in-out 
                      ${darkMode ? 'bg-gray-800 text-blue-200 border-gray-600 focus:border-blue-500' : 'bg-blue-100 text-black border-gray-300 focus:border-blue-500'}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label
          className={`absolute left-4 top-0 transform -translate-y-1/2 transition-all duration-200 ease-in-out pointer-events-none z-10 px-1
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:-translate-y-1/2 
                      peer-focus:top-[-16px] peer-focus:text-xs peer-focus:translate-y-0 peer-focus:text-black 
                      peer-valid:top-[-16px] peer-valid:text-xs peer-valid:translate-y-0 peer-valid:text-black
                      ${darkMode ? 'text-blue-400' : 'text-gray-500'}`}
        >
          Password
        </label>
      </div>

      <div className="form-control mt-6">
  <button
    className={`btn w-full py-2 ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-400 text-white'} transition-all duration-200 ease-in-out`}
    type="submit"
    disabled={loading}
  >
    {loading ? 'ยืนยันการเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
  </button>
</div>

    </form>
    <p className="mt-4 text-center">
      <a
        href="/get-pos"
        className={`link ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-white hover:text-blue-300'}`}
      >
        รับการใช้งานระบบ
      </a>
    </p>
  </div>
</div>

      </main>

      {/* <Note /> */}

      <footer className="footer footer-center bg-base-300 text-base-content p-4 mt-auto">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - All right reserved by Supernatural Co. Ltd</p>
        </aside>
      </footer>
    </div>
  );
};

export default Login;
