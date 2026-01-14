"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BBNDirector } from "./bbnTypes";
import BBNDirectorModal from "./modal";

export default function BBNTable() {
  const [data, setData] = useState<BBNDirector[]>([]);
  const [selected, setSelected] = useState<BBNDirector | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Logic: Select all columns including the new 'district' field
      const { data, error } = await supabase
        .from("bbn_directors")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setData(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-4 text-gray-400 italic">Loading directors...</p>;

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-4 text-left font-semibold">Name</th>
              <th className="p-4 text-left font-semibold">Phone</th>
              <th className="p-4 text-left font-semibold">City</th>
              {/* New District Column */}
              <th className="p-4 text-left font-semibold">District</th>
              <th className="p-4 text-left font-semibold">State</th>
              <th className="p-4 text-left font-semibold">Region</th>
            </tr>
          </thead>

          <tbody className="bg-gray-900">
            {data.length > 0 ? (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-4">
                    <button
                      onClick={() => setSelected(row)}
                      className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-all"
                    >
                      {row.name}
                    </button>
                  </td>
                  <td className="p-4 text-gray-300">{row.phone_number}</td>
                  <td className="p-4 text-gray-300">{row.city}</td>
                  {/* District Data Cell: Show '-' if empty */}
                  <td className="p-4 text-gray-300">
                    {row.district || <span className="text-gray-600">—</span>}
                  </td>
                  <td className="p-4 text-gray-300">{row.state}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs capitalize">
                      {row.region}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No directors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <BBNDirectorModal
          director={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}