"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import useEventRegistration from "@/utils/useEventRegistration";
import ManualRegisterModal from "@/components/ManualRegisterModal";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || "";
  const sessionId = searchParams.get("sessionId") || "";

  const { handleManualSubmit, isProcessing } = useEventRegistration(eventId, sessionId);
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="flex justify-center items-start min-h-screen p-4 bg-gray-100">
      {showModal && (
        <ManualRegisterModal
          onClose={() => setShowModal(false)}
          onSubmit={handleManualSubmit}
          isProcessing={isProcessing}
          sessionId= {sessionId}
        />
      )}
    </div>
  );
}
