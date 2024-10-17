"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Loading from './loading';
import PaymentModal from '../components/keypad/paymentModal';
import QuantityModal from  '../components/keypad/quantityModal';
import ChangeQuantityModal from  '../components/keypad/changeQuantityModal';
import {TicketPercent} from 'lucide-react';



export default function Component() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [categories, setCategories] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [discount, setDiscount] = useState(0.00);
  const [fullScreen, setFullScreen] = useState(false);
  const [amount, setAmount] = useState('0');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false); 
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [storeName, setStoreName] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [modalOpen, setModalOpen] = useState(false); 

  const [totalDiscountItemPrice, setTotalDiscountItemPrice] = useState(0);
  const [subtotalPrice, setSubtotalPrice] = useState(0);
  const [totalPriceAfterDiscount, setTotalPriceAfterDiscount] = useState(0);
  
  useEffect(() => {
    const total = selectedProducts.reduce((total, product) => {
      const priceAfterDiscount = product.price - (product.discount || 0); // หักส่วนลด
      return total + (priceAfterDiscount * product.quantity); // คูณด้วยจำนวนเพื่อหายอดรวม
    }, 0);
    
    setSubtotalPrice(total);
  
    // คำนวณยอดรวมราคาสินค้า หลังหักส่วนลด
    const totalDiscount = selectedProducts.reduce((total, product) => {
      return total + (product.discount || 0) * product.quantity; // รวมส่วนลดที่ใช้
    }, 0);
  
    setTotalDiscountItemPrice(totalDiscount); // อัปเดตยอดรวมส่วนลด
  
    const finalTotal = total - totalDiscount; // ยอดรวมสุดท้ายหลังหักส่วนลด
    setTotalPriceAfterDiscount(finalTotal); // อัปเดตยอดรวมสุดท้าย
  }, [selectedProducts]); // อัปเดตเมื่อ selectedProducts เปลี่ยนแปล


  useEffect(() => {
    const fetchStoreDetails = async () => {
      const sessionToken = localStorage.getItem('session'); 
      if (!sessionToken) {
        router.push('/session/sign-in');
        return;
      }

      try {
        const response = await fetch('/api/stores', {
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        });

        if (!response.ok) {
          console.error('ไม่สามารถดึง ID ร้านค้า และ ชื่อร้านค้า ได้');
          return;
        }

        const data = await response.json();
        setStoreName(data.store_name); 
      } catch (error) {
        console.error('Error fetching store details:', error);
      }
    };

    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId]);
  
  
  
const totalItems = selectedProducts.reduce((acc, product) => acc + product.quantity, 0);

const handleQuantityProductClick = (product) => {
    setSelectedProduct(product);
    setQuantity(1); // ตั้งค่าจำนวนเริ่มต้นเป็น 1
    setIsQuantityModalOpen(true); // เปิด modal
  };

  const handleQuantityOpenModal = (quantity) => {
    setSelectedQuantity(quantity);
    setModalOpen(true);
  };

  const closeQuantityOpenModal = () => {
    setModalOpen(false);
  };

  const closeQuantityModal = () => {
    setIsQuantityModalOpen(false);
  };

  const handleQuantityNumberClick = (number) => {
    setQuantity(parseInt(number, 10));
  };

  const handleChangeQuantityNumberClick = (num) => {
    setSelectedQuantity((prev) => (prev ? parseInt(prev) + num : num)); // เพิ่มจำนวนที่เลือกหรือเปลี่ยนจำนวนใหม่
  };
  

  const handleQuantityClear = () => {
    setQuantity(0);
  };

  const handleChangeQuantity = (quantity, productName) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.product_name === productName
          ? { ...product, quantity: parseInt(quantity, 10) } // Update quantity based on the selected product
          : product
      )
    );
  };


  const handleAddQuantity = (inputQuantity) => {
    const quantity = parseInt(inputQuantity, 10); // แปลงค่าจำนวนที่ป้อน
  
    if (isNaN(quantity) || quantity <= 0) return; // ตรวจสอบค่าที่ป้อน
  
    setSelectedProducts((prevSelected) => {
      const existingProduct = prevSelected.find(p => p.product_name === selectedProduct.product_name);
      
      if (existingProduct) {
        return prevSelected.map(p => 
          p.product_name === selectedProduct.product_name ? { ...p, quantity: p.quantity + quantity } : p
        );
      } else {
        return [...prevSelected, { ...selectedProduct, quantity }];
      }
    });
  };
  


  const handleNumberClick = (num) => {
    setAmount(prev => {
      if (prev === '0') return num;
      return prev + num;
    });
  };

  const handleClear = () => setAmount('0');

  const handleQuickAmount = (amt) => setAmount(amt);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handlePaymentClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };

    const intervalId = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(intervalId); 
  }, []);


  useEffect(() => {
    const userPreference = localStorage.getItem('darkMode');
    if (userPreference !== null) {
      setDarkMode(JSON.parse(userPreference));
    } else {
      const systemPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPreference);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);
  // const toggleTheme = () => {
  //   setDarkMode(prevMode => !prevMode);
  // };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // const toggleTheme = () => {
  //   setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light')); // toggle ระหว่าง light และ dark
  // };

  const getSessionToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session_token') || '';
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const sessionToken = localStorage.getItem('session'); // ดึง sessionToken จาก localStorage
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


  useEffect(() => {
    const validateSession = async () => {
      const sessionToken = localStorage.getItem('session'); // ดึง sessionToken จาก localStorage
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
            confirmButtonText: 'ตกลง',
          }).then(() => router.push('/session/sign-in'));
        }
      } catch (error) {
        console.error('Error validating session:', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `Failed to validate session: ${error.message}`,
          confirmButtonText: 'ตกลง',
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
      const sessionToken = localStorage.getItem('session'); // ดึง sessionToken จาก localStorage

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
  
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullScreen(!fullScreen);
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

  

  // const handleRemoveProduct = (productName) => {
  //   setSelectedProducts((prevSelected) => 
  //     prevSelected.filter(p => p.product_name !== productName)
  //   );
  // };
  const handleRemoveProduct = (productName) => {
    setSelectedProducts(selectedProducts.filter(product => product.product_name !== productName));
  };
  
  const handleClearAll = () => {
    setSelectedProducts([]);
  };

  const calculateTotal = () => {
    const vatRate = 0.00; 

    const totalQuantity = selectedProducts.reduce((sum, product) => sum + product.quantity, 0);
    const totalPrice = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const vatAmount = totalPrice * vatRate;
    const totalWithVAT = totalPrice + vatAmount - discount;

    return { totalQuantity, totalPrice, vatAmount, totalWithVAT };
    
    
  };
  

  const { totalQuantity, totalPrice, vat,vatAmount, totalWithVAT } = calculateTotal();

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
  setSelectedProducts((prevProducts) => {
    const product = prevProducts.find(p => p.product_name === productName);
    
    if (product) {
      if (product.quantity > 1) {
        // หากจำนวนสินค้ามากกว่า 1 ให้ลดจำนวนลง
        return prevProducts.map((p) =>
          p.product_name === productName
            ? { ...p, quantity: p.quantity - 1 }
            : p
        );
      } else {
        // หากจำนวนสินค้าคือ 1 ให้ลบสินค้าออก
        return prevProducts.filter((p) => p.product_name !== productName);
      }
    }
    return prevProducts; // ไม่ทำอะไรหากไม่พบสินค้า
  });
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

function numberToThaiText(num) {
  const units = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า", "สิบ"];
  const teens = ["สิบ", "สิบเอ็ด", "สิบสอง", "สิบสาม", "สิบสี่", "สิบห้า", "สิบหก", "สิบเจ็ด", "สิบแปด", "สิบเก้า"];
  const tens = ["", "สิบ", "ยี่สิบ", "สามสิบ", "สี่สิบ", "ห้าสิบ", "หกสิบ", "เจ็ดสิบ", "แปดสิบ", "เก้าสิบ"];
  const thousands = ["", "หนึ่งพัน", "สองพัน", "สามพัน", "สี่พัน", "ห้าพัน", "หกพัน", "เจ็ดพัน", "แปดพัน", "เก้าพัน"];
  const tenThousands = ["", "หนึ่งหมื่น", "สองหมื่น", "สามหมื่น", "สี่หมื่น", "ห้าหมื่น", "หกหมื่น", "เจ็ดหมื่น", "แปดหมื่น", "เก้าหมื่น"];
  const hundredThousands = ["", "หนึ่งแสน", "สองแสน", "สามแสน", "สี่แสน", "ห้าหมื่น", "หกแสน", "เจ็ดแสน", "แปดแสน", "เก้าแสน"];

  if (num === 0) return "ศูนย์บาท";

  let words = "";
  let baht = Math.floor(num);
  let satang = Math.round((num - baht) * 100);

  if (baht >= 100000) {
    const hundredThousandPart = Math.floor(baht / 100000);
    words += hundredThousands[hundredThousandPart]; // ไม่มีช่องว่าง
    baht %= 100000;
  }

  if (baht >= 10000) {
    const tenThousandPart = Math.floor(baht / 10000);
    words += tenThousands[tenThousandPart]; // ไม่มีช่องว่าง
    baht %= 10000;
  }

  if (baht >= 1000) {
    const thousandPart = Math.floor(baht / 1000);
    words += thousands[thousandPart]; // ไม่มีช่องว่าง
    baht %= 1000;
  }

  if (baht >= 100) {
    const hundredPart = Math.floor(baht / 100);
    words += units[hundredPart] + "ร้อย"; // ไม่มีช่องว่าง
    baht %= 100;
  }

  if (baht >= 20) {
    const tenPart = Math.floor(baht / 10);
    words += tens[tenPart]; // ไม่มีช่องว่าง
    baht %= 10;
  } else if (baht >= 11) {
    words += teens[baht - 10]; // ไม่มีช่องว่าง
    return words + "บาทถ้วน"; // ตัดคำนี้ออก
  } else if (baht === 10) {
    words += "สิบ"; // ไม่มีช่องว่าง
    return words + "บาทถ้วน"; // ตัดคำนี้ออก
  }

  if (baht > 0) {
    words += units[baht]; // ไม่มีช่องว่าง
  }

  words += "บาท"; // ไม่มีช่องว่าง

  if (satang > 0) {
    if (satang < 10) {
      words += `${units[satang]} สตางค์`;
    } else {
      const tenPart = Math.floor(satang / 10);
      const unitPart = satang % 10;
      words += ` ${tens[tenPart]}${unitPart > 0 ? ' ' + units[unitPart] : ''} สตางค์`;
    }
  } else {
    words += "ถ้วน"; // ไม่มีช่องว่าง
  }

  return words.trim();
}

const handleItemDiscountClick = (productName) => {
  Swal.fire({
    title: 'กรอกส่วนลด',
    html: `
      <label style="display: block;">เลือกประเภทส่วนลด</label>
      <select id="discountType" class="block w-full p-2 border rounded mb-2 bg-white text-black">
        <option value="percentage">เปอร์เซ็นต์ (%)</option>
        <option value="amount">จำนวนเงิน (฿)</option>
      </select>
      <input type="text" id="discountValue" placeholder="กรุณากรอกจำนวนส่วนลด" class="block w-full p-2 border rounded bg-white text-black" />
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'ตกลง',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const discountValue = document.getElementById('discountValue').value;
      const discountType = document.getElementById('discountType').value;

      if (!discountValue) {
        Swal.showValidationMessage('กรุณากรอกข้อมูลส่วนลด!');
      }

      return { discountValue: parseFloat(discountValue), discountType };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { discountValue, discountType } = result.value;
      handleItemApplyDiscount(productName, discountValue, discountType);
    }
  });
};




const handleItemApplyDiscount = (productName, discountValue, discountType) => {
  const updatedProducts = selectedProducts.map(product => {
    if (product.product_name === productName) {

      let finalPrice = product.price;

      if (discountType === 'percentage') {
        finalPrice -= (finalPrice * (discountValue / 100)); // คำนวณส่วนลดเป็นเปอร์เซ็นต์
      } else if (discountType === 'amount') {
        finalPrice -= discountValue; // คำนวณส่วนลดเป็นจำนวนเงิน
      }

      return {
        ...product,
        discount: discountValue, // เพิ่มฟิลด์ discount
        finalPrice: finalPrice > 0 ? finalPrice : 0 // ตรวจสอบให้แน่ใจว่าราคาไม่ติดลบ
      };
    }
    return product;
  });
  
  setSelectedProducts(updatedProducts);
};




  

return (
  <div className={`flex flex-col w-full min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
<header className={`flex items-center justify-between h-16 px-4 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b'} shrink-0 md:px-6`}>
    <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
      <button className={`btn ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} gap-2`}>
        <PackageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base">จัดการสินค้า</span>
      </button>
      <button className={`btn ${darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'} gap-2`}>
        <LayoutGridIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base">จัดการหมวดหมู่</span>
      </button>
    </div>

    <div className="flex-grow text-center">
      <span className={`text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{currentTime}</span>
      <span className={`text-lg ${darkMode ? 'text-gray-100' : 'text-gray-900'} ml-4`}>{storeName}</span>
    </div>

    <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
      <button className={`btn ${darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white'} gap-2`}>
        <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base">จัดการผู้ใช้งาน</span>
      </button>
      <button className={`btn ${darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'} gap-2`} onClick={handleDashboardClick}>
        <CircleUserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base">ผู้ดูแล</span>
      </button>
      <div className="flex items-center gap-2 sm:gap-4">
        <label className="grid cursor-pointer place-items-center">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleTheme}
            className="toggle theme-controller bg-base-content col-span-2 col-start-1 row-start-1"
          />
          <svg className="stroke-base-100 fill-base-100 col-start-1 row-start-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
          <svg className="stroke-base-100 fill-base-100 col-start-2 row-start-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </label>
        <div onClick={toggleFullScreen} className="group cursor-pointer inline-flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-fullscreen" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707m0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707m-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707" />
          </svg>
        </div>
        <div onClick={handleLogout} className="group cursor-pointer inline-flex items-center justify-center">
          <PowerIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-700 transition-transform duration-300 transform group-hover:scale-50 group-hover:rotate-45" />
        </div>
      </div>
    </div>
  </header>

  
  <main className={`flex flex-1 p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-200'} md:p-3`}>
  <div className={`flex flex-col w-full max-w-[700px] h-[calc(100vh-90px)] p-4 ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white bg-opacity-50 text-gray-900'} border rounded-md`}>
  <div className="flex flex-wrap items-center mb-4 space-x-2">
      <select className={`select select-bordered ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-black'} flex-1`} defaultValue="">
        <option value="" disabled>ลูกค้าภายในร้าน</option>
      </select>
      <button className={`btn ${darkMode ? 'btn-gray-600' : 'btn-gray-500'} gap-2`}>
        <PlusIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
    <div className={`p-4 h-[calc(100vh-80px)] ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-md`}>
    <h2 className="text-xl font-bold mb-4">
  คำสั่งซื้อปัจจุบัน 
  <span className="badge badge-primary ml-2">
    {selectedProducts.length} รายการ
  </span>
  <span className="badge badge-warning ml-1">
    {totalItems} ชิ้น
  </span>
</h2>
      <div className="h-[calc(100vh-520px)] overflow-y-auto"> 
        {selectedProducts.map((product, index) => (
          <div key={index} className={`relative flex items-center justify-between mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-lg`}>
            <img 
              src={product.img ? product.img : ''} 
              alt={product.product_name || 'Product Image'} 
              className="w-16 h-16 object-cover rounded-lg" 
            />
            <div className="flex-1 ml-4">
              <h3 className="font-semibold">{product.product_name}</h3>
              <p className={`text-orange-500`}>
      ฿{(Number(product.finalPrice) || Number(product.price)).toFixed(2)} {/* ใช้ finalPrice หากมี ไม่งั้นใช้ราคาต้นทาง */}
    </p>
          {product.discount > 0 && (
        <p className="text-red-500">
          -฿{(product.discount * product.quantity).toFixed(2)} {/* จำนวนเงินที่ลด */}
        </p>
      )}
            </div>
            <div className="flex items-center">
  <button onClick={() => handleDecreaseQuantity(product.product_name)} className={`btn btn-outline btn-xs h-7 w-7 ${darkMode ? 'btn-dark' : 'btn-light'}`}>-</button>
  
  <span 
    className="mx-2 cursor-pointer hover:underline" 
    onClick={() => handleQuantityOpenModal(product.quantity)} // เปิด modal
  >
    {product.quantity}
  </span>

  <button onClick={() => handleIncreaseQuantity(product.product_name)} className={`btn btn-outline btn-xs h-7 w-7 ${darkMode ? 'btn-dark' : 'btn-light'}`}>+</button>
</div>
<ChangeQuantityModal
  quantity={selectedQuantity}
  isModalOpen={modalOpen}
  closeModal={closeQuantityOpenModal}
  handleChangeQuantity={(quantity) => handleChangeQuantity(quantity, product.product_name)} // Pass the product name to update the specific product
  handleChangeQuantityNumberClick={handleChangeQuantityNumberClick} // ส่งฟังก์ชันนี้ไปยัง Modal
/>




            <svg 
              onClick={() => handleRemoveProduct(product.product_name)} 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              fill="red" 
              className="absolute top-1 right-1 w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity" 
              viewBox="0 0 16 16">
              <path d="M2.037 3.225A.7.7 0 0 1 2 3c0-1.105 2.686-2 6-2s6 .895 6 2a.7.7 0 0 1-.037.225l-1.684 10.104A2 2 0 0 1 10.305 15H5.694a2 2 0 0 1-1.973-1.671zm9.89-.69C10.966 2.214 9.578 2 8 2c-1.58 0-2.968.215-3.926.534-.477.16-.795.327-.975.466.18.14.498.307.975.466C5.032 3.786 6.42 4 8 4s2.967-.215 3.926-.534c.477-.16.795-.327.975-.466-.18-.14-.498-.307-.975-.466z"/>
            
            </svg>
                    <TicketPercent 
                    onClick={() => handleItemDiscountClick(product.product_name)}
          className={`absolute top-1 right-8 w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity ${darkMode ? 'text-white' : 'text-black'} hover:text-blue-500 transition-colors`} 
        />


            
            
          </div>
        ))}
      </div>
      <div className={`border-t pt-4 mt-4 ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
        <div className="flex justify-between mb-6">
          <span>ยอดรวมสินค้า</span>
          <span>{subtotalPrice.toFixed(2)} บาท</span> {/* แสดงยอดรวมราคาสินค้า */}
          </div>
        <div className="flex justify-between mb-6">
          <span>ส่วนลด</span>
          <div className="flex items-center text-red-500">
            <span className="mr-2">-฿{discount.toFixed(2)}</span>
            <svg
              onClick={handleApplyDiscount}
              className={`w-4 h-4 cursor-pointer ${darkMode ? 'text-gray-500' : 'text-gray-300'} hover:text-blue-500 transition-colors`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
        </div>
        {/* <div className="flex justify-between mb-5">
          <span>ภาษี (7%)</span>
          <span>{vatAmount.toFixed(2)} บาท</span>
        </div> */}
<div className="flex justify-between font-bold text-lg mb-10 border-b pb-4">
  <span>ยอดรวมทั้งหมด ({numberToThaiText(subtotalPrice)})</span>
  <span className="text-orange-500 text-xl">{subtotalPrice.toFixed(2)} บาท</span> {/* แสดงยอดรวมหลังหักส่วนลด */}
  
</div>



        <button 
          onClick={handlePaymentClick} 
          className={`py-3 px-6 rounded-lg shadow-lg focus:outline-none transition-colors duration-300 ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'} 
          ${selectedProducts.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={selectedProducts.length === 0} 
        >
          ชำระเงิน
        </button>

        







        {/* <PaymentModal 
          amount={amount} 
          setAmount={setAmount} 
          handleNumberClick={handleNumberClick} 
          handleClear={handleClear} 
          handleQuickAmount={handleQuickAmount} 
          isModalOpen={isModalOpen} 
          closeModal={closeModal} 
          totalWithVAT={totalWithVAT}
          totalPrice={totalPrice}
          selectedProducts={selectedProducts} 
        /> */}


  </div>
</div>


</div>

      <div className={`flex flex-col flex-1 p-4 mt md:ml-3 h-[calc(100vh-90px)] ${darkMode ? 'bg-gray-700' : 'bg-white'} bg-opacity-50 border rounded-md`}>
      <input 
  type="text" 
  placeholder="ค้นหาสินค้า..." 
  className={`input input-bordered ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-black'} mb-4`} 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>

<div className="btn-group mb-4 flex flex-wrap space-x-2">
  <button
    className={`btn ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-black'} mb-2 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-500 hover:text-white`}
    onClick={() => setSelectedCategory(null)}
  >
    ทั้งหมด
  </button>
  {categories.map((category) => (
    <button
      key={category.id}
      className={`btn ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-black'} mb-2 transition-transform duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-500 hover:text-white`}
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
            onClick={() => handleQuantityProductClick(product)} 
            style={{ maxWidth: '270px' }} 
          >
<figure className="relative w-full h-32 overflow-hidden">
  <img
    src={product.img || 'default-image-url'}
    alt={product.product_name || 'Product Image'}
    className="w-full h-full object-contain" // เปลี่ยนจาก object-cover เป็น object-contain
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
  {isQuantityModalOpen && (
        <QuantityModal
          quantity={quantity}
          setQuantity={setQuantity}
          handleQuantityNumberClick={handleQuantityNumberClick}
          handleQuantityClear={handleQuantityClear}
          isModalOpen={isQuantityModalOpen}
          closeModal={closeQuantityModal}
          handleAddQuantity={handleAddQuantity}
        />
      )}
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