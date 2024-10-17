export default function Loading() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-t-4 rounded-full animate-spin"></div>
          <p className="text-xl font-semibold text-gray-700">กำลังโหลด...</p>
        </div>
      </div>
    );
  }
  