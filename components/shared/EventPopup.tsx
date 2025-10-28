'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import RegisterButton from '@/components/shared/RegisterButton';
import { usePathname } from 'next/navigation';

interface EventData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventId: string;
  sessionId: string;
  cost: number;
}

export const EventPopup: FC = () => {
  const pathname = usePathname();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0); // new state to force updates


useEffect(() => {
  setMounted(true);

  const fetchLatestEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching event:', error);
        return;
      }


if (data) {
  // Use the correct column from your table
  const rawUrl = data.image_url; 
  const imageUrl = rawUrl || 'https://res.cloudinary.com/dz2cmusyt/image/upload/v1758865308/dec_9_szsqw7.webp';


  setEventData({
    id: data.id,
    title: data.name || 'Event',
    description: data.description || '',
    imageUrl,
    eventId: data.id,
    sessionId: data.default_session_id || '',
    cost: data.cost || 0,
  });


}

    } catch (err) {
      console.error('Error in fetchLatestEvent:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchLatestEvent();
}, []);


  // Force update RegisterButton every second
useEffect(() => {
  
  const interval = setInterval(() => {
    setTick((prev) => {
      if (prev >= 0) { // 0 → 4 = 5 increments
        clearInterval(interval);
        return prev; // stop incrementing
      }
      return prev + 1;
    });
  }, 3000);

  // Cleanup in case the component unmounts early
  return () => {
    clearInterval(interval);
  };
}, []);
  if (!mounted || !isOpen || loading || !eventData) {
    console.log('Popup not rendered yet', { mounted, isOpen, loading, eventData });
    return null;
  }

  const modalRoot =
    document.getElementById('modal-root') ||
    (() => {
      const root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
      return root;
    })();

  if (pathname === '/register') {
    return null;
  }


  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-fit max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <button
          className="absolute -top-3 -right-3 w-12 h-12 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-900 text-white font-bold text-2xl shadow-lg transition z-10"
          onClick={() => {
            setIsOpen(false);
          }}
        >
          ×
        </button>

        <div className="w-full shimmer-effect">
          <div className="w-full h-9/12 bg-black flex justify-center items-center">
            <Image
              src={eventData.imageUrl}
              alt={eventData.title}
              width={600}
              height={600}
              className="object-contain max-h-full max-w-full"
              onError={(e) => {
                console.error('Failed to load image:', eventData.imageUrl, e);
              }}
              
            />
          </div>

          <div className="bg-black">
            <div className="grid grid-cols-12">
              <div className="col-span-1" />
              <div className="flex flex-col col-span-10">
                <div className="h-4" />
                <h3 className="text-xl font-bold text-gray-100 mb-2">
                  {eventData.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-3">
                  {eventData.description}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-green-600">
                    {eventData.cost > 0 ? `₹${eventData.cost}` : ' '}
                  </p>
                  {/* Pass tick as key to force re-render */}
                  <RegisterButton
                    key={tick}
                    eventId={eventData.eventId}
                    sessionId={eventData.sessionId}
                  />
                </div>
              </div>
              <div className="col-span-1" />
            </div>
            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>,
    modalRoot
  );
};
