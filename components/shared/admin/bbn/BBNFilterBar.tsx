"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, RotateCcw, XCircle } from "lucide-react";
import { BBNDirector } from "./bbnTypes";

interface BBNFilterBarProps {
  data?: BBNDirector[];
  onFilterChange: (filtered: BBNDirector[]) => void;
  hierarchy: {
    states: string[];
    districts: string[];
    cities: string[];
    selection: {
      selectedRegion: string;
      selectedState: string;
      selectedDistrict: string;
      selectedCity: string;
    };
    setters: {
      setSelectedRegion: (v: string) => void;
      setSelectedState: (v: string) => void;
      setSelectedDistrict: (v: string) => void;
      setSelectedCity: (v: string) => void;
    };
  };
}

export default function BBNFilterBar({
  data = [],
  onFilterChange,
  hierarchy,
}: BBNFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const lastFilteredRef = useRef("");

  /* ---------------------------------------
     Fuzzy Match Helper
  ---------------------------------------- */
  const isCloseMatch = (target: string, query: string) => {
    const t = target.toLowerCase();
    const q = query.toLowerCase();
    if (t.includes(q)) return true;
    if (q.length < 3) return false;

    let matchCount = 0;
    for (let i = 0; i < q.length - 2; i++) {
      if (t.includes(q.substring(i, i + 3))) matchCount++;
    }
    return matchCount >= 1;
  };

  /* ---------------------------------------
     Debounced Filtering
  ---------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = data.filter((item) => {
        const q = searchQuery.trim();

        // Search
        const matchesSearch =
          !q ||
          isCloseMatch(item.name, q) ||
          isCloseMatch(item.city, q) ||
          (item.district && isCloseMatch(item.district, q)) ||
          item.phone_number.includes(q);

        // Quick chips
        const matchesQuick =
          !activeQuickFilter ||
          item.district === activeQuickFilter ||
          (!item.district && item.city === activeQuickFilter);

        // Region
        const matchesRegion =
          !hierarchy.selection.selectedRegion ||
          item.region === hierarchy.selection.selectedRegion;

        // Hierarchy
        const matchesState =
          !hierarchy.selection.selectedState ||
          item.state === hierarchy.selection.selectedState;

        const matchesDistrict =
          !hierarchy.selection.selectedDistrict ||
          item.district === hierarchy.selection.selectedDistrict ||
          (!item.district &&
            item.city === hierarchy.selection.selectedDistrict);

        const matchesCity =
          !hierarchy.selection.selectedCity ||
          item.city === hierarchy.selection.selectedCity;

        return (
          matchesSearch &&
          matchesQuick &&
          matchesRegion &&
          matchesState &&
          matchesDistrict &&
          matchesCity
        );
      });

      const serialized = JSON.stringify(filtered.map((f) => f.id));
      if (lastFilteredRef.current !== serialized) {
        lastFilteredRef.current = serialized;
        onFilterChange(filtered);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    searchQuery,
    activeQuickFilter,
    hierarchy.selection,
    data,
    onFilterChange,
  ]);

  /* ---------------------------------------
     Quick Tags
  ---------------------------------------- */
  const quickTags = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((d) => {
      const key = d.district || d.city;
      if (key) counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([n]) => n);
  }, [data]);

  const anyFilterActive =
    hierarchy.selection.selectedRegion ||
    hierarchy.selection.selectedState ||
    hierarchy.selection.selectedDistrict ||
    hierarchy.selection.selectedCity;

  return (
    <div className="space-y-4">
      {/* Search + Filter Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone or location..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
            showFilters || anyFilterActive
              ? "bg-blue-600 border-blue-600 text-white"
              : "bg-gray-900 border-gray-800 text-gray-400"
          }`}
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {activeQuickFilter && (
          <button
            onClick={() => setActiveQuickFilter(null)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/50 text-red-400 text-[10px] font-bold"
          >
            <XCircle className="w-3 h-3" /> CLEAR
          </button>
        )}

        {quickTags.map((tag) => (
          <button
            key={tag}
            onClick={() =>
              setActiveQuickFilter(
                activeQuickFilter === tag ? null : tag
              )
            }
            className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
              activeQuickFilter === tag
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-gray-800 border-gray-700 text-gray-400"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest">
              Location Filters
            </h3>
            <button
              onClick={() => {
                hierarchy.setters.setSelectedRegion("");
                hierarchy.setters.setSelectedState("");
                hierarchy.setters.setSelectedDistrict("");
                hierarchy.setters.setSelectedCity("");
              }}
              className="text-xs text-red-400 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Region */}
            <select
              value={hierarchy.selection.selectedRegion}
              onChange={(e) => {
                hierarchy.setters.setSelectedRegion(e.target.value);
                hierarchy.setters.setSelectedState("");
                hierarchy.setters.setSelectedDistrict("");
                hierarchy.setters.setSelectedCity("");
              }}
              className="bg-gray-800 border-gray-700 rounded-xl p-3 text-sm outline-none"
            >
              <option value="">All Regions</option>
              <option value="uttarandhra">Uttarandhra</option>
              <option value="andhra">Andhra</option>
              <option value="rayalaseema">Rayalaseema</option>
              <option value="telangana">Telangana</option>
            </select>

            {/* State */}
            <select
              value={hierarchy.selection.selectedState}
              onChange={(e) => {
                hierarchy.setters.setSelectedState(e.target.value);
                hierarchy.setters.setSelectedDistrict("");
                hierarchy.setters.setSelectedCity("");
              }}
              className="bg-gray-800 border-gray-700 rounded-xl p-3 text-sm outline-none"
            >
              <option value="">All States</option>
              {hierarchy.states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* District */}
            <select
              disabled={!hierarchy.selection.selectedState}
              value={hierarchy.selection.selectedDistrict}
              onChange={(e) => {
                hierarchy.setters.setSelectedDistrict(e.target.value);
                hierarchy.setters.setSelectedCity("");
              }}
              className="bg-gray-800 border-gray-700 rounded-xl p-3 text-sm outline-none disabled:opacity-50"
            >
              <option value="">All Districts / Cities</option>
              {hierarchy.districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* City */}
            <select
              disabled={!hierarchy.selection.selectedDistrict}
              value={hierarchy.selection.selectedCity}
              onChange={(e) =>
                hierarchy.setters.setSelectedCity(e.target.value)
              }
              className="bg-gray-800 border-gray-700 rounded-xl p-3 text-sm outline-none disabled:opacity-50"
            >
              <option value="">All Cities</option>
              {hierarchy.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
