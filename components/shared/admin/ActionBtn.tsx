import { Loader2, FileSpreadsheet, Download } from "lucide-react";

// ==================== ACTION BUTTONS COMPONENT ====================
const ActionButtons: React.FC<{
  selectedCount: number;
  onDownloadAll: () => void;
  onDownloadSelected: () => void;
  onDownloadCertsAndIDs: () => void;
  isDownloading: boolean;
}> = ({ selectedCount, onDownloadAll, onDownloadSelected, onDownloadCertsAndIDs, isDownloading }) => (
  <div className="flex gap-3">
    <button
      onClick={onDownloadAll}
      disabled={isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="w-4 h-4" />
      )}
      Download All
    </button>
    
    {selectedCount > 0 && (
      <>
        <button
          onClick={onDownloadSelected}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download Selected ({selectedCount})
        </button>
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
          Certs & IDs ({selectedCount})
        </button>
      </>
    )}
  </div>
);
export default ActionButtons;