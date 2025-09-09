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
  const [id] = useState("85ea0c3d-7715-4c90-9113-8cacc93777f9");
  const [title] = useState("Mini Beauty Expo");
  const [description] = useState("Learn professional bridal makeup techniques. Witness the Chota King Choti Queen beauty pagent.");
  const [imageUrl] = useState("/images/og_image.jpg");
  const [eventId] = useState("85ea0c3d-7715-4c90-9113-8cacc93777f9");
  const [sessionId] = useState("af316369-a0fd-473f-bec5-a0b4a38e0786");
  const [cost] = useState(0);
  const [isRegistered] = useState(false);
  const [paymentStatus] = useState("pending");

  // Ensure client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!mounted || !isOpen) return null;

  // Portal root
  const modalRoot =
    document.getElementById('modal-root') || (() => {
      const root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
      return root;
    })();

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
          <div className=" bg-black	">
						<div className='grid grid-cols-12'>
							<div className='grid col-span-1'></div>
							<div className='flex flex-col col-span-10'>
								<div className='h-4'></div>
								<h3 className="text-xl font-bold text-gray-100 mb-2">{title}</h3>
								<p className="text-gray-400 text-sm mb-3 line-clamp-3">{description}</p>
								<div className="flex justify-between items-center">
									<p className="text-lg font-semibold text-green-600">
										{cost > 0 ? `₹${cost}` : 'Free'}
									</p>
									<RegisterButton eventId={eventId} sessionId={sessionId} />
								</div>
							</div>
							<div className='grid col-span-1'></div>
						</div>
						<div className='h-4'></div>
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};