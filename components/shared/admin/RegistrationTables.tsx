import * as types from "@/lib/certificate_and_id/types";
import { Check } from "lucide-react";

// ==================== REGISTRATIONS TABLE COMPONENT ====================
interface RegistrationsTableProps {
  registrations: types.RegistrationWithDetails[];
  selectedIds: Set<string>;
  onToggleSelectAll: () => void;
  onToggleSelect: (id: string) => void;
}

const RegistrationsTable: React.FC<RegistrationsTableProps> = ({ 
  registrations, 
  selectedIds, 
  onToggleSelectAll, 
  onToggleSelect 
}) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedIds.size === registrations.length && registrations.length > 0}
                onChange={onToggleSelectAll}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reg #
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Organisation
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              WhatsApp
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Session
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Certificate
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {registrations.map((reg) => (
            <tr key={reg.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(reg.id)}
                  onChange={() => onToggleSelect(reg.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                #{reg.registration_number}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {reg.user?.name || 'N/A'}
                <div className="text-xs text-gray-500">{reg.user?.city || ''}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {reg.user?.organisation_name || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {reg.user?.whatsapp_number || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {reg.session?.name || 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {reg.event?.name || 'N/A'}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  reg.status === 'registered' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {reg.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(reg.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                {reg.certificate ? (
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">{reg.certificate.status}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {registrations.length === 0 && (
      <div className="text-center py-12">
        <p className="text-gray-500">No registrations found</p>
      </div>
    )}
  </div>
);

export default RegistrationsTable;
