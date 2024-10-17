import React from 'react';

const LoadingStore = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75"></div>

        <p className="text-2xl font-semibold text-gray-700">
          กำลังโหลดข้อมูลร้านค้า...
        </p>
      </div>
    </div>
  );
};

export default LoadingStore;
