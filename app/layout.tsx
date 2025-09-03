import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/NavBar";
import { AuthProvider } from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: "SBMS",
  description: "South Indian Bridal Makeup Studio",
  icons: {
    icon: "/images/sbms_logo.svg",
  },
  openGraph: {
    title: "SBMS",
    description: "South Indian Bridal Makeup Studio",
    images: [
      {
        url: "/images/og_image.jpg",
        width: 1200,
        height: 630,
        alt: "SBMS Bridal Makeup Studio",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-100 text-base-content">
        <AuthProvider>
          {/* Navbar - full width, no padding constraints */}
          <Navbar />
          
          {/* Main content with padding */}
          <main className="pt-16 lg:pt-20 p-4 sm:p-6 lg:p-10">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}