// app/registrations/page.tsx

import EventRegistrations from "@/components/EventRegistrations";
import { Suspense } from "react";




export default function RegistrationsPage() {
  return (
    <Suspense>
    <EventRegistrations/>
    </Suspense>
  )
}