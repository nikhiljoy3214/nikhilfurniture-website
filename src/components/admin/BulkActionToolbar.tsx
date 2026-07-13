import React from 'react';
import { Trash2, Archive, Globe, Sparkles, FileSpreadsheet, X, EyeOff } from 'lucide-react';

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkArchive: () => void;
  onBulkPublish: (publish: boolean) => void;
  onBulkFeatured: (featured: boolean) => void;
  onBulkExport: () => void;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkArchive,
  onBulkPublish,
  onBulkFeatured,
  onBulkExport,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-wood-950 text-white rounded-2xl shadow-xl px-5 py-3.5 flex items-center gap-6 border border-wood-800 animate-slide-up max-w-[95vw] sm:max-w-none flex-wrap justify-center sm:justify-start">
      <div className="flex items-center gap-3 border-r border-wood-800 pr-5 flex-shrink-0">
        <button
          onClick={onClearSelection}
          className="p-1 rounded bg-wood-900 hover:bg-wood-800 text-wood-400 hover:text-white transition-colors cursor-pointer border-none"
          title="Clear selections"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold font-sans tracking-wide">
          {selectedCount} selected
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap font-sans text-[10px] font-bold uppercase tracking-wider">
        <button
          onClick={() => onBulkPublish(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 hover:bg-wood-800 border border-wood-800 rounded-xl text-white transition-colors cursor-pointer hover:border-wood-700"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" /> Publish
        </button>

        <button
          onClick={() => onBulkPublish(false)}
          className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 hover:bg-wood-800 border border-wood-800 rounded-xl text-white transition-colors cursor-pointer hover:border-wood-700"
        >
          <EyeOff className="w-3.5 h-3.5 text-amber-400" /> Unpublish
        </button>

        <button
          onClick={onBulkArchive}
          className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 hover:bg-wood-800 border border-wood-800 rounded-xl text-white transition-colors cursor-pointer hover:border-wood-700"
        >
          <Archive className="w-3.5 h-3.5 text-blue-400" /> Archive
        </button>

        <button
          onClick={() => onBulkFeatured(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 hover:bg-wood-800 border border-wood-800 rounded-xl text-white transition-colors cursor-pointer hover:border-wood-700"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-300" /> Star
        </button>

        <button
          onClick={() => onBulkFeatured(false)}
          className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 hover:bg-wood-800 border border-wood-800 rounded-xl text-white transition-colors cursor-pointer hover:border-wood-700"
        >
          <Sparkles className="w-3.5 h-3.5 text-wood-500" /> Unstar
        </button>

        <button
          onClick={onBulkExport}
          className="flex items-center gap-1.5 px-3 py-2 bg-wood-900 hover:bg-wood-800 border border-wood-800 rounded-xl text-white transition-colors cursor-pointer hover:border-wood-700"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" /> Export CSV
        </button>

        <button
          onClick={onBulkDelete}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-900 hover:border-rose-700 rounded-xl text-rose-200 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Delete
        </button>
      </div>
    </div>
  );
};

export default BulkActionToolbar;
