'use client';

import { Suspense, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useSearchParams, useRouter } from 'next/navigation';
import { EventSessionCard } from '@/components/EventSessionCard';

// --- Types ---
type AllEventRegistrationRow = {
  id: string;
  user_name: string;
  whatsapp_number: string | null;
  beautyparlor_name: string | null;
  event_name: string;
  session_name: string | null;
  payment_status: string | null;
  created_at: string;
  registration_number: number;
  session_id?: string; // FK to sessions table
  sessions?: { id: string; image_url: string | null }; // relationship
};

type Registration = {
  id: string;
  event_name: string;
  session_name: string | null;
  payment_status: string | null;
  user_name: string;
  user_number: string;
  image_url: string;
  created_at: string;
  reference: string | null;
};

// External logging functions - these run on client side
const logRegistrationActivity = (message: string, data?: unknown) => {
  if (typeof window !== 'undefined') {
    console.log(`🔄 [EventRegistrations] ${message}`, data || '');
  }
};

const logError = (message: string, error: unknown) => {
  if (typeof window !== 'undefined') {
    console.error(`❌ [EventRegistrations] ${message}`, error);
  }
};

const logWarning = (message: string) => {
  if (typeof window !== 'undefined') {
    console.warn(`⚠️ [EventRegistrations] ${message}`);
  }
};

const logSuccess = (message: string, data?: unknown) => {
  if (typeof window !== 'undefined') {
    console.log(`✅ [EventRegistrations] ${message}`, data || '');
  }
};

function EventRegistrationsContent() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const registrationId = searchParams.get('registration_id');

  // Add debug info to state so we can see it in UI
  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => prev + '\n' + new Date().toLocaleTimeString() + ': ' + info);
  };

  const fetchRegistrations = async () => {
    logRegistrationActivity('fetchRegistrations() called');
    addDebugInfo('Starting fetchRegistrations');
    setLoading(true);

    try {
      // Get Supabase user session
      logRegistrationActivity('Getting Supabase session');
      addDebugInfo('Getting Supabase session');
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        logError('Error fetching session:', sessionError);
        addDebugInfo('Session error: ' + sessionError.message);
      }
      const user = sessionData.session?.user;
      
      logRegistrationActivity('User found:', !!user);
      addDebugInfo(`User found: ${!!user}, Registration ID: ${registrationId}`);

      if (!user && !registrationId) {
        logWarning('No user and no registrationId → redirecting to /events');
        addDebugInfo('No user and no registrationId - redirecting');
        router.push('/events');
        return;
      }

      // --- Fetch single registration by ID ---
      if (registrationId) {
        logRegistrationActivity('Fetching single registration by ID:', registrationId);
        addDebugInfo('Fetching single registration by ID: ' + registrationId);
        
        const { data, error } = await supabase
          .from('all_event_registrations')
          .select('*, sessions(id, image_url)')
          .eq('id', registrationId)
          .maybeSingle();

        if (error) {
          logError('Error fetching single registration:', error);
          addDebugInfo('Error fetching single registration: ' + error.message);
          throw error;
        }

        if (data) {
          logSuccess('Single registration data received:', data);
          addDebugInfo('Single registration found: ' + data.event_name);
          
          const single: Registration = {
            id: data.id,
            event_name: data.event_name,
            session_name: data.session_name,
            payment_status: data.payment_status ?? 'pending',
            user_name: data.user_name,
            user_number: data.whatsapp_number ?? 'Unknown',
            image_url: data.sessions?.image_url ?? '/placeholder.png',
            created_at: data.created_at,
            reference: data.registration_number?.toString() ?? null,
          };
          
          logSuccess('Mapped registration:', single);
          addDebugInfo('Image URL: ' + single.image_url);
          setRegistrations([single]);
        } else {
          logRegistrationActivity('No registration found for ID:', registrationId);
          addDebugInfo('No registration found for ID: ' + registrationId);
          setRegistrations([]);
        }
        return;
      }

      if (!user) {
        logWarning('No user found, setting empty registrations');
        addDebugInfo('No user found');
        setRegistrations([]);
        return;
      }

      // --- Fetch user profile ---
      logRegistrationActivity('Fetching user profile for user:', user.id);
      addDebugInfo('Fetching user profile for: ' + user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, number')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        logError('Error fetching profile:', profileError);
        addDebugInfo('Profile error: ' + profileError.message);
      }
      if (!profile?.role) {
        logWarning('No profile role found, setting empty registrations');
        addDebugInfo('No profile role found');
        setRegistrations([]);
        return;
      }

      // --- Fetch registrations ---
      logRegistrationActivity('Fetching registrations for role:', profile.role);
      addDebugInfo('User role: ' + profile.role);
      
      let query = supabase
        .from('all_event_registrations')
        .select('*, sessions(id, image_url)')
        .order('created_at', { ascending: false });

      if (profile.role !== 'admin') {
        logRegistrationActivity('Filtering by user number:', profile.number);
        addDebugInfo('Filtering by number: ' + profile.number);
        query = query.eq('whatsapp_number', profile.number);
      }

      const { data, error } = await query;

      if (error) {
        logError('Error fetching registrations:', error);
        addDebugInfo('Fetch error: ' + error.message);
        throw error;
      }

      if (data && data.length > 0) {
        logSuccess('Raw registrations data:', data);
        addDebugInfo('Found ' + data.length + ' registrations');
        
        const mapped: Registration[] = data.map((r) => ({
          id: r.id,
          event_name: r.event_name,
          session_name: r.session_name,
          payment_status: r.payment_status ?? 'pending',
          user_name: r.user_name,
          user_number: r.whatsapp_number ?? 'Unknown',
          image_url: r.sessions?.image_url ?? '/placeholder.png',
          created_at: r.created_at,
          reference: r.registration_number?.toString() ?? null,
        }));
        
        logSuccess('Mapped registrations:', mapped);
        addDebugInfo('Mapped registrations with images: ' + mapped.map(r => r.image_url).join(', '));
        setRegistrations(mapped);
      } else {
        logRegistrationActivity('No registrations found');
        addDebugInfo('No registrations found in query result');
        setRegistrations([]);
      }
    } catch (err) {
      logError('Unexpected error fetching registrations:', err);
      addDebugInfo('Unexpected error: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setRegistrations([]);
    } finally {
      logRegistrationActivity('fetchRegistrations completed');
      addDebugInfo('fetchRegistrations completed');
      setLoading(false);
    }
  };

  useEffect(() => {
    logRegistrationActivity('useEffect triggered, registrationId:', registrationId);
    addDebugInfo('useEffect triggered with registrationId: ' + registrationId);
    fetchRegistrations();
  }, [registrationId]);

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading registrations...</p>
        <details className="mt-4 text-xs text-gray-600">
          <summary>Debug Info (Click to expand)</summary>
          <pre className="whitespace-pre-wrap mt-2 bg-gray-100 p-2 rounded">{debugInfo}</pre>
        </details>
      </div>
    );
  }
  
  if (registrations.length === 0) {
    return (
      <div className="p-4">
        <p>No registrations found.</p>
        <details className="mt-4 text-xs text-gray-600">
          <summary>Debug Info (Click to expand)</summary>
          <pre className="whitespace-pre-wrap mt-2 bg-gray-100 p-2 rounded">{debugInfo}</pre>
        </details>
      </div>
    );
  }

  const highlighted = registrations[0]?.id === registrationId ? registrations[0] : null;
  const others = highlighted ? registrations.slice(1) : registrations;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registrations</h1>
      
      {/* Debug info at top in development */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mb-4 text-xs text-gray-600">
          <summary>Debug Info (Development Only)</summary>
          <pre className="whitespace-pre-wrap mt-2 bg-gray-100 p-2 rounded max-h-40 overflow-y-auto">{debugInfo}</pre>
        </details>
      )}

      {highlighted && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Highlighted Registration</h2>
          <EventSessionCard
            id={highlighted.id}
            title={highlighted.event_name}
            description={`👤 Name: ${highlighted.user_name},  Phone: ${highlighted.user_number} ,
🕒 Registered: ${formatDate(highlighted.created_at)}, 
${highlighted.session_name ? `🎟️ Session: ${highlighted.session_name} ,` : ''} 
${highlighted.reference ? `Ref: ${highlighted.reference}` : ''}`}
            imageUrl={highlighted.image_url}
            eventId={''}
            sessionId={highlighted.session_name ?? ''}
            isRegistered={true}
            paymentStatus={''}
            cost={0}
          />
        </div>
      )}

      {others.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">All Registrations</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {others.map((r) => (
              <EventSessionCard
                key={r.id}
                id={r.id}
                title={r.event_name}
                description={`👤 ${r.user_name},   (${r.user_number})
🕒 Registered: ${formatDate(r.created_at)}
${r.session_name ? `🎟️ Session: ${r.session_name}, ` : ''} 
${r.reference ? `Ref: ${r.reference}, ` : ''}`}
                imageUrl={r.image_url}
                eventId={''}
                sessionId={r.session_name ?? ''}
                isRegistered={true}
                paymentStatus={''}
                cost={0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function EventRegistrations() {
  // Initialize logging when component mounts
  useEffect(() => {
    logRegistrationActivity('EventRegistrations component mounted');
  }, []);

  return (
    <Suspense fallback={
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    }>
      <EventRegistrationsContent />
    </Suspense>
  );
}