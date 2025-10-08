"use client";

import React, { useEffect, useRef } from "react";
import * as types from "@/lib/certificate_and_id/types";
import { X, ChevronDown, ChevronUp } from "lucide-react";

interface FiltersPanelProps {
  filters: types.FilterState;
  onFilterChange: (filters: types.FilterState) => void;
  uniqueSessions: types.Session[];
  onClearFilters: () => void;
  uniqueAcademies?: string[];
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  onFilterChange,
  uniqueSessions,
  onClearFilters,
  uniqueAcademies = [],
}) => {
  const [isSessionsOpen, setIsSessionsOpen] = React.useState<boolean>(true);
  const [isAcademiesOpen, setIsAcademiesOpen] = React.useState<boolean>(true);
  const [isStatusOpen, setIsStatusOpen] = React.useState<boolean>(true);

  const initializedRef = useRef<boolean>(false);

  // ✅ Proper useEffect with correct dependencies
  useEffect(() => {
    if (!initializedRef.current && !filters.session && uniqueSessions.length > 0) {
      const latest = uniqueSessions[uniqueSessions.length - 1];
      onFilterChange({ ...filters, session: latest.id });
      initializedRef.current = true;
    }
  }, [filters, onFilterChange, uniqueSessions]);

  const handleFilterClick = (field: keyof types.FilterState, value: string): void => {
    onFilterChange({
      ...filters,
      [field]: filters[field] === value ? "" : value,
    });
  };

  const handleRemoveTag = (field: keyof types.FilterState): void => {
    onFilterChange({ ...filters, [field]: "" });
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm p-10 m-10 rounded-lg">
      {(filters.session || filters.status || filters.academy) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {filters.session && (
            <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              Session:&nbsp;
              {uniqueSessions.find((s) => s.id === filters.session)?.name ?? filters.session}
              <X
                className="ml-2 w-3 h-3 cursor-pointer hover:text-blue-900"
                onClick={() => handleRemoveTag("session")}
              />
            </div>
          )}

          {filters.academy && (
            <div className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
              Academy: {filters.academy}
              <X
                className="ml-2 w-3 h-3 cursor-pointer hover:text-purple-900"
                onClick={() => handleRemoveTag("academy")}
              />
            </div>
          )}

          {filters.status && (
            <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
              Status: {filters.status}
              <X
                className="ml-2 w-3 h-3 cursor-pointer hover:text-green-900"
                onClick={() => handleRemoveTag("status")}
              />
            </div>
          )}
        </div>
      )}

      {/* Filter sections */}
      <div className="space-y-4">
        {/* Sessions */}
        <div className="border rounded-lg p-3">
          <button
            className="w-full flex justify-between items-center text-gray-700 font-medium mb-2"
            onClick={() => setIsSessionsOpen(!isSessionsOpen)}
          >
            <span>Sessions</span>
            {isSessionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isSessionsOpen && (
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full border ${
                  filters.session === "" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterClick("session", "")}
              >
                All
              </button>
              {uniqueSessions.map((session) => (
                <button
                  key={session.id}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    filters.session === session.id ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleFilterClick("session", session.id)}
                >
                  {session.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Academies */}
        {uniqueAcademies.length > 0 && (
          <div className="border rounded-lg p-3">
            <button
              className="w-full flex justify-between items-center text-gray-700 font-medium mb-2"
              onClick={() => setIsAcademiesOpen(!isAcademiesOpen)}
            >
              <span>Academies</span>
              {isAcademiesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isAcademiesOpen && (
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full border ${
                    filters.academy === "" ? "bg-purple-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleFilterClick("academy", "")}
                >
                  All
                </button>
                {uniqueAcademies.map((academy) => (
                  <button
                    key={academy}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      filters.academy === academy ? "bg-purple-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                    }`}
                    onClick={() => handleFilterClick("academy", academy)}
                  >
                    {academy}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div className="border rounded-lg p-3">
          <button
            className="w-full flex justify-between items-center text-gray-700 font-medium mb-2"
            onClick={() => setIsStatusOpen(!isStatusOpen)}
          >
            <span>Status</span>
            {isStatusOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isStatusOpen && (
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full border ${
                  filters.status === "" ? "bg-green-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterClick("status", "")}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded-full border text-sm ${
                  filters.status === "registered" ? "bg-green-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterClick("status", "registered")}
              >
                Registered
              </button>
              <button
                className={`px-3 py-1 rounded-full border text-sm ${
                  filters.status === "cancelled" ? "bg-green-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterClick("status", "cancelled")}
              >
                Cancelled
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 text-sm"
        >
          <X className="w-4 h-4" />
          Clear All
        </button>
      </div>
    </div>
  );
};

export default FiltersPanel;
