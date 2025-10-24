"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import RegisterButton from "@/components/shared/RegisterButton";
import { EventSessionCard } from "@/components/shared/EventSessionCard";

/** Type definition for a single session */
type Session = {
  id: string;
  name: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  cost: number | null;
  currency: string | null;
  upi_link: string | null;
  image_url: string | null;
};

/** Type definition for an event with its sessions */
type EventWithSessions = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  photo_url: string | null;
  sessions: Session[];
};

/**
 * Event detail page for a given event ID.
 * In Next.js 15+, `params` is a Promise and must be unwrapped with `React.use`.
 */
export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Unwrap the params Promise
  const { id } = React.use(params);

  const [event, setEvent] = useState<EventWithSessions | null>(null);
  const [loading, setLoading] = useState(true);

  /** Fetch event + sessions from Supabase when component mounts */
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*, sessions:sessions!sessions_event_id_fkey(*)")
          .eq("id", id)
          .single();

        if (error || !data) {
          console.error("Error fetching event:", error);
          setEvent(null);
        } else {
          setEvent(data as EventWithSessions);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <p className="p-4">Loading event...</p>;
  if (!event) return <p className="p-4 text-red-600">Event not found.</p>;

  return (
    <div className="container mx-auto p-4">
      {/* Event details */}
      <div className="mb-6">
        {event.photo_url && (
          <div className="relative w-full h-64 rounded overflow-hidden">
            <Image
              src={event.photo_url}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              priority
            />
          </div>
        )}
  
      </div>

      {/* Sessions */}
      <h2 className="text-2xl font-semibold mb-4">Sessions</h2>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {event.sessions.length > 0 ? (
          event.sessions.map((s) => (
            <EventSessionCard
              key={s.id}
              id={s.id}
              title={s.name}
              description={s.description || "No description"}
              imageUrl={s.image_url || "/images/placeholder.png"}
              eventId={event.id}
              sessionId={s.id}
              isRegistered={false}
              cost={s.cost || 0}
              paymentStatus=""
            >
              <RegisterButton eventId={event.id} sessionId={s.id} />
            </EventSessionCard>
          ))
        ) : (
          <p>No sessions available.</p>
        )}
      </div>
    </div>
  );
}
