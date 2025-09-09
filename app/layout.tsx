import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/NavBar";
import { AuthProvider } from '@/components/AuthProvider'
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SBMS Academy",
  description: "South Indian Bridal Makeover Studio",
  icons: {
    icon: "/images/sbms_logo.svg",
  },
  openGraph: {
    title: "SBMS Academy",
    description: "South Indian Bridal Makeover Studio",
    url: "https://sbmsacademy.in", // important for OG
    images: [
      {
        url: "/images/og_image.jpg",
        width: 1200,
        height: 630,
        alt: "SBMS Bridal Makeup Studio",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SBMS Academy",
    description: "South Indian Bridal Makeup Studio",
    images: ["/images/og_image.jpg"],
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

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}