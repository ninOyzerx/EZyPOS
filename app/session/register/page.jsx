"use client";
import { useState, useEffect } from 'react';
import { createHash } from 'crypto'; 

export default function Register() {
  const [storeName, setStoreName] = useState('');
  const [storeCode, setStoreCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const generateStoreCode = (name) => {
    const date = new Date();
    const yyyymmdd = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const hash = createHash('sha256').update(name).digest('hex').substring(0, 5).toUpperCase();
    return `STC${yyyymmdd}${hash}`;
  };

  useEffect(() => {
    if (storeName) {
      const code = generateStoreCode(storeName);
      setStoreCode(code);
    }
  }, [storeName]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ store_name: storeName, store_code: storeCode, username, password, email }),
    });

    if (response.ok) {
      alert('Registration successful');
    } else {
      alert('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Store Name:</label>
            <input 
              type="text" 
              value={storeName} 
              onChange={(e) => setStoreName(e.target.value)} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Store Code (auto-generated):</label>
            <input 
              type="text" 
              value={storeCode} 
              readOnly 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username:</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
            />
          </div>
          <button 
            type="submit" 
            className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
