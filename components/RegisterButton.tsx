"use client";

import { useRouter } from "next/navigation";

interface RegisterButtonProps {
  eventId: string;
  sessionId: string;
}

export default function RegisterButton({ eventId, sessionId }: RegisterButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Simply redirect to /register page with eventId and sessionId
    router.push(`/register?eventId=${eventId}&sessionId=${sessionId}`);
  };

  return (
    <button
      className="register-btn px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
      onClick={handleClick}
    >
      Register
    </button>
  );
}
