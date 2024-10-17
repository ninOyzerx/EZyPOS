import { CreditCard, X, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import { FaSpinner } from 'react-icons/fa'; // ใช้ spinner จาก react-icons
import './styles.css';


export default function PaymentModal({ 
  amount, 
  setAmount, 
  handleNumberClick, 
  handleClear, 
  handleQuickAmount, 
  isModalOpen, 
  closeModal,
  fullTotalPrice, 
  selectedProducts,
  setSelectedProducts, 
  storeId, 
  storeName,
  darkMode

}) {
  const [showModal, setShowModal] = useState(isModalOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [change, setChange] = useState(0);
  const [date] = useState(new Date().toLocaleString());
  const [paymentMethod] = useState('เงินสด');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false); // State สำหรับ loading
  const [transactionId, setTransactionId] = useState(''); // Correct declaration


  



  const calculatedTotalPrice = fullTotalPrice;

  const vatRate = 0.07;

const subtotalBeforeVAT = fullTotalPrice / (1 + vatRate);

const vatAmount = fullTotalPrice - subtotalBeforeVAT;
const [storeData, setStoreData] = useState(null); // Store data from API


  // New state variables for settings retrieved from localStorage
  const [showStoreImage, setShowStoreImage] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);

  // Retrieve settings from localStorage
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('receiptSettings'));
    if (savedSettings) {
      setShowStoreImage(savedSettings.showStoreImage);
      setShowAddress(savedSettings.showAddress);
      setShowPhoneNumber(savedSettings.showPhoneNumber);
    }
  }, []);  // Runs when the component mounts



useEffect(() => {
  const fetchStoreData = async () => {
    try {
      const sessionToken = localStorage.getItem('session');
      const storeId = localStorage.getItem('storeId'); // ตรวจสอบว่า store_id ถูกเก็บใน localStorage หรือไม่

      if (!storeId) {
        throw new Error('Store ID not found');
      }

      const response = await fetch(`/api/stores/detail?store_id=${storeId}`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();
      setStoreData(data); // บันทึกข้อมูลร้านค้าใน state
    } catch (error) {
      console.error('Error fetching store data:', error);
    }
  };

  fetchStoreData();
}, []);


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
  

  useEffect(() => {
    if (isModalOpen) {
      setShowModal(true);
      setIsClosing(false);
      
      // Generate and set a new formatted transaction ID each time the modal opens
      const newTransactionId = formatTransactionId(uuidv4());
      setTransactionId(newTransactionId);
    } else {
      setIsClosing(true);
      setTimeout(() => setShowModal(false), 300);
    }
  }, [isModalOpen]);

  const handleFullPayment = () => {
    setAmount(fullTotalPrice.toFixed(2));
  };

  const formatTransactionId = (uuid) => {
    const segments = uuid.split('-'); 
    return `${segments[0].substring(0, 5)}-${segments[1].substring(0, 5)}-${segments[2].substring(0, 5)}-${segments[3].substring(0, 5)}`;
  };


  const handlePayment = async () => {
    setLoading(true); // เริ่มโหลด
  
    const parsedAmount = parseFloat(amount);
  
    // Validate input amount
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Swal.fire({
        title: 'ผิดพลาด!',
        text: 'กรุณาระบุจำนวนเงินที่ถูกต้อง',
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      setLoading(false); // หยุดโหลด
      return;
    }
  
    // ตรวจสอบสต็อกสินค้าว่าหมดหรือไม่
    const outOfStockItems = selectedProducts.filter((product) => product.stock_quantity === 0);
  
    if (outOfStockItems.length > 0) {
      Swal.fire({
        title: 'สินค้าหมดสต็อก!',
        text: `สินค้าบางรายการหมดสต็อก: ${outOfStockItems.map(item => item.product_name).join(', ')}`,
        icon: 'error',
        confirmButtonText: 'ตกลง',
      });
      setLoading(false); // หยุดโหลด
      return; // หยุดการทำงานของการชำระเงิน
    }
  
    // ใช้ setTimeout เพื่อจำลองการโหลดนาน 2 วินาที (2000 มิลลิวินาที)
    setTimeout(async () => {
      // Calculate change
      const calculatedChange = parsedAmount - fullTotalPrice;
  
      if (calculatedChange < 0) {
        Swal.fire({
          title: 'ผิดพลาด!',
          text: 'จำนวนเงินที่ให้ไม่เพียงพอ',
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
        setLoading(false); // หยุดโหลด
        return;
      }
      const items = selectedProducts.map(product => ({
        productId: product.id,
        name: product.product_name,
        priceBeforeDiscount: product.price * product.quantity,
        fullTotalPrice: product.price * product.quantity - (product.discount || 0) * product.quantity,
        discountAmount: product.discount || 0,
        quantity: product.quantity
      }));
  
      const data = {
        amount: parsedAmount,
        paymentMethod: 'เงินสด',
        change: calculatedChange,
        transactionId: transactionId,
        items: items,
        storeId: storeId, // Include storeId
        totalBeforeVAT: fullTotalPrice
    };
    
  
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        const result = await response.json();
        setChange(calculatedChange);
        setPaymentData(data);
        // setShowReceipt(true);

        // localStorage.removeItem('selectedProducts'); 
        Swal.fire({
          icon: 'success',
          title: `ทอนเงินจำนวน <br>${calculatedChange.toFixed(2)}฿`,
          confirmButtonText: 'ตกลง',
        }).then(() => {
          // แสดงใบเสร็จหลังจากคลิกปุ่ม 'ตกลง' ใน Swal
          setShowReceipt(true);
          localStorage.removeItem('selectedProducts');

        });

      } else {
        const errorData = await response.json();
        Swal.fire({
          title: 'ผิดพลาด!',
          text: 'เกิดข้อผิดพลาดในการชำระเงิน: ' + errorData.error,
          icon: 'error',
          confirmButtonText: 'ตกลง',
        });
      }
      setLoading(false); // หยุดโหลดเมื่อเสร็จสิ้น
    }, 2000); // โหลดเป็นเวลา 2 วินาที
  };

  


  const closeReceipt = () => {
    setShowReceipt(false);
  
    // Clear selected products from the state and localStorage
    setSelectedProducts([]);
    localStorage.removeItem('selectedProducts');  
  
    setAmount('0'); // Reset the amount input field
    setPaymentData(null); // Clear payment data
    setChange(0); // Reset the change
    setLoading(false); // Stop any potential loading states
  

    closeModal();
  };
  
  


const closeModalWithBackground = (e) => {
  if (e.target === e.currentTarget) {
    closeModal();
  }
};

  if (!showModal) return null;

  return (
<div 
  className={`fixed inset-0 z-50 flex items-center justify-center ${darkMode ? 'bg-black bg-opacity-80' : 'bg-black bg-opacity-50'}`} 
  onClick={closeModalWithBackground}
>
  <div 
    className={`p-4 rounded-lg shadow-lg w-full max-w-lg mx-4 sm:mx-auto relative 
      transform transition-transform duration-300 ${isClosing ? 'slide-out' : 'scale-100 animate-modal'} 
      ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`} // Apply dark mode styles here
    onClick={(e) => e.stopPropagation()}
  >
    <button 
      onClick={closeModal} 
      className={`absolute top-4 right-4 ${darkMode ? 'text-red-300 hover:text-red-500' : 'text-red-500 hover:text-red-700'}`}
    >
      <X className="h-6 w-6" />
    </button>

    <h2 className="text-3xl font-bold mb-4 text-center">เลือกวิธีการชำระเงิน</h2>

    <div className="flex justify-between mb-4 text-2xl">
      <button variant="ghost" className="flex flex-col items-center">
        <CreditCard className={`h-6 w-6 ${darkMode ? 'text-blue-300' : 'text-blue-500'}`} />
        <span className="text-xl mt-1">เงินสด</span>
      </button>
    </div>

    <input 
      value={amount} 
      readOnly 
      className={`text-right text-3xl font-bold mb-4 w-full rounded-lg p-2 border ${darkMode ? 'bg-gray-900 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
    />

      {/* แสดงราคาสินค้าก่อน VAT, VAT 7%, และยอดรวม */}
      <div className={`text-right text-2xl font-bold mb-4 ${darkMode ? 'text-orange-400' : 'text-orange-500'}`}>
        ยอดรวมทั้งหมด: ฿{fullTotalPrice.toFixed(2)}
        <br />
        <div className={` text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>
          ({numberToThaiText(fullTotalPrice)})
        </div>
      </div>
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => (
        <button 
          key={index} 
          onClick={() => handleNumberClick(num.toString())}
          className={`h-12 text-3xl rounded-lg transition ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
        >
          {num}
        </button>
      ))}
      <button 
        onClick={handleClear} 
        className={`h-12 rounded-lg transition ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}
      >
        C
      </button>
      <button 
        onClick={() => handleNumberClick('0')} 
        className={`h-12 text-3xl rounded-lg transition ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
      >
        0
      </button>
      <button 
        onClick={() => handleQuickAmount('1000')} 
        className={`h-12 rounded-lg transition ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
      >
        1,000
      </button>
      <button 
        onClick={() => handleQuickAmount('500')} 
        className={`h-12 rounded-lg transition ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
      >
        500
      </button>
      <button 
        onClick={() => handleQuickAmount('100')} 
        className={`h-12 rounded-lg transition ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
      >
        100
      </button>
      <button 
        onClick={() => handleQuickAmount('50')} 
        className={`h-12 rounded-lg transition ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
      >
        50
      </button>
      <button 
        onClick={() => handleQuickAmount('20')} 
        className={`h-12 rounded-lg transition ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
      >
        20
      </button>
      <button 
        onClick={handleFullPayment} 
        className={`flex-1 py-2 rounded-lg transition mr-2 ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
      >
        ชำระเต็มจำนวน
      </button>
    </div>

    <div className="flex justify-between mt-4">
    <button
          onClick={handlePayment}
          className={`flex-1 py-2 rounded-lg transition ml-2 ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={loading} // Disable ปุ่มเมื่อ loading อยู่
        >
 {loading ? (
  <FaSpinner className="h-5 w-5 animate-spin mx-auto" /> // ใช้ spinner จาก react-icons
) : (
  'ตกลง'
)}

        </button>
    </div>

  </div>



    {/* ใบเสร็จ */}
    {showReceipt && paymentData && storeData && (
  <Receipt
    storeInfo={{
      name: storeData.store_name,
      address: showAddress ? (() => {
        try {
          const addressData = JSON.parse(storeData.store_address);
          const address = addressData.address || 'ไม่ระบุที่อยู่';
          const district = addressData.district ? `ต.${addressData.district}` : 'ไม่ระบุตำบล';
          const amphoe = addressData.amphoe ? `อ.${addressData.amphoe}` : 'ไม่ระบุอำเภอ';
          const province = addressData.province ? `จ.${addressData.province}` : 'ไม่ระบุจังหวัด';
          const postalCode = addressData.postal_code || 'ไม่ระบุรหัสไปรษณีย์';

          return `${address} ${district} ${amphoe} ${province} ${postalCode}`;
        } catch (error) {
          console.error('Error parsing address:', error);
          return storeData.store_address || 'ไม่ระบุที่อยู่';
        }
      })() : null, 
      phone: showPhoneNumber ? storeData.store_phone_no || 'ไม่ระบุเบอร์โทรศัพท์' : null, 
      image: showStoreImage ? storeData.store_img || null : null,
    }}
    transactionId={transactionId} // Pass the transaction ID here
    date={date}
    items={paymentData.items}
    subtotal={subtotalBeforeVAT.toFixed(2)}
    tax={vatAmount.toFixed(2)}
    total={fullTotalPrice.toFixed(2)}
    paymentMethod={paymentMethod}
    change={change}
    amountGiven={amount}
    closeReceipt={closeReceipt}
    darkMode={darkMode}
  />
)}




  </div>
  );
}

function Receipt({ 
  storeInfo, 
  transactionId, 
  date, 
  items, 
  subtotal, 
  tax, 
  total, 
  paymentMethod, 
  change,
  amountGiven,
  closeReceipt,
  darkMode
}) {
  const formattedDate = new Date(date).toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, 
  });

  const printReceipt = () => {
    const printContents = document.getElementById('receipt-content').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  };

  const handleCloseReceipt = (e) => {
    if (e.target === e.currentTarget) {
      closeReceipt();
    }
  };


  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleCloseReceipt}
    >
      <div 
        className="w-full max-w-xs mx-auto bg-white text-black shadow-lg p-6 rounded-lg relative receipt-print"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mt-4">
          <div
            onClick={closeReceipt}
            className="cursor-pointer text-blue-500 hover:text-blue-600 transition"
            aria-label="ปิดใบเสร็จ"          
          >
            <X className="h-5 w-5" />
          </div>

          <div 
            onClick={printReceipt} 
            className="cursor-pointer text-blue-500 hover:text-blue-600 transition"
            aria-label="พิมพ์ใบเสร็จ"
          >
            <Printer className="h-5 w-5" />
          </div>
        </div>
        
        {/* Scrollable receipt content */}
        <div id="receipt-content" className="receipt-content overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* <h1 className="text-3xl font-bold mb-0 text-center">EZyPOS</h1> */}
          <h1 className="text-3xl font-bold mb-3 text-center">ใบเสร็จรับเงิน</h1>

          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold">{storeInfo.name}</h2>
            {storeInfo.image && (
              <div className="flex justify-center mb-2">
                <img
                  src={storeInfo.image}
                  alt="Store Logo"
                  className="w-20 h-20 object-cover rounded-full shadow-lg"
                />
              </div>
            )}
            <p className="text-xl font-semibold text-gray-500">{storeInfo.address}</p>
            <p className="text-xl font-semibold text-gray-500">{storeInfo.phone}</p>
            <p className="text-xl font-semibold text-gray-500">วันที่: {formattedDate}</p>
          </div>

          <div className="my-4 border-t border-gray-800 border-dashed"></div>
          <h3 className="font-bold mb-2 text-center">รายการสินค้า</h3>

          {/* Items List */}
          <ul className="mb-4">
            {items.map((item, index) => (
              <li key={index} className="flex justify-between mb-1">
                <span className="text-xl">
                  <strong>{item.quantity}x</strong> {item.name}
                </span>
                <span className="text-xl">฿{item.priceBeforeDiscount.toFixed(2)}</span> 
              </li>
            ))}
          </ul>

          {/* Discount List */}
          <ul className="mb-4">
            {items.map((item, index) => (
              item.discountAmount > 0 && (
                <li key={index} className="flex justify-between mb-1">
                  <span className="text-xl leading-tight truncate w-3/4"><strong>ส่วนลด</strong> {item.name}</span> 
                  <span className="text-xl leading-tight">-฿{item.discountAmount.toFixed(2)}</span>
                </li>
              )
            ))}
          </ul>

          <div className="my-4 border-t border-gray-800 border-dashed"></div>

          {/* Total and Payment Summary */}
          <div className="flex justify-between text-2xl">
            <span>ยอดรวมก่อน VAT</span>
            <span>฿{subtotal ? parseFloat(subtotal).toFixed(2) : '0.00'}</span>
          </div>
          <div className="flex justify-between text-2xl">
            <span>VAT (7%)</span>
            <span>฿{tax ? parseFloat(tax).toFixed(2) : '0.00'}</span>
          </div>
          <div className="flex justify-between font-bold text-3xl">
            <span>สุทธิ</span>
            <span>฿{total ? parseFloat(total).toFixed(2) : '0.00'}</span>
          </div>

          <div className="my-4 border-t border-gray-800 border-dashed"></div>

          <div className="flex justify-between text-2xl">
            <span>ชำระเงินด้วย</span>
            <span>{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-2xl">
            <span>รับมา</span>
            <span>฿{amountGiven ? parseFloat(amountGiven).toFixed(2) : '0.00'}</span>
          </div>
          <div className="flex justify-between text-2xl">
            <span>เงินทอน</span>
            <span>฿{change ? parseFloat(change).toFixed(2) : '0.00'}</span>
          </div>

          <div className="my-4 border-t border-gray-800 border-dashed"></div>
          <div className="text-xl fold-semibold text-center text-gray-500 mb-2">
            <p>ขอบคุณที่ใช้บริการ!</p>
            <p>กรุณาตรวจสอบใบเสร็จให้เรียบร้อย</p>
            <p>ถ้าท่านมีข้อสงสัยโปรดติดต่อเรา</p>
          </div>
          <div className="text-xs text-center text-gray-500">
            <p className="text-xl font-semibold text-gray-500">รหัสการทำรายการ: {transactionId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}





