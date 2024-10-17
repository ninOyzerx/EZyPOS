"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Head from 'next/head';

export default function Component() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    const session = localStorage.getItem('session');
    if (!session) {
      router.push('/session/sign-in');
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [router]);

  const handleDashboardClick = () => {
    router.push('../dashboard'); 
  };


  const handleAddProduct = async (product) => {
    const { value: quantity } = await Swal.fire({
      title: 'กรุณากรอกจำนวนสินค้า',
      input: 'number',
      inputLabel: 'จำนวน',
      inputPlaceholder: 'จำนวนสินค้า',
      inputAttributes: {
        min: 1
      },
      confirmButtonText: 'เพิ่ม',
      cancelButtonText: 'ยกเลิก',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || value < 1) {
          return 'กรุณากรอกจำนวนที่ถูกต้อง';
        }
      }
    });

    if (quantity) {
      setSelectedProducts((prevSelected) => {
        const existingProduct = prevSelected.find(p => p.p_name === product.p_name);
        if (existingProduct) {
          return prevSelected.map(p => 
            p.p_name === product.p_name ? { ...p, quantity: p.quantity + parseInt(quantity, 10) } : p
          );
        } else {
          return [...prevSelected, { ...product, quantity: parseInt(quantity, 10) }];
        }
      });
    }
  };

  const handleRemoveProduct = (productName) => {
    setSelectedProducts((prevSelected) => 
      prevSelected.filter(p => p.p_name !== productName)
    );
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  const calculateTotal = () => {
    const totalQuantity = selectedProducts.reduce((sum, product) => sum + product.quantity, 0);
    const totalPrice = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const vat = totalPrice * 0.07;
    const totalWithVAT = totalPrice + vat;
    return { totalQuantity, totalPrice, vat, totalWithVAT };
  };

  const { totalQuantity, totalPrice, vat, totalWithVAT } = calculateTotal();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการออกจากระบบจริงๆ หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6c757d', // Darker gray color
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ออกจากระบบ!',
      cancelButtonText: 'ยกเลิก',
    });

    if (result.isConfirmed) {
      localStorage.removeItem('session');
      router.push('/session/sign-in');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <Head>
        <title>POS System - Manage Products</title>
      </Head>
      <header className="flex items-center justify-between h-16 px-4 bg-gray-100 border-b shrink-0 md:px-6">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          <button className="btn btn-gray-600 gap-2">
            <PackageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">จัดการสินค้า</span>
          </button>
          <button className="btn btn-gray-500 gap-2">
            <LayoutGridIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">จัดการหมวดหมู่</span>
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          <button className="btn btn-gray-400 gap-2">
            <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">จัดการผู้ใช้งาน</span>
          </button>
          <button className="btn btn-gray-300 gap-2" onClick={handleDashboardClick}>
            <CircleUserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-base">ผู้ดูแล</span>
          </button>
          <button onClick={handleLogout} className="btn btn-gray-700 gap-2">
            <PowerIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </header>
      <main className="flex flex-1 p-4 bg-gray-200 md:p-6">
        <div className="flex flex-col w-full md:w-1/3 p-4 bg-white bg-opacity-50 border rounded-md">
          <div className="flex flex-wrap items-center mb-4 space-x-2">
            <select className="select select-bordered bg-gray-100 text-black flex-1" defaultValue="">
              <option value="" disabled>ลูกค้าภายในร้าน</option>
            </select>
            <button className="btn btn-gray-600 gap-2">
              <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <table className="table w-full mb-4">
            <thead className="bg-gray-300 text-black text-sm md:text-base">
              <tr>
                <th className="font-bold text-black">#</th>
                <th className="font-bold text-black">สินค้า</th>
                <th className="font-bold text-black">จำนวน</th>
                <th className="font-bold text-black">ราคา</th>
                <th className="font-bold text-black">
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </th>
              </tr>
            </thead>
            <tbody className="text-black">
              {selectedProducts.map((product, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{product.p_name}</td>
                  <td>{product.quantity}</td>
                  <td>฿{product.price * product.quantity}</td>
                  <td>
                    <button onClick={() => handleRemoveProduct(product.p_name)} className="btn btn-gray-700 btn-xs">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-auto space-y-2 text-black">
            <div className="flex justify-between">
              <span>สินค้าทั้งหมด(ชิ้น):</span>
              <span>{totalQuantity}</span>
            </div>
            <div className="flex justify-between">
              <span>ส่วนลด:</span>
              <input type="number" className="input input-bordered bg-gray-100 text-black w-20" />
            </div>
            <div className="flex justify-between">
              <span>ราคา:</span>
              <span>฿{totalPrice.toFixed(2)} THB</span>
            </div>
            <div className="flex justify-between">
              <span>ราคารวม (7% VAT):</span>
              <span>฿{totalWithVAT.toFixed(2)} THB</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-between mt-5 space-x-2">
            <button className="btn btn-gray-600 gap-2 w-40 px-3 py-2 text-lg">
              <PrinterIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            <button onClick={handleClearAll} className="btn btn-gray-700 gap-2 w-40 px-3 py-2 text-lg">
              ล้างทั้งหมด
            </button>
            <button className="btn btn-gray-800 gap-2 w-60 px-8 py-2 text-lg">
              ชำระเงิน
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-4 mt md:ml-4 bg-white bg-opacity-50 border rounded-md">
          <input 
            type="text" 
            placeholder="ค้นหาสินค้า..." 
            className="input input-bordered bg-gray-100 text-black mb-4" 
          />
          <div className="btn-group mb-4 flex flex-wrap space-x-2">
            <button className="btn btn-gray-300 mb-2">ทั้งหมด</button>
            <button className="btn btn-gray-300 mb-2">ทั่วไป</button>
            <button className="btn btn-gray-300 mb-2">เครื่องดื่ม</button>
            <button className="btn btn-gray-300 mb-2">เครื่องเขียน</button>
          </div>

          {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
            {products.map((product, index) => (
              <div 
                key={index} 
                className="card bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer" 
                onClick={() => handleAddProduct(product)}
              >
                <figure className="relative w-full h-48 overflow-hidden">
                  <img
                    src={product.img}
                    alt={product.p_name}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body text-black flex flex-col p-4 flex-grow">
                  <h2 className="card-title text-sm sm:text-base font-semibold">{product.p_name}</h2>
                  <p className="text-lg text-gray-700 mt-2">฿{product.price}</p>
                </div>
              </div>
            ))}
          </div> */}
<div className="flex-grow overflow-y-auto max-h-[calc(100vh-200px)]"> {/* Adjust max-h as needed */}
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
      {products.map((product, index) => (
        <div 
          key={index} 
          className="card bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer"
          onClick={() => handleAddProduct(product)}
        >
          <figure className="relative w-full h-48 overflow-hidden">
            <img
              src={product.img}
              alt={product.p_name}
              className="w-full h-full object-cover"
              style={{ aspectRatio: "1 / 1" }}
            />
          </figure>
          <div className="card-body text-black flex flex-col p-4 flex-grow">
            <h2 className="card-title text-sm sm:text-base font-semibold">{product.product_name}</h2>
            <p className="text-lg text-gray-700 mt-2">฿{product.price}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
        </div>
      </main>
    </div>
  );
}






function CircleUserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  )
}


function DollarSignIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}


function FolderOpenIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  )
}


function LayoutGridIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  )
}


function PackageIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}


function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}


function PowerIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v10" />
      <path d="M18.4 6.6a9 9 0 1 1-12.77.04" />
    </svg>
  )
}


function PrinterIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  )
}


function ShoppingCartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}


function TrashIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}


function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}