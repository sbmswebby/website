'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import RegisterButton from './RegisterButton';

interface EventData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventId: string;
  sessionId: string;
  cost: number;
  isRegistered: boolean;
  paymentStatus: string;
}

export const EventPopup: FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    console.log('[EventPopup] Component mounted');

    const fetchLatestEvent = async () => {
      try {
        console.log('[EventPopup] Fetching latest event...');
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('[EventPopup] Supabase error:', error);
          return;
        }

        console.log('[EventPopup] Supabase returned data:', data);

        if (data) {
          const imageUrl =
            data.photo_url?.startsWith('http')
              ? data.photo_url
              : 'https://uhbnssgxxszdqwmspxkm.supabase.co/storage/v1/object/public/current_event/default.jpg';

          console.log('[EventPopup] Using image URL:', imageUrl);

          setEventData({
            id: data.id,
            title: data.name || data.event_name || 'Event',
            description: data.description || '',
            imageUrl,
            eventId: data.event_id || data.id,
            sessionId: data.id,
            cost: data.cost || 0,
            isRegistered: false,
            paymentStatus: '',
          });
        } else {
          console.warn('[EventPopup] No event data returned from Supabase');
        }
      } catch (err) {
        console.error('[EventPopup] Unexpected error:', err);
      } finally {
        setLoading(false);
        console.log('[EventPopup] Fetching finished, loading set to false');
      }
    };

    fetchLatestEvent();
  }, []);

  if (!mounted) {
    console.log('[EventPopup] Not mounted yet');
    return null;
  }

  if (!isOpen) {
    console.log('[EventPopup] Modal is closed');
    return null;
  }

  if (loading) {
    console.log('[EventPopup] Loading latest event...');
    return null;
  }

  if (!eventData) {
    console.warn('[EventPopup] No event data available');
    return null;
  }

  console.log('[EventPopup] Rendering modal with event data:', eventData);

  const modalRoot =
    document.getElementById('modal-root') ||
    (() => {
      console.log('[EventPopup] Creating modal-root div');
      const root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
      return root;
    })();

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          console.log('[EventPopup] Backdrop clicked, closing modal');
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
            console.log('[EventPopup] Close button clicked');
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
              onError={(e) => console.error('[EventPopup] Image failed to load', e)}
              onLoad={() =>
                console.log('[EventPopup] Image loaded successfully')
              }
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
                    {eventData.cost > 0 ? `₹${eventData.cost}` : 'Free'}
                  </p>
                  <RegisterButton
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
