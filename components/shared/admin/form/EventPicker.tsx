"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface EventRow {
  id: string;
  name: string;
  start_time: string;
}

interface Props {
  onCreateNew: () => void;
  onSelectEvent: (eventId: string) => void;
}

const EventPicker: React.FC<Props> = ({
  onCreateNew,
  onSelectEvent,
}) => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect((): void => {
    const fetchEvents = async (): Promise<void> => {
      const { data } = await supabase
        .from("events")
        .select("id, name, start_time")
        .order("start_time", { ascending: false });

      if (data) {
        setEvents(data);
      }

      setLoading(false);
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading events…</div>;
  }

  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
      <button
        onClick={onCreateNew}
        className="w-full bg-green-600 text-white py-3 rounded text-lg"
      >
        Create New Event
      </button>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-200">
          Edit Existing Event
        </h2>

        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => onSelectEvent(event.id)}
            className="w-full text-left px-4 py-3 rounded bg-gray-800 hover:bg-gray-700 text-gray-200"
          >
            <div className="font-medium">{event.name}</div>
            <div className="text-sm text-gray-400">
              {new Date(event.start_time).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventPicker;
