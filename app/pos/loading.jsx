// loading.js
export default function Loading() {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-gray-500" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    );
  }
  