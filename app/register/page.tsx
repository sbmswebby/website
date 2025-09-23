"use client";

import RegisterPageContent from "@/components/RegisterPageContent";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading registration form...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
