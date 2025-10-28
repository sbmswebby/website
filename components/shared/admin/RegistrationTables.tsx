"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  Download,
} from "lucide-react";
import * as types from "@/lib/certificate_and_id/types";

/* ============================================================
   TYPES
   ============================================================ */

/**
 * ColumnConfig defines how each column behaves in a table.
 * - key: either a key of T, or a string path like "user.name"
 * - label: column header
 * - sortable: whether column supports sorting
 * - render: custom renderer for cell content
 */
interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface RegistrationsTableProps {
  tableName: string;
  registrations: types.RegistrationWithDetails[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  tableName,
  registrations,
  selectedIds,
  onToggleSelectAll,
  onToggleSelect,
}) => {
  /* ------------------------------------------------------------
     Local sort state
     ------------------------------------------------------------ */
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Handle sort toggle
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Utility function to safely access nested properties
  const getValue = (obj: unknown, path: string): unknown => {
    return path.split(".").reduce((acc, key) => {
      if (acc && typeof acc === "object" && key in acc) {
        // @ts-expect-error - key indexing
        return acc[key];
      }
      return undefined;
    }, obj);
  };

  // Apply sorting dynamically
  const sortedRegistrations = useMemo(() => {
    if (!sortConfig) return registrations;

    const { key, direction } = sortConfig;
    return [...registrations].sort((a, b) => {
      const valA = String(getValue(a, key) ?? "");
      const valB = String(getValue(b, key) ?? "");
      return direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
  }, [registrations, sortConfig]);

  /* ------------------------------------------------------------
     Column Configuration (Dynamic)
     ------------------------------------------------------------ */
  const columns: ColumnConfig<types.RegistrationWithDetails>[] = [
    { key: "registration_number", label: "Reg #", sortable: true },

    {
      key: "user.name",
      label: "Name",
      sortable: true,
      render: (reg) => (
        <div>
          <div className="font-medium text-gray-900">{reg.user?.name || "N/A"}</div>
          <div className="text-xs text-gray-500">{reg.user?.city || ""}</div>
        </div>
      ),
    },
    {
      key: "user.organisation_name",
      label: "Organisation",
      sortable: true,
      render: (reg) => reg.user?.organisation_name || "N/A",
    },
    {
      key: "user.whatsapp_number",
      label: "WhatsApp",
      sortable: true,
      render: (reg) => reg.user?.whatsapp_number || "N/A",
    },
    {
      key: "session.name",
      label: "Session",
      render: (reg) => reg.session?.name || "N/A",
    },
    {
      key: "event.name",
      label: "Event",
      render: (reg) => reg.event?.name || "N/A",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (reg) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            reg.status === "registered"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {reg.status}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (reg) => new Date(reg.created_at).toLocaleDateString(),
    },
    {
      key: "certificate.status",
      label: "Certificate",
      render: (reg) =>
        reg.certificate ? (
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600">{reg.certificate.status}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
    },
  ];

  /* ------------------------------------------------------------
     Header (Normal vs Bulk Mode)
     ------------------------------------------------------------ */
  const allSelected =
    selectedIds.size === registrations.length && registrations.length > 0;
  const anySelected = selectedIds.size > 0;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* --------------------- HEADER BAR --------------------- */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        {anySelected ? (
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSelectAll}
              className="text-sm text-blue-600 hover:underline"
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>

            {/* Bulk action icons */}
            <button className="p-1 hover:bg-gray-200 rounded" title="Edit">
              <Edit3 className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded" title="Delete">
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
            <button className="p-1 hover:bg-gray-200 rounded" title="Download IDs">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <h3 className="text-lg font-semibold text-gray-800">{tableName}</h3>
        )}
      </div>

      {/* --------------------- TABLE --------------------- */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable &&
                      (sortConfig?.key === col.key ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-gray-400" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {sortedRegistrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(reg.id)}
                    onChange={() => onToggleSelect(reg.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>

                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm text-gray-700"
                  >
                    {col.render
                      ? col.render(reg)
                      : String(getValue(reg, col.key) ?? "N/A")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --------------------- EMPTY STATE --------------------- */}
      {registrations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No registrations found</p>
        </div>
      )}
    </div>
  );
};

export default RegistrationsTable;
