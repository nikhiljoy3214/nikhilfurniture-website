import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category, Product } from '../../types';
import { SEO } from '../../components/SEO';
import { Plus, Search, Edit2, Trash2, Copy, Loader2, X, Eye, EyeOff, Star, AlertCircle } from 'lucide-react';
import { MediaLibraryPicker } from '../../components/admin/MediaLibraryPicker';

interface ExtendedCategory extends Category {
  is_featured: boolean;
  is_visible: boolean;
  sort_order: number;
  thumbnail_image?: string;
  banner_image?: string;
  seo_title?: string;
  seo_description?: string;
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  
  // Media library picker states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'thumbnail' | 'banner' | ''>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  const [sortField, setSortField] = useState<string>('sort_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal / Form States
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExtendedCategory | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [description, setDescription] = useState('');
  const [thumbnailImage, setThumbnailImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [sortOrderVal, setSortOrderVal] = useState<number>(0);

  const fetchCategoriesAndProductCounts = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      // 2. Fetch products to aggregate counts
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('id, category');

      if (prodError) throw prodError;

      if (catData) {
        setCategories(catData as ExtendedCategory[]);
      }
      if (prodData) {
        setProducts(prodData as Product[]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndProductCounts();
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setIsDirty(true);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  // Inline toggles
  const handleQuickUpdate = async (id: string, fields: Partial<ExtendedCategory>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(fields)
        .eq('id', id);
      if (error) throw error;
      setCategories(prev =>
        prev.map(c => (c.id === id ? { ...c, ...fields } : c))
      );
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setAutoSlug(true);
    setDescription('');
    setThumbnailImage('');
    setBannerImage('');
    setSeoTitle('');
    setSeoDescription('');
    setIsFeatured(false);
    setIsVisible(true);
    setSortOrderVal(categories.length + 1);
    setIsDirty(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (c: ExtendedCategory) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setAutoSlug(false);
    setDescription(c.description || '');
    setThumbnailImage(c.thumbnail_image || '');
    setBannerImage(c.banner_image || '');
    setSeoTitle(c.seo_title || '');
    setSeoDescription(c.seo_description || '');
    setIsFeatured(c.is_featured || false);
    setIsVisible(c.is_visible ?? true);
    setSortOrderVal(c.sort_order || 0);
    setIsDirty(false);
    setIsOpen(true);
  };



  // Save Categories CRUD (insert / update)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Category Name is required.');
    if (!slug.trim()) return alert('Slug is required.');

    setSubmitting(true);

    const payload = {
      name,
      slug,
      description,
      thumbnail_image: thumbnailImage || 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
      banner_image: bannerImage || thumbnailImage || 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
      seo_title: seoTitle || `${name} Collections | Nikhil Furniture`,
      seo_description: seoDescription || description,
      is_featured: isFeatured,
      is_visible: isVisible,
      sort_order: sortOrderVal,
    };

    try {
      if (editingCategory) {
        // If name changes, we update all products category strings for integrity
        if (editingCategory.name !== name) {
          const { error: prodUpdateError } = await supabase
            .from('products')
            .update({ category: name })
            .eq('category', editingCategory.name);
          if (prodUpdateError) throw prodUpdateError;
        }

        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([payload]);
        if (error) throw error;
      }

      setIsOpen(false);
      fetchCategoriesAndProductCounts();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete category with integrity warning
  const handleDeleteCategory = async (id: string, catName: string) => {
    const associatedCount = products.filter(p => p.category === catName).length;
    let warning = `Are you sure you want to delete category "${catName}"? This action is permanent.`;
    
    if (associatedCount > 0) {
      warning = `⚠️ INTEGRITY WARNING!\n\nThere are ${associatedCount} products associated with "${catName}". Deleting this category will leave these products uncategorized.\n\nAre you absolutely sure you want to proceed?`;
    }

    if (!window.confirm(warning)) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategoriesAndProductCounts();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Category Duplication
  const handleDuplicateCategory = async (c: ExtendedCategory) => {
    const randomSuffix = Math.random().toString(36).substring(4, 7);
    const newSlug = `${c.slug}-copy-${randomSuffix}`;
    const newName = `${c.name} (Copy)`;

    const duplicatePayload = {
      name: newName,
      slug: newSlug,
      description: c.description,
      thumbnail_image: c.thumbnail_image,
      banner_image: c.banner_image,
      seo_title: `Copy of ${c.seo_title}`,
      seo_description: c.seo_description,
      is_featured: false,
      is_visible: true,
      sort_order: c.sort_order + 1,
    };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .insert([duplicatePayload])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        await fetchCategoriesAndProductCounts();
        handleOpenEdit(data[0] as ExtendedCategory);
      }
    } catch (err: any) {
      alert(`Duplication failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard?')) {
      return;
    }
    setIsOpen(false);
  };

  // Filter & Sort computation
  const filteredCategories = categories
    .filter(c => {
      if (!search) return true;
      const term = search.toLowerCase();
      return c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term);
    })
    .sort((a, b) => {
      let aField: any = a[sortField as keyof ExtendedCategory];
      let bField: any = b[sortField as keyof ExtendedCategory];

      if (typeof aField === 'string') {
        aField = aField.toLowerCase();
        bField = bField.toLowerCase();
      }

      if (aField < bField) return sortOrder === 'asc' ? -1 : 1;
      if (aField > bField) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Pagination slicing
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6">
      <SEO
        title="Category Manager | Nikhil Furniture"
        description="Manage furniture collection categories."
      />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60 select-none">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Categories Management</h2>
          <p className="text-xs text-wood-500 font-sans">Manage public groupings, banner image sliders, descriptions, and SEO details</p>
        </div>
        <div>
          <button
            onClick={handleOpenAdd}
            className="bg-wood-800 hover:bg-wood-950 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-wood-200/40 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-wood-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold font-sans focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Database Listing Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-wood-200/40 flex items-center justify-center min-h-[300px] shadow-sm">
          <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
        </div>
      ) : paginatedCategories.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-wood-200/40 text-center text-wood-500 text-sm font-semibold font-sans shadow-sm">
          No categories found matching filters.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-wood-200/40 shadow-sm overflow-hidden select-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-wood-50/30 text-wood-500 text-xs font-bold uppercase tracking-wider border-b border-wood-100 font-sans">
                  <th className="py-4 px-6 w-20">Image</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-wood-900" onClick={() => handleSort('name')}>
                    Category Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : null}
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-wood-900" onClick={() => handleSort('slug')}>
                    Slug {sortField === 'slug' ? (sortOrder === 'asc' ? '▲' : '▼') : null}
                  </th>
                  <th className="py-4 px-6 text-center">Products</th>
                  <th className="py-4 px-6 text-center cursor-pointer hover:text-wood-900" onClick={() => handleSort('sort_order')}>
                    Order {sortField === 'sort_order' ? (sortOrder === 'asc' ? '▲' : '▼') : null}
                  </th>
                  <th className="py-4 px-6 text-center cursor-pointer hover:text-wood-900" onClick={() => handleSort('is_featured')}>
                    Featured {sortField === 'is_featured' ? (sortOrder === 'asc' ? '▲' : '▼') : null}
                  </th>
                  <th className="py-4 px-6 text-center cursor-pointer hover:text-wood-900" onClick={() => handleSort('is_visible')}>
                    Visible {sortField === 'is_visible' ? (sortOrder === 'asc' ? '▲' : '▼') : null}
                  </th>
                  <th className="py-4 px-6 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood-100 text-xs text-wood-700 font-semibold font-sans">
                {paginatedCategories.map((c) => {
                  const productCount = products.filter(p => p.category === c.name).length;
                  return (
                    <tr key={c.id} className="hover:bg-wood-50/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="w-14 h-11 rounded-lg overflow-hidden border border-wood-200/30 bg-wood-50 shadow-sm">
                          <img src={c.thumbnail_image || c.image} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span 
                          onClick={() => handleOpenEdit(c)}
                          className="font-serif text-sm font-bold text-wood-950 hover:text-gold-600 transition-colors cursor-pointer"
                        >
                          {c.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[10px] text-wood-500 tracking-tight">
                        {c.slug}
                      </td>
                      <td className="py-4 px-6 text-center font-mono font-bold">
                        {productCount}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <input
                          type="number"
                          value={c.sort_order}
                          onChange={(e) => handleQuickUpdate(c.id, { sort_order: Number(e.target.value) })}
                          className="w-12 bg-wood-50/50 border border-wood-200 rounded py-0.5 text-center text-xs font-bold font-mono"
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleQuickUpdate(c.id, { is_featured: !c.is_featured })}
                          className="bg-transparent border-none cursor-pointer p-1"
                        >
                          <Star className={`w-4 h-4 transition-colors ${
                            c.is_featured ? 'fill-gold-400 text-gold-500' : 'text-wood-300'
                          }`} />
                        </button>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleQuickUpdate(c.id, { is_visible: !c.is_visible })}
                          className="bg-transparent border-none cursor-pointer p-1"
                        >
                          {c.is_visible ? (
                            <Eye className="w-4 h-4 text-wood-700" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-wood-300" />
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleDuplicateCategory(c)}
                            className="p-2 text-wood-400 hover:text-wood-800 hover:bg-wood-50 rounded-lg transition-colors border border-wood-200/10 cursor-pointer bg-transparent"
                            title="Duplicate Category"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-2 text-wood-600 hover:text-wood-950 hover:bg-wood-50 rounded-lg transition-colors border border-wood-200/20 cursor-pointer bg-transparent"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id, c.name)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-red-200/20 cursor-pointer bg-transparent"
                            title="Delete Category"
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

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4 bg-wood-50/10 border-t border-wood-100">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-3 py-1.5 border border-wood-200 bg-white text-[10px] font-bold uppercase tracking-wider text-wood-700 rounded-lg hover:bg-wood-100 disabled:opacity-30 transition-colors cursor-pointer"
              >
                Prev
              </button>
              <span className="text-[10px] font-bold uppercase tracking-widest text-wood-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1.5 border border-wood-200 bg-white text-[10px] font-bold uppercase tracking-wider text-wood-700 rounded-lg hover:bg-wood-100 disabled:opacity-30 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Category Add/Edit Popup modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-wood-950/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-wood-200 shadow-xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-8 py-5 bg-wood-50 border-b border-wood-100 flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-wood-950">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add Furniture Category'}
              </h3>
              <button onClick={handleClose} className="text-wood-400 hover:text-wood-700 cursor-pointer bg-transparent border-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} className="flex-grow overflow-y-auto p-8 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Category Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Corner Sofa Sets"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Slug path</label>
                    <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-wood-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="rounded border-wood-300 text-wood-700"
                      />
                      Auto-generate
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    disabled={autoSlug}
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setIsDirty(true);
                    }}
                    placeholder="corner-sofa-sets"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none transition-colors disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Short Summary description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="L-shaped and sectional sofa layouts designed for corner orientations..."
                  className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                />
              </div>

              {/* Banner / Thumbnail upload */}
              <div className="border border-wood-200 bg-wood-50/30 rounded-2xl p-6 flex flex-col gap-6">
                <h4 className="font-serif text-sm font-bold text-wood-950 flex items-center gap-2">
                  Categories Image Manager
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Thumbnail */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-wood-500 block">Thumbnail Grid Photo</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { setPickerTarget('thumbnail'); setPickerOpen(true); }}
                        className="bg-wood-800 hover:bg-wood-950 text-white border-none py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Select from Media
                      </button>
                      {thumbnailImage && (
                        <div className="w-12 h-10 rounded border overflow-hidden shrink-0 shadow-sm bg-wood-100">
                          <img src={thumbnailImage} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-wood-500 block">Hero Banner Photo (Details Page Header)</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => { setPickerTarget('banner'); setPickerOpen(true); }}
                        className="bg-wood-800 hover:bg-wood-950 text-white border-none py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Select from Media
                      </button>
                      {bannerImage && (
                        <div className="w-12 h-10 rounded border overflow-hidden shrink-0 shadow-sm bg-wood-100">
                          <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Tags */}
              <div className="border border-wood-200/50 bg-wood-50/15 rounded-2xl p-6 flex flex-col gap-4">
                <h4 className="font-serif text-sm font-bold text-wood-950">Category SEO Metadata (Optional)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-wood-500">SEO Page Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => {
                        setSeoTitle(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Corner Sectional Sofas in Thrissur | Teak Wood"
                      className="w-full bg-white border border-wood-200 focus:border-wood-500 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-wood-500">Meta Description</label>
                    <input
                      type="text"
                      value={seoDescription}
                      onChange={(e) => {
                        setSeoDescription(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Browse modular sectional solid wood couches designed in Kerala."
                      className="w-full bg-white border border-wood-200 focus:border-wood-500 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Visibility and Order flags */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 select-none font-semibold text-wood-700">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Sort Order Index</label>
                  <input
                    type="number"
                    value={sortOrderVal}
                    onChange={(e) => {
                      setSortOrderVal(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    className="w-24 bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 text-xs font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-wood-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => {
                        setIsFeatured(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
                    />
                    Featured Category
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-wood-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => {
                        setIsVisible(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
                    />
                    Visible on Catalog list
                  </label>
                </div>
              </div>

              {/* Submit Action footer */}
              <div className="pt-6 border-t border-wood-150 flex items-center justify-between mt-4">
                <div className="flex items-center text-[10px] text-amber-600 font-bold">
                  {isDirty && (
                    <span className="flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes in modal form
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="border border-wood-300 bg-white text-wood-700 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-wood-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-wood-800 hover:bg-wood-950 text-white px-8 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Category'
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
      <MediaLibraryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          setIsDirty(true);
          if (pickerTarget === 'thumbnail') setThumbnailImage(url);
          else if (pickerTarget === 'banner') setBannerImage(url);
        }}
        defaultFolder="Products"
      />
    </div>
  );
};

export default Categories;
