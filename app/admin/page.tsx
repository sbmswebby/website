"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Filter, Users, Calendar, Building2, Loader2, FileSpreadsheet, Download } from "lucide-react";
import * as types from "@/lib/certificate_and_id/types";
import FiltersPanel from "@/components/shared/admin/FilterPannel";
import RegistrationsTable from "@/components/shared/admin/RegistrationTables";
import StatsCard from "@/components/shared/admin/StatsCard";
import SearchBar from "@/components/shared/admin/Searchbar";
import { getAllRegistrationsWithDetails } from "@/lib/supabaseHelpers";
import { downloadExcel } from "@/components/shared/admin/utils/downloadExcel";
import { downloadFilesAsZip } from "@/components/shared/admin/utils/downloadcertandid";

// ==================== DOWNLOAD BUTTONS COMPONENT ====================
const DownloadButtons: React.FC<{
  selectedCount: number;
  onDownloadXLSX: () => void;
  onDownloadCertsAndIDs: () => void;
  isDownloading: boolean;
}> = ({ selectedCount, onDownloadXLSX, onDownloadCertsAndIDs, isDownloading }) => (
  <div className="flex gap-3">
    <button
      onClick={onDownloadXLSX}
      disabled={isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
      Download XLSX
    </button>

    <button
      onClick={onDownloadCertsAndIDs}
      disabled={selectedCount === 0 || isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Download Certs & IDs ({selectedCount})
    </button>
  </div>
);

// ==================== ADMIN DASHBOARD ====================
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
    academy: "",
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [stats, setStats] = useState<types.StatsData>({ total: 0, today: 0, thisWeek: 0 });

  // ==================== FETCH REGISTRATIONS ====================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllRegistrationsWithDetails();
        setRegistrations(data);
        calculateStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ==================== FILTERING ====================
  const applyFilters = useCallback(() => {
    let filtered = [...registrations];

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

    if (filters.session) filtered = filtered.filter((r) => r.session?.id === filters.session);
    if (filters.status) filtered = filtered.filter((r) => r.status === filters.status);
    if (filters.dateFrom) filtered = filtered.filter((r) => new Date(r.created_at) >= new Date(filters.dateFrom));
    if (filters.dateTo) filtered = filtered.filter((r) => new Date(r.created_at) <= new Date(filters.dateTo));

    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // ==================== CALCULATE STATS ====================
  const calculateStats = (regs: types.RegistrationWithDetails[]) => {
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

  // ==================== SELECT / DESELECT ====================
  const toggleSelectAll = () =>
    selectedIds.size === filteredRegistrations.length
      ? setSelectedIds(new Set())
      : setSelectedIds(new Set(filteredRegistrations.map((r) => r.id)));

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedIds(newSelected);
  };

  // ==================== DOWNLOAD XLSX ====================
  const downloadAsXLSX = (regsToDownload: types.RegistrationWithDetails[]) => {
    if (regsToDownload.length === 0) return;
    setIsDownloading(true);
    try {
      const dataForExcel = regsToDownload.map((r) => ({
        RegistrationID: r.registration_number,
        Name: r.user?.name ?? "",
        WhatsApp: r.user?.whatsapp_number ?? "",
        Organisation: r.user?.organisation_name ?? "",
        Session: r.session?.name ?? "",
        Event: r.event?.name ?? "",
        Status: r.status ?? "",
        CreatedAt: new Date(r.created_at).toLocaleString(),
      }));
      downloadExcel(dataForExcel, "Registrations.xlsx");
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  // ==================== DOWNLOAD CERTIFICATES & IDs ====================
  const downloadCertificatesAndIDs = async () => {
    setIsDownloading(true);
    try {
      const files: Array<{
        url: string;
        type: "certificate" | "id_card";
        academyName: string;
        filename: string;
      }> = [];

      filteredRegistrations.forEach((r) => {
        const academyName = r.user?.organisation_name || "Unknown_Academy";
        const userName = r.user?.name?.replace(/[^a-zA-Z0-9]/g, "_") || "User";
        const regNumber = r.registration_number || "0";

        if (r.certificate?.download_url) {
          files.push({
            url: r.certificate.download_url,
            type: "certificate",
            academyName,
            filename: `${regNumber}_${userName}_Certificate.pdf`,
          });
        }

        if (r.ticket_url) {
          files.push({
            url: r.ticket_url,
            type: "id_card",
            academyName,
            filename: `${regNumber}_${userName}_IDCard.pdf`,
          });
        }
      });

      if (files.length === 0) {
        alert("No certificates or IDs found.");
        return;
      }

      await downloadFilesAsZip(files, "All_Certificates_and_IDs.zip");
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ session: "", status: "", dateFrom: "", dateTo: "", academy: "" });
    setSearchTerm("");
  };

  const uniqueSessions = registrations
    .map((r) => r.session)
    .filter((s): s is types.Session => !!s)
    .filter((s, idx, self) => self.findIndex((x) => x.id === s.id) === idx);

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
        <p className="text-gray-400 mb-6">Manage registrations, certificates, and ID cards</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard title="Total Registrations" value={stats.total} icon={<Users className="w-12 h-12 text-blue-400" />} color="text-[var(--foreground)]" />
          <StatsCard title="Today" value={stats.today} icon={<Calendar className="w-12 h-12 text-green-400" />} color="text-green-400" />
          <StatsCard title="This Week" value={stats.thisWeek} icon={<Building2 className="w-12 h-12 text-purple-400" />} color="text-purple-400" />
        </div>

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
              selectedCount={filteredRegistrations.length}
              onDownloadXLSX={() => downloadAsXLSX(filteredRegistrations)}
              onDownloadCertsAndIDs={downloadCertificatesAndIDs}
              isDownloading={isDownloading}
            />
          </div>

          {showFilters && (
            <FiltersPanel filters={filters} onFilterChange={setFilters} uniqueSessions={uniqueSessions} onClearFilters={clearFilters} />
          )}
        </div>

        <RegistrationsTable
          registrations={filteredRegistrations}
          selectedIds={selectedIds}
          onToggleSelectAll={toggleSelectAll}
          onToggleSelect={toggleSelect}
        />

        <div className="mt-4 text-sm text-gray-400">
          Showing {filteredRegistrations.length} of {registrations.length} registrations
          {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
