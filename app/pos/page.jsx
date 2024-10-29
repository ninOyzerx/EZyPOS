"use client";
import '../globals.css';
import React, { useState, useRef , useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import Loading from './loading';
import PaymentModal from '../components/keypad/paymentModal';
import QuantityModal from '../components/keypad/quantityModal';
import ChangeQuantityModal from '../components/keypad/changeQuantityModal';
import { TicketPercent, ListFilter, ArrowDownNarrowWide, ArrowUpNarrowWide, ClockArrowUp ,Package,HandCoins,Pause,LayoutList  } from 'lucide-react';
import { RxReload } from "react-icons/rx";
import { AiFillEdit , AiOutlineBarcode} from "react-icons/ai";
import { FaTrash , FaArrowTrendDown} from "react-icons/fa6";
import { Settings , LayoutDashboard , Play ,ReceiptText } from 'lucide-react'; 
import SettingsModal from '../components/store/settingsModal'
import { IoMdPersonAdd } from "react-icons/io";
import { LuPackageX } from "react-icons/lu";
import LoadingStore from './loadingStoreDetails';


import BarcodeScannerModal from '../components/barcodeScannerModal'; 

// import BarcodeScanner from '../barcode-scanner'; 








export default function Component() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [userStoreId, setUserStoreId] = useState(null); // Store user store ID

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
      setIsExpanded(!isExpanded);
  };

  const [outOfStockToggle, setOutOfStockToggle] = useState(false); 
  const [progress, setProgress] = useState(0); 
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false); // สร้าง state สำหรับเปิด Barcode Modal

  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCategoryGridOpen, setIsCategoryGridOpen] = useState(false); // เปลี่ยนชื่อ state เป็น isCategoryGridOpen
  
  const [filterProducts, setFilterProducts] = useState(products);

  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false); // State to manage dropdown visibility

  const [sortOption, setSortOption] = useState('latest'); // ค่าเริ่มต้นคือ "เพิ่มล่าสุด"
  const [loading, setLoading] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);  // New state to track whether the darkMode has been loaded
  const [manageCategories, setManageCategories] = useState([]);
  const [ManageProducts, setManageProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeId, setStoreId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCategoriesTerm, setSearchCategoriesTerm] = useState('');

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
  const [fullTotalPrice, setFullTotalPrice] = useState(0);
  const [totalPriceAfterDiscount, setTotalPriceAfterDiscount] = useState(0);

  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const [isStoreSettingModalVisible, setIsStoreSettingModalVisible] = useState(false);
  const [storeData, setStoreData] = useState({
    store_name: '', // ชื่อร้านค้า
    store_address: '', // ที่อยู่ร้านค้า (ในรูป JSON string)
    store_phone_no: '', // เบอร์โทรศัพท์ร้านค้า
    store_img: '', // รูปภาพร้านค้า
  });
  const [pausedProducts, setPausedProducts] = useState([]);
  

  const handlePauseProducts = () => {
    if (selectedProducts.length > 0) {
      setPausedProducts([...pausedProducts, ...selectedProducts]);
      // เคลียร์รายการสินค้าใน selectedProducts หลังจากพักสินค้า
      setSelectedProducts([]);
    }
  };
  

      // ฟังก์ชันสำหรับเปิด Category Grid
      const openCategoryGrid = () => {
        setIsCategoryGridOpen(true);
    };

    // ฟังก์ชันสำหรับปิด Category Grid
    const closeCategoryGrid = () => {
        setIsCategoryGridOpen(false);
    };

    const handleCategorySelect = (categoryId) => {
      setSelectedCategory(categoryId);
      closeCategoryGrid();
  };

  const handleLogin = async () => {
    // Your login logic...
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true); // Set logged-in status
    } else {
        console.error('Login failed:', await response.json());
    }
};

  // ฟังก์ชันสำหรับนำสินค้าที่ถูกพักกลับมาใช้งาน
  const handleContinueOrder = (product) => {
    // เพิ่มสินค้าที่ถูกพักกลับเข้าสู่รายการ selectedProducts
    setSelectedProducts([...selectedProducts, product]);
    // นำสินค้านั้นออกจาก pausedProducts
    setPausedProducts(pausedProducts.filter((p) => p.product_code !== product.product_code));
  };


  useEffect(() => {
    async function fetchUserData() {
        try {
            const response = await fetch('/api/get-user');
            if (response.ok) {
                const userData = await response.json();
                setUserStoreId(userData.store_id); // Store store_id in state
                localStorage.setItem('userStoreId', userData.store_id); // Save userStoreId in localStorage

            } else {
                const errorData = await response.json();
                console.error('Error fetching user data:', errorData.message); // Log the specific error message

                // Display error alert using SweetAlert2
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: errorData.message || 'ไม่สามารถดึงข้อมูลผู้ใช้ได้',
                    confirmButtonText: 'ตกลง',
                }).then(() => {
                    router.push('/session/sign-in');
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);

            // Display error alert using SweetAlert2
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถติดต่อกับเซิร์ฟเวอร์ได้',
                confirmButtonText: 'ตกลง',
            }).then(() => {
                router.push('/session/sign-in');
            });
        }
    }

    fetchUserData();
}, []);

let isAddingProduct = false; // ตัวแปรเพื่อป้องกันการเพิ่มซ้ำ

useEffect(() => {
  const handleBarcodeMessage = (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }

    const { barcode } = event.data;
    console.log('Barcode received:', barcode); 

    if (barcode && userStoreId) { // ตรวจสอบว่ามี userStoreId หรือไม่ก่อนเรียกใช้งาน
      if (!isAddingProduct) { // ตรวจสอบว่ากำลังเพิ่มสินค้าหรือไม่
        console.log('Calling handleAddProductByBarcode with barcode:', barcode);
        isAddingProduct = true; // ตั้งค่ากำลังเพิ่มสินค้า
        handleAddProductByBarcode(barcode).finally(() => {
          isAddingProduct = false; // คืนค่ากลับหลังจากการเพิ่มเสร็จสิ้น
        });
      }
    } else {
      console.error('userStoreId is undefined or null');
    }
  };

  window.addEventListener('message', handleBarcodeMessage);

  return () => {
    window.removeEventListener('message', handleBarcodeMessage);
  }; 
}, [userStoreId]); // useEffect นี้จะทำงานใหม่เมื่อ userStoreId ถูกตั้งค่า

const openAddProduct = () => {
  if (!manageCategories) {
    console.error('Categories data is not available.');
    return;
}

const categories = Array.isArray(manageCategories) ? manageCategories : [];

  // If no categories are available, show an error message
  if (categories.length === 0) {
      Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'ไม่พบหมวดหมู่ กรุณาเพิ่มหมวดหมู่ก่อนเพิ่มสินค้า',
          confirmButtonText: 'ตกลง',
          customClass: {
              confirmButton: 'custom-confirm-button',
              cancelButton: 'custom-cancel-button',
              title: 'font-thai',
              htmlContainer: 'font-thai',
              confirmButton: 'font-thai',
              cancelButton: 'font-thai',
          },
          willOpen: () => {
              document.querySelector('.swal2-title').style.fontSize = '30px'; 
              document.querySelector('.swal2-html-container').style.fontSize = '25px';
              const confirmButton = document.querySelector('.swal2-confirm');
              confirmButton.style.fontSize = '24px'; 
              confirmButton.style.padding = '6px 24px';
              confirmButton.style.backgroundColor = '#4CAF50'; 
              confirmButton.style.color = '#fff'; 
              const cancelButton = document.querySelector('.swal2-cancel');
              cancelButton.style.fontSize = '24px';
              cancelButton.style.padding = '6px 24px';
              cancelButton.style.backgroundColor = '#f44336'; 
              cancelButton.style.color = '#fff'; 
          }
      });
      return;
  }

  // Generate category options
  const categoryOptions = categories.map(category => 
      `<option value="${category.id}">${category.name}</option>`
  ).join('');

  // Show the SweetAlert for adding a product
  Swal.fire({
      title: '<h2>เพิ่มสินค้าใหม่</h2>',
      html: `
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <label for="product-name" style="font-size: 24px; font-weight: bold; width: 30%;">ชื่อสินค้า</label>
              <input type="text" id="product-name" class="swal2-input" placeholder="ชื่อสินค้า" style="width: 65%; height: 40px;" />
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <label for="product-code" style="font-size: 24px; font-weight: bold; width: 30%;">รหัสสินค้า</label>
              <input type="text" id="product-code" class="swal2-input" placeholder="รหัสสินค้า" style="width: 65%; height: 40px;" />
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <label for="category-id" style="font-size: 24px; font-weight: bold; width: 30%;">หมวดหมู่</label>
<select id="category-id" class="swal2-input" style="width: 65%; height: 40px; padding: 0 10px; border: 1px solid #d9d9d9; background-color: white; color: black;">
                                  ${categoryOptions}

                </select>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <label for="price" style="font-size: 24px; font-weight: bold; width: 30%;">ราคา</label>
              <input type="number" id="price" class="swal2-input" placeholder="ราคา" style="width: 65%; height: 40px;" />
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <label for="stock-quantity" style="font-size: 24px; font-weight: bold; width: 30%;">จำนวนคงเหลือ</label>
              <input type="number" id="stock-quantity" class="swal2-input" placeholder="จำนวนคงเหลือ" style="width: 65%; height: 40px;" />
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <label for="product-img" style="font-size: 24px; font-weight: bold; width: 30%;">เลือกรูปภาพสินค้า</label>
              <input type="file" id="product-img" class="swal2-file-input" accept="image/*" style="width: 65%; height: 40px;" />
          </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      customClass: {
          popup: 'custom-swal-popup',
          confirmButton: 'custom-confirm-button',
          cancelButton: 'custom-cancel-button',
          title: 'font-thai',
          htmlContainer: 'font-thai',
          confirmButton: 'font-thai',
          cancelButton: 'font-thai',
      },
      preConfirm: () => {
          const name = Swal.getPopup().querySelector('#product-name').value;
          const code = Swal.getPopup().querySelector('#product-code').value;
          const categoryId = Swal.getPopup().querySelector('#category-id').value;
          const price = Swal.getPopup().querySelector('#price').value;
          const stockQuantity = Swal.getPopup().querySelector('#stock-quantity').value;
          const imageFile = Swal.getPopup().querySelector('#product-img').files[0];
          if (!name || !code || !price || !stockQuantity) {
              Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน และเลือกรูปภาพ');
              return null;
          }

          return { name, code, categoryId, price, stockQuantity, imageFile };
      },
      willOpen: () => {
          document.querySelector('.swal2-title').style.fontSize = '30px'; 
          document.querySelector('.swal2-html-container').style.fontSize = '25px';
          const confirmButton = document.querySelector('.swal2-confirm');
          confirmButton.style.fontSize = '24px'; 
          confirmButton.style.padding = '6px 24px';
          confirmButton.style.backgroundColor = '#4CAF50'; 
          confirmButton.style.color = '#fff'; 
          const cancelButton = document.querySelector('.swal2-cancel');
          cancelButton.style.fontSize = '24px';
          cancelButton.style.padding = '6px 24px';
          cancelButton.style.backgroundColor = '#f44336'; 
          cancelButton.style.color = '#fff'; 
      }
  }).then((result) => {
      if (result.isConfirmed) {
          addProduct(result.value); // Call function to add the new product
      }
  });
};

const addProduct = async (productData) => {
  const formData = new FormData();
  formData.append('name', productData.name);
  formData.append('code', productData.code);
  formData.append('categoryId', productData.categoryId);
  formData.append('price', productData.price);
  formData.append('stockQuantity', productData.stockQuantity);

  // Only append the image if it exists
  if (productData.imageFile) {
    formData.append('productImg', productData.imageFile);
  }

  try {
    const response = await fetch(`/api/products/manage-products/${userStoreId}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'สินค้าถูกเพิ่มเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
        customClass: {
            confirmButton: 'custom-confirm-button',
            title: 'font-thai',
            htmlContainer: 'font-thai',
            confirmButton: 'font-thai',
        },
        willOpen: () => {
            document.querySelector('.swal2-title').style.fontSize = '30px'; 
            document.querySelector('.swal2-html-container').style.fontSize = '25px';
            const confirmButton = document.querySelector('.swal2-confirm');
            confirmButton.style.fontSize = '24px'; 
            confirmButton.style.padding = '6px 24px';
            confirmButton.style.backgroundColor = '#4CAF50'; 
            confirmButton.style.color = '#fff'; 
        }
    });
      fetchProducts(); // Reload products list after adding a new one
    } else {
      Swal.fire('Error', result.message || 'ไม่สามารถเพิ่มสินค้าได้', 'error');
    }
  } catch (error) {
    console.error('Error adding product:', error);
    Swal.fire('Error', 'เกิดข้อผิดพลาดในการเพิ่มสินค้า', 'error');
  }
};

  
const openAddCategory = () => {
      Swal.fire({
          title: '<h2>เพิ่มหมวดหมู่ใหม่</h2>',
          html: `
              <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 15px;">
  <label for="category-name" style="font-size: 22px; font-weight: bold; margin-bottom: 5px;">ชื่อหมวดหมู่</label>
  <input type="text" id="category-name" class="swal2-input" placeholder="ชื่อหมวดหมู่" style="width: 80%; height: 40px;" />
</div>

<div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 15px;">
  <label for="category-description" style="font-size: 22px; font-weight: bold; margin-bottom: 5px;">รายละเอียดหมวดหมู่</label>
  <textarea id="category-description" class="swal2-textarea" rows="3" placeholder="รายละเอียดหมวดหมู่" style="width: 80%; height: auto;"></textarea>
</div>

<div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 15px;">
  <label for="category-img" style="font-size: 22px; font-weight: bold; margin-bottom: 8px;">เลือกรูปภาพหมวดหมู่ (ถ้ามี)</label>
  <input type="file" id="category-img" class="swal2-file-input" accept="image/*" style="width: 80%; height: 40px;" />
</div>

          `,
          focusConfirm: false,
          customClass: {
              confirmButton: 'custom-confirm-button',
              cancelButton: 'custom-cancel-button',
              title: 'font-thai',
              htmlContainer: 'font-thai',  
              confirmButton: 'font-thai',
              cancelButton: 'font-thai',
          },
          showCancelButton: true,
          confirmButtonText: 'บันทึก',
          cancelButtonText: 'ยกเลิก',
          preConfirm: () => {
              const name = Swal.getPopup().querySelector('#category-name').value;
              const description = Swal.getPopup().querySelector('#category-description').value;
              const imageFile = Swal.getPopup().querySelector('#category-img').files[0];
  
              if (!name || !description) {
                  Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
                  return null;
              }
  
              return { name, description, imageFile };
          },
  
          willOpen: () => {
              document.querySelector('.swal2-title').style.fontSize = '30px'; 
              document.querySelector('.swal2-html-container').style.fontSize = '25px';
              const confirmButton = document.querySelector('.swal2-confirm');
              confirmButton.style.fontSize = '24px'; 
              confirmButton.style.padding = '6px 24px';
              confirmButton.style.backgroundColor = '#4CAF50'; 
              confirmButton.style.color = '#fff'; 
              const cancelButton = document.querySelector('.swal2-cancel');
              cancelButton.style.fontSize = '24px';
              cancelButton.style.padding = '6px 24px';
              cancelButton.style.backgroundColor = '#f44336'; 
              cancelButton.style.color = '#fff'; 
          }
      }).then((result) => {
          if (result.isConfirmed) {
              addCategory(result.value);
          }
      });
  };

  const addCategory = async (categoryData) => {
    const formData = new FormData();
    formData.append('name', categoryData.name);
    formData.append('description', categoryData.description);

    // Only append the image file if it exists (optional image upload)
    if (categoryData.imageFile) {
        formData.append('category_img', categoryData.imageFile); // Append the image file only if provided
    }

    try {
        const response = await fetch(`/api/categories/manage-categories/${userStoreId}`, {
            method: 'POST',
            body: formData, // Send formData to the server
        });

        if (response.ok) {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ!',
            text: 'หมวดหมู่ถูกเพิ่มเรียบร้อยแล้ว',
            confirmButtonText: 'ตกลง',
            customClass: {
                confirmButton: 'custom-confirm-button',
                title: 'font-thai',
                htmlContainer: 'font-thai',
                confirmButton: 'font-thai',
            },
            willOpen: () => {
                document.querySelector('.swal2-title').style.fontSize = '30px'; 
                document.querySelector('.swal2-html-container').style.fontSize = '25px';
                const confirmButton = document.querySelector('.swal2-confirm');
                confirmButton.style.fontSize = '24px'; 
                confirmButton.style.padding = '6px 24px';
                confirmButton.style.backgroundColor = '#4CAF50'; 
                confirmButton.style.color = '#fff'; 
            }
        });
            fetchCategories();
        } else {
            const errorData = await response.json();
            console.error('Error adding category:', errorData.message);
            Swal.fire('Error', errorData.message || 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้', 'error');
    }
};

  const barcodeToggleModal = () => {
    setIsBarcodeModalOpen(!isBarcodeModalOpen);
  };

// Function to toggle the barcode modal
const toggleBarcodeModal = () => {
  setIsBarcodeModalOpen(!isBarcodeModalOpen);
};

const [customers, setCustomers] = useState([]);
const [selectedCustomer, setSelectedCustomer] = useState("walkin");

useEffect(() => {
  // Fetch customers from the API with session token and store_id
  const fetchCustomers = async () => {
    try {
      const sessionToken = localStorage.getItem('session'); // Get session token
      const storeId = localStorage.getItem('storeId'); // Get store_id

      if (!sessionToken || !storeId) {
        console.error('Session token or store ID not found');
        return;
      }

      const response = await fetch(`/api/customers?store_id=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}` // Include the session token in the headers
        }
      });

      const data = await response.json();
      
      // If the data is an array, set the customers list
      if (Array.isArray(data)) {
        setCustomers(data); // Store the entire array of customers
      } else {
        console.error('Unexpected data structure:', data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  fetchCustomers();
}, []);

const handleSelectChange = (e) => {
  setSelectedCustomer(e.target.value);
};





  const sortDropdownRef = useRef(null); // ใช้ ref เพื่ออ้างอิงถึง dropdown

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false); // ปิด dropdown เมื่อคลิกข้างนอก
      }
    };

    // เพิ่ม event listener เมื่อ component ถูก mount
    document.addEventListener('mousedown', handleClickOutside);

    // ลบ event listener เมื่อ component ถูก unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (filterDropdownOpen && sortDropdownRef.current) {
      const dropdown = sortDropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (dropdown.bottom > viewportHeight) {
        sortDropdownRef.current.style.top = `${viewportHeight - dropdown.bottom - 10}px`; // Adjust top if dropdown goes out of screen
      }
    }
  }, [filterDropdownOpen]);


  useEffect(() => {
    if (selectedProducts.length > 0) {  
      localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    }
  }, [selectedProducts]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('selectedProducts');
    if (savedProducts) {
      setSelectedProducts(JSON.parse(savedProducts));
    }
  }, []);

  // const fetchProductByBarcode = async (barcode) => {
  //   try {
  //     // ดึง sessionToken และ storeId จาก localStorage
  //     const sessionToken = localStorage.getItem('sessionToken');
  //     const storeId = localStorage.getItem('storeId');
  
  //     if (!sessionToken || !storeId) {
  //       throw new Error('Session token หรือ Store ID ไม่พบ');
  //     }
  
  //     // เรียก API โดยใส่ sessionToken และ storeId ไปใน headers และ URL
  //     const response = await fetch(`/api/products?product_code=${barcode}&store_id=${storeId}`, {
  //       headers: {
  //         'Authorization': `Bearer ${sessionToken}`,
  //       },
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('ไม่พบสินค้า');
  //     }
  
  //     const product = await response.json();
  //     return product;
  //   } catch (error) {
  //     console.error('Error fetching product:', error);
  //     return null;
  //   }
  // };
  
  

  const fetchProductsByCategory = async (categoryId) => {
    if (!storeId) return;
    setLoading(true);  // เริ่มการโหลด
    const sessionToken = localStorage.getItem('session'); // ดึง sessionToken จาก localStorage
  
    try {
      const response = await fetch(`/api/products?category_id=${categoryId || ''}&store_id=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      const data = await response.json();
      
      // Simulate a 2-second delay before updating the products
      setTimeout(() => {
        setProducts(data);  // อัพเดทสินค้าหลังจาก 2 วินาที
        setLoading(false);  // จบการโหลด
      }, 2000);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);  // จบการโหลดในกรณีที่เกิดข้อผิดพลาด
    }
  };
  
  // ใช้ useEffect เพื่อโหลดสินค้าตอนเริ่มต้นและเมื่อเลือก category ใหม่
  useEffect(() => {
    if (selectedCategory === null) {
      fetchProductsByCategory('');
    } else {
      fetchProductsByCategory(selectedCategory);
    }
  }, [selectedCategory, storeId]);
  
  // ฟังก์ชัน handleReload ที่ใช้เพื่อโหลดสินค้าซ้ำ
  const handleReload = () => {
    setLoading(true);  // เริ่มการโหลดเมื่อกดปุ่ม reload
    fetchProductsByCategory(selectedCategory || '');
  };
  
  const handleSortOption = (option) => {
    setSortOption(option); // เปลี่ยนค่า sortOption เมื่อผู้ใช้เลือกตัวเลือกการกรองหรือเรียงลำดับ
  };
  
  useEffect(() => {
    let tempProducts = [...products];

    // Filter by category
    if (selectedCategory !== null) {
      tempProducts = tempProducts.filter(product => product.category_id === selectedCategory);
    }

    // Filter out of stock products if sortOption is 'out-of-stock'
    if (sortOption === 'out-of-stock') {
      tempProducts = tempProducts.filter(product => product.stock_quantity === 0);
    } 

    // Sort products based on selected sort option
    if (sortOption === 'latest') {
      tempProducts = tempProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Newest first
    } else if (sortOption === 'price-low-high') {
      tempProducts = tempProducts.sort((a, b) => a.price - b.price); // Lowest price first
    } else if (sortOption === 'price-high-low') {
      tempProducts = tempProducts.sort((a, b) => b.price - a.price); // Highest price first
    }

    // Set filtered and sorted products
    setFilterProducts(tempProducts);
  }, [selectedCategory, sortOption, products]);

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.trim().toLowerCase()) || // ใช้ trim() เพื่อตัดช่องว่างทั้งสองด้านของ searchTerm
    (product.barcode && product.barcode.includes(searchTerm.trim()))
  );

  // const filteredSelectedCategories = categories.filter((category) =>
  //   category.name.toLowerCase().includes(searchCategoriesTerm.trim().toLowerCase())
  // );
  
  

  const handleDropdownToggle = () => {
    setFilterDropdownOpen(!filterDropdownOpen); // Toggle open/close
  };


  


  const handleAddProductByBarcode = async (barcode) => {
    const sessionToken = localStorage.getItem('session');
    const userStoreId = localStorage.getItem('userStoreId');

    if (!userStoreId) {
        console.error('userStoreId is undefined or null');
        return;
    }

    if (!sessionToken) {
        console.error('Session Token not found');
        return;
    }

    try {
        console.log(`Fetching product with barcode: ${barcode}, store_id: ${userStoreId}`);
        const response = await fetch(`/api/products/${barcode}?store_id=${userStoreId}`, {
            headers: {
                Authorization: `Bearer ${sessionToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'ไม่พบสินค้า',
                    text: 'ไม่พบสินค้าในฐานข้อมูลหรือสินค้านี้ไม่อยู่ในร้านของคุณ',
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        confirmButton: 'custom-confirm-button',
                        title: 'font-thai',
                        htmlContainer: 'font-thai',
                        confirmButton: 'font-thai',
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า',
                    confirmButtonText: 'ตกลง',
                    customClass: {
                        confirmButton: 'custom-confirm-button',
                        title: 'font-thai',
                        htmlContainer: 'font-thai',
                        confirmButton: 'font-thai',
                    }
                });
            }
            return;
        }

        const product = await response.json();
        console.log('Product fetched:', product);

        // อัปเดตสินค้าลงในตะกร้า
        setSelectedProducts(prevProducts => {
            const productInCart = prevProducts.find(item => item.product_code === barcode);

            if (productInCart) {
                // ถ้าสินค้าอยู่ในตะกร้า ให้เพิ่มจำนวน
                return prevProducts.map(item =>
                    item.product_code === barcode
                        ? { ...item, quantity: item.quantity + 1 } // เพิ่มจำนวนสินค้า
                        : item
                );
            } else {
                // ถ้าไม่อยู่ในตะกร้า ให้เพิ่มสินค้าใหม่
                return [...prevProducts, { ...product, quantity: 1 }];
            }
        });
        
    } catch (error) {
        console.error('Error fetching product by barcode:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า',
            confirmButtonText: 'ตกลง',
            customClass: {
                confirmButton: 'custom-confirm-button',
                title: 'font-thai',
                htmlContainer: 'font-thai',
                confirmButton: 'font-thai',
            }
        });
    }
};


  
  
  

  
  
  
  
  
  


  


  useEffect(() => {
    // คำนวณยอดรวมเต็มราคาสินค้า
    const total = selectedProducts.reduce((total, product) => {
      const priceAfterDiscount = product.price - (product.discount || 0);
      return total + (priceAfterDiscount * product.quantity);
    }, 0);

    setFullTotalPrice(total);

    // คำนวณยอดรวมส่วนลด
    const totalDiscount = selectedProducts.reduce((total, product) => {
      return total + (product.discount || 0) * product.quantity; // รวมส่วนลดที่ใช้
    }, 0);

    setTotalDiscountItemPrice(totalDiscount); // อัปเดตยอดรวมส่วนลด

    // คำนวณยอดรวมสุดท้ายหลังหักส่วนลด
    const finalTotal = total - totalDiscount;
    setTotalPriceAfterDiscount(finalTotal); // อัปเดตยอดรวมสุดท้าย
  }, [selectedProducts]); // อัปเดตเมื่อ selectedProducts เปลี่ยนแปลง



  useEffect(() => {
    const fetchStoreDetails = async () => {
      const sessionToken = localStorage.getItem('session');
      const storeId = localStorage.getItem('storeId'); 

      if (!sessionToken || !storeId) {
        Swal.fire({
          icon: 'error',
          title: 'ไม่พบข้อมูลการเข้าสู่ระบบ',
          text: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          router.push('/session/sign-in'); 
        });
        return;
      }
  
      try {
        const response = await fetch(`/api/stores`, {
          headers: {
            'Authorization': `Bearer ${sessionToken}`, 
          },
        });
  
        if (!response.ok) {
          console.error('ไม่สามารถดึงข้อมูลร้านค้าได้');
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถดึงข้อมูลร้านค้าได้',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
          });
          return;
        }
  
        const data = await response.json();
        setStoreName(data.store_name); // Set store_name from API data
        setStoreData(data); // Update storeData
        setLoading(false); // Turn off loading after data is fetched
      } catch (error) {
        console.error('Error fetching store details:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลร้านค้าได้',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setLoading(false); // Turn off loading in case of error
      }
    };

    fetchStoreDetails(); // Fetch store details on component load
  }, [router]);




  const totalItems = selectedProducts.reduce((acc, product) => acc + product.quantity, 0);

 const handleQuantityProductClick = (product) => {
  // ตรวจสอบว่าสินค้ามีสต็อกหรือไม่
  if (product.stock_quantity <= 0) {
    // แจ้งเตือนผู้ใช้ว่าสินค้าหมดสต็อก
    Swal.fire({
      title: 'สินค้าหมด!',
      text: `สินค้า "${product.product_name}" หมดสต็อก`,
      icon: 'error',
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
    });
    return; // หยุดการทำงานหากสินค้าหมด
  }
  

  // หากสินค้ามีสต็อก ทำงานต่อ
  setSelectedProduct(product);
  setSelectedProductName(product.product_name); 
  setQuantity(1); 
  setIsQuantityModalOpen(true);
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
      setDarkMode(JSON.parse(userPreference));  // Use stored preference
    } else {
      const systemPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(systemPreference);  
    }
    setIsHydrated(true);  
  }, []);
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }
  }, [darkMode, isHydrated]);


  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

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

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light'); 
  };



  // const toggleTheme = () => {
  //   setDarkMode((prevMode) => !prevMode);
  // };



  // const toggleTheme = () => {
  //   setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light')); // toggle ระหว่าง light และ dark
  // };

  const getSessionToken = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('session_token') || '';
  };

  const fetchCategories = async () => {
    if (!storeId) {
      console.error('storeId is undefined or null');
      return;
    }
  
    const sessionToken = localStorage.getItem('session');
    
    try {
      const response = await fetch(`/api/categories?store_id=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setCategories(data);
      setManageCategories(data);

    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  // Use the function when storeId is valid
  useEffect(() => {
    if (storeId) {
      fetchCategories();
    }
  }, [storeId]);

  const fetchProducts = async () => {
    if (!storeId) {
      console.error('storeId is undefined or null');
      return;
    }
  
    const sessionToken = localStorage.getItem('session');
  
    try {
      const response = await fetch(`/api/products?store_id=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setProducts(data); // Update the state with the fetched products
      setManageProducts(data); // Optional: if you need a separate state for managing products
  
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  
  // Use the function when storeId is valid
  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [storeId]);
  

  
  


  useEffect(() => {
    const validateSession = async () => {
      const sessionToken = localStorage.getItem('session'); 
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
            text: errorData.message || 'Session Token ไม่ถูกต้อง',
            confirmButtonText: 'ตกลง',
            timer: 3000, // ให้ Swal โชว์ 2 วินาที
            timerProgressBar: true,
            willClose: () => {
              // หลังจาก Swal ปิดให้ไปที่หน้า sign-in
              router.push('/session/sign-in');
            }
          });
        }
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการตรวจสอบ Session :', error);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: `ไม่สามารถตรวจสอบ Session ได้ : ${error.message}`,
          confirmButtonText: 'ตกลง',
          timer: 3000, // ให้ Swal โชว์ 2 วินาที
          timerProgressBar: true,
          willClose: () => {
            // หลังจาก Swal ปิดให้ไปที่หน้า sign-in
            router.push('/session/sign-in');
          }
        });
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

  // const filteredProducts = products.filter(product =>
  //   product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

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
    router.push('/pos/dashboard'); // Navigate to the /dashboard page
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
    const updatedProducts = selectedProducts.filter(product => product.product_name !== productName);
    setSelectedProducts(updatedProducts);
  
    localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));
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


  const { totalQuantity, totalPrice, vat, vatAmount, totalWithVAT } = calculateTotal();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการออกจากระบบจริงๆ หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33', // สีแดงเข้มสำหรับปุ่มยืนยัน
      cancelButtonColor: '#3085d6', // สีฟ้าสำหรับปุ่มยกเลิก
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      customClass: {
        title: 'font-thai',
        htmlContainer: 'font-thai',
        confirmButton: 'font-thai',
        cancelButton: 'font-thai'
      },
      willOpen: () => {
        // ปรับขนาดฟอนต์และสไตล์ต่างๆ ในที่นี้โดยใช้ inline style
        document.querySelector('.swal2-title').style.fontSize = '35px'; // ขนาดฟอนต์ของ title
        document.querySelector('.swal2-html-container').style.fontSize = '25px'; // ขนาดฟอนต์ของข้อความ
        
        // ปรับขนาดและสไตล์ของปุ่มยืนยัน (สีแดง)
        const confirmButton = document.querySelector('.swal2-confirm');
        confirmButton.style.fontSize = '24px'; // ขนาดฟอนต์ของปุ่ม
        confirmButton.style.padding = '6px 24px'; // ปรับขนาด padding ของปุ่ม
        confirmButton.style.backgroundColor = '#d33'; // สีพื้นหลังแดงเข้ม
        confirmButton.style.color = '#fff'; // สีข้อความขาว
        
        // ปรับขนาดและสไตล์ของปุ่มยกเลิก (สีฟ้า)
        const cancelButton = document.querySelector('.swal2-cancel');
        cancelButton.style.fontSize = '24px'; // ขนาดฟอนต์ของปุ่ม
        cancelButton.style.padding = '6px 24px'; // ปรับขนาด padding ของปุ่ม
        cancelButton.style.backgroundColor = '#3085d6'; // สีพื้นหลังฟ้า
        cancelButton.style.color = '#fff'; // สีข้อความขาว
      }
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
        localStorage.removeItem('storeId');
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

    let updatedProducts;
    if (product) {
      if (product.quantity > 1) {
        // หากจำนวนสินค้ามากกว่า 1 ให้ลดจำนวนลง
        updatedProducts = prevProducts.map((p) =>
          p.product_name === productName
            ? { ...p, quantity: p.quantity - 1 }
            : p
        );
      } else {
        // หากจำนวนสินค้าคือ 1 ให้ลบสินค้าออก
        updatedProducts = prevProducts.filter((p) => p.product_name !== productName);
      }
    } else {
      updatedProducts = prevProducts; // ไม่ทำอะไรหากไม่พบสินค้า
    }

    localStorage.setItem('selectedProducts', JSON.stringify(updatedProducts));

    return updatedProducts;
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
    // Get the product's price by productName (this assumes you have a way to access the product's price, e.g., from a state or a data store)
    const product = selectedProducts.find(p => p.product_name === productName); // Assuming `selectedProducts` is an array with product info
    const productPrice = product ? parseFloat(product.finalPrice || product.price) : 0; // Make sure it's a number
  
    Swal.fire({
      title: 'กรอกส่วนลด',
      html: `
        <label style="display: block;">เลือกประเภทส่วนลด</label>
        <select id="discountType" class="block w-full p-2 border rounded mb-2 bg-white text-black">
          <option value="amount">จำนวนเงิน (฿)</option>
        </select>
        <input type="text" id="discountValue" placeholder="กรุณากรอกจำนวนส่วนลด" class="block w-full p-2 border rounded bg-white text-black" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      preConfirm: () => {
        const discountValue = parseFloat(document.getElementById('discountValue').value);
        const discountType = document.getElementById('discountType').value;
  
        // Validation to check if discount is provided
        if (isNaN(discountValue)) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลส่วนลด!');
          return false;  // Prevents form submission
        }
  
        // Validation to check if the discount is greater than the product's price
        if (discountValue > productPrice) {
          Swal.showValidationMessage(`ส่วนลดต้องไม่เกินราคา ${productPrice.toFixed(2)} ฿!`);
          return false;  // Prevents form submission
        }
  
        return { discountValue, discountType };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { discountValue, discountType } = result.value;
        handleItemApplyDiscount(productName, discountValue, discountType);  // Apply the discount
      }
    });
  };
  





  const handleItemApplyDiscount = (productName, discountValue, discountType) => {
    const updatedProducts = selectedProducts.map(product => {
      if (product.product_name === productName) {
  
        let finalPrice = parseFloat(product.price) || 0;  // Ensure it's a valid number
  
        // Apply the discount based on the discount type
        if (discountType === 'percentage') {
          finalPrice -= (finalPrice * (discountValue / 100)); // Calculate percentage discount
        } else if (discountType === 'amount') {
          finalPrice -= discountValue; // Calculate discount by amount
        }
  
        // Ensure that if the discount makes the product free or the discount is equal to the price, the final price is 0
        finalPrice = finalPrice <= 0 ? 0 : finalPrice;
  
        return {
          ...product,
          discount: discountValue, // Store the discount value
          finalPrice: isNaN(finalPrice) ? 0 : finalPrice  // Ensure finalPrice is valid
        };
      }
      return product;
    });
  
    setSelectedProducts(updatedProducts);
  };

  const handleStoreSettingOpenModal = () => {
    console.log('Store Details before opening Modal: ', storeData); // ตรวจสอบค่าของ storeData ก่อนเปิด Modal
    setIsStoreSettingModalVisible(true);
  };
  
  const handleStoreSettingCloseModal = () => {
    setIsStoreSettingModalVisible(false);
  };


  const onUpdateStore = (updatedDetails) => {
    setStoreData((prevDetails) => ({
      ...prevDetails, 
      store_name: updatedDetails.store_name || prevDetails.store_name,
      store_img: updatedDetails.store_img || prevDetails.store_img,
      store_phone_no: updatedDetails.store_phone_no || prevDetails.store_phone_no,
      store_address: updatedDetails.store_address || prevDetails.store_address,
    }));
  };
  
  
  

  const handleStoreNameChange = (newName) => {
    setStoreData((prevDetails) => ({
      ...prevDetails,
      store_name: newName,
    }));
  };

  const fetchProductByBarcode = async (barcode) => {
    try {
      const sessionToken = localStorage.getItem('session');
      const storeId = localStorage.getItem('storeId');

      const response = await fetch(`/api/products?product_code=${barcode}&store_id=${storeId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });

      if (response.ok) {
        const product = await response.json();
        const existingItem = scannedItems.find(item => item.product_code === barcode);

        if (existingItem) {
          const updatedItems = scannedItems.map(item =>
            item.product_code === barcode ? { ...item, quantity: item.quantity + 1 } : item
          );
          setScannedItems(updatedItems);
        } else {
          setScannedItems([...scannedItems, { ...product, quantity: 1 }]);
        }
        setSelectedProducts(scannedItems);
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };
  
  

  // if (loading) {
  //   return <LoadingStore />; 
  // }
  


  return (
    
    <div className={`flex flex-col w-full min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      <header className={`flex items-center justify-between h-13 px-4 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-100 border-b'} shrink-0 md:px-6`}>
  {/* Section ปุ่ม Products และ Categories */}


  {/* Section ข้อมูลด้านขวา เช่น เวลาและชื่อร้าน */}
  <div className="flex flex-grow justify-center items-center font-thai">
  <span className={`text-3xl ${darkMode ? 'text-gray-100' : 'text-gray-900'} inline-flex items-center`}>
    <span className="mr-2">{currentTime}</span> 
    {storeData.store_name} 
    <button
      onClick={handleStoreSettingOpenModal}
      className={`ml-2 ${
        darkMode
          ? 'bg-teal-600 hover:bg-teal-700 text-white'
          : 'bg-teal-400 hover:bg-teal-500 text-white'
      } font-semibold py-1 px-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md`}
    >
      <Settings className="w-6 h-6" />
    </button>
  </span>
</div>





  <div className="flex items-center gap-2 sm:gap-4 ">

      <SettingsModal 
  isVisible={isStoreSettingModalVisible}
  onClose={handleStoreSettingCloseModal}
  storeId={storeData.storeId} 
  onUpdateStore={onUpdateStore}
  darkMode={darkMode}

/>


<button
            onClick={handleDashboardClick} // Add onClick event to the button
            className={`ml-2 font-thai text-2xl ${
                darkMode
                    ? 'bg-blue-800 hover:bg-blue-900 text-gray-200' // Dark mode styles
                    : 'bg-yellow-400 hover:bg-yellow-500 text-black'  // Light mode styles
            } font-semibold py-1 px-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md flex items-center`}
        >
            <LayoutDashboard className="w-6 h-6 mr-2" />
            <span>Dashboard</span>
        </button>


    {/* <button className={`btn ${darkMode ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'} gap-2`} onClick={handleDashboardClick}>
      <CircleUserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      <span className="text-sm sm:text-base">ผู้ดูแล</span>
    </button> */}

    <div className="flex items-center gap-2 sm:gap-4">
      {/* Toggle Theme */}
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

      {/* Fullscreen Toggle */}
      <div onClick={toggleFullScreen} className="group cursor-pointer inline-flex items-center justify-center transition-transform duration-300 transform hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-fullscreen" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707m0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707m-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707" />
        </svg>
      </div>

      {/* Logout */}
      <div onClick={handleLogout} className="group cursor-pointer inline-flex items-center justify-center">
        <PowerIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-600 dark:text-gray-700 transition-transform duration-300 transform group-hover:scale-50 group-hover:rotate-45" />
      </div>
    </div>
  </div>
</header>



      


      <main className={`flex flex-1 p-4 font-thai text-2xl ${darkMode ? 'bg-gray-900' : 'bg-gray-200'} md:p-3`}>
      <div className={`flex flex-col w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 h-[calc(100vh-87px)] p-4  ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-white bg-opacity-50 text-gray-900'} border rounded-md`}>
      <div className="relative flex items-center">
        <select
          className={`text-2xl select select-bordered w-[748px] py-2 px-3 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          value={selectedCustomer}
          onChange={handleSelectChange}
        >
          <option value="walkin">ลูกค้าที่มาใช้บริการในร้าน</option>
          {/* Dynamically render customer options from fetched data */}
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.phone_no} {customer.name}
            </option>
          ))}
        </select>
        <div
          className={`p-2 rounded-md cursor-pointer transition-all transform hover:scale-105 hover:bg-opacity-80 
            ${darkMode ? 'text-white hover' : 'text-black hover'}`}
        >
          <IoMdPersonAdd className="w-8 h-8" />
        </div>
      </div>
  <div className="relative flex items-center">
    <input 
      type="text" 
      placeholder="ใส่รหัสบาร์โค้ด และ กด Enter หรือ กดที่ปุ่มบาร์โค้ดด้านขวา" 
      className={`text-2xl input input-bordered w-[807px] py-2 px-3 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`} 
    />
<div
  className={`absolute right-0 top-0 p-2 rounded-md cursor-pointer transition-all transform hover:scale-105 hover:bg-opacity-80 
    ${darkMode ? 'text-white hover' : 'text-black hover'}`}
  onClick={() => {
    const barcodeScannerWindow = window.open(
      '/barcode-scanner',
      '_blank',
      'width=500,height=350,resizable=no,scrollbars=no,toolbar=no,location=no,status=no,menubar=no'
    );
    
    barcodeScannerWindow.onload = () => {
      console.log('Barcode scanner window opened');
    };

    const handleBarcodeMessage = (event) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      const { barcode } = event.data;
      console.log('Barcode received:', barcode);

      if (barcode) {
        handleAddProductByBarcode(barcode);
      }

      window.removeEventListener('message', handleBarcodeMessage);
    };

    window.addEventListener('message', handleBarcodeMessage);

    barcodeScannerWindow.onbeforeunload = () => {
      window.removeEventListener('message', handleBarcodeMessage);
    };
  }}
>
  <AiOutlineBarcode className="w-8 h-8" />
</div>





</div>

        <div className={`p-4 h-[calc(100vh-120px)] ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-md`}>
        <div className="flex justify-between items-center mb-4">


  <h2 className="text-2xl font-bold">
    คำสั่งซื้อปัจจุบัน
  </h2>

        
  <div className="flex items-center">
    <span className="badge badge-primary ml-2 text-2xl py-3 px-2 font-bold">
      {selectedProducts.length} รายการ
    </span>
    <span className="badge badge-warning ml-1 text-2xl py-3 px-2 font-bold">
      {totalItems} ชิ้น
    </span>
  </div>
</div>


<div className="h-[calc(100vh-475px)] overflow-y-auto">
  {selectedProducts.map((product, index) => (
    <div key={index} className={`relative flex items-center justify-between mb-4 text-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-lg`}>
      {/* Delete Button (moved to the left side, before the image) */}
      <FaTrash
        onClick={() => handleRemoveProduct(product.product_name)} // Ensure this function removes the product
        className="w-5 h-5 mr-2 text-red-500 cursor-pointer hover:opacity-80 transition-opacity" // Styled for larger size
      />

      {/* Product Image */}
      <img
        src={product.img ? product.img : ''}
        alt={product.product_name || 'Product Image'}
        className="w-16 h-16 object-cover rounded-lg"
      />

      {/* Product Details */}
      <div className="flex-1 ml-4">
        <h3 className="font-semibold">{product.product_name}</h3>

        {product.finalPrice < product.price ? (
    <div className="flex items-center">
      {/* Original price with strikethrough on the left */}
      <p className="text-gray-500 line-through mr-2 text-3xl">
        {(Number(product.price * product.quantity)).toFixed(2)}
      </p>
      {/* Final discounted price on the right */}
      <p className="text-orange-500 text-3xl">
        {(Number(product.finalPrice * product.quantity)).toFixed(2)} ฿
      </p>
    </div>
  ) : (
    /* If no discount or price unchanged, show just the final price */
    <p className="text-orange-500 text-3xl">
      {(Number(product.price * product.quantity)).toFixed(2)} ฿
    </p>
  )}

        {product.discount > 0 && (
          <p className="text-red-500 ml-2 text-3xl">
            -{(product.discount).toFixed(2)} ฿
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center ml-2 ">
        <button
          onClick={() => handleDecreaseQuantity(product.product_name)}
          className={`btn btn-outline btn-xs h-8 w-8 ${darkMode ? 'btn-dark' : 'btn-light'} text-lg`}
        >
          -
        </button>
        <span
  className={`mx-1 cursor-text border  ${darkMode ? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-300' : 'border-gray-400 hover:bg-gray-500 hover:border-gray-300 text-gray-900'} rounded-lg px-3 py-1 text-2xl flex items-center`}
  onClick={() => handleQuantityOpenModal(product.quantity)}
>
  <AiFillEdit className= {`${darkMode ? 'text-gray-200' : 'text-gray-1000'} ml-1 `} />
  {product.quantity}
</span>



<button
  onClick={() => handleIncreaseQuantity(product.product_name)}
  className={`btn btn-outline btn-xs h-8 w-8 ${darkMode ? 'btn-dark' : 'btn-light'} text-lg`} 
>
  +
</button>

      </div>

      {/* Modals and Additional Components */}
      <ChangeQuantityModal
        quantity={selectedQuantity}
        productName={selectedProductName}
        isModalOpen={modalOpen}
        closeModal={closeQuantityOpenModal}
        handleChangeQuantity={(quantity) => handleChangeQuantity(quantity, product.product_name)}
        handleChangeQuantityNumberClick={handleChangeQuantityNumberClick}
        darkMode={darkMode}
      />

      {/* <TicketPercent
        onClick={() => handleItemDiscountClick(product.product_name)}
        className={`absolute top-0 right-2 w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity ${darkMode ? 'text-white' : 'text-black'} hover:text-blue-500 transition-colors`}
      /> */}
    </div>
  ))}
</div>


    
    <div className={`border-t pt-4 mt-4 text-3xl  ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      <div className="flex justify-between mb-0 text-2xl ">
        <span>รวม</span>
        <span>{fullTotalPrice.toFixed(2)} ฿</span> 
      </div>
      {selectedProducts.reduce((totalDiscount, product) => totalDiscount + (product.discount || 0) * product.quantity, 0) > 0 && (
        <div className="flex justify-between mb-4 text-2xl">
          <span>ส่วนลดรวม</span>
          <div className="flex items-center text-red-500 text-2xl">
            <span className="mr-0">
              -{selectedProducts.reduce((totalDiscount, product) => totalDiscount + (product.discount || 0) * product.quantity, 0).toFixed(2)} ฿
            </span>
          </div>
        </div>
      )}
      <div className="flex justify-between font-bold text-2xl mb-3 border-b pb-4">
        <span>รวมสุทธิ</span>
        <span className="text-orange-500 text-2xl">{fullTotalPrice.toFixed(2)} ฿</span>
      </div>
      <div className="flex justify-between space-x-4">
      <button
        className={`flex items-center py-3 px-6 rounded-lg shadow-lg focus:outline-none transition-colors duration-300 
          ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white'} 
          ${selectedProducts.length === 0 ? 'opacity-50 cursor-not-allowed' : darkMode ? 'hover:bg-gray-500' : 'hover:bg-gray-600'}`}
        disabled={selectedProducts.length === 0}
        onClick={handlePauseProducts}
      >
        <Pause className="w-4 h-4 mr-2" />
        พักชั่วคราว
      </button>
      {pausedProducts.length > 0 && (
        <div className="mt-4">
          <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
            รายการที่พักไว้
          </h3>
          <ul className="mt-2">
            {pausedProducts.map((product, index) => (
              <li
                key={index}
                className={`flex items-center justify-between p-2 mb-2 rounded-lg shadow-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}
              >
                <span>{product.product_name}</span>
                <button
                  className={`ml-4 py-1 px-4 rounded-lg focus:outline-none transition-colors duration-300 ${darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}
                  onClick={() => handleContinueOrder(product)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  ดำเนินการต่อ
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
        <button
          onClick={handlePaymentClick}
          className={`flex items-center py-3 px-6 rounded-lg shadow-lg focus:outline-none transition-colors duration-300 ${darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white'} ${selectedProducts.length === 0 ? 'opacity-50 cursor-not-allowed' : darkMode ? 'hover:bg-green-500' : 'hover:bg-green-600'}`}
          disabled={selectedProducts.length === 0}
        >
          <HandCoins className="w-4 h-4 mr-2" />
          ชำระเงิน
        </button>
      </div>













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

<PaymentModal
  amount={amount}
  setAmount={setAmount}
  handleNumberClick={handleNumberClick}
  handleClear={handleClear}
  handleQuickAmount={handleQuickAmount}
  isModalOpen={isModalOpen}
  closeModal={closeModal}
  totalWithVAT={totalWithVAT}
  fullTotalPrice={fullTotalPrice} // ส่งยอดรวมราคาสินค้า
  totalDiscountItemPrice={totalDiscountItemPrice} // ส่งยอดรวมส่วนลด
  selectedProducts={selectedProducts}
  setSelectedProducts={setSelectedProducts}  // เพิ่ม setSelectedProducts ตรงนี้
  storeId={storeId}
  storeName={storeName}
  darkMode={darkMode}
  
  />



            </div>
          </div>


        </div>

        <div className={`flex flex-col flex-1 p-4 mt md:ml-3 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 h-[calc(100vh-87px)] ${darkMode ? 'bg-gray-700' : 'bg-white'} bg-opacity-50 border rounded-md`}>
        <label className={`input input-bordered flex items-center gap-2 transition-all duration-300 ease-in-out ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-black'} mb-4`}>
        <input
  type="text"
  placeholder="ค้นหาสินค้า หรือ สแกนบาร์โค้ด..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="text-2xl grow bg-transparent border-none outline-none transition-all duration-300 ease-in-out placeholder-opacity-50 focus:placeholder-opacity-0"
/>


        <AiOutlineBarcode 
          className="h-6 w-6 opacity-70 cursor-pointer transition-opacity duration-300 ease-in-out"
          onClick={barcodeToggleModal} // เปิด Modal เมื่อคลิก
        />
      </label>

      <BarcodeScannerModal 
  isBarcodeModalOpen={isBarcodeModalOpen} 
  barcodeToggleModal={barcodeToggleModal} 
  darkMode={darkMode} 
/>





<div className="flex justify-between items-center mt-[-15px]">
<div className="ml-[-12px] mr-[-10px]">
    <ul className="text-xl menu lg:menu-horizontal rounded-box p-2 transition-all duration-300 ease-in-out flex sm:flex-nowrap">
        <li className="bg-gray-300 rounded-lg m-1">
            <a
                onClick={openCategoryGrid}
                className={`flex justify-center font-bold items-center transition duration-300 transform hover:scale-105 ${
                    darkMode ? 'text-white' : 'text-black'
                }`}
            >
                <LayoutList className="w-6 h-6" />
            
            </a>
        </li>

        {/* Modal สำหรับ Category Grid */}
        {isCategoryGridOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div
                    className={`rounded-lg p-6 w-4/5 max-w-3xl relative transition-all ${
                        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
                    }`}
                >
                    <button
                        className={`absolute top-2 right-2 transition-colors ${
                            darkMode ? 'text-gray-300 hover:text-gray-500' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={closeCategoryGrid}
                    >
                        ✕
                    </button>
                    <h2 className="text-2xl font-bold mb-4">เลือกหมวดหมู่</h2>

                    {/* การค้นหา */}
                    <input
                        type="text"
                        placeholder="ค้นหาหมวดหมู่..."
                        className={`mb-4 p-2 w-full border rounded-md ${
                            darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'
                        }`}
                        onChange={(e) => setSearchCategoriesTerm(e.target.value)}
                    />

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* เพิ่มตัวเลือก "ทั้งหมด" */}
                        <div
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedCategory === null
                                    ? darkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
                                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-black hover:bg-gray-200'
                            }`}
                            onClick={() => handleCategorySelect(null)}
                        >
                            <div className="text-center font-bold">ทั้งหมด</div>
                        </div>

                        {/* แสดงรายการหมวดหมู่ที่กรองแล้ว */}
                        {categories
                            .filter((category) =>
                              searchCategoriesTerm.trim() // ตรวจสอบว่าคีย์เวิร์ดการค้นหาไม่เป็นช่องว่าง
                                  ? category.name.toLowerCase().includes(searchCategoriesTerm.trim().toLowerCase()) // ใช้ searchCategoriesTerm
                                  : true // ถ้าเป็นช่องว่าง แสดงผลทั้งหมด
                            )
                            .map((category) => (
                                <div
                                    key={category.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                        selectedCategory === category.id
                                            ? darkMode ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
                                            : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-black hover:bg-gray-200'
                                    }`}
                                    onClick={() => handleCategorySelect(category.id)}
                                >
                                    {/* แสดงภาพของหมวดหมู่ */}
                                    {category.category_img && (
                                        <img
                                            src={category.category_img}
                                            alt={category.name}
                                            className="w-full h-32 object-cover rounded-md mb-2"
                                        />
                                    )}
                                    {/* แสดงชื่อหมวดหมู่ */}
                                    <div className="text-center">{category.name}</div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        )}
    </ul>
</div>



    
<div className="flex-grow overflow-x-auto max-w-full whitespace-nowrap">





  <ul className="text-xl menu lg:menu-horizontal rounded-box p-2 transition-all duration-300 ease-in-out flex sm:flex-nowrap ">

    {/* Category Filter */}
    <li className="border border-gray-300 rounded-lg m-1 ">
      <a
        onClick={() => setSelectedCategory(null)}
        className={`${
          selectedCategory === null
            ? `${darkMode ? 'bg-gray-700 text-white' : 'bg-blue-100 border-blue-300'} font-bold`
            : `${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-black border-gray-300'}`
        } transition duration-300 transform hover:scale-105 px-3 sm:px-4 py-2`}
      >
        ทั้งหมด
      </a>
    </li>
    {Array.isArray(categories) && categories.map((category) => (
    <li key={category.id} className="border border-gray-300 rounded-lg m-1">
      <a
        onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
        className={`${
          selectedCategory === category.id
            ? `${darkMode ? 'bg-gray-700 text-white' : 'bg-blue-100 border-blue-300'} font-bold`
            : `${darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-black border-gray-300'}`
        } transition duration-300 transform hover:scale-105 px-3 sm:px-4 py-2`}
      >
        {category.name}
      </a>
    </li>
  ))}
  </ul>
</div>


  {/* Container for both Dropdown and Reload Button */}
  <div className="flex items-center ml-auto space-x-2 text-xl">
    {/* Reload Button */}
    <button
      className="flex items-center gap-2 p-2 rounded-md bg-green-500 hover:bg-green-600 active:scale-95 transition-all ml-2"
      onClick={handleReload}
    >
      <RxReload />
    </button>

    {/* Dropdown Menu Button for sorting */}
    <div className="relative" ref={sortDropdownRef}>
      <button
        className={`flex items-center gap-2 p-2 rounded-md transition-all transform 
          ${filterDropdownOpen ? (darkMode ? 'bg-gray-700' : 'bg-blue-700 shadow-lg') : (darkMode ? 'bg-gray-600' : 'bg-blue-500')} 
          hover:${darkMode ? 'bg-gray-500' : 'bg-blue-600'} active:scale-95`}
        onClick={handleDropdownToggle}
      >
        <ListFilter className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {filterDropdownOpen && (
        <ul
          className={`absolute z-50 mt-2 shadow-lg rounded-md py-1 w-48 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          style={{
            maxHeight: '200px', // Set max height for the dropdown
            overflowY: 'auto',  // Enable scrolling if content exceeds max height
            right: 0,           // Align dropdown to the right of the button
          }}
        >
          <li>
            <a
              className={`block px-4 py-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${sortOption === 'latest' ? 'font-bold' : ''}`}
              onClick={() => handleSortOption('latest')}
            >
              <div className="flex items-center gap-x-2">
                <ClockArrowUp className={`${darkMode ? 'text-white' : 'text-black'} w-4 h-4`} />
                เพิ่มล่าสุด
              </div>
            </a>
          </li>
          <li>
            <a
              className={`block px-4 py-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${sortOption === 'price-low-high' ? 'font-bold' : ''}`}
              onClick={() => handleSortOption('price-low-high')}
            >
              <div className="flex items-center gap-x-2">
                <ArrowDownNarrowWide className={`${darkMode ? 'text-white' : 'text-black'} w-4 h-4`} />
                ราคาน้อยไปมาก
              </div>
            </a>
          </li>
          <li>
            <a
              className={`block px-4 py-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${sortOption === 'price-high-low' ? 'font-bold' : ''}`}
              onClick={() => handleSortOption('price-high-low')}
            >
              <div className="flex items-center gap-x-2">
                <ArrowUpNarrowWide className={`${darkMode ? 'text-white' : 'text-black'} w-4 h-4`} />
                ราคามากไปน้อย
              </div>
            </a>
          </li>
          {/* Filter for Out of Stock */}
      <li>
        <a
          className={`block px-4 py-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${sortOption === 'out-of-stock' ? 'font-bold' : ''}`}
          onClick={() => handleSortOption('out-of-stock')}
        >
          <div className="flex items-center gap-x-2">
            <LuPackageX className={`${darkMode ? 'text-white' : 'text-black'} w-4 h-4`} />
            สินค้าหมด
          </div>
        </a>
      </li>
        </ul>
      )}
    </div>
  </div>
</div>



{/* Product Grid */}
<div className="flex-grow overflow-y-auto max-h-[calc(100vh-200px)] text-3xl">
  {loading ? (
    <div className="flex justify-center items-center h-64">
      <span className="loading loading-ring loading-lg"></span>
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`relative card ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-black'} shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer h-full`} // Use relative on the card
            onClick={() => handleQuantityProductClick(product)}
          >
            {/* Stock Badge */}
            <span 
  className={`absolute top-[-6px] right-[-6px]  ${
    product.stock_quantity === 0 
      ? darkMode 
        ? 'bg-red-600'  // สีแดงเมื่อโหมดมืดและสินค้าหมด
        : 'bg-red-500'  // สีแดงเมื่อโหมดสว่างและสินค้าหมด
      : product.stock_quantity <= 5 
      ? darkMode 
        ? 'bg-yellow-600'  // สีเหลืองเมื่อโหมดมืดและสินค้าใกล้หมด
        : 'bg-yellow-500'  // สีเหลืองเมื่อโหมดสว่างและสินค้าใกล้หมด
      : darkMode 
        ? 'bg-green-600'  // สีเขียวเมื่อโหมดมืดและสินค้ามีพอเพียง
        : 'bg-green-500'  // สีเขียวเมื่อโหมดสว่างและสินค้ามีพอเพียง
    } 
    font-semibold text-white text-lg px-2 py-0 rounded-full mt-2 mr-2 z-10 flex items-center gap-1`}
>
  <Package className="w-4 h-4" />
  {product.stock_quantity > 0 ? product.stock_quantity : 'สินค้าหมด'}

  {/* แสดง <FaArrowTrendDown /> เฉพาะเมื่อ stock_quantity มากกว่า 0 และน้อยกว่าหรือเท่ากับ 5 */}
  {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
    <FaArrowTrendDown />
  )}
</span>




<figure className="relative w-full h-32 sm:h-36 md:h-24 lg:h-32 overflow-hidden mt-4">
  <img
    src={product.img ? `${product.img}` : '/default-image-url.png'}  // Ensure default image if product.img is null
    alt={product.product_name || 'Product Image'}
    className="w-full h-full object-contain"
  />
</figure>



            <div className="card-body flex flex-col p-2 flex-grow">
              {/* Product Name */}
              <h2 
                className={`card-title text-xl font-semibold ${darkMode ? 'text-gray-100' : 'text-black'} mb-6 min-h-[40px]`} 
                style={{
                  whiteSpace: 'nowrap',       
                  overflow: 'hidden',         
                  textOverflow: 'ellipsis',   
                }}
              >
                {product.product_name || 'Product Name'}
              </h2>
            </div>

            <p className={`absolute bottom-2 left-2 text-2xl ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
              ฿{product.price || 'N/A'}
            </p>
          </div>
        ))
      ) : (
        <div className="col-span-full flex justify-center items-center h-32">
          <p className={`text-2xl font-semibold ${darkMode ? 'text-gray-100' : 'text-black'} mb-4`}>
            ไม่มีสินค้าที่ต้องแสดง
          </p>
        </div>
      )}






                  {/* <div
                    className="card bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col cursor-pointer items-center justify-center opacity-50 hover:opacity-80"
                    style={{ maxWidth: '100%', minWidth: '0', flexGrow: 1 }} // ปรับขนาดให้ยืดหยุ่น
                  >
                    <div className="w-full h-32 flex items-center justify-center">
                      <span className="text-3xl text-gray-500">+</span>
                    </div>
                    <div className="card-body text-black flex flex-col p-2 flex-grow items-center">
                      <p className="text-sm font-semibold">เพิ่มสินค้า</p>
                    </div>
                  </div> */}

            </div>
              )}



{isQuantityModalOpen && (
  <QuantityModal
    quantity={quantity}
    productName={selectedProductName} 
    stockQuantity={selectedProduct.stock_quantity} // ส่งจำนวน stock ของสินค้าปัจจุบัน
    setQuantity={setQuantity}
    handleQuantityNumberClick={handleQuantityNumberClick}
    handleQuantityClear={handleQuantityClear}
    isModalOpen={isQuantityModalOpen}
    closeModal={closeQuantityModal}
    handleAddQuantity={handleAddQuantity}
    darkMode={darkMode} 
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