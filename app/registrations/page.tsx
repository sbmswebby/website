// app/registrations/page.tsx

import EventRegistrations from "@/components/shared/UserRegistrations";
import { Suspense } from "react";




export default function RegistrationsPage() {
  return (
    <Suspense>
    <EventRegistrations/>
    </Suspense>
  )
}