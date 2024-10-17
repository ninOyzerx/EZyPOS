"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Loading from './loading';


export default function Component() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [categories, setCategories] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [discount, setDiscount] = useState(0.00);



  // Theme toggle effect
  useEffect(() => {
    const userPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(userPreference);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const getSessionToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session_token') || '';
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const sessionToken = new URLSearchParams(window.location.search).get('session_token');
      if (!sessionToken) {
        router.push('/session/sign-in');
        return;
      }

      try {
        const response = await fetch(`/api/categories?store_id=${storeId}`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    if (storeId) {
      fetchCategories();
    }
  }, [storeId]);

  // Fetch store ID and validate session
  useEffect(() => {
    const validateSession = async () => {
      const sessionToken = getSessionToken();
      if (!sessionToken) {
        router.push('/session/sign-in');
        return;
      }

      try {
        const response = await fetch('/api/validate-session', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStoreId(data.storeId);
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Session Error',
            text: errorData.message || 'Invalid session token',
          }).then(() => router.push('/session/sign-in'));
        }
      } catch (error) {
        console.error('Error validating session:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `Failed to validate session: ${error.message}`,
        }).then(() => router.push('/session/sign-in'));
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [router]);

  // Fetch products by selected category
  useEffect(() => {
    const fetchProductsByCategory = async (categoryId) => {
      if (!storeId) return; 
      setLoading(true);
      const sessionToken = new URLSearchParams(window.location.search).get('session_token');

      try {
        const response = await fetch(`/api/products?category_id=${categoryId || ''}&store_id=${storeId}`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory === null) {
      // Fetch all products if no category is selected
      fetchProductsByCategory('');
    } else {
      fetchProductsByCategory(selectedCategory);
    }
  }, [selectedCategory, storeId]);

  const filteredProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApplyDiscount = async () => {
    const { value: discountValue } = await Swal.fire({
      title: 'กรุณากรอกส่วนลด',
      input: 'number',
      inputLabel: 'ส่วนลด',
      inputPlaceholder: 'จำนวนเงินที่ลด',
      inputAttributes: {
        min: 0
      },
      confirmButtonText: 'ใช้',
      cancelButtonText: 'ยกเลิก',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || value < 0) {
          return 'กรุณากรอกจำนวนส่วนลดที่ถูกต้อง';
        }
      }
    });
  
    if (discountValue !== undefined) {
      setDiscount(parseFloat(discountValue));
    }
  };
  

  


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
        const existingProduct = prevSelected.find(p => p.product_name === product.product_name);
        if (existingProduct) {
          return prevSelected.map(p => 
            p.product_name === product.product_name ? { ...p, quantity: p.quantity + parseInt(quantity, 10) } : p
          );
        } else {
          return [...prevSelected, { ...product, quantity: parseInt(quantity, 10) }];
        }
      });
    }
  };

  const handleRemoveProduct = (productName) => {
    setSelectedProducts((prevSelected) => 
      prevSelected.filter(p => p.product_name !== productName)
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
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: errorData.message || 'Failed to log out',
        });
        return;
      }

      localStorage.removeItem('session');
      router.push('/session/sign-in');
    } catch (error) {
      console.error('Error logging out:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to log out',
      });
    }
  }
};

const handleDecreaseQuantity = (productName) => {
  setSelectedProducts((prevProducts) =>
    prevProducts.map((product) =>
      product.product_name === productName && product.quantity > 1
        ? { ...product, quantity: product.quantity - 1 }
        : product
    )
  );
};

const handleIncreaseQuantity = (productName) => {
  setSelectedProducts((prevProducts) =>
    prevProducts.map((product) =>
      product.product_name === productName
        ? { ...product, quantity: product.quantity + 1 }
        : product
    )
  );
};

const discount = 0.00; // Set a fixed discount or calculate it based on your logic
const vatRate = 0.07; // 7% VAT
const vatAmount = totalPrice * vatRate; 


  

return (
  <div className={`flex flex-col w-full min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
    <header className={`flex items-center justify-between h-16 px-4 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b'} shrink-0 md:px-6`}>
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
        <button className={`btn ${darkMode ? 'btn-gray-600' : 'btn-gray-500'} gap-2`}>
          <PackageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base">จัดการสินค้า</span>
        </button>
        <button className={`btn ${darkMode ? 'btn-gray-500' : 'btn-gray-400'} gap-2`}>
          <LayoutGridIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base">จัดการหมวดหมู่</span>
        </button>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
        <button className={`btn ${darkMode ? 'btn-gray-400' : 'btn-gray-300'} gap-2`}>
          <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base">จัดการผู้ใช้งาน</span>
        </button>
        <button className={`btn ${darkMode ? 'btn-gray-300' : 'btn-gray-200'} gap-2`} onClick={handleDashboardClick}>
          <CircleUserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="text-sm sm:text-base">ผู้ดูแล</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-4">

        <label className="grid cursor-pointer place-items-center">
  <input
      type="checkbox"
      checked={darkMode}
      onChange={toggleTheme}
    className="toggle theme-controller bg-base-content col-span-2 col-start-1 row-start-1" />
  <svg
    className="stroke-base-100 fill-base-100 col-start-1 row-start-1"
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path
      d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
  <svg
    className="stroke-base-100 fill-base-100 col-start-2 row-start-1"
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
</label>

<div
  onClick={handleLogout}
  className="group cursor-pointer inline-flex items-center justify-center"
>
  <PowerIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-700 transition-transform duration-300 transform group-hover:scale-50 group-hover:rotate-45" />
</div>


        </div>
      </div>
    </header>
    <main className={`flex flex-1 p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} md:p-6`}>
      <div className={`flex flex-col w-full md:w-1/3 p-4 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white bg-opacity-50 text-gray-900'} border rounded-md`}>
        <div className="flex flex-wrap items-center mb-4 space-x-2">
          <select className={`select select-bordered ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-black'} flex-1`} defaultValue="">
            <option value="" disabled>ลูกค้าภายในร้าน</option>
          </select>
          <button className={`btn ${darkMode ? 'btn-gray-600' : 'btn-gray-500'} gap-2`}>
            <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="w-90 bg-white dark:bg-gray-800 p-6">
  <h2 className="text-xl font-bold mb-4 text-black dark:text-white">คำสั่งซื้อปัจจุบัน</h2>
  <div className="h-[calc(100vh-470px)] overflow-y-auto">
  {selectedProducts.map((product, index) => (
      <div key={index} className="flex items-center justify-between mb-4">
        <img src="/placeholder.svg" alt={product.product_name} className="w-16 h-16 object-cover rounded-lg" />
        <div className="flex-1 ml-4">
          <h3 className="font-semibold text-black dark:text-white">{product.product_name}</h3>
          <p className="text-orange-500">฿{(product.price * product.quantity).toFixed(2)}</p>
          </div>
        <div className="flex items-center">
          <button onClick={() => handleDecreaseQuantity(product.product_name)} className="btn btn-outline btn-xs h-6 w-6 dark:bg-gray-700 dark:text-white">-</button>
          <span className="mx-2 dark:text-white">{product.quantity}</span>
          <button onClick={() => handleIncreaseQuantity(product.product_name)} className="btn btn-outline btn-xs h-6 w-6 dark:bg-gray-700 dark:text-white">+</button>
        </div>
      </div>
    ))}
  </div>
  <div className="border-t pt-4 mt-4 dark:border-gray-700">
    <div className="flex justify-between mb-2">
      <span className="text-black dark:text-white">ยอดรวม</span>
      <span className="text-black dark:text-white">฿{totalPrice.toFixed(2)}</span>
    </div>
    <div className="flex justify-between mb-2">
      <span className="text-black dark:text-white">ส่วนลด</span>
      <span className="text-red-500 dark:text-red-400">-฿{discount.toFixed(2)}</span>
    </div>
    <div className="flex justify-between mb-4">
      <span className="text-black dark:text-white">ภาษี (7%)</span>
      <span className="text-black dark:text-white">฿{vatAmount.toFixed(2)}</span>
    </div>
    <div className="flex justify-between font-bold text-lg">
      <span className="text-black dark:text-white">ยอดรวมทั้งหมด</span>
      <span className="text-orange-500">฿{totalWithVAT.toFixed(2)}</span>
    </div>
  </div>
</div>
</div>

      <div className={`flex flex-col flex-1 p-4 mt md:ml-4 ${darkMode ? 'bg-gray-700' : 'bg-white'} bg-opacity-50 border rounded-md`}>
      <input 
  type="text" 
  placeholder="ค้นหาสินค้า..." 
  className={`input input-bordered ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-black'} mb-4`} 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

<div className="btn-group mb-4 flex flex-wrap space-x-2">
<button 
          className={`btn ${darkMode ? 'btn-gray-500' : 'btn-gray-300'} mb-2`}
          onClick={() => setSelectedCategory(null)}
        >
          ทั้งหมด
        </button>
        {categories.map((category) => (
          <button 
            key={category.id} 
            className={`btn ${darkMode ? 'btn-gray-500' : 'btn-gray-300'} mb-2`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-grow overflow-y-auto max-h-[calc(100vh-200px)]">
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
    {loading ? (
      <div className="col-span-full flex justify-center items-center h-32">
        <Loading />
      </div>
    ) : filteredProducts.length > 0 ? (
      <>
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="card bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer"
            onClick={() => handleAddProduct(product)}
            style={{ maxWidth: '270px' }} 
          >
            <figure className="relative w-full h-32 overflow-hidden">
              <img
                src={product.img || 'default-image-url'}
                alt={product.product_name || 'Product Image'}
                className="w-full h-full object-cover"
                style={{ aspectRatio: '1 / 1' }}
              />
            </figure>
            <div className="card-body text-black flex flex-col p-2 flex-grow">
              <h2 className="card-title text-xs sm:text-sm font-semibold">{product.product_name || 'Product Name'}</h2>
              <p className="text-base text-gray-700 mt-1">฿{product.price || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">สินค้าคงเหลือ: {product.stock_quantity || 'N/A'}</p>
            </div>
          </div>
        ))}
        <div 
          className="card bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer items-center justify-center opacity-50 hover:opacity-80"
          style={{ maxWidth: '270px' }}
        >
          <div className="w-full h-32 flex items-center justify-center"> 
            <span className="text-3xl text-gray-500">+</span> 
          </div>
          <div className="card-body text-black flex flex-col p-2 flex-grow items-center"> 
            <p className="text-sm font-semibold">เพิ่มสินค้า</p> 
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="col-span-full flex justify-center items-center h-32">
          <p className="text-lg font-semibold text-black mb-4">ไม่มีสินค้าที่ต้องแสดง</p>
        </div>
        <div 
          className="card bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer items-center justify-center opacity-50 hover:opacity-80"
          style={{ maxWidth: '270px' }}
        >
          <div className="w-full h-32 flex items-center justify-center"> 
            <span className="text-3xl text-gray-500">+</span> 
          </div>
          <div className="card-body text-black flex flex-col p-2 flex-grow items-center"> 
            <p className="text-sm font-semibold">เพิ่มสินค้า</p> 
          </div>
        </div>
      </>
    )}
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