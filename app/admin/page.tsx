"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Filter,
  Users,
  Calendar,
  Building2,
  Loader2,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import * as types from "@/lib/certificate_and_id/types";
import FiltersPanel from "@/components/shared/admin/FilterPannel";
import RegistrationsTable from "@/components/shared/admin/RegistrationTables";
import StatsCard from "@/components/shared/admin/StatsCard";
import SearchBar from "@/components/shared/admin/Searchbar";
import { getAllRegistrationsWithDetails } from "@/lib/supabaseHelpers";
import { downloadExcel } from "@/components/shared/admin/utils/downloadExcel";
import {
  downloadFilesAsZip,
  FileInfo,
} from "@/components/shared/admin/utils/downloadcertandid";
import EventAndSessionsForm from "@/components/shared/admin/AddEventForm";


// ==================== DOWNLOAD BUTTONS COMPONENT ====================
const DownloadButtons: React.FC<{
  selectedCount: number;
  onDownloadXLSX: () => void;
  onDownloadCertsAndIDs: () => void;
  isDownloading: boolean;
}> = ({
  selectedCount,
  onDownloadXLSX,
  onDownloadCertsAndIDs,
  isDownloading,
}) => (
  <div className="flex gap-3">
    {/* Excel Download */}
    <button
      onClick={onDownloadXLSX}
      disabled={isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="w-4 h-4" />
      )}
      Download XLSX
    </button>

    {/* Certificates + IDs Download */}
    <button
      onClick={onDownloadCertsAndIDs}
      disabled={isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Download Certs & IDs
      {selectedCount > 0 && ` (${selectedCount})`}
    </button>
  </div>
);

// ==================== ADMIN DASHBOARD ====================
const AdminDashboardContent: React.FC = () => {
  const [registrations, setRegistrations] = useState<
    types.RegistrationWithDetails[]
  >([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    types.RegistrationWithDetails[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ==================== FILTER STATE ====================
  const [filters, setFilters] = useState<types.FilterState>({
    event: {
      id: "",
      name: "",
      description: null,
      slug: null,
      image_public_id: null,
      image_url: null,
      venue: "",
      start_time: "",
      end_time: "",
      created_at: "",
      updated_at: "",
    },
    session: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    academy: "",
  });

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [stats, setStats] = useState<types.StatsData>({
    total: 0,
    today: 0,
    thisWeek: 0,
  });

  // ==================== FETCH REGISTRATIONS ====================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllRegistrationsWithDetails();
        setRegistrations(data);
        calculateStats(data);
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ==================== FILTERING ====================
  const applyFilters = useCallback(() => {
    let filtered = [...registrations];

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(term) ||
          r.user?.whatsapp_number?.includes(term) ||
          r.session?.name?.toLowerCase().includes(term) ||
          r.event?.name?.toLowerCase().includes(term) ||
          r.registration_number?.toString().includes(term)
      );
    }

    // Event filter
    if (filters.event.id)
      filtered = filtered.filter((r) => r.event?.id === filters.event.id);

    // Session filter
    if (filters.session)
      filtered = filtered.filter((r) => r.session?.id === filters.session);

    // Status filter
    if (filters.status)
      filtered = filtered.filter((r) => r.status === filters.status);

    // Date range filters
    if (filters.dateFrom)
      filtered = filtered.filter(
        (r) => new Date(r.created_at) >= new Date(filters.dateFrom)
      );
    if (filters.dateTo)
      filtered = filtered.filter(
        (r) => new Date(r.created_at) <= new Date(filters.dateTo)
      );

    // Academy filter
    if (filters.academy)
      filtered = filtered.filter(
        (r) =>
          r.user?.organisation_name?.toLowerCase() ===
          filters.academy.toLowerCase()
      );

    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // ==================== CALCULATE STATS ====================
  const calculateStats = (regs: types.RegistrationWithDetails[]): void => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    setStats({
      total: regs.length,
      today: regs.filter((r) => new Date(r.created_at) >= today).length,
      thisWeek: regs.filter((r) => new Date(r.created_at) >= weekAgo).length,
    });
  };

  // ==================== CLEAR FILTERS ====================
  const clearFilters = (): void => {
    setFilters({
      event: {
        id: "",
        name: "",
        description: null,
        slug: null,
        image_public_id: null,
        image_url: null,
        venue: "",
        start_time: "",
        end_time: "",
        created_at: "",
        updated_at: "",
      },
      session: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      academy: "",
    });
    setSearchTerm("");
  };

  // ==================== UNIQUE VALUE LISTS ====================
  const uniqueSessions = registrations
    .map((r) => r.session)
    .filter((s): s is types.Session => !!s)
    .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);

  const uniqueEvents = registrations
    .map((r) => r.event)
    .filter((e): e is types.Event => !!e)
    .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i);

  const uniqueAcademies = Array.from(
    new Set(
      registrations.map((r) => r.user?.organisation_name).filter(Boolean)
    )
  ) as string[];

  // ==================== DOWNLOAD HANDLERS ====================

  /** Handles downloading the Excel file (only selected or all filtered). */
  const handleDownloadExcel = (): void => {
    const regsToDownload =
      selectedIds.size > 0
        ? filteredRegistrations.filter((r) => selectedIds.has(r.id))
        : filteredRegistrations;

    if (regsToDownload.length === 0) {
      alert("No registrations found to export.");
      return;
    }

    downloadExcel(regsToDownload);
  };

  /** Handles downloading certificates + ID cards as ZIP (only selected or all filtered). */
  const handleDownloadCertsAndIDs = async (): Promise<void> => {
    setIsDownloading(true);
    try {
      const regsToDownload =
        selectedIds.size > 0
          ? filteredRegistrations.filter((r) => selectedIds.has(r.id))
          : filteredRegistrations;

      // Prepare file info
      const files: FileInfo[] = regsToDownload.flatMap((reg) => {
        const academyName: string =
          reg.user?.organisation_name || "Unknown_Academy";
        const userName: string =
          reg.user?.name?.replace(/[^\w\s-]/g, "").trim() || "Unknown";

        const list: FileInfo[] = [];

        // Add certificate if exists
        if (reg.certificate_url && reg.certificate_url.trim() !== "") {
          list.push({
            url: reg.certificate_url,
            type: "certificate",
            academyName,
            filename: `${userName}_certificate.jpg`,
          });
        }

        // Add ID card if exists
        if (reg.id_card_url && reg.id_card_url.trim() !== "") {
          list.push({
            url: reg.id_card_url,
            type: "id_card",
            academyName,
            filename: `${userName}_idcard.jpg`,
          });
        }

        return list;
      });

      if (files.length === 0) {
        alert("No valid certificate or ID links found for the selected users.");
        return;
      }

      await downloadFilesAsZip(files, "Certificates_and_IDCards.zip");
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <h2>Add Event</h2>
        <EventAndSessionsForm/>
        <p className="text-gray-400 mb-6">
          Manage registrations, certificates, and ID cards
        </p>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Total Registrations"
            value={stats.total}
            icon={<Users className="w-12 h-12 text-blue-400" />}
            color="text-[var(--foreground)]"
          />
          <StatsCard
            title="Today"
            value={stats.today}
            icon={<Calendar className="w-12 h-12 text-green-400" />}
            color="text-green-400"
          />
          <StatsCard
            title="This Week"
            value={stats.thisWeek}
            icon={<Building2 className="w-12 h-12 text-purple-400" />}
            color="text-purple-400"
          />
        </div>

        {/* SEARCH + FILTER + DOWNLOAD BUTTONS */}
        <div className="bg-[var(--background)] rounded-lg shadow mb-6 p-4 border border-gray-700">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 flex-1 min-w-0">
              <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800"
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
            </div>

            <DownloadButtons
              selectedCount={selectedIds.size}
              onDownloadXLSX={handleDownloadExcel}
              onDownloadCertsAndIDs={handleDownloadCertsAndIDs}
              isDownloading={isDownloading}
            />
          </div>

          {showFilters && (
            <FiltersPanel
              filters={filters}
              onFilterChange={setFilters}
              uniqueSessions={uniqueSessions}
              uniqueEvents={uniqueEvents}
              uniqueAcademies={uniqueAcademies}
              onClearFilters={clearFilters}
            />
          )}
        </div>
{/* REGISTRATIONS TABLE */}
<RegistrationsTable
  tableName="Registrations"
  registrations={filteredRegistrations}
  selectedIds={selectedIds}
  // Toggle all rows: select all or clear all
  onToggleSelectAll={() => {
    if (selectedIds.size === filteredRegistrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRegistrations.map((r) => r.id)));
    }
  }}
  // Toggle a single row
  onToggleSelect={(id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }}
  // ✅ New handler for Deselect button
  onDeselectAll={() => setSelectedIds(new Set())}
/>


        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredRegistrations.length} of {registrations.length}{" "}
          registrations
          {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  /**
   * Handles password submission
   */
const handleSubmit = async (): Promise<void> => {
  setError("");

  try {
    const response: Response = await fetch("/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data: { success: boolean; error?: string } =
      await response.json();

    if (!data.success) {
      setError(data.error ?? "Authentication failed.");
      return;
    }

    setIsAuthorized(true);
  } catch (err) {
    console.error("Auth error:", err);
    setError("Unable to authenticate.");
  }
};

  // If authorized, show the real dashboard
  if (isAuthorized) {
    return <AdminDashboardContent />;
  }

  // Password gate UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-white text-xl font-bold mb-4 text-center">
          Admin Access
        </h2>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter admin password"
          className="w-full p-2 rounded mb-3"
        />

        {error && (
          <p className="text-red-400 text-sm mb-2">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Enter
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;

