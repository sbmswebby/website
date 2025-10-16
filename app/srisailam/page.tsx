"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import RegisterButton from "@/components/shared/RegisterButton";
import { EventSessionCard } from "@/components/shared/EventSessionCard";

/** Type definition for a single session */
interface Session {
  id: string;
  name: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  cost: number | null;
  currency: string | null;
  upi_link: string | null;
  image_url: string | null;
}

/** Type definition for an event with its sessions */
interface EventWithSessions {
  id: string;
  name: string;
  description: string | null;
  date: string;
  photo_url: string | null;
  sessions: Session[];
}

/**
 * SrisailamPage Component
 * Displays all events where event_locations.location_name = 'Srisailam'
 */
const SrisailamPage: React.FC = () => {
  const [events, setEvents] = useState<EventWithSessions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetch events that are located in 'Srisailam'
   * along with their sessions.
   */
  useEffect(() => {
    const fetchSrisailamEvents = async (): Promise<void> => {
      try {
        // Step 1: Fetch event IDs from event_locations
        const { data: locationData, error: locationError } = await supabase
          .from("event_locations")
          .select("event_id")
          .eq("location_name", "Srisailam");

        if (locationError) {
          console.error("Error fetching locations:", locationError);
          return;
        }

        if (!locationData || locationData.length === 0) {
          setEvents([]);
          return;
        }

        // Step 2: Extract event IDs
        const eventIds = locationData.map((loc) => loc.event_id);

        // Step 3: Fetch events and their sessions for matching IDs
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*, sessions(*)")
          .in("id", eventIds);

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          setEvents([]);
        } else {
          setEvents(eventsData as EventWithSessions[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSrisailamEvents();
  }, []);

  // ===== UI Section =====

  if (loading) return <p className="p-4">Loading Srisailam events...</p>;
  if (events.length === 0)
    return (
      <p className="p-4 text-gray-600">
        No events found for <strong>Srisailam</strong>.
      </p>
    );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Srisailam Events</h1>

      {/* Loop through all matching events */}
      {events.map((event) => (
        <div key={event.id} className="mb-10">
          {/* Event photo */}
          {event.photo_url && (
            <div className="relative w-full h-64 mb-4 rounded overflow-hidden">
              <Image
                src={event.photo_url}
                alt={event.name}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>
          )}


          {/* Sessions grid */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {event.sessions && event.sessions.length > 0 ? (
              event.sessions.map((session) => (
                <EventSessionCard
                  key={session.id}
                  id={session.id}
                  title={session.name}
                  description={session.description || "No description"}
                  imageUrl={session.image_url || "/images/placeholder.png"}
                  eventId={event.id}
                  sessionId={session.id}
                  isRegistered={false}
                  cost={session.cost || 0}
                  paymentStatus=""
                >
                  <RegisterButton eventId={event.id} sessionId={session.id} />
                </EventSessionCard>
              ))
            ) : (
              <p className="text-gray-500">No sessions available for this event.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SrisailamPage;
