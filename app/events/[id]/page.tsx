import { supabase } from '@/lib/supabaseClient';
import RegisterButton from '@/components/RegisterButton';

// Session type
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

// Event type with sessions
type EventWithSessions = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  photo_url: string | null;
  sessions: Session[];
};

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const { data, error } = await supabase
    .from('events')
    .select('*, sessions(*)')
    .eq('id', id)
    .single();

  const event = data as EventWithSessions | null;

  if (error || !event) {
    console.error('Error fetching event:', error);
    return <p className="p-4 text-red-600">Event not found.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        {event.photo_url && (
          <img
            src={event.photo_url}
            alt={event.name}
            className="w-full h-64 object-cover rounded"
          />
        )}
        <h1 className="text-3xl font-bold mt-4">{event.name}</h1>
        {event.description && <p className="text-gray-700 mt-2">{event.description}</p>}
        <p className="text-gray-500 mt-1">
          Date: {new Date(event.date).toLocaleDateString()}
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Sessions</h2>
      <div className="space-y-4">
        {event.sessions.length > 0 ? (
          event.sessions.map((s: Session) => (
            <div
              key={s.id}
              className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">{s.name}</h3>
                {s.description && <p className="text-gray-600">{s.description}</p>}
                {s.start_time && s.end_time && (
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(s.start_time).toLocaleTimeString()} -{' '}
                    {new Date(s.end_time).toLocaleTimeString()}
                  </p>
                )}
                <p className="text-gray-700 font-medium mt-1">
                  Cost: {s.cost ? `${s.currency || 'INR'} ${s.cost}` : 'Free'}
                </p>
              </div>

              <div className="mt-2 md:mt-0">
                <RegisterButton eventId={event.id} sessionId={s.id} />
              </div>
            </div>
          ))
        ) : (
          <p>No sessions available.</p>
        )}
      </div>
    </div>
  );
}
