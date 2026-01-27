"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Users, Clock, CheckCircle, Map } from "lucide-react";
import DirectorGridWithFilters from "@/components/shared/admin/bbn/BbnDirectorsGrid";
import BBNTable from "@/components/shared/admin/bbn/table";

export default function BBNAdminDirectorsPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    regions: 0,
  });

  // We can fetch stats here to show at the top of the admin panel
  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from("bbn_directors").select("is_approved, region");
      if (data) {
        setStats({
          total: data.length,
          pending: data.filter((d) => !d.is_approved).length,
          approved: data.filter((d) => d.is_approved).length,
          regions: new Set(data.map((d) => d.region)).size,
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      {/* Admin Header Section */}
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Director Management</h1>
            <p className="text-gray-500 mt-2">
              Review, approve, and manage BBN regional directors.
            </p>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={stats.total} icon={<Users size={16}/>} />
            <StatCard label="Pending" value={stats.pending} icon={<Clock size={16} className="text-amber-500"/>} />
            <StatCard label="Approved" value={stats.approved} icon={<CheckCircle size={16} className="text-green-500"/>} />
            <StatCard label="Regions" value={stats.regions} icon={<Map size={16}/>} />
          </div>
        </div>
      </header>

      <div>
        <BBNTable/>
      </div>

      {/* The Main Content */}
      <div className="max-w-7xl mx-auto">
        <DirectorGridWithFilters />
      </div>
    </div>
  );
}

// Small helper component for the admin stats
function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl min-w-[120px]">
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
      </div>
      <div className="text-xl font-mono font-bold">{value}</div>
    </div>
  );
}