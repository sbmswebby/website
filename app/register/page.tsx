// app/register/page.tsx
import RegistrationForm from "@/components/RegistrationForm";

export default function RegisterPage() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Event Registration</h1>
      <RegistrationForm />
    </main>
  );
}
