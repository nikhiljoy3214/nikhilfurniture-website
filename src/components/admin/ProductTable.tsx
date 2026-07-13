import React, { useState } from 'react';
import type { Product } from '../../types';
import { Star, Edit2, Trash2, Copy, Eye } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  onDuplicate: (product: Product) => void;
  onQuickUpdate: (id: string, fields: Partial<Product>) => Promise<void>;
  searchQuery: string;
  categories: string[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
  onDuplicate,
  onQuickUpdate,
  searchQuery,
  categories,
  sortField,
  sortOrder,
  onSort,
}) => {
  const [activeQuickEdit, setActiveQuickEdit] = useState<{ id: string; type: 'status' | 'category' | 'sort_order' } | null>(null);

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

  const handleQuickStatusChange = async (id: string, status: string) => {
    await onQuickUpdate(id, { status } as any);
    setActiveQuickEdit(null);
  };

  const handleQuickCategoryChange = async (id: string, category: string) => {
    await onQuickUpdate(id, { category });
    setActiveQuickEdit(null);
  };

  const handleQuickSortOrderChange = async (id: string, orderVal: number) => {
    await onQuickUpdate(id, { sort_order: orderVal });
    setActiveQuickEdit(null);
  };

  const renderSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return <span className="ml-1 text-[8px]">{sortOrder === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="overflow-x-auto select-none">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-wood-50/40 text-wood-500 text-[10px] font-bold uppercase tracking-wider border-b border-wood-100 font-sans">
            <th className="py-4 px-6 w-10">
              <input
                type="checkbox"
                checked={products.length > 0 && selectedIds.length === products.length}
                onChange={onToggleSelectAll}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
            </th>
            <th className="py-4 px-6 w-20">Image</th>
            <th className="py-4 px-6 cursor-pointer hover:text-wood-950" onClick={() => onSort('name')}>
              Product Name {renderSortIndicator('name')}
            </th>
            <th className="py-4 px-6 cursor-pointer hover:text-wood-950" onClick={() => onSort('category')}>
              Category {renderSortIndicator('category')}
            </th>
            <th className="py-4 px-6 cursor-pointer hover:text-wood-950" onClick={() => onSort('wood_type')}>
              Wood / Finish {renderSortIndicator('wood_type')}
            </th>
            <th className="py-4 px-6 text-center cursor-pointer hover:text-wood-950" onClick={() => onSort('status')}>
              Status {renderSortIndicator('status')}
            </th>
            <th className="py-4 px-6 text-center cursor-pointer hover:text-wood-950" onClick={() => onSort('sort_order')}>
              Order {renderSortIndicator('sort_order')}
            </th>
            <th className="py-4 px-6 text-center">Featured</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-wood-100 text-xs text-wood-700 font-semibold font-sans">
          {products.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            const productStatus = (p as any).status || 'published';

            return (
              <tr 
                key={p.id} 
                className={`hover:bg-wood-50/20 transition-colors ${isSelected ? 'bg-gold-50/10' : ''}`}
              >
                {/* Checkbox */}
                <td className="py-4 px-6">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(p.id)}
                    className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
                  />
                </td>

                {/* Image */}
                <td className="py-4 px-6">
                  <div className="w-14 h-11 rounded-lg overflow-hidden border border-wood-200/30 shadow-sm bg-wood-50">
                    <img src={p.featured_image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                </td>

                {/* Name */}
                <td className="py-4 px-6">
                  <div className="flex flex-col max-w-[200px]">
                    <span 
                      onClick={() => onEdit(p)}
                      className="font-serif text-sm font-bold text-wood-950 hover:text-gold-600 transition-colors cursor-pointer truncate"
                    >
                      {highlightText(p.name, searchQuery)}
                    </span>
                    <span className="text-[9px] text-wood-400 font-mono tracking-tight font-normal truncate mt-0.5">
                      {p.slug}
                    </span>
                  </div>
                </td>

                {/* Category (Quick Edit) */}
                <td className="py-4 px-6 relative">
                  {activeQuickEdit?.id === p.id && activeQuickEdit.type === 'category' ? (
                    <select
                      value={p.category}
                      onChange={(e) => handleQuickCategoryChange(p.id, e.target.value)}
                      onBlur={() => setActiveQuickEdit(null)}
                      autoFocus
                      className="bg-white border border-wood-300 rounded-lg p-1 text-xs focus:outline-none focus:border-wood-500 font-semibold"
                    >
                      {categories.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <span 
                      onClick={() => setActiveQuickEdit({ id: p.id, type: 'category' })}
                      className="text-[9px] font-bold bg-wood-50 text-wood-700 px-2.5 py-1 rounded-full border border-wood-200/30 cursor-pointer hover:border-wood-400 hover:bg-wood-100/50 transition-all"
                      title="Click to change category inline"
                    >
                      {highlightText(p.category, searchQuery)}
                    </span>
                  )}
                </td>

                {/* Wood/Finish */}
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-wood-800">{highlightText(p.wood_type, searchQuery)}</span>
                    <span className="text-wood-500 font-normal">{highlightText(p.finish, searchQuery)}</span>
                  </div>
                </td>

                {/* Status (Quick Edit) */}
                <td className="py-4 px-6 text-center relative">
                  {activeQuickEdit?.id === p.id && activeQuickEdit.type === 'status' ? (
                    <select
                      value={productStatus}
                      onChange={(e) => handleQuickStatusChange(p.id, e.target.value)}
                      onBlur={() => setActiveQuickEdit(null)}
                      autoFocus
                      className="bg-white border border-wood-300 rounded-lg p-1 text-xs focus:outline-none focus:border-wood-500 font-semibold mx-auto block"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  ) : (
                    <span 
                      onClick={() => setActiveQuickEdit({ id: p.id, type: 'status' })}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border capitalize cursor-pointer hover:scale-105 transition-all ${getStatusColor(productStatus)}`}
                      title="Click to update status inline"
                    >
                      {productStatus}
                    </span>
                  )}
                </td>

                {/* Sort Order (Quick Edit) */}
                <td className="py-4 px-6 text-center">
                  {activeQuickEdit?.id === p.id && activeQuickEdit.type === 'sort_order' ? (
                    <input
                      type="number"
                      defaultValue={p.sort_order || 0}
                      onBlur={(e) => handleQuickSortOrderChange(p.id, Number(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleQuickSortOrderChange(p.id, Number((e.target as HTMLInputElement).value));
                        }
                      }}
                      autoFocus
                      className="w-16 bg-white border border-wood-300 rounded-lg py-0.5 px-1 text-center font-bold font-mono focus:outline-none"
                    />
                  ) : (
                    <span 
                      onClick={() => setActiveQuickEdit({ id: p.id, type: 'sort_order' })}
                      className="font-mono text-wood-500 hover:text-wood-950 hover:underline cursor-pointer font-bold"
                      title="Click to change sorting weight weight"
                    >
                      {p.sort_order || 0}
                    </span>
                  )}
                </td>

                {/* Featured Trigger (Quick Edit Toggle) */}
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => onQuickUpdate(p.id, { is_featured: !p.is_featured })}
                    className="p-1 rounded bg-transparent border-none cursor-pointer"
                    title={p.is_featured ? 'Remove from home featured' : 'Feature on homepage'}
                  >
                    <Star className={`w-4.5 h-4.5 transition-colors ${
                      p.is_featured 
                        ? 'fill-gold-400 text-gold-500 hover:text-gold-600' 
                        : 'text-wood-300 hover:text-wood-400'
                    }`} />
                  </button>
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/products/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-wood-400 hover:text-wood-800 hover:bg-wood-50 rounded-lg transition-colors border border-wood-200/10 cursor-pointer"
                      title="Preview Product details"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => onDuplicate(p)}
                      className="p-1.5 text-wood-400 hover:text-wood-800 hover:bg-wood-50 rounded-lg transition-colors border border-wood-200/10 cursor-pointer bg-transparent"
                      title="Duplicate record"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 text-wood-600 hover:text-wood-950 hover:bg-wood-50 rounded-lg transition-colors border border-wood-200/20 cursor-pointer bg-transparent"
                      title="Open full editor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-red-200/20 cursor-pointer bg-transparent"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
