'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import RegisterButton from './RegisterButton';

export const EventPopup: FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Event data states
  const [id] = useState("4abe0d58-5a7e-4def-8cf3-5beef1c7bedf");
  const [title] = useState("Press Meet");
  const [description] = useState(
    "Poster unveiling for the mini beauty expo"
  );
  const [imageUrl] = useState("/images/events/sep_2025/press_meet.jpg");
  const [eventId] = useState("e6f43520-aa0a-4a79-8434-554d925ab6dc");
  const [sessionId] = useState("4abe0d58-5a7e-4def-8cf3-5beef1c7bedf");
  const [cost] = useState(0);
  const [isRegistered] = useState(false);
  const [paymentStatus] = useState("");

  // Ensure client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  // Portal root
  const modalRoot =
    document.getElementById('modal-root') ||
    (() => {
      const root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
      return root;
    })();

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        // Close only if the user clicks directly on the backdrop
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-fit max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          className="absolute -top-3 -right-3 w-12 h-12 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-900 text-white font-bold text-2xl shadow-lg transition z-10"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>

        {/* Event Card Content */}
        <div className="w-full shimmer-effect">
          {/* Image Section */}
          <div className="w-full h-9/12 bg-black flex justify-center items-center">
            <Image
              src={imageUrl}
              alt={title}
              width={600}
              height={600}
              className="object-contain max-h-full max-w-full"
            />
          </div>

          {/* Content Section */}
          <div className="bg-black">
            <div className="grid grid-cols-12">
              <div className="grid col-span-1"></div>
              <div className="flex flex-col col-span-10">
                <div className="h-4"></div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">{title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                  {description}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-green-600">
                    {cost > 0 ? `₹${cost}` : 'Free'}
                  </p>
                  <RegisterButton eventId={eventId} sessionId={sessionId} />
                </div>
              </div>
              <div className="grid col-span-1"></div>
            </div>
            <div className="h-4"></div>
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};
