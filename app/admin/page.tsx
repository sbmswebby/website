"use client";

import React, { useState, useEffect } from "react";
import { Filter, Users, Calendar, Building2, Loader2 } from "lucide-react";
import * as types from "@/lib/certificate_and_id/types";
import ActionButtons from "@/components/shared/admin/ActionBtn";
import FiltersPanel from "@/components/shared/admin/FilterPannel";
import RegistrationsTable from "@/components/shared/admin/RegistrationTables";
import StatsCard from "@/components/shared/admin/StatsCard";
import SearchBar from "@/components/shared/admin/Searchbar";

// Import Supabase helpers
import {
  getAllRegistrationsWithDetails,
} from "@/lib/supabaseHelpers";

// ==================== MAIN ADMIN DASHBOARD COMPONENT ====================
const AdminDashboard: React.FC = () => {
  const [registrations, setRegistrations] = useState<types.RegistrationWithDetails[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<types.RegistrationWithDetails[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<types.FilterState>({
    session: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [stats, setStats] = useState<types.StatsData>({
    total: 0,
    today: 0,
    thisWeek: 0,
  });

  // ==================== FETCH REGISTRATIONS FROM SUPABASE ====================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("[AdminDashboard] Fetching registrations from Supabase...");
        const data = await getAllRegistrationsWithDetails();
        console.log("[AdminDashboard] Fetched registrations:", data.length);

        setRegistrations(data);
        calculateStats(data);
      } catch (error) {
        console.error("[AdminDashboard] Failed to fetch registrations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ==================== APPLY FILTERS WHEN SEARCH OR FILTERS CHANGE ====================
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, registrations]);

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

  // ==================== FILTERING FUNCTION ====================
  const applyFilters = (): void => {
    let filtered = [...registrations];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.user?.name?.toLowerCase().includes(term) ||
          reg.user?.whatsapp_number?.includes(term) ||
          reg.session?.name?.toLowerCase().includes(term) ||
          reg.event?.name?.toLowerCase().includes(term) ||
          reg.registration_number?.toString().includes(term)
      );
    }

    if (filters.session) {
      filtered = filtered.filter((reg) => reg.session?.id === filters.session);
    }

    if (filters.status) {
      filtered = filtered.filter((reg) => reg.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (reg) => new Date(reg.created_at) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (reg) => new Date(reg.created_at) <= new Date(filters.dateTo)
      );
    }

    setFilteredRegistrations(filtered);
  };

  // ==================== SELECT / DESELECT ====================
  const toggleSelectAll = (): void => {
    if (selectedIds.size === filteredRegistrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRegistrations.map((r) => r.id)));
    }
  };

  const toggleSelect = (id: string): void => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // ==================== DOWNLOAD FUNCTIONS ====================
  const downloadAsXLSX = async (regsToDownload: types.RegistrationWithDetails[]): Promise<void> => {
    setIsDownloading(true);
    try {
      console.log("[AdminDashboard] Preparing XLSX download:", regsToDownload.length);
      // TODO: Replace with XLSX generation code
      alert(`Would download ${regsToDownload.length} registrations as XLSX`);
    } catch (error) {
      console.error("[AdminDashboard] Failed to download XLSX:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadCertificatesAndIDs = async (): Promise<void> => {
    setIsDownloading(true);
    try {
      const selected = filteredRegistrations.filter((r) => selectedIds.has(r.id));
      const urls: string[] = [];

      selected.forEach((reg) => {
        if (reg.certificate?.download_url) urls.push(reg.certificate.download_url);
        if (reg.ticket_url) urls.push(reg.ticket_url);
      });

      console.log("[AdminDashboard] Downloading certificates and IDs:", urls);
      alert(`Would download ${urls.length} files (certificates and ID cards)`);
    } catch (error) {
      console.error("[AdminDashboard] Failed to download certificates/IDs:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // ==================== CLEAR FILTERS ====================
  const clearFilters = (): void => {
    setFilters({ session: "", status: "", dateFrom: "", dateTo: "" });
    setSearchTerm("");
  };

  // ==================== UNIQUE SESSIONS ====================
  const uniqueSessions = registrations
    .map((r) => r.session)
    .filter((session): session is types.Session => session !== null && session !== undefined)
    .filter((session, index, self) => self.findIndex((s) => s.id === session.id) === index);

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER DASHBOARD ====================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage event registrations, certificates, and ID cards</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard title="Total Registrations" value={stats.total} icon={<Users className="w-12 h-12 text-blue-600" />} color="text-gray-900" />
          <StatsCard title="Today" value={stats.today} icon={<Calendar className="w-12 h-12 text-green-600" />} color="text-green-600" />
          <StatsCard title="This Week" value={stats.thisWeek} icon={<Building2 className="w-12 h-12 text-purple-600" />} color="text-purple-600" />
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 flex-1 min-w-0">
              <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            <ActionButtons
              selectedCount={selectedIds.size}
              onDownloadAll={() => downloadAsXLSX(filteredRegistrations)}
              onDownloadSelected={() => {
                const selected = filteredRegistrations.filter((r) => selectedIds.has(r.id));
                downloadAsXLSX(selected);
              }}
              onDownloadCertsAndIDs={downloadCertificatesAndIDs}
              isDownloading={isDownloading}
            />
          </div>

          {showFilters && (
            <FiltersPanel filters={filters} onFilterChange={setFilters} uniqueSessions={uniqueSessions} onClearFilters={clearFilters} />
          )}
        </div>

        {/* Registrations Table */}
        <RegistrationsTable registrations={filteredRegistrations} selectedIds={selectedIds} onToggleSelectAll={toggleSelectAll} onToggleSelect={toggleSelect} />

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredRegistrations.length} of {registrations.length} registrations
          {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
