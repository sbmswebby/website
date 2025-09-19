"use client";

import { useState } from "react";
import useEventRegistration from "@/utils/useEventRegistration";
import ManualRegisterModal from "./ManualRegisterModal";

interface RegisterButtonProps {
  eventId: string;
  sessionId: string;
}

export default function RegisterButton({ eventId, sessionId }: RegisterButtonProps) {
  const { isRegistered, isAdmin, isProcessing, handleRegister, handleDownloadPass, handleManualSubmit } =
    useEventRegistration(eventId, sessionId);

  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button
        className={`register-btn px-4 py-2 rounded text-white ${
          isRegistered || isAdmin ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
        } disabled:bg-gray-400`}
        onClick={async () => {
          if (isRegistered || isAdmin) {
            await handleDownloadPass();
          } else {
            const openedModal = await handleRegister();
            if (openedModal) setShowModal(true);
          }
        }}
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : isRegistered || isAdmin ? "Download Pass" : "Register"}
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
