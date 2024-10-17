"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function PosPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('Walk in customer');

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (!session) {
      router.push('/');
    }
  }, [router]);

  const handleAdministratorClick = () => {
    router.push('/dashboard');
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการออกจากระบบจริงๆ หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ออกจากระบบ!',
      cancelButtonText: 'ยกเลิก',
    });
    
    if (result.isConfirmed) {
      localStorage.removeItem('session');
      router.push('/sign-in');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="navbar bg-indigo-600 text-white shadow-lg">
        <div className="navbar-start">
          <button className="btn btn-ghost text-white hover:bg-indigo-700">Products</button>
          <button className="btn btn-ghost text-white hover:bg-indigo-700">Categories</button>
          <button className="btn btn-ghost text-white hover:bg-indigo-700">Open Tabs</button>
          <button className="btn btn-ghost text-white hover:bg-indigo-700">Customer Orders</button>
        </div>
        <div className="navbar-end">
          <button className="btn btn-ghost text-white hover:bg-indigo-700">Transactions</button>
          <button className="btn btn-ghost text-white hover:bg-indigo-700">Users</button>
          <button
            onClick={handleAdministratorClick}
            className="btn btn-ghost text-white hover:bg-indigo-700"
          >
            Administrator
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-error ml-4"
          >
            จบการทำงาน
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex">
        {/* Left side - Cart details */}
        <div className="w-1/3 p-4 bg-white shadow-lg">
          <div className="mb-4">
            <select
              className="select select-bordered w-full text-indigo-600"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option>Walk in customer</option>
              {/* Add more customers here */}
            </select>
          </div>
          <input
            type="text"
            placeholder="Scan barcode or type the number then hit enter"
            className="input input-bordered w-full mb-4"
          />
          <table className="table w-full">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th>#</th>
                <th>สินค้า</th>
                <th>จำนวนสินค้า</th>
                <th>ราคา</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{item.price}</td>
                  <td>
                    <button className="btn btn-error btn-xs">X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <div className="flex justify-between text-indigo-600">
              <span>Total Item(s): {items.length}</span>
              <span>Price: R0.00</span>
            </div>
            <div className="flex justify-between mt-2 text-indigo-600">
              <span>Discount:</span>
              <input
                type="number"
                className="input input-bordered w-20"
                placeholder="0"
              />
            </div>
            <div className="flex justify-between mt-2 text-indigo-600">
              <span>Gross Price (inc 15% Tax):</span>
              <span>R0.00</span>
            </div>
            <div className="flex justify-end mt-4">
              <button className="btn btn-error mr-2">Cancel</button>
              <button className="btn btn-warning mr-2">Hold</button>
              <button className="btn btn-success">Pay</button>
            </div>
          </div>
        </div>

        {/* Right side - Product list */}
        <div className="w-2/3 p-4">
          <input
            type="text"
            placeholder="Search product by name or sku"
            className="input input-bordered w-full mb-4"
          />
          <div className="grid grid-cols-4 gap-4">
            {/* Replace with dynamic product list */}
            <div className="card bg-white shadow-lg border border-gray-200">
              <div className="card-body">
                <h2 className="card-title text-indigo-600">500ml Still Water</h2>
                <p className="text-gray-600">Stock: 8</p>
                <p className="text-green-600">R10.00</p>
              </div>
            </div>
            <div className="card bg-white shadow-lg border border-gray-200">
              <div className="card-body">
                <h2 className="card-title text-indigo-600">500ml Sprite</h2>
                <p className="text-gray-600">Stock: 14</p>
                <p className="text-green-600">R11.00</p>
              </div>
            </div>
            {/* Add more products as needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
