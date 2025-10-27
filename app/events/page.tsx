'use client';

import { JSX, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { EventSessionCard } from '@/components/shared/EventSessionCard';
import RegisterButton from "@/components/shared/RegisterButton";

/**
 * ✅ Matches the updated `events` table schema
 */
interface Event {
  id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  image_url: string | null;
  location: string | null;
  type: string | null;
}

/**
 * ✅ Default Next.js Page component
 * Wraps `EventsPageContent` inside a <Suspense> boundary
 */
export default function EventsPage(): JSX.Element {
  return (
    <Suspense fallback={<div>Loading events...</div>}>
      <EventsPageContent />
    </Suspense>
  );
}

/**
 * ✅ Actual page content that loads and renders events
 */
function EventsPageContent(): JSX.Element {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Extract query parameters from the URL
  const locationParam = (searchParams.get('location'));
  const typeParam = searchParams.get('type');

  /**
   * ✅ Fetch events from Supabase
   *    - Filters by `location` or `type` if provided via URL query params
   *    - Orders by start_time ascending
   */
  useEffect(() => {
    const fetchEvents = async (): Promise<void> => {
      setIsLoading(true);

      try {
        // Base query
        let query = supabase
          .from('events')
          .select(
            'id, name, description, start_time, end_time, image_url, location, type'
          )
          .order('start_time', { ascending: true });

        // ✅ Apply filters dynamically
        if (locationParam) query = query.ilike('location', locationParam);
        if (typeParam) query = query.ilike('type', typeParam);

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error('[EventsPage] Error fetching events:', fetchError);
          setError('Failed to load events. Please try again.');
          return;
        }

        setEvents(data ?? []);
      } catch (err) {
        console.error('[EventsPage] Unexpected error:', err);
        setError('Something went wrong while fetching events.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [locationParam, typeParam]);

  // ================== UI Rendering ==================

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading events... if this takes too long reload the page</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* ✅ Dynamic heading based on filters */}
      <h1 className="text-3xl font-bold mb-6">
        {locationParam || typeParam
          ? `Events ${locationParam ? `in ${locationParam}` : ''} ${
              typeParam ? `(${typeParam})` : ''
            }`
          : 'Upcoming Events'}
      </h1>

      {/* ✅ Grid of event cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event) => {
            const safeImageUrl =
              event.image_url && event.image_url.trim() !== ''
                ? event.image_url
                : '/images/placeholder.png';

            return (
              <div
                key={event.id}
                className="cursor-pointer"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <EventSessionCard
                  id={event.id}
                  title={event.name}
                  description={event.description || 'No description available.'}
                  imageUrl={safeImageUrl}
                  eventId={event.id}
                  sessionId=""
                  cost={0}
                  isRegistered={false}
                  paymentStatus=""
                >
                  {/* ✅ Two action buttons */}
                  <div className="flex justify-between">
                    <button
                      className='register-btn'
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      View Sessions
                    </button>

                  <RegisterButton eventId={event.id} sessionId={"."} />

                  </div>
                </EventSessionCard>
              </div>
            );
          })
        ) : (
          <p>No events found matching your filters.</p>
        )}
      </div>
    </div>
  );
}
