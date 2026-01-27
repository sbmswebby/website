"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BBNDirector } from "./bbnTypes";
import BBNDirectorModal from "./modal";
import { Trash2, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, Users, Ban } from "lucide-react";

export default function BBNTable() {
  const [data, setData] = useState<BBNDirector[]>([]);
  const [selected, setSelected] = useState<BBNDirector | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bbn_directors")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    setActionId(id);
    const { error } = await supabase
      .from("bbn_directors")
      .update({ is_approved: !currentStatus })
      .eq("id", id);
    
    if (!error) {
      setData(prev => prev.map(d => d.id === id ? { ...d, is_approved: !currentStatus } : d));
    }
    setActionId(null);
  };

  const deleteDirector = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    setActionId(id);
    const { error } = await supabase.from("bbn_directors").delete().eq("id", id);
    if (!error) {
      setData(prev => prev.filter(d => d.id !== id));
      if (currentRows.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
    }
    setActionId(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center p-20 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span>Fetching director database...</span>
    </div>
  );

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm max-h-[75vh] flex flex-col">
        
        {/* Sticky Header Section */}
        <div className="sticky top-0 z-20 bg-[#0a0a0a] border-b border-gray-800">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xs">
                <p className="text-white font-bold uppercase tracking-tighter">Directory Controls</p>
                <p className="text-gray-500 text-[10px]">
                  {data.length > 0 ? indexOfFirstRow + 1 : 0}-{Math.min(indexOfLastRow, data.length)} of {data.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || data.length === 0}
                  className="p-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 text-xs font-mono text-gray-400">
                  {currentPage} <span className="text-gray-700">/</span> {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || data.length === 0}
                  className="p-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-20 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#0a0a0a] text-gray-500 uppercase tracking-widest text-[9px] font-black">
              <tr>
                <th className="p-4 text-left w-[30%]">Director</th>
                <th className="p-4 text-center w-[20%]">Region</th>
                <th className="p-4 text-left w-[25%]">Location</th>
                <th className="p-4 text-center w-[15%]">Status Action</th>
                <th className="p-4 text-right w-[10%]">Remove</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Scrollable Body Section */}
        <div className="overflow-y-auto flex-1 custom-scrollbar bg-black/20">
          <table className="w-full border-collapse text-sm">
            <tbody className="divide-y divide-gray-800/50">
              {currentRows.length > 0 ? (
                currentRows.map((row) => (
                  <tr key={row.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                    <td className="p-4 w-[30%]">
                      <div className="flex flex-col">
                        <button onClick={() => setSelected(row)} className="text-gray-200 group-hover:text-blue-400 font-bold text-left transition-colors truncate">
                          {row.name}
                        </button>
                        <span className="text-gray-600 text-[11px] font-mono">{row.phone_number}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center w-[20%]">
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[9px] font-bold uppercase tracking-tighter border border-gray-700">
                        {row.region}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 w-[25%]">
                      <div className="text-[11px] leading-tight">
                        <div className="text-gray-300 font-medium">{row.city}</div>
                        <div className="truncate">{row.district || row.state}</div>
                      </div>
                    </td>
                    <td className="p-4 text-center w-[15%]">
                      <button
                        onClick={() => toggleApproval(row.id, !!row.is_approved)}
                        disabled={actionId === row.id}
                        className={`min-w-[90px] inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-black transition-all border ${
                          row.is_approved 
                            ? "bg-transparent text-green-500 border-green-500/30 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50" 
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                        }`}
                      >
                        {actionId === row.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : row.is_approved ? (
                          <>
                            <CheckCircle className="w-3 h-3 group-hover:hidden" />
                            <Ban className="w-3 h-3 hidden group-hover:block" />
                            <span className="group-hover:hidden tracking-widest">LIVE</span>
                            <span className="hidden group-hover:block tracking-widest">DISAPPROVE</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span className="tracking-widest">PENDING</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-right w-[10%]">
                      <button onClick={() => deleteDirector(row.id)} className="p-2 text-gray-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-gray-600 text-xs tracking-widest uppercase">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <BBNDirectorModal director={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}