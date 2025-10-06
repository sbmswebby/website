// ==================== FILTERS PANEL COMPONENT ====================
// A modern, intuitive filter panel using clickable filter chips,
// sticky positioning, and responsive design with instant feedback.

"use client";
import React, { useEffect, useRef } from "react";
import * as types from "@/lib/certificate_and_id/types";
import { X, ChevronDown, ChevronUp } from "lucide-react";

/**
 * Props for the FiltersPanel component
 */
interface FiltersPanelProps {
  filters: types.FilterState;
  onFilterChange: (filters: types.FilterState) => void;
  uniqueSessions: types.Session[];
  onClearFilters: () => void;
  uniqueAcademies?: string[]; // Optional academy filter list
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  onFilterChange,
  uniqueSessions,
  onClearFilters,
  uniqueAcademies = [],
}) => {
  // Accordion open/close state for mobile responsiveness
  const [isSessionsOpen, setIsSessionsOpen] = React.useState<boolean>(true);
  const [isAcademiesOpen, setIsAcademiesOpen] = React.useState<boolean>(true);
  const [isStatusOpen, setIsStatusOpen] = React.useState<boolean>(true);

  // ✅ Fix: only auto-select latest session once, on initial mount
  const initializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!initializedRef.current && !filters.session && uniqueSessions.length > 0) {
      const latest = uniqueSessions[uniqueSessions.length - 1];
      onFilterChange({ ...filters, session: latest.id });
      initializedRef.current = true; // Prevent re-running on future clears
    }
  }, [uniqueSessions]);

  /**
   * Handles filter chip clicks for any field (session, status, academy)
   * Clicking again on the same value resets it (toggle behavior)
   */
  const handleFilterClick = (
    field: keyof types.FilterState,
    value: string
  ): void => {
    onFilterChange({
      ...filters,
      [field]: filters[field] === value ? "" : value,
    });
  };

  /**
   * Removes a specific filter when the user clicks its tag's "X"
   */
  const handleRemoveTag = (field: keyof types.FilterState): void => {
    onFilterChange({ ...filters, [field]: "" });
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm p-10 m-10 rounded-lg">
      {/* ==================== ACTIVE FILTER SUMMARY ==================== */}
      {(filters.session || filters.status || filters.academy) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {filters.session && (
            <div className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              Session:&nbsp;
              {
                uniqueSessions.find((s) => s.id === filters.session)?.name ??
                filters.session
              }
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

      {/* ==================== FILTER SECTIONS ==================== */}
      <div className="space-y-4">
        {/* -------- Session Filter Section -------- */}
        <div className="border rounded-lg p-3">
          <button
            className="w-full flex justify-between items-center text-gray-700 font-medium mb-2"
            onClick={() => setIsSessionsOpen(!isSessionsOpen)}
          >
            <span>Sessions</span>
            {isSessionsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isSessionsOpen && (
            <div className="flex flex-wrap gap-2">
              {/* "All" Button */}
              <button
                className={`px-3 py-1 rounded-full border ${
                  filters.session === ""
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterClick("session", "")}
              >
                All
              </button>

              {/* Dynamic session buttons */}
              {uniqueSessions.map((session) => (
                <button
                  key={session.id}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    filters.session === session.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleFilterClick("session", session.id)}
                >
                  {session.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* -------- Academy Filter Section -------- */}
        {uniqueAcademies.length > 0 && (
          <div className="border rounded-lg p-3">
            <button
              className="w-full flex justify-between items-center text-gray-700 font-medium mb-2"
              onClick={() => setIsAcademiesOpen(!isAcademiesOpen)}
            >
              <span>Academies</span>
              {isAcademiesOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {isAcademiesOpen && (
              <div className="flex flex-wrap gap-2">
                {/* "All" Button */}
                <button
                  className={`px-3 py-1 rounded-full border ${
                    filters.academy === ""
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleFilterClick("academy", "")}
                >
                  All
                </button>

                {/* Dynamic academy buttons */}
                {uniqueAcademies.map((academy) => (
                  <button
                    key={academy}
                    className={`px-3 py-1 rounded-full border text-sm ${
                      filters.academy === academy
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
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

        {/* -------- Status Filter Section -------- */}
        <div className="border rounded-lg p-3">
          <button
            className="w-full flex justify-between items-center text-gray-700 font-medium mb-2"
            onClick={() => setIsStatusOpen(!isStatusOpen)}
          >
            <span>Status</span>
            {isStatusOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isStatusOpen && (
            <div className="flex flex-wrap gap-2">
              {/* "All" Button */}
              <button
                className={`px-3 py-1 rounded-full border ${
                  filters.status === ""
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterClick("status", "")}
              >
                All
              </button>

              {/* Status options */}
              <button
                className={`px-3 py-1 rounded-full border text-sm ${
                  filters.status === "registered"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterClick("status", "registered")}
              >
                Registered
              </button>

              <button
                className={`px-3 py-1 rounded-full border text-sm ${
                  filters.status === "cancelled"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterClick("status", "cancelled")}
              >
                Cancelled
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== CLEAR ALL BUTTON ==================== */}
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
