'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [total, setTotal] = useState(10000);
  const [step, setStep] = useState(1);
  const [darkMode, setDarkMode] = useState(true);

  // Personal Info
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // User Account Info
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // Default to 'card'

  const [errors, setErrors] = useState({}); // State to store form validation errors

  useEffect(() => {
    const totalAmount = searchParams.get('total');
    if (totalAmount) {
      setTotal(totalAmount);
    }
  }, [searchParams]);

  const steps = [
    { id: 1, name: 'ข้อมูลส่วนตัว' },  // Personal information
    { id: 2, name: 'ข้อมูลผู้ใช้งาน' }, // User account information
    { id: 3, name: 'วิธีการชำระเงิน' }, // Payment methods
    { id: 4, name: 'ยืนยันการสั่งซื้อ' } // Confirmation
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!fname.trim()) newErrors.fname = 'กรุณากรอกชื่อ';
    if (!lname.trim()) newErrors.lname = 'กรุณากรอกนามสกุล';
    if (!address.trim()) newErrors.address = 'กรุณากรอกที่อยู่';
    if (!phone.trim()) newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'กรุณากรอกอีเมล';
    if (!username.trim()) newErrors.username = 'กรุณากรอกชื่อผู้ใช้งาน';
    if (!password.trim()) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    if (password !== confirmPassword) newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(step + 1);
    } else if (step === 2 && validateStep2()) {
      setStep(step + 1);
    } else if (step > 2) {
      setStep(step + 1);
    }
  };

  const handlePayment = async () => {
    // Validate required fields
    if (!fname || !lname || !email || !username || !phone || !password || !paymentMethod || !total) {
      alert('Please fill in all required fields.');
      return;
    }
  
    const userData = {
      fname,
      lname,
      email,
      username,
      phone,
      password, // Include password field
      paymentMethod,
      total,
    };
  
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData), // Send password along with other user data
      });
  
      const { sessionId, url } = await response.json();
  
      if (url) {
        window.location.href = url; // Redirect to Stripe checkout page
      } else {
        alert('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };
  
  

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="form-control grid grid-cols-2 gap-4 font-thai">
          <div className="space-y-2">
            <label
              className={`label text-3xl ${darkMode ? 'text-white' : 'text-black'}`}
              htmlFor="fname"
            >
              ชื่อ
            </label>
            <input
              id="fname"
              className={`text-2xl input input-bordered w-full ${
                errors.fname ? 'border-red-500' : ''
              } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
              placeholder="ชื่อ"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
            />
            {errors.fname && (
              <p className="text-red-500 text-xl">{errors.fname}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              className={`label text-3xl ${darkMode ? 'text-white' : 'text-black'}`}
              htmlFor="lname"
            >
              นามสกุล
            </label>
            <input
              id="lname"
              className={`text-2xl input input-bordered w-full ${
                errors.lname ? 'border-red-500' : ''
              } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
              placeholder="นามสกุล"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
            />
            {errors.lname && (
              <p className="text-red-500 text-xl">{errors.lname}</p>
            )}
          </div>
        </div>

        <div className="form-control grid grid-cols-2 gap-4 space-y-2 font-thai">
          <div className="space-y-2">
            <label
              className={`label text-3xl ${darkMode ? 'text-white' : 'text-black'}`}
              htmlFor="address"
            >
              ที่อยู่
            </label>
            <textarea
              id="address"
              className={`textarea text-2xl textarea-bordered w-full ${
                errors.address ? 'border-red-500' : ''
              } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
              placeholder="บ้านเลขที่ หมู่บ้าน ซอย ถนน หมู่ ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="4"
            />
            {errors.address && (
              <p className="text-red-500 text-xl">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              className={`label text-3xl ${darkMode ? 'text-white' : 'text-black'}`}
              htmlFor="phone_no"
            >
              เบอร์โทรศัพท์
            </label>
            <input
              id="phone_no"
              className={`text-2xl input input-bordered w-full ${
                errors.phone ? 'border-red-500' : ''
              } ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
              placeholder="0812345678 (ไม่ต้องใส่ขีด)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className="text-red-500 text-xl">{errors.phone}</p>
            )}
          </div>
        </div>

        
          </>
        );
      case 2:
        return (
          <>
{/* Section: ข้อมูลผู้ใช้งานระบบ */}
<h3 className="text-3xl font-thai text-center font-bold mb-4 font-thai">ข้อมูลผู้ใช้งานระบบ</h3>
<div className="form-control grid grid-cols-2 gap-4 font-thai">
  <div className="space-y-2">
    <label className="label text-3xl" htmlFor="email">อีเมล</label>
    <input
      id="email"
      type="email"
      className={`text-2xl input input-bordered w-full ${errors.email ? 'border-red-500' : ''}`}
      placeholder="you@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />
    {errors.email && <p className="text-red-500 text-xl">{errors.email}</p>}
  </div>
  <div className="space-y-2">
    <label className="label text-3xl" htmlFor="username">ชื่อผู้ใช้งาน</label>
    <input
      id="username"
      className={`text-2xl input input-bordered w-full ${errors.username ? 'border-red-500' : ''}`}
      placeholder="user101"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
    {errors.username && <p className="text-red-500 text-xl">{errors.username}</p>}
  </div>
</div>
<div className="form-control grid grid-cols-2 gap-4 font-thai">
  <div className="space-y-2">
    <label className="label text-3xl" htmlFor="password">รหัสผ่าน</label>
    <input
      id="password"
      type="password"
      className={`text-2xl input input-bordered w-full ${errors.password ? 'border-red-500' : ''}`}
      placeholder="รหัสผ่าน"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    {errors.password && <p className="text-red-500 text-xl">{errors.password}</p>}
  </div>
  <div className="space-y-2">
    <label className="label text-3xl" htmlFor="confirmPassword">ยืนยันรหัสผ่าน</label>
    <input
      id="confirmPassword"
      type="password"
      className={`text-2xl input input-bordered w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
      placeholder="ยืนยันรหัสผ่าน"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />
    {errors.confirmPassword && <p className="text-red-500 text-xl">{errors.confirmPassword}</p>}
  </div>
</div>

{/* Section: ข้อมูลร้านค้า */}
{/* <h3 className="text-3xl font-thai text-center font-bold mt-8 mb-4">ข้อมูลร้านค้า</h3>
<div className="form-control space-y-2 font-thai">
  <label className="label text-3xl" htmlFor="storeName">ชื่อร้านค้า</label>
  <input
    id="storeName"
    className={`text-2xl input input-bordered w-full ${errors.storeName ? 'border-red-500' : ''}`}
    placeholder="ชื่อร้านค้า"
    // value={storeName}
    // onChange={(e) => setStoreName(e.target.value)}
  />
  {errors.storeName && <p className="text-red-500 text-sm">{errors.storeName}</p>}
</div>
<div className="form-control space-y-2 font-thai">
  <label className="label text-3xl" htmlFor="storeAddress">ที่อยู่ร้านค้า</label>
  <textarea
    id="storeAddress"
    className={`text-2xl textarea textarea-bordered w-full ${errors.storeAddress ? 'border-red-500' : ''}`}
    placeholder="ที่อยู่ร้านค้า"
    // value={storeAddress}
    // onChange={(e) => setStoreAddress(e.target.value)}
    rows="4"
  />
  {errors.storeAddress && <p className="text-red-500 text-sm">{errors.storeAddress}</p>}
</div>
<div className="form-control space-y-2 font-thai">
  <label className="label text-3xl" htmlFor="storePhone">เบอร์โทรศัพท์ร้านค้า</label>
  <input
    id="storePhone"
    className={`text-2xl input input-bordered w-full ${errors.storePhone ? 'border-red-500' : ''}`}
    placeholder="เบอร์โทรศัพท์ร้านค้า"
    // value={storePhone}
    // onChange={(e) => setStorePhone(e.target.value)}
  />
  {errors.storePhone && <p className="text-red-500 text-sm">{errors.storePhone}</p>}
</div> */}

          </>
        );
      case 3:
        return (
          <div className="form-control space-y-2 font-thai">
            <label className="label text-3xl">วิธีการชำระเงิน</label>
            <div className="form-control">
            <label className="cursor-pointer label flex items-center justify-between">
            <div className="flex items-center">
            <input
                  type="radio"
                  name="payment"
                  value="card"
                  className="radio checked:bg-blue-500"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span className="label-text text-3xl ml-3">บัตรเครดิต/เดบิต</span>
                </div>
                <img
    src="/img/debit-credit-logo.png"
    alt="PromptPay Logo"
    className="w-30 h-10 ml-auto"
  />
              </label>
              <label className="cursor-pointer label flex items-center justify-between">
  <div className="flex items-center">
    <input
      type="radio"
      name="payment"
      value="promptpay"
      className="radio checked:bg-blue-500"
      checked={paymentMethod === 'promptpay'}
      onChange={() => setPaymentMethod('promptpay')}
    />
    <span className="label-text text-3xl ml-3">พร้อมเพย์</span>
  </div>
  <img
    src="/img/prompt-pay-logo.png"
    alt="PromptPay Logo"
    className="w-30 h-10 ml-auto"
  />
</label>


            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 font-thai">
            <p className="text-3xl text-center font-semibold">สรุปรายการสั่งซื้อ</p>
            <div className={`p-4 text-3xl text-center rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <p>ระบบ POS - ฿{total.toLocaleString()}</p>
              <p className="mt-2 font-semibold">ยอดรวมทั้งสิ้น : ฿{total.toLocaleString()}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className={`w-full max-w-3xl p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="mb-4 text-center">
          <h2 className="font-thai text-4xl font-bold">ชำระเงินสำหรับระบบ POS</h2>
          <p className='font-thai text-3xl'>กรุณากรอกข้อมูลการชำระเงินของคุณ</p>
        </div>
        <div className="flex justify-between mb-8">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              {s.id < step ? (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  ✓
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center">
                  {s.id}
                </div>
              )}
              <span className="ml-2 text-2xl font-thai">{s.name}</span>
              {index < steps.length - 1 && (
                <div className={`h-1 w-12 mx-2 ${s.id < step ? 'bg-blue-500' : 'bg-gray-400'}`} />
              )}
            </div>
          ))}
        </div>

        {renderStepContent()}

        <div className="mt-6">
          <div className="flex justify-between items-center">
            {step > 1 && (
              <button className={`font-thai text-2xl btn ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-300 text-black hover:bg-gray-400'}`} onClick={() => setStep(step - 1)}>
                ย้อนกลับ
              </button>
            )}
            <button className={`font-thai text-2xl btn ${darkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`} onClick={() => (step < 4 ? handleNextStep() : handlePayment())}>
              {step === 4 ? 'ยืนยันการสั่งซื้อ' : 'ดำเนินการต่อ'}
            </button>
          </div>

        </div>

        {/* <div className="mt-6 text-center">
          <button className="btn bg-gray-500 text-white hover:bg-gray-600" onClick={toggleDarkMode}>
            {darkMode ? 'โหมดแสงสว่าง' : 'โหมดมืด'}
          </button>
        </div> */}
      </div>
    </div>
  );
}  