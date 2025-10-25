"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for client-side navigation
import React from "react";

/**
 * SrisailamPage Component
 * Redirects the user to /events?location=srisailam immediately upon loading.
 */
const SrisailamPage: React.FC = () => {
  const router = useRouter(); // Initialize the router hook

  // Use useEffect to perform the redirect once the component mounts
  useEffect(() => {
    // The redirect path
    const targetPath = "/events?location=srisailam";

    // Use router.replace() to redirect and replace the current entry in the history stack
    router.replace(targetPath);
    
    // The dependency array is empty so this runs only once after the initial render
  }, [router]); 

  // While the redirect is happening, display a simple loading message
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl text-gray-700">Redirecting to Srisailam events...</p>
    </div>
  );
};

export default SrisailamPage;