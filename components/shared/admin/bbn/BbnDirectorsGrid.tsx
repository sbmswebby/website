"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DirectorCard } from "./DirectorCard";
import BBNFilterBar from "./BBNFilterBar";
import type { BBNDirector } from "./bbnTypes";

export default function DirectorGridWithFilters() {
  const [allDirectors, setAllDirectors] = useState<BBNDirector[]>([]);
  const [filteredDirectors, setFilteredDirectors] = useState<BBNDirector[]>([]);
  const [loading, setLoading] = useState(false);

  // States for hierarchy
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data } = await supabase.from("bbn_directors").select("*").order("name");
      setAllDirectors(data || []);
      setFilteredDirectors(data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // 1. Get States
  const states = useMemo(() => 
    Array.from(new Set(allDirectors.map(d => d.state))).sort(), 
  [allDirectors]);

  // 2. Get Districts (Edge Case: Show City if District is missing)
  const districts = useMemo(() => {
    const raw = allDirectors
      .filter(d => !selectedState || d.state === selectedState)
      .map(d => d.district || d.city); // Fallback to city
    return Array.from(new Set(raw)).filter(Boolean).sort();
  }, [allDirectors, selectedState]);

  // 3. Get Cities (Filter by the 'District' which might actually be a City)
  const cities = useMemo(() => {
    return Array.from(new Set(
      allDirectors
        .filter(d => {
          if (!selectedDistrict) return true;
          // Match if it's the actual district OR it's a city masquerading as a district
          return d.district === selectedDistrict || (!d.district && d.city === selectedDistrict);
        })
        .map(d => d.city)
    )).sort();
  }, [allDirectors, selectedDistrict]);

  return (
    <div className="p-6 bg-black min-h-screen text-white rounded-lg">
      <BBNFilterBar 
        data={allDirectors} 
        onFilterChange={setFilteredDirectors}
        hierarchy={{
          states,
          districts,
          cities,
          selection: { selectedState, selectedDistrict, selectedCity },
          setters: { setSelectedState, setSelectedDistrict, setSelectedCity }
        }}
      />

      <main className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-gray-900 animate-pulse rounded-2xl" />)}
          </div>
        ) : filteredDirectors.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800 animate-in fade-in zoom-in duration-300">
             <p className="text-gray-500">No directors found matching your criteria.</p>
             <button 
                onClick={() => {setSelectedState(""); setSelectedDistrict(""); setSelectedCity("");}}
                className="mt-4 text-blue-500 text-sm hover:underline"
             >
                Reset all filters
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-in fade-in duration-500">
            {filteredDirectors.map((d) => <DirectorCard key={d.id} director={d} />)}
          </div>
        )}
      </main>
    </div>
  );
}