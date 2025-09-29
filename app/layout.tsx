import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/sbms/NavBar";
import { AuthProvider } from '@/components/shared/AuthProvider'
import Footer from "@/components/sbms/Footer";
import { EventPopup } from "@/components/shared/EventPopup";

export const metadata: Metadata = {
  title: "SBMS Academy",
  description: "South Indian Bridal Makeover Studio",
  icons: {
    icon: "/images/sbms_logo.svg",
  },
  metadataBase: new URL("https://sbmsacademy.in"),
  openGraph: {
    title: "SBMS Academy",
    description: "South Indian Bridal Makeover Studio",
    url: "https://sbmsacademy.in",
    siteName: "SBMS Academy",
    images: [
      {
        url: "https://res.cloudinary.com/dz2cmusyt/image/upload/v1758864745/og_image_cnlh6n.webp",
        width: 1200,
        height: 630,
        alt: "SBMS Bridal Makeup Studio",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SBMS Academy",
    description: "South Indian Bridal Makeover Studio",
    images: ["https://sbmsacademy.in/images/og_image.jpg"],
    creator: "@sbmsacademy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* These will be automatically added by Next.js from metadata, but you can add custom ones here if needed */}
      </head>
      <body className="min-h-screen bg-base-100 text-base-content">
        <AuthProvider>
          {/* Navbar - full width, no padding constraints */}
          <Navbar />
          
          {/* Main content with padding */}
          <main className="pt-16 lg:pt-20 p-4 sm:p-6 lg:p-10">
            <EventPopup/>
            {children}
          </main>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}