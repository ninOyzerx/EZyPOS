"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { FaSun, FaMoon, FaUser, FaLock } from 'react-icons/fa';
import './styles.css'; // Assuming this is where your CSS animation will be

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false); 

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

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
        <div className="cursor-pointer" onClick={toggleTheme}>
          {darkMode ? <FaSun className="text-yellow-500 text-2xl" /> : <FaMoon className="text-blue-800 text-2xl" />}
        </div>
      </header>

      <main className="flex flex-grow justify-center items-center opacity-90">
        <div className="flex w-full max-w-7xl"> {/* Wrapping both the form and ad inside a flex container */}
          {/* Login Card */}
          <div className={`card w-1/2 transition-all duration-1000 ease-in-out shadow-xl ${darkMode ? 'bg-gray-900' : 'bg-blue-500'} slide-in-left`}>
  <div className="card-body">
    <h1 className={`typewriter-animation text-3xl font-bold text-center ${darkMode ? 'text-blue-300' : 'text-black'} mb-6`}></h1>
    <form onSubmit={handleSubmit}>
      <div className="form-control relative mb-4">
        <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-blue-400' : 'text-gray-500'}`} />
        <input
          type="text"
          placeholder=" "
          className={`peer input input-bordered w-full pl-10 py-3 rounded-md border-2 transition-all duration-200 ease-in-out 
            ${darkMode ? 'bg-gray-800 text-blue-200 border-gray-600 focus:border-blue-500' : 'bg-blue-100 text-black border-gray-300 focus:border-blue-500'}`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label
          className={`absolute left-10 top-0 transform -translate-y-1/2 transition-all duration-200 ease-in-out pointer-events-none z-10 px-1
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:-translate-y-1/2 
            peer-focus:top-[-17px] peer-focus:text-xs peer-focus:translate-y-0 
            ${username ? 'top-[-9px] text-xs' : ''} 
            ${darkMode ? 'text-blue-400' : 'text-gray-500'}`}
        >
          ชื่อผู้ใช้งาน หรือ อีเมล
        </label>
      </div>

      <div className="form-control relative mb-4 mt-6">
        <FaLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-blue-400' : 'text-gray-500'}`} />
        <input
          type="password"
          placeholder=" "
          className={`peer input input-bordered w-full pl-10 py-3 rounded-md border-2 transition-all duration-200 ease-in-out 
            ${darkMode ? 'bg-gray-800 text-blue-200 border-gray-600 focus:border-blue-500' : 'bg-blue-100 text-black border-gray-300 focus:border-blue-500'}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label
          className={`absolute left-10 top-0 transform -translate-y-1/2 transition-all duration-200 ease-in-out pointer-events-none z-10 px-1
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:-translate-y-1/2 
            peer-focus:top-[-16px] peer-focus:text-xs peer-focus:translate-y-0 
            ${password ? 'top-[-8px] text-xs' : ''} 
            ${darkMode ? 'text-blue-400' : 'text-gray-500'}`}
        >
          รหัสผ่าน
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


          {/* Advertisement Section */}
          <div className="w-full ml-10 flex items-center justify-center">
  <img 
    src="https://files.oaiusercontent.com/file-BYQba3MKNntYAzknY0w8mOXB?se=2024-09-28T06%3A45%3A03Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D07c99d04-08e3-4c95-ac00-ddb66a600cb2.webp&sig=cPJZs31fVNVe9s9rcRxuNJnPgOqaDdORjcUF2tM9IvA%3D" 
    alt="Advertisement" 
    className="max-w-md w-full h-auto" 
  />
</div>

        </div>
      </main>

      <footer className="footer footer-center bg-base-300 text-base-content p-4 mt-auto">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - All right reserved by Supernatural Co. Ltd</p>
        </aside>
      </footer>
    </div>
  );
};

export default Login;
