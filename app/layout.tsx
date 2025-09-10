import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/NavBar";
import { AuthProvider } from '@/components/AuthProvider'
import Footer from "@/components/Footer";
import { EventPopup } from "@/components/EventPopup";

export const metadata: Metadata = {
  title: "SBMS Academy",
  description: "South Indian Bridal Makeover Studio",
  icons: {
    icon: "/images/sbms_logo.svg",
  },
  // Add metadataBase for absolute URLs
  metadataBase: new URL('https://sbmsacademy.in'),
  openGraph: {
    title: "SBMS Academy",
    description: "South Indian Bridal Makeover Studio",
    url: "https://sbmsacademy.in",
    siteName: "SBMS Academy",
    images: [
      {
        url: "https://sbmsacademy.in/images/og_image.jpg", // This will resolve to https://sbmsacademy.in/images/og_image.jpg
        width: 1200,
        height: 1200,
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
    creator: "@sbmsacademy", // Add if you have a Twitter handle
  },
  // Add robots meta
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Add verification if needed
  // verification: {
  //   google: 'your-google-verification-code',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <head>
        <meta property="og:image" content="https://sbmsacademy.in/images/og_image.jpg" />
        <meta name="twitter:image" content="https://sbmsacademy.in/images/og_image.jpg" />
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