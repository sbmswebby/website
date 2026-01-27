"use client";

import AdminGuard from "@/components/shared/admin/AdminGuard";
import { LogOut } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleLogout = () => {
    localStorage.removeItem("bbn_admin_auth");
    window.location.reload();
  };

  return (
    <AdminGuard>
      <section className="bg-black min-h-screen text-white relative">
        {/* Main Content - No longer blocked by a top bar */}
        <main className="w-full">
          {children}
        </main>

        {/* Floating Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout from Admin"
          className="fixed bottom-6 right-6 z-[99] flex items-center gap-2 px-4 py-2 
                     bg-red-500/20 backdrop-blur-md 
                     border border-red-500/50 
                     rounded-full text-red-500 
                     transition-all duration-300 shadow-2xl group"
        >
          <span className="text-xs font-medium uppercase tracking-wider">
            Logout Session
          </span>
          <LogOut className="w-4 h-4" />
        </button>
      </section>
    </AdminGuard>
  );
}