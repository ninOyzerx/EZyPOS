export function Progress({ value, className, children }) {
    return (
      <div className={`relative h-2 bg-gray-200 rounded-full ${className}`}>
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{ width: `${value}%` }}
        />
        {children}
      </div>
    );
  }