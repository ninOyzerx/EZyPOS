import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EZyPOS",
  description: "POS & Inventory Management System",
};

export default function RootLayout({ children }) {
  return (
    <div className={inter.className}>
      {children}
    </div>
  );
}

  