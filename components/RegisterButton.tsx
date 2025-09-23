"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useEventRegistration from "@/utils/useEventRegistration";
import ManualRegisterModal from "./ManualRegisterModal";

interface RegisterButtonProps {
  eventId: string;
  sessionId: string;
}

export default function RegisterButton({ eventId, sessionId }: RegisterButtonProps) {
  const router = useRouter();
  const { isRegistered, isAdmin, isProcessing, handleDownloadPass, handleRegister, handleManualSubmit } =
    useEventRegistration(eventId, sessionId);

  const [showModal, setShowModal] = useState(false);

  const handleDownloadWithTimestamp = async () => {


    await handleDownloadPass();

  };

  const handleClick = async () => {
    if (isRegistered || isAdmin) {
      await handleDownloadWithTimestamp();
    } else {
      // Try to register - this will either auto-register authenticated users 
      // or return true if manual registration is needed
      const needsManualRegistration = await handleRegister();
      
      if (needsManualRegistration) {
        // If user is not authenticated, redirect to registration page
        router.push(`/register?eventId=${eventId}&sessionId=${sessionId}`);
      }
      // If user was authenticated, handleRegister would have registered them automatically
    }
  };

  return (
    <div>
      <button
        className={`register-btn px-4 py-2 rounded text-white ${
          isRegistered || isAdmin ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
        } disabled:bg-gray-400`}
        onClick={handleClick}
        disabled={isProcessing}
      >
        {isProcessing
          ? "Processing..."
          : isRegistered || isAdmin
          ? "Download Pass"
          : "Register"}
      </button>

      {showModal && (
        <ManualRegisterModal
          onClose={() => setShowModal(false)}
          onSubmit={handleManualSubmit}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}