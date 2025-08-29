import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/NavBar";


export const metadata: Metadata = {
  title: "SBMS",
  description: "South Indian Bridal Makeup Studio",
  icons: {
    icon: "/images/icon.png",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-100 p-10 text-base-content">

          <div className="flex h-20">
          <Navbar />
          </div>


          {children}

      </body>
    </html>
  );
}