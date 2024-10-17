import React from "react";
import classNames from "classnames";

export function Button({ children, className, variant = "primary", ...props }) {
  const baseStyles = "px-4 py-2 rounded text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
    accent: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
  };

  const combinedStyles = classNames(baseStyles, variantStyles[variant], className);

  return (
    <button className={combinedStyles} {...props}>
      {children}
    </button>
  );
}
