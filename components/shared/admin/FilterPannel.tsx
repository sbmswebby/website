"use client";

import React, { useEffect, useRef, useState } from "react";
import * as types from "@/lib/certificate_and_id/types";
import { X, ChevronDown, ChevronUp } from "lucide-react";

// ==================== INTERFACE ====================
interface FiltersPanelProps {
  filters: types.FilterState;
  onFilterChange: (filters: types.FilterState) => void;
  uniqueSessions: types.Session[];
  uniqueEvents: types.Event[];
  onClearFilters: () => void;
  uniqueAcademies?: string[];
}

// ==================== COMPONENT ====================
const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  onFilterChange,
  uniqueSessions,
  uniqueEvents,
  onClearFilters,
  uniqueAcademies = [],
}) => {
  // ==================== LOCAL STATE ====================
  const [isEventsOpen, setIsEventsOpen] = useState<boolean>(true);
  const [isSessionsOpen, setIsSessionsOpen] = useState<boolean>(true);
  const [isAcademiesOpen, setIsAcademiesOpen] = useState<boolean>(true);
  const [isStatusOpen, setIsStatusOpen] = useState<boolean>(true);
  const [isCreatedOnOpen, setIsCreatedOnOpen] = useState<boolean>(true);

  const initializedRef = useRef<boolean>(false);

  // ==================== EFFECT: Auto-select last session ====================
  useEffect(() => {
    if (!initializedRef.current && !filters.session && uniqueSessions.length > 0) {
      const latest = uniqueSessions[uniqueSessions.length - 1];
      onFilterChange({ ...filters, session: latest.id });
      initializedRef.current = true;
    }
  }, [filters, onFilterChange, uniqueSessions]);

  // ==================== HANDLERS ====================

  /** Toggles a specific filter value (clears if re-clicked) */
  const handleFilterClick = (field: keyof types.FilterState, value: string): void => {
    onFilterChange({
      ...filters,
      [field]: filters[field] === value ? "" : value,
    });
  };

  /** Removes a specific filter tag */
  const handleRemoveTag = (field: keyof types.FilterState): void => {
    onFilterChange({ ...filters, [field]: "" });
  };

  /** Handles date change for the Created On filter */
  const handleDateChange = (field: "dateFrom" | "dateTo", value: string): void => {
    onFilterChange({ ...filters, [field]: value });
  };

  /** Filters sessions based on selected event */
  const filteredSessions: types.Session[] =
    filters.event && filters.event.name !== ""
      ? uniqueSessions.filter((s) => s.event_id === filters.event.id)
      : uniqueSessions;

  // ==================== RENDER ====================
  return (
    <div className="sticky top-0 z-10 text-gray-800 bg-white border-b border-gray-200 shadow-sm p-10 m-10 rounded-lg">
      {/* ==================== ACTIVE FILTER TAGS ==================== */}
      {(filters.session || filters.status || filters.academy || filters.event) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Event Tag */}
          {filters.event && (
            <div className="flex items-center bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
              Event:&nbsp;
              {uniqueEvents.find((e) => e.id === filters.event.id)?.name ?? filters.event.name}
              <X
                className="ml-2 w-3 h-3 cursor-pointer hover:text-yellow-900"
                onClick={() => handleRemoveTag("event")}
              />
            </div>
          )}

          {/* Session Tag */}
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

          {/* Academy Tag */}
          {filters.academy && (
            <div className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
              Academy: {filters.academy}
              <X
                className="ml-2 w-3 h-3 cursor-pointer hover:text-purple-900"
                onClick={() => handleRemoveTag("academy")}
              />
            </div>
          )}

          {/* Status Tag */}
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
        {/* ========= EVENTS FILTER ========= */}
        <div className="border rounded-lg p-3">
          <button
            className="w-full flex justify-between items-center text-gray-700 font-medium mb-2"
            onClick={() => setIsEventsOpen(!isEventsOpen)}
          >
            <span>Events</span>
            {isEventsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isEventsOpen && (
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full border ${
                  filters.event.name === "" ? "bg-yellow-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => handleFilterClick("event", "")}
              >
                All Events
              </button>
              {uniqueEvents.map((event) => (
                <button
                  key={event.id}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    filters.event.id === event.id ? "bg-yellow-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => handleFilterClick("event", event.id)}
                >
                  {event.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========= SESSIONS FILTER ========= */}
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
                All Sessions
              </button>
              {filteredSessions.map((session) => (
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

        {/* ========= ACADEMIES FILTER ========= */}
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

        {/* ========= STATUS FILTER ========= */}
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

        {/* ========= CREATED ON FILTER (DATE RANGE) ========= */}
        <div className="border rounded-lg p-3">
          <button
            className="w-full flex justify-between items-center text-gray-700 font-medium mb-2"
            onClick={() => setIsCreatedOnOpen(!isCreatedOnOpen)}
          >
            <span>Created On</span>
            {isCreatedOnOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isCreatedOnOpen && (
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600">From</label>
                <input
                  type="date"
                  value={filters.dateFrom ?? ""}
                  onChange={(e) => handleDateChange("dateFrom", e.target.value)}
                  className="border rounded-lg px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">To</label>
                <input
                  type="date"
                  value={filters.dateTo ?? ""}
                  onChange={(e) => handleDateChange("dateTo", e.target.value)}
                  className="border rounded-lg px-2 py-1 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== CLEAR ALL ==================== */}
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
