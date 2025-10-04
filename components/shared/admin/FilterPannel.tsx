// ==================== FILTERS PANEL COMPONENT ====================
import * as types from "@/lib/certificate_and_id/types"
import { X } from "lucide-react";


const FiltersPanel: React.FC<{
  filters: types.FilterState;
  onFilterChange: (filters: types.FilterState) => void;
  uniqueSessions: types.Session[];
  onClearFilters: () => void;
}> = ({ filters, onFilterChange, uniqueSessions, onClearFilters }) => (
  <div className="mt-4 pt-4 border-t border-gray-200">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session
        </label>
        <select
          value={filters.session}
          onChange={(e) => onFilterChange({ ...filters, session: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sessions</option>
          {uniqueSessions.map((session) => (
            <option key={session.id} value={session.id}>
              {session.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="registered">Registered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          From Date
        </label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          To Date
        </label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
    <div className="mt-3 flex justify-end">
      <button
        onClick={onClearFilters}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
      >
        <X className="w-4 h-4" />
        Clear Filters
      </button>
    </div>
  </div>
);
export default FiltersPanel;