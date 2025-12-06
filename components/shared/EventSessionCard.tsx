'use client';

import { FC, ReactNode, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export interface EventSessionCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventId: string;
  sessionId: string;
  cost: number;
  isRegistered: boolean;
  paymentStatus: string;
  children?: ReactNode;
}

interface SessionRow {
  id: string;
  image_url: string | null;
}

export const EventSessionCard: FC<EventSessionCardProps> = ({
  title,
  description,
  imageUrl,
  eventId,
  cost,
  children,
}) => {
  const [sessionImages, setSessionImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSliding, setIsSliding] = useState<boolean>(false);

  const trackRef = useRef<HTMLDivElement | null>(null);

  /**
   * Fetch all images
   */
  useEffect(() => {
    const fetchImages = async (): Promise<void> => {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, image_url')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching', error);
        return;
      }

      const valid = (data as SessionRow[])
        .map((s) => s.image_url)
        .filter((u): u is string => Boolean(u && u.trim() !== ''));

      setSessionImages(valid.length > 0 ? valid : [imageUrl]);
    };

    fetchImages();
  }, [eventId, imageUrl]);

  /**
   * Auto slide loop
   */
  useEffect(() => {
    if (sessionImages.length <= 1) return;

    const interval = setInterval(() => {
      triggerSlide();
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionImages, currentIndex]);

  /**
   * Performs a smooth slide, then snaps to circular next position
   */
  const triggerSlide = (): void => {
    if (!trackRef.current) return;

    setIsSliding(true);

    // Slide left by 100%
    trackRef.current.style.transition = 'transform 700ms ease-in-out';
    trackRef.current.style.transform = 'translateX(-100%)';

    // After animation completes → instantly reset
    setTimeout(() => {
      setIsSliding(false);

      // Remove transition so snap is invisible
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = 'translateX(0)';
      }

      // Move index forward using circular modulo
      setCurrentIndex((prev) => (prev + 1) % sessionImages.length);
    }, 700);
  };

  /**
   * Circular list: show current + next
   */
  const nextIndex: number =
    (currentIndex + 1) % sessionImages.length;

  const visibleSlides: string[] = [
    sessionImages[currentIndex],
    sessionImages[nextIndex],
  ];

  return (
    <div className="event-card shimmer-effect w-full max-w-5xl mx-auto">

      {/* ======================== SLIDER ======================== */}
      <div className="relative w-full overflow-hidden bg-black">

        {/* Track */}
        <div
          ref={trackRef}
          className="flex"
          style={{ transform: 'translateX(0)' }}
        >
          {visibleSlides.map((url: string, i: number) => (
            <div
              key={i}
              className="min-w-full flex justify-center items-center"
            >
              <Image
                src={url}
                alt={title}
                width={800}
                height={400}
                className="object-contain max-h-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ======================== TEXT ======================== */}
      <div className="event-card-content flex flex-col md:flex-row items-start md:items-end justify-between">
        <div className="event-card-text">
          <h3 className="event-card-title">{title}</h3>
          <p className="event-card-description">{description}</p>
          <p className="event-card-meta">{cost > 0 ? `₹${cost}` : ''}</p>
        </div>
      </div>

      {/* ======================== CHILDREN ======================== */}
      <div className="m-4">{children}</div>
    </div>
  );
};
