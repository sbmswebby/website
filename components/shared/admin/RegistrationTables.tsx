"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  SquareMinus,
  ExternalLink,
  X,
} from "lucide-react";
import * as types from "@/lib/certificate_and_id/types";
import { deleteRegistrations } from "@/lib/supabaseHelpers";
import { useRouter } from "next/navigation";


/* ============================================================
   TYPES
   ============================================================ */

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
  onDeselectAll: () => void;
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
  onDeselectAll,
}) => {
  const router = useRouter();
  /* ------------------------------------------------------------
     State Management
     ------------------------------------------------------------ */
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ For Certificates Modal
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);
  const [currentCertificates, setCurrentCertificates] = useState<string[]>([]);

  /**
   * Toggles sorting for a given column key.
   */
  const handleSort = (key: string): void => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  /**
   * Safely access nested properties (like "user.name")
   */
  const getValue = (obj: unknown, path: string): unknown => {
    return path.split(".").reduce((acc, key) => {
      if (acc && typeof acc === "object" && key in acc) {
        // @ts-expect-error safe dynamic access
        return acc[key];
      }
      return undefined;
    }, obj);
  };

  /**
   * Sort registrations dynamically
   */
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
     Delete Logic
     ------------------------------------------------------------ */
  const handleConfirmDelete = async (): Promise<void> => {
    setIsDeleting(true);
    const idsToDelete = Array.from(selectedIds);
    const success = await deleteRegistrations(idsToDelete);
    setIsDeleting(false);
    setShowDeleteModal(false);

    if (success) {
      console.log("Deleted")
      router.refresh();
    } else {
      alert("Failed to delete registrations. Check console for details.");
    }
  };

  /* ------------------------------------------------------------
     Table Configuration
     ------------------------------------------------------------ */
  const columns: ColumnConfig<types.RegistrationWithDetails>[] = [
    { key: "registration_number", label: "Reg #", sortable: true },
    {
      key: "user.name",
      label: "Name",
      sortable: true,
      render: (reg) => (
        <div>
          <div className="font-medium text-gray-900">
            {reg.user?.name || "N/A"}
          </div>
          <div className="text-xs text-gray-500">{reg.user?.city || ""}</div>
        </div>
      ),
    },
{
  key: "user.organisation_name",
  label: "Organisation",
  sortable: true,
  render: (reg) => (
    <div>
      {/* Organisation */}
      <div>{reg.user?.organisation_name || "N/A"}</div>

      {/* Profession always shown below organisation */}
      <div className="text-xs text-gray-500 min-h-[1rem]">
        {reg.user?.profession ? reg.user.profession : "—"}
      </div>
    </div>
  ),
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
      key: "created_at",
      label: "Date",
      sortable: true,
      render: (reg) => new Date(reg.created_at).toLocaleDateString(),
    },
    {
      key: "id_card.url",
      label: "ID Card",
      render: (reg) =>
        reg.id_card_url ? (
          <a
            href={reg.id_card_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
          >
            View ID
          </a>
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
    },
    /* ------------------------------------------------------------
       ✅ New Certificates Column
       ------------------------------------------------------------ */
    {
      key: "certificates",
      label: "Certificates",
      render: (reg) => {
        const certs: string[] = reg.certificates?.map((c) => c.url) ?? [];
        if (certs.length === 0) {
          return <span className="text-xs text-gray-400">N/A</span>;
        }

        // Display comma-separated values (like a CSV preview)
        const csvText = certs.join(", ");

        return (
          <button
            type="button"
            onClick={() => {
              setCurrentCertificates(certs);
              setShowCertificatesModal(true);
            }}
            className="text-blue-600 hover:underline text-xs truncate max-w-[200px] text-left"
            title="Click to view all links"
          >
            {csvText}
          </button>
        );
      },
    },
  ];

  /* ------------------------------------------------------------
     Header Bar
     ------------------------------------------------------------ */
  const allSelected =
    selectedIds.size === registrations.length && registrations.length > 0;
  const anySelected = selectedIds.size > 0;

  return (
    <>
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

              <button
                onClick={onDeselectAll}
                className="p-1 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="Deselect All"
              >
                <SquareMinus className="w-4 h-4" />
              </button>

              <button className="p-1 hover:bg-gray-200 rounded" title="Edit Selected">
                <Edit3 className="w-4 h-4 text-gray-600" />
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ) : (
            <h3 className="text-lg font-semibold text-gray-800">{tableName}</h3>
          )}
        </div>

        {/* --------------------- TABLE --------------------- */}
        <div className="overflow-x-auto">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full border-collapse">
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
                      <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
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
        </div>

        {registrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No registrations found</p>
          </div>
        )}
      </div>

      {/* ================== DELETE CONFIRMATION MODAL ================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Deletion
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">{selectedIds.size}</span>{" "}
              {selectedIds.size === 1 ? "registration" : "registrations"}?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={`px-4 py-2 text-sm text-white rounded ${
                  isDeleting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================== CERTIFICATES MODAL ================== */}
      {showCertificatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Certificates</h2>
              <button
                onClick={() => setShowCertificatesModal(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {currentCertificates.length > 0 ? (
              <ul className="space-y-2">
                {currentCertificates.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> {link}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No certificates found.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default RegistrationsTable;
