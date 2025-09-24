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
  const { isRegistered, isAdmin, isProcessing, handleDownloadPass } =
    useEventRegistration(eventId, sessionId);

  const [showModal, setShowModal] = useState(false);

  const handleDownload = async (): Promise<void> => {
    try {
      await handleDownloadPass();
    } catch (err) {
      console.error("Failed to download pass:", err);
      alert("Download failed. Please try again.");
    }
  };

  const handleClick = async (): Promise<void> => {
    if (isRegistered || isAdmin) {
      await handleDownload();
      return;
    }

    // Redirect to /register with both eventId and sessionId
    setShowModal(true); // optional, for brief visual
    router.push(`/register?eventId=${eventId}&sessionId=${sessionId}`);
    setShowModal(false); // close modal immediately after redirect
  };

  return (
    <div>
      <button
        className={`register-btn px-4 py-2 rounded text-white ${
          isRegistered || isAdmin
            ? "bg-green-600 hover:bg-green-700"
            : "bg-blue-600 hover:bg-blue-700"
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
          sessionId={sessionId} // optional
          onClose={() => setShowModal(false)}
          onSubmit={async () => {}}
          isProcessing={false}
        />
      )}
    </div>
  );
}
