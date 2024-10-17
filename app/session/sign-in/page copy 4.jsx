"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FaSun, FaMoon, FaUser, FaLock, FaUserCheck } from 'react-icons/fa';
import { FaArrowRightToBracket } from 'react-icons/fa6';
import { SlLogin } from "react-icons/sl";
import { TiUserDelete } from "react-icons/ti";
import { MdExpandMore, MdExpandLess, MdClose } from "react-icons/md";

import './styles.css';
import '../../globals.css';

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [lastLogin, setLastLogin] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLastLogin, setShowLastLogin] = useState(true); // New state for lastLogin toggle
  const [showCookieBanner, setShowCookieBanner] = useState(false); // Cookie banner state

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const cookieConsent = localStorage.getItem('cookieConsent');
    const savedShowLastLogin = localStorage.getItem('showLastLogin'); // Get saved lastLogin state

    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    if (savedShowLastLogin !== null) {
      setShowLastLogin(JSON.parse(savedShowLastLogin)); // Set saved lastLogin state
    }

    const lastLoggedInUser = localStorage.getItem('lastLogin');
    const savedPassword = localStorage.getItem('password');
    if (lastLoggedInUser && savedPassword) {
      setLastLogin(lastLoggedInUser);
    }

    if (!cookieConsent) {
      setShowCookieBanner(true);
    }
  }, []);

  const handleCookieConsent = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowCookieBanner(false);
  };

  // Save showLastLogin state to localStorage when it's changed
  const handleToggleLastLogin = () => {
    const newValue = !showLastLogin;
    setShowLastLogin(newValue);
    localStorage.setItem('showLastLogin', JSON.stringify(newValue)); // Save new state to localStorage
  };

  useEffect(() => {
    if (autoLogin && username && password) {
      handleSubmit(new Event('submit'));
      setAutoLogin(false);
    }
  }, [username, password, autoLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // แสดง loading
  
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
        const storeId = data.storeId;  // รับค่า storeId จาก API
  
        // เก็บ sessionToken และ storeId ลงใน localStorage
        localStorage.setItem('session', sessionToken);
        localStorage.setItem('storeId', storeId);  // เก็บ storeId
  
        localStorage.setItem('lastLogin', username);
        localStorage.setItem('password', password);
  
        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ!',
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
          router.push('/pos'); // เปลี่ยนเส้นทางไปยังหน้า pos
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'ไม่สามารถเข้าสู่ระบบได้',
          confirmButtonText: 'ตกลง',
          text: data.error || 'Something went wrong!',
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
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred. Please try again.',
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
      });
    } finally {
      setLoading(false); // ซ่อน loading
    }
  };
  

  const handleLastLoginClick = () => {
    const savedPassword = localStorage.getItem('password');
    if (savedPassword) {
      setUsername(lastLogin);
      setPassword(savedPassword);
      setAutoLogin(true);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่พบรหัสผ่าน',
        text: 'กรุณากรอกรหัสผ่านด้วยตนเอง',
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
      });
    }
  };

  const handleDeleteLastLogin = () => {
    localStorage.removeItem('lastLogin');
    localStorage.removeItem('password');
    setLastLogin('');
    Swal.fire({
      icon: 'info',
      title: 'ข้อมูลการล็อกอินถูกลบแล้ว',
      confirmButtonText: 'ตกลง',
    });
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-black' : 'bg-blue-200'}`}>
      <header className="flex justify-between items-center p-4">
        <div className="cursor-pointer" onClick={toggleTheme}>
          <div className={`transition-transform duration-500 ${darkMode ? 'rotate-180' : 'rotate-0'}`}>
            {darkMode ? (
              <FaSun className="text-yellow-500 text-2xl transition-colors duration-500 animate-pulse-slow" />
            ) : (
              <FaMoon className="text-blue-800 text-2xl transition-colors duration-500 animate-pulse-slow" />
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-grow justify-center items-center opacity-90 relative font-thai">
        {/* Toggle for showing last login */}
        <div className="absolute top-4 right-4">
  <label className="inline-flex items-center cursor-pointer">
    <input 
      type="checkbox" 
      className="sr-only" 
      checked={showLastLogin} 
      onChange={handleToggleLastLogin} 
    />
    <div 
      className={`w-12 h-6 rounded-full shadow-inner relative transition-colors duration-300 ${
        showLastLogin 
          ? darkMode 
            ? 'bg-green-400'  // สีเขียวสว่างใน dark mode
            : 'bg-green-500'  // สีเขียวใน light mode
          : darkMode 
            ? 'bg-gray-600'   // สีเทาใน dark mode
            : 'bg-gray-300'   // สีเทาใน light mode
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          showLastLogin ? 'translate-x-6' : 'translate-x-0'
        }`}
      ></div>
    </div>
    <span className={`ml-2 text-2xl transition-colors ${
      darkMode ? 'text-gray-300' : 'text-gray-600'
    }`}>
      เข้าสู่ระบบอย่างรวดเร็ว
    </span>
  </label>
</div>



        <button
          className={`absolute top-[-45px] right-4 p-3 rounded-full focus:outline-none ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <MdExpandLess className="text-xl" /> : <MdExpandMore className="text-xl" />}
        </button>

        {/* Cookie Banner */}
        {showCookieBanner && (
  <div className="fixed bottom-14 right-2 z-50">
    <div className="relative bg-white shadow-lg border border-gray-300 rounded-lg p-4 max-w-sm">
      {/* ปุ่มปิด (X) */}
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={() => setShowCookieBanner(false)}  // ฟังก์ชันปิดแบนเนอร์
      >
        < MdClose />
      </button>

      <div className="flex items-center">
        <img
          src="https://media0.giphy.com/media/L3u3WyrmJXR5QtiDhL/giphy.gif?cid=6c09b9527sbdexgkaw0alb46rkp4w8vhq21s3fy93ksldh7q&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=s"
          alt="Cookie"
          className="w-20 h-20 mr-3"
        />
        <div>
          <h3 className="font-bold text-gray-700 text-2xl">Cookie Policy</h3>
          <p className="text-xl font-semibold text-gray-600 mt-4">
            เว็บไซต์นี้ใช้คุกกี้เพื่อพัฒนาประสบการณ์การใช้งานของคุณ โปรดยอมรับคุกกี้เพื่อดำเนินการต่อ.{' '}
            <button
              onClick={() => window.open('https://cookieinformation.com/th/what-is-a-cookie-policy/', '_blank')}
              className="text-blue-500 underline hover:text-blue-700"
            >
              อ่านเพิ่มเติม
            </button>
          </p>

        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          className="bg-blue-500 text-xl text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none"
          onClick={handleCookieConsent}
        >
          ยอมรับ
        </button>
      </div>
    </div>
  </div>
)}





        {/* Sliding content from right */}
        <div className={`card w-full max-w-sm transition-transform duration-700 ease-in-out shadow-xl ${darkMode ? 'bg-gray-900' : 'bg-blue-500'} ${isExpanded ? 'transform translate-x-[-7px] scale-95' : ''}`}>
          {/* ส่วนของฟอร์มเข้าสู่ระบบ */}
          <div className="card-body">
            <h1 className={`typewriter-animation text-3xl font-bold text-center ${darkMode ? 'text-blue-300' : 'text-black'} mb-6`}></h1>
            <form onSubmit={handleSubmit}>
              <div className="form-control relative mb-4 text-xl">
                <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-blue-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder=" "
                  className={`text-2xl peer input input-bordered w-full pl-10 py-3 rounded-md border-2 transition-all duration-200 ease-in-out 
                    ${darkMode ? 'bg-gray-800 text-blue-200 border-gray-600 focus:border-blue-500' : 'bg-blue-100 text-black border-gray-300 focus:border-blue-500'}`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <label
                  className={`absolute left-10 top-[-12px] transform -translate-y-1/2 transition-all duration-200 ease-in-out pointer-events-none z-10 px-1
                    peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:-translate-y-1/2 
                    peer-focus:top-[-26px] peer-focus:text-xl peer-focus:translate-y-0 
                    ${username ? 'top-[-12px] text-xl' : ''} 
                    ${darkMode ? 'text-blue-400 peer-focus:text-blue-400 font-bold' : 'text-black peer-focus:text-black font-bold'}`}
                >
                  ชื่อผู้ใช้งาน หรือ อีเมล
                </label>
              </div>

              <div className="form-control relative mb-4 mt-6 text-xl">
                <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-blue-400' : 'text-gray-500'}`} />
                <input
                  type="password"
                  placeholder=" "
                  className={`text-2xl peer input input-bordered w-full pl-10 py-3 rounded-md border-2 transition-all duration-200 ease-in-out 
                    ${darkMode ? 'bg-gray-800 text-blue-200 border-gray-600 focus:border-blue-500' : 'bg-blue-100 text-black border-gray-300 focus:border-blue-500'}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label
                  className={`absolute left-10 top-[-12px] transform -translate-y-1/2 transition-all duration-200 ease-in-out pointer-events-none z-10 px-1
                    peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:-translate-y-1/2 
                    peer-focus:top-[-26px] peer-focus:text-xl peer-focus:translate-y-0 
                    ${password ? 'top-[-12px] text-xl' : ''} 
                    ${darkMode ? 'text-blue-400 peer-focus:text-blue-400 font-bold' : 'text-black peer-focus:text-black font-bold'}`}
                >
                  รหัสผ่าน
                </label>
              </div>

              <div className="form-control mt-4 ">
                <button
                  className={`text-2xl btn w-full py-2 flex items-center justify-center gap-2 ${
                    darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-400 text-white'
                  } transition-all duration-200 ease-in-out`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'ยืนยันการเข้าสู่ระบบ...' : <>
                    <SlLogin className="text-xl" /> เข้าสู่ระบบ
                  </>}
                </button>
              </div>

              {showLastLogin && lastLogin && (
                <>
                  <h3 className='mt-4 text-2xl font-semibold text-white-600 '>
                    Quick Login
                  </h3>

                  <div className="flex items-center justify-between mt-2">
                    <div
                      className={`last-login-container flex items-center justify-between w-full max-w-[500px] p-3 rounded-md shadow-md transition-transform transform hover:scale-105 cursor-pointer ${
                        darkMode ? 'bg-gray-800 border-blue-500' : 'bg-blue-100 border-blue-300'
                      }`}
                      onClick={handleLastLoginClick}
                    >
                      <div className="flex items-center space-x-2">
                        <FaUserCheck className={`text-xl ${darkMode ? 'text-blue-500' : 'text-blue-700'}`} />
                        <span className={`text-xl font-medium ${darkMode ? 'text-blue-500' : 'text-blue-800'}`}>
                          <strong>{lastLogin}</strong>
                        </span>
                      </div>

                      <FaArrowRightToBracket className={`text-sm arrow-icon transition-transform duration-300 ${darkMode ? 'text-blue-500' : 'text-blue-700'}`} />
                    </div>

                    <div className="ml-4 relative flex items-center space-x-2 group">
                      <TiUserDelete
                        onClick={handleDeleteLastLogin}
                        className="text-2xl cursor-pointer text-red-500 hover:text-red-700"
                      />
                      <span className="absolute bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xl rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        ลบข้อมูลการล็อกอิน
                      </span>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Expanded card with information sliding from right */}
        {isExpanded && (
          <div
            className={`absolute right-0 top-0 h-full p-4 transform transition-transform duration-700 ease-in-out ${
              isExpanded ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            } ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-200 text-black'} w-[250px]`} 
          >
            {/* ข้อมูลเพิ่มเติม */}
            <h2 className="text-3xl font-bold text-center mb-4">
              งานนี้เป็นส่วนหนึ่งของโปรเจค HCI และ Workshop II
            </h2>
            <h3 className="text-2xl font-semibold text-center mb-2">
              รายชื่อผู้จัดทำ
            </h3>
            <p className="text-xl leading-relaxed">
              <strong>6430251179</strong> นายภูมินทร์ สุขสุวรรณ <br />
              <strong>6430251012</strong> นายกรวิทย์ ผิวฟัก <br />
              <strong>6430251161</strong> นายพัชรพล นิลทสุข <br />
              <strong>6430251217</strong> นายรัชชานนท์ วันทอง <br />
              <strong>6430251047</strong> นายชยุตม์ แซ่อั๊ง
            </p>
          </div>
        )}
      </main>

      <footer className="font-thai footer footer-center bg-base-300 text-2xl p-4 mt-auto">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - This project is part of the final year project for the course HCI and Workshop II.</p>
        </aside>
      </footer>
    </div>
  );
};

export default Login;
