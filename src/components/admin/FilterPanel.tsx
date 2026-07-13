import React from 'react';
import { RotateCcw } from 'lucide-react';

interface FilterState {
  category: string;
  woodType: string;
  finish: string;
  status: string;
  isFeatured: boolean | null;
  isPopular: boolean | null;
  isNewArrival: boolean | null;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  categories: string[];
  woodTypes: string[];
  finishes: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  categories,
  woodTypes,
  finishes,
}) => {
  const handleSelectChange = (key: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleCheckboxChange = (key: 'isFeatured' | 'isPopular' | 'isNewArrival', checked: boolean) => {
    onChange({
      ...filters,
      [key]: checked ? true : null,
    });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-wood-200/40 shadow-sm flex flex-col gap-5 animate-slide-down">
      <div className="flex items-center justify-between pb-3 border-b border-wood-100">
        <h4 className="font-serif text-sm font-bold text-wood-950 flex items-center gap-2">
          Advanced Search Filters
        </h4>
        <button
          onClick={onClear}
          className="text-[10px] font-bold uppercase tracking-wider text-wood-500 hover:text-wood-950 flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-none"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-sans text-xs font-semibold text-wood-700">
        {/* Category Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleSelectChange('category', e.target.value)}
            className="bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none focus:border-wood-500 font-semibold"
          >
            <option value="">All Categories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Wood Type Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Wood Type</label>
          <select
            value={filters.woodType}
            onChange={(e) => handleSelectChange('woodType', e.target.value)}
            className="bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none focus:border-wood-500 font-semibold"
          >
            <option value="">All Wood Types</option>
            {woodTypes.map((wt, i) => (
              <option key={i} value={wt}>{wt}</option>
            ))}
          </select>
        </div>

        {/* Finish Polish Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Finish Polish</label>
          <select
            value={filters.finish}
            onChange={(e) => handleSelectChange('finish', e.target.value)}
            className="bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none focus:border-wood-500 font-semibold"
          >
            <option value="">All Finishes</option>
            {finishes.map((f, i) => (
              <option key={i} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Publishing Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleSelectChange('status', e.target.value)}
            className="bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none focus:border-wood-500 font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>
      </div>

      {/* Flag Checkboxes */}
      <div className="flex items-center flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-wood-100/50">
        <label className="flex items-center gap-2 text-xs font-semibold text-wood-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.isFeatured}
            onChange={(e) => handleCheckboxChange('isFeatured', e.target.checked)}
            className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
          />
          Featured on Homepage
        </label>
        
        <label className="flex items-center gap-2 text-xs font-semibold text-wood-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.isPopular}
            onChange={(e) => handleCheckboxChange('isPopular', e.target.checked)}
            className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
          />
          Popular Collection
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-wood-700 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.isNewArrival}
            onChange={(e) => handleCheckboxChange('isNewArrival', e.target.checked)}
            className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
          />
          New Arrivals
        </label>
      </div>
    </div>
  );
};

export default FilterPanel;
