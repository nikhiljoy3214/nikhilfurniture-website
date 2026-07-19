import React from 'react';
import type { Product } from '../../types';
import { Star, Edit2, Trash2, Copy, Eye } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  onDuplicate: (product: Product) => void;
  onQuickUpdate: (id: string, fields: Partial<Product>) => Promise<void>;
  searchQuery: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onQuickUpdate,
  searchQuery,
}) => {
  const highlightText = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-gold-200 text-wood-950 font-bold rounded-sm px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status || 'published') {
      case 'published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'draft':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'archived':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'hidden':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 select-none">
      {products.map((p) => {
        const isSelected = selectedIds.includes(p.id);
        const productStatus = (p as any).status || 'published';

        return (
          <div
            key={p.id}
            className={`bg-white rounded-2xl border transition-all duration-350 flex flex-col overflow-hidden relative group hover:shadow-md hover:border-wood-300/45 ${
              isSelected ? 'border-gold-400 ring-1 ring-gold-400' : 'border-wood-200/40'
            }`}
          >
            {/* Checkbox overlay */}
            <div className="absolute top-3.5 left-3.5 z-10">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(p.id)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer w-4.5 h-4.5 bg-white/80"
              />
            </div>

            {/* Featured star toggle */}
            <div className="absolute top-3.5 right-3.5 z-10">
              <button
                onClick={() => onQuickUpdate(p.id, { is_featured: !p.is_featured })}
                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-wood-100 flex items-center justify-center shadow-sm cursor-pointer"
                title={p.is_featured ? 'Remove featured flag' : 'Mark featured'}
              >
                <Star className={`w-4 h-4 transition-colors ${
                  p.is_featured ? 'fill-gold-400 text-gold-500' : 'text-wood-300 hover:text-wood-400'
                }`} />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-white p-2 border-b border-wood-100 relative">
              <img
                src={p.featured_image}
                alt={p.name}
                className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500"
              />
              <span className={`absolute bottom-3 left-3 text-[9px] font-bold px-2 py-0.5 rounded border capitalize bg-white/90 shadow-sm ${getStatusColor(productStatus)}`}>
                {productStatus}
              </span>
            </div>

            {/* Content info */}
            <div className="p-4 flex-grow flex flex-col gap-3 font-sans">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-wood-400 uppercase tracking-widest">
                  {p.category}
                </span>
                <h5 
                  onClick={() => onEdit(p)}
                  className="font-serif text-sm font-bold text-wood-950 truncate hover:text-gold-600 transition-colors cursor-pointer"
                >
                  {highlightText(p.name, searchQuery)}
                </h5>
                <span className="text-[10px] text-wood-500 font-semibold font-mono tracking-tight block truncate mt-0.5">
                  {p.wood_type} • {p.finish}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-wood-100 pt-3 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-wood-400">Starting Price</span>
                  <span className="text-xs font-bold text-wood-900">₹{(p.base_price || 25000).toLocaleString('en-IN')}</span>
                </div>

                {/* Grid Action icons */}
                <div className="flex items-center gap-1">
                  <a
                    href={`/products/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-wood-400 hover:text-wood-800 hover:bg-wood-50 rounded-lg transition-colors border border-wood-200/10 cursor-pointer"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => onDuplicate(p)}
                    className="p-1.5 text-wood-400 hover:text-wood-800 hover:bg-wood-50 rounded-lg transition-colors border border-wood-200/10 cursor-pointer bg-transparent"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onEdit(p)}
                    className="p-1.5 text-wood-600 hover:text-wood-950 hover:bg-wood-50 rounded-lg transition-colors border border-wood-200/20 cursor-pointer bg-transparent"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(p.id, p.name)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-red-200/20 cursor-pointer bg-transparent"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
