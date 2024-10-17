"use client";

export default function Component() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
      <div className="w-full max-w-md p-8 bg-base-100 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">ชำระเงิน</h1>
          <p className="text-base-content text-opacity-70">
            สมัครสมาชิกและชำระเงินเพื่อใช้งานระบบ
          </p>
        </div>
        <form className="space-y-6 mt-8">
          <div>
            <label htmlFor="name">ชื่อ</label>
            <input
              id="name"
              type="text"
              placeholder="ป้อนชื่อของคุณ"
              className="mt-2 input input-bordered w-full"
            />
          </div>
          <div>
            <label htmlFor="email">อีเมล</label>
            <input
              id="email"
              type="email"
              placeholder="ป้อนอีเมลของคุณ"
              className="mt-2 input input-bordered w-full"
            />
          </div>
          <div>
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              placeholder="ป้อนรหัสผ่านของคุณ"
              className="mt-2 input input-bordered w-full"
            />
          </div>
          <div>
            <label>วิธีการชำระเงิน</label>
            <div className="mt-2">
              <div className="flex items-center space-x-4">
                <input
                  type="radio"
                  id="paypal"
                  name="payment-method"
                  value="paypal"
                  className="sr-only peer"
                />
                <label
                  htmlFor="paypal"
                  className="flex items-center justify-between rounded-md border-2 border-neutral bg-base-100 p-4 cursor-pointer peer-checked:border-primary hover:bg-neutral hover:text-neutral-content"
                >
                  <WalletCardsIcon className="mr-3 h-6 w-6" />
                  PayPal
                </label>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full mt-4 btn btn-primary">
            สมัครสมาชิก และชำระเงิน
          </button>
        </form>
        <div className="text-center text-base-content text-opacity-70 mt-8">
          <p>แพ็กเกจสมาชิก:</p>
          <ul className="space-y-2 mt-4">
            <li>
              <strong>ฟรี</strong> - ใช้งานฟีเจอร์พื้นฐาน
            </li>
            <li>
              <strong>Premium</strong> - ใช้งานฟีเจอร์ขั้นสูง ราคา 10000 บาท/เดือน
            </li>
            <li>
              <strong>Enterprise</strong> - ใช้งานฟีเจอร์ขั้นสูงสุด ราคา 10000 บาท/เดือน
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function WalletCardsIcon(props) {
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
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2" />
      <path d="M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21" />
    </svg>
  )
}