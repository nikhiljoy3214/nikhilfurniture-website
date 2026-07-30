import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category, Product } from '../../types';
import { SEO } from '../../components/SEO';
import { Plus, Search, Edit2, Trash2, Copy, Loader2, X, Star, Layers, Trees, Package, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
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

export interface TimberSpecies {
  id: string;
  name: string;
  origin?: string;
  density?: string;
  description?: string;
  sort_order: number;
  is_visible: boolean;
}

const defaultTimberSpecies: TimberSpecies[] = [
  { id: 'w1', name: 'Premium Teak Wood', origin: 'Nilambur, Kerala', density: 'High Oil & Tight Grain', description: 'Heirloom quality timber naturally rich in essential teak oils, offering supreme termite immunity and golden luster.', sort_order: 1, is_visible: true },
  { id: 'w2', name: 'Rosewood', origin: 'Malabar, Kerala', density: 'Ultra High Density', description: 'Deep purple-brown grain timber renowned for ornamental hand carvings and heirloom durability.', sort_order: 2, is_visible: true },
  { id: 'w3', name: 'Mahogany', origin: 'Seasoned Plantation', density: 'Medium-High Density', description: 'Classic reddish-brown hardwood with smooth grain texture, ideal for elegant dining and bedroom suites.', sort_order: 3, is_visible: true },
  { id: 'w4', name: 'Walnut Wood', origin: 'Imported Grade', density: 'Dense & Stable', description: 'Luxurious dark cocoa tones with straight, dark-veined grain patterns.', sort_order: 4, is_visible: true },
  { id: 'w5', name: 'Anjili', origin: 'Central Travancore', density: 'Water-Resistant Hardwood', description: 'Traditional Kerala jungle hardwood exceptionally resistant to water damage.', sort_order: 5, is_visible: true },
  { id: 'w6', name: 'Jackwood', origin: 'Local Homesteads', density: 'Golden Hardwood', description: 'Vibrant golden yellow timber prized in traditional Kerala architecture and sacred furniture.', sort_order: 6, is_visible: true }
];

export const Categories: React.FC = () => {
  // Main Tab Control: Categories vs Timber Species
  const [mainTab, setMainTab] = useState<'categories' | 'wood_types'>('categories');

  // Categories & Products state
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [timberList, setTimberList] = useState<TimberSpecies[]>(defaultTimberSpecies);

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting for Categories
  const [sortField, setSortField] = useState<string>('sort_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Media library picker states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'thumbnail' | 'banner' | ''>('');

  // Category Modal / Form States
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExtendedCategory | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Category Form Fields
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catAutoSlug, setCatAutoSlug] = useState(true);
  const [catDescription, setCatDescription] = useState('');
  const [catThumbnailImage, setCatThumbnailImage] = useState('');
  const [catBannerImage, setCatBannerImage] = useState('');
  const [catSeoTitle, setCatSeoTitle] = useState('');
  const [catSeoDescription, setCatSeoDescription] = useState('');
  const [catIsFeatured, setCatIsFeatured] = useState(false);
  const [catIsVisible, setCatIsVisible] = useState(true);
  const [catSortOrderVal, setCatSortOrderVal] = useState<number>(0);

  // Timber Species Modal & Accordion Drawer States
  const [isWoodModalOpen, setIsWoodModalOpen] = useState(false);
  const [editingWood, setEditingWood] = useState<TimberSpecies | null>(null);
  const [expandedWoodId, setExpandedWoodId] = useState<string | null>(null);

  // Timber Species Form Fields
  const [woodName, setWoodName] = useState('');
  const [woodOrigin, setWoodOrigin] = useState('');
  const [woodDensity, setWoodDensity] = useState('');
  const [woodDescription, setWoodDescription] = useState('');
  const [woodSortOrderVal, setWoodSortOrderVal] = useState<number>(1);
  const [woodIsVisible, setWoodIsVisible] = useState(true);

  // Fetch Categories, Products & Timber Species Catalog
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      // 2. Fetch All Products with full columns to compute timber & category counts
      const { data: prodData } = await supabase
        .from('products')
        .select('id, name, slug, featured_image, base_price, category, wood_type, specifications');

      if (catData) setCategories(catData as ExtendedCategory[]);
      if (prodData) setProducts(prodData as Product[]);

      // 3. Fetch Timber Catalog from site_settings key 'wood_types_catalog'
      const { data: woodSetting } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'wood_types_catalog')
        .single();

      let activeWoodList: TimberSpecies[] = defaultTimberSpecies;
      if (woodSetting && woodSetting.value && Array.isArray(woodSetting.value.items)) {
        activeWoodList = woodSetting.value.items;
      }

      // Auto-discover any new wood types dynamically from database products
      if (prodData) {
        const discovered = new Set<string>();
        prodData.forEach((p: any) => {
          if (p.wood_type && p.wood_type.trim()) {
            p.wood_type.split(/[,/|]|\band\b/i).forEach((w: string) => {
              if (w.trim()) discovered.add(w.trim());
            });
          }
          if (p.specifications && Array.isArray(p.specifications.matrix_attributes)) {
            const attr = p.specifications.matrix_attributes.find((a: any) => a && /wood/i.test(a.name));
            if (attr && Array.isArray(attr.values)) {
              attr.values.forEach((v: string) => {
                if (v && v.trim()) discovered.add(v.trim());
              });
            }
          }
        });

        // Merge missing discovered woods into active list
        const existingNames = new Set(activeWoodList.map(w => w.name.toLowerCase()));
        let addedCount = 0;
        discovered.forEach((discName) => {
          if (!existingNames.has(discName.toLowerCase())) {
            activeWoodList.push({
              id: `w_${Date.now()}_${Math.random().toString(36).substring(4, 7)}`,
              name: discName,
              origin: 'Showroom Catalog',
              density: 'Natural Solid Wood',
              description: `Solid hardwood timber species featured in Nikhil Furniture catalog.`,
              sort_order: activeWoodList.length + 1,
              is_visible: true
            });
            existingNames.add(discName.toLowerCase());
            addedCount++;
          }
        });

        if (addedCount > 0) {
          // Persist updated list
          await supabase
            .from('site_settings')
            .upsert([{ key: 'wood_types_catalog', value: { items: activeWoodList } }]);
        }
      }

      setTimberList(activeWoodList);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  // CATEGORY ACTIONS
  const handleOpenAddCat = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatAutoSlug(true);
    setCatDescription('');
    setCatThumbnailImage('');
    setCatBannerImage('');
    setCatSeoTitle('');
    setCatSeoDescription('');
    setCatIsFeatured(false);
    setCatIsVisible(true);
    setCatSortOrderVal(categories.length + 1);
    setIsDirty(false);
    setIsCatModalOpen(true);
  };

  const handleOpenEditCat = (c: ExtendedCategory) => {
    setEditingCategory(c);
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatAutoSlug(false);
    setCatDescription(c.description || '');
    setCatThumbnailImage(c.thumbnail_image || '');
    setCatBannerImage(c.banner_image || '');
    setCatSeoTitle(c.seo_title || '');
    setCatSeoDescription(c.seo_description || '');
    setCatIsFeatured(c.is_featured || false);
    setCatIsVisible(c.is_visible ?? true);
    setCatSortOrderVal(c.sort_order || 0);
    setIsDirty(false);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return alert('Category Name is required.');
    if (!catSlug.trim()) return alert('Slug is required.');

    setSubmitting(true);

    const payload = {
      name: catName,
      slug: catSlug,
      description: catDescription,
      thumbnail_image: catThumbnailImage || 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
      banner_image: catBannerImage || catThumbnailImage || 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
      seo_title: catSeoTitle || `${catName} Collections | Nikhil Furniture`,
      seo_description: catSeoDescription || catDescription,
      is_featured: catIsFeatured,
      is_visible: catIsVisible,
      sort_order: catSortOrderVal,
    };

    try {
      if (editingCategory) {
        if (editingCategory.name !== catName) {
          const { error: prodUpdateError } = await supabase
            .from('products')
            .update({ category: catName })
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

      setIsCatModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

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
      fetchAllData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

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
      sort_order: categories.length + 1,
    };

    try {
      const { error } = await supabase
        .from('categories')
        .insert([duplicatePayload]);
      if (error) throw error;
      fetchAllData();
    } catch (err: any) {
      alert(`Duplication failed: ${err.message}`);
    }
  };

  // TIMBER SPECIES (WOOD TYPES) ACTIONS & CALCULATIONS
  const getProductsForWood = (woodName: string) => {
    const q = woodName.toLowerCase().trim();
    const rawWord = q.replace(/^premium\s+/i, '').replace(/\s+wood$/i, '').trim();

    return products.filter((p: any) => {
      // 1. Match wood_type column
      if (p.wood_type && p.wood_type.toLowerCase().includes(q)) return true;
      if (rawWord && p.wood_type && p.wood_type.toLowerCase().includes(rawWord)) return true;

      // 2. Match matrix_attributes in specifications JSON
      if (p.specifications && Array.isArray(p.specifications.matrix_attributes)) {
        const woodAttr = p.specifications.matrix_attributes.find((a: any) => a && /wood/i.test(a.name));
        if (woodAttr && Array.isArray(woodAttr.values)) {
          return woodAttr.values.some((v: string) => v && (v.toLowerCase().includes(q) || (rawWord && v.toLowerCase().includes(rawWord))));
        }
      }
      return false;
    });
  };

  const saveWoodCatalogSettings = async (updatedList: TimberSpecies[]) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'wood_types_catalog', value: { items: updatedList } }]);
      if (error) throw error;
      setTimberList(updatedList);
    } catch (err: any) {
      alert(`Failed to save Timber Catalog: ${err.message}`);
    }
  };

  const handleOpenAddWood = () => {
    setEditingWood(null);
    setWoodName('');
    setWoodOrigin('Depot Sourced');
    setWoodDensity('Solid Hardwood');
    setWoodDescription('');
    setWoodSortOrderVal(timberList.length + 1);
    setWoodIsVisible(true);
    setIsWoodModalOpen(true);
  };

  const handleOpenEditWood = (w: TimberSpecies) => {
    setEditingWood(w);
    setWoodName(w.name);
    setWoodOrigin(w.origin || '');
    setWoodDensity(w.density || '');
    setWoodDescription(w.description || '');
    setWoodSortOrderVal(w.sort_order || 1);
    setWoodIsVisible(w.is_visible ?? true);
    setIsWoodModalOpen(true);
  };

  const handleSaveWood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!woodName.trim()) return alert('Timber Species Name is required.');

    setSubmitting(true);
    try {
      let updatedList = [...timberList];

      if (editingWood) {
        // If timber name was edited, offer option to batch update products wood_type
        if (editingWood.name !== woodName) {
          const matchedProds = getProductsForWood(editingWood.name);
          if (matchedProds.length > 0) {
            const doBatch = window.confirm(
              `Notice: There are ${matchedProds.length} products currently assigned to "${editingWood.name}".\n\nDo you want to update the wood_type string on these products to "${woodName}" in the database as well?`
            );
            if (doBatch) {
              const { error: batchErr } = await supabase
                .from('products')
                .update({ wood_type: woodName })
                .eq('wood_type', editingWood.name);
              if (batchErr) console.error('Batch product update error:', batchErr);
            }
          }
        }

        updatedList = updatedList.map(item =>
          item.id === editingWood.id
            ? {
                ...item,
                name: woodName.trim(),
                origin: woodOrigin.trim(),
                density: woodDensity.trim(),
                description: woodDescription.trim(),
                sort_order: woodSortOrderVal,
                is_visible: woodIsVisible
              }
            : item
        );
      } else {
        const newWood: TimberSpecies = {
          id: `w_${Date.now()}`,
          name: woodName.trim(),
          origin: woodOrigin.trim() || 'Depot Sourced',
          density: woodDensity.trim() || 'Solid Hardwood',
          description: woodDescription.trim(),
          sort_order: woodSortOrderVal,
          is_visible: woodIsVisible
        };
        updatedList.push(newWood);
      }

      updatedList.sort((a, b) => a.sort_order - b.sort_order);
      await saveWoodCatalogSettings(updatedList);
      setIsWoodModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWood = async (id: string, name: string) => {
    const matchedProds = getProductsForWood(name);
    let warning = `Are you sure you want to delete timber species "${name}"?`;
    if (matchedProds.length > 0) {
      warning = `⚠️ INTEGRITY WARNING!\n\nThere are ${matchedProds.length} products currently listed under "${name}". Deleting this species will remove it from the admin catalog.\n\nAre you sure you want to proceed?`;
    }

    if (!window.confirm(warning)) return;

    const updated = timberList.filter(w => w.id !== id);
    await saveWoodCatalogSettings(updated);
  };

  const handleDuplicateWood = async (w: TimberSpecies) => {
    const newWood: TimberSpecies = {
      ...w,
      id: `w_${Date.now()}`,
      name: `${w.name} (Copy)`,
      sort_order: timberList.length + 1
    };
    const updated = [...timberList, newWood];
    await saveWoodCatalogSettings(updated);
  };

  const handleToggleWoodVisibility = async (id: string) => {
    const updated = timberList.map(w =>
      w.id === id ? { ...w, is_visible: !w.is_visible } : w
    );
    await saveWoodCatalogSettings(updated);
  };

  // Filter Computation
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

  const filteredTimberList = timberList.filter(w => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      w.name.toLowerCase().includes(term) ||
      (w.origin || '').toLowerCase().includes(term) ||
      (w.description || '').toLowerCase().includes(term)
    );
  });

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-6 font-sans">
      <SEO
        title="Category & Timber Species Manager | Nikhil Furniture"
        description="Manage furniture collection categories and timber species attributes."
      />

      {/* Page Title & Main Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60 select-none">
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Catalog Attributes Management</h2>
          <p className="text-xs text-wood-500 font-sans">Control product categories, timber species libraries, and product assignment breakdowns</p>
        </div>

        <div className="flex items-center gap-3">
          {mainTab === 'categories' ? (
            <button
              onClick={handleOpenAddCat}
              className="bg-wood-800 hover:bg-wood-950 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          ) : (
            <button
              onClick={handleOpenAddWood}
              className="bg-wood-800 hover:bg-wood-950 text-white px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer border-none"
            >
              <Plus className="w-4 h-4" /> Add Timber Species
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Switcher Bar */}
      <div className="flex items-center gap-3 bg-wood-100/60 p-1.5 rounded-2xl w-fit select-none">
        <button
          onClick={() => { setMainTab('categories'); setSearch(''); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
            mainTab === 'categories'
              ? 'bg-wood-800 text-white shadow-md'
              : 'text-wood-650 hover:bg-white/60'
          }`}
        >
          <Layers className="w-4 h-4" /> Collection Categories ({categories.length})
        </button>
        <button
          onClick={() => { setMainTab('wood_types'); setSearch(''); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-none ${
            mainTab === 'wood_types'
              ? 'bg-wood-800 text-white shadow-md'
              : 'text-wood-650 hover:bg-white/60'
          }`}
        >
          <Trees className="w-4 h-4 text-amber-300" /> Timber Species ({timberList.length})
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-wood-200/40 shadow-sm">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-wood-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder={mainTab === 'categories' ? "Search categories by name or slug..." : "Search timber species by name, origin..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold font-sans focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* TAB 1: CATEGORIES MANAGEMENT */}
      {mainTab === 'categories' && (
        <>
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
                      <th className="py-4 px-6 cursor-pointer hover:text-wood-900" onClick={() => { setSortField('name'); setSortOrder(s => s === 'asc' ? 'desc' : 'asc'); }}>
                        Category Name {sortField === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : null}
                      </th>
                      <th className="py-4 px-6 cursor-pointer hover:text-wood-900" onClick={() => { setSortField('slug'); setSortOrder(s => s === 'asc' ? 'desc' : 'asc'); }}>
                        Slug {sortField === 'slug' ? (sortOrder === 'asc' ? '▲' : '▼') : null}
                      </th>
                      <th className="py-4 px-6 text-center">Products</th>
                      <th className="py-4 px-6 text-center cursor-pointer hover:text-wood-900" onClick={() => { setSortField('sort_order'); setSortOrder(s => s === 'asc' ? 'desc' : 'asc'); }}>
                        Sort Order {sortField === 'sort_order' ? (sortOrder === 'asc' ? '▲' : '▼') : null}
                      </th>
                      <th className="py-4 px-6 text-center">Featured</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-100 font-sans text-xs font-semibold text-wood-700">
                    {paginatedCategories.map((c) => {
                      const count = products.filter(p => p.category === c.name).length;
                      return (
                        <tr key={c.id} className="hover:bg-wood-50/40 transition-colors">
                          <td className="py-3 px-6">
                            <img
                              src={c.thumbnail_image || 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg'}
                              alt={c.name}
                              className="w-12 h-12 rounded-xl object-cover border border-wood-200/50 bg-wood-50"
                            />
                          </td>
                          <td className="py-3 px-6 font-bold text-wood-950 font-serif text-sm">
                            {c.name}
                          </td>
                          <td className="py-3 px-6 text-wood-500 font-mono text-[11px]">
                            {c.slug}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <span className="bg-wood-100 text-wood-800 text-[10px] font-bold py-1 px-2.5 rounded-full">
                              {count} Items
                            </span>
                          </td>
                          <td className="py-3 px-6 text-center font-mono">
                            {c.sort_order}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <button
                              onClick={() => supabase.from('categories').update({ is_featured: !c.is_featured }).eq('id', c.id).then(() => fetchAllData())}
                              className="border-none bg-transparent cursor-pointer"
                            >
                              <Star className={`w-4 h-4 mx-auto ${c.is_featured ? 'text-amber-500 fill-amber-500' : 'text-wood-300'}`} />
                            </button>
                          </td>
                          <td className="py-3 px-6 text-center">
                            <button
                              onClick={() => supabase.from('categories').update({ is_visible: !c.is_visible }).eq('id', c.id).then(() => fetchAllData())}
                              className={`py-1 px-3 rounded-full text-[10px] font-bold border-none cursor-pointer ${
                                c.is_visible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {c.is_visible ? 'Active' : 'Hidden'}
                            </button>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditCat(c)}
                                className="p-1.5 rounded-lg border border-wood-200 text-wood-700 hover:bg-wood-100 transition-colors cursor-pointer"
                                title="Edit Category"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicateCategory(c)}
                                className="p-1.5 rounded-lg border border-wood-200 text-wood-700 hover:bg-wood-100 transition-colors cursor-pointer"
                                title="Duplicate Category"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c.id, c.name)}
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: TIMBER SPECIES (WOOD TYPES) MANAGEMENT */}
      {mainTab === 'wood_types' && (
        <div className="flex flex-col gap-6 select-none">
          
          {/* Timber Species Grid & Product Count Table */}
          <div className="bg-white rounded-2xl border border-wood-200/40 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-wood-100 flex items-center justify-between bg-wood-50/30">
              <div>
                <h3 className="font-serif text-lg font-bold text-wood-950">Timber Species Catalog & Product Assignments</h3>
                <p className="text-xs text-wood-500 font-sans">Manage available wood species options and see how many products are currently listed in each wood type.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-wood-50/50 text-wood-500 text-xs font-bold uppercase tracking-wider border-b border-wood-100 font-sans">
                    <th className="py-4 px-6">Timber Species Name</th>
                    <th className="py-4 px-6">Origin & Grain Profile</th>
                    <th className="py-4 px-6 text-center">Listed Products</th>
                    <th className="py-4 px-6 text-center">Order</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-100 font-sans text-xs font-semibold text-wood-700">
                  {filteredTimberList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-wood-400">
                        No timber species found. Click "+ Add Timber Species" above to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredTimberList.map((wood) => {
                      const matchedProducts = getProductsForWood(wood.name);
                      const isExpanded = expandedWoodId === wood.id;

                      return (
                        <React.Fragment key={wood.id}>
                          <tr className="hover:bg-wood-50/40 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300/60 flex items-center justify-center text-amber-800 font-serif font-bold text-base shrink-0">
                                  🪵
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-serif font-bold text-wood-950 text-sm">{wood.name}</span>
                                  {wood.description && (
                                    <span className="text-[11px] text-wood-500 font-normal line-clamp-1 max-w-sm">{wood.description}</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-wood-900">{wood.origin || 'Depot Sourced'}</span>
                                <span className="text-[10px] text-wood-500">{wood.density || 'Solid Hardwood'}</span>
                              </div>
                            </td>

                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => setExpandedWoodId(isExpanded ? null : wood.id)}
                                className={`py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 mx-auto ${
                                  matchedProducts.length > 0
                                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                    : 'bg-wood-50 text-wood-450 border-wood-200'
                                }`}
                              >
                                <Package className="w-3.5 h-3.5 text-amber-700" />
                                {matchedProducts.length} Products
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </td>

                            <td className="py-4 px-6 text-center font-mono">
                              {wood.sort_order}
                            </td>

                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleToggleWoodVisibility(wood.id)}
                                className={`py-1 px-3 rounded-full text-[10px] font-bold border-none cursor-pointer ${
                                  wood.is_visible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {wood.is_visible ? 'Active' : 'Hidden'}
                              </button>
                            </td>

                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditWood(wood)}
                                  className="p-1.5 rounded-lg border border-wood-200 text-wood-700 hover:bg-wood-100 transition-colors cursor-pointer"
                                  title="Edit Timber Species"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateWood(wood)}
                                  className="p-1.5 rounded-lg border border-wood-200 text-wood-700 hover:bg-wood-100 transition-colors cursor-pointer"
                                  title="Duplicate Timber Species"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteWood(wood.id, wood.name)}
                                  className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Timber Species"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Collapsible Expanded List of Products for this Wood Type */}
                          {isExpanded && (
                            <tr className="bg-wood-50/60 border-b border-wood-200">
                              <td colSpan={6} className="p-5">
                                <div className="bg-white rounded-2xl p-4 border border-wood-200/60 shadow-inner flex flex-col gap-3">
                                  <div className="flex items-center justify-between border-b border-wood-100 pb-2">
                                    <span className="font-serif font-bold text-wood-950 text-xs flex items-center gap-1.5">
                                      <Package className="w-4 h-4 text-amber-700" />
                                      Products Listed in "{wood.name}" ({matchedProducts.length})
                                    </span>
                                    <span className="text-[10px] text-wood-500 font-sans">Live Database Assignment Breakdown</span>
                                  </div>

                                  {matchedProducts.length === 0 ? (
                                    <div className="text-center py-4 text-wood-450 italic">
                                      No products are currently using "{wood.name}". You can assign this wood when editing products under "Wood & Pricing".
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {matchedProducts.map((p: any) => (
                                        <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-wood-200/50 bg-wood-50/40">
                                          <img
                                            src={p.featured_image || 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg'}
                                            alt={p.name}
                                            className="w-10 h-10 rounded-lg object-cover bg-white border border-wood-200 shrink-0"
                                          />
                                          <div className="flex flex-col min-w-0 flex-grow">
                                            <span className="font-serif font-bold text-wood-900 truncate text-[11px]">{p.name}</span>
                                            <span className="text-[9px] text-wood-500 truncate">{p.category || 'Furniture'} • ₹{p.base_price?.toLocaleString('en-IN')}</span>
                                          </div>
                                          <a
                                            href={`/products/${p.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-wood-400 hover:text-wood-800 p-1"
                                            title="View Live Product"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-wood-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-wood-200/40 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-zoom-in font-sans text-xs font-semibold text-wood-700 select-none">
            <div className="flex items-center justify-between pb-4 border-b border-wood-100 mb-6">
              <h3 className="font-serif text-xl font-bold text-wood-950">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h3>
              <button onClick={() => setIsCatModalOpen(false)} className="text-wood-400 hover:text-wood-800 border-none bg-transparent cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Category Name *</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => { setCatName(e.target.value); if (catAutoSlug) setCatSlug(slugify(e.target.value)); setIsDirty(true); }}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
                    placeholder="e.g. Wooden Dining Tables"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">URL Slug *</label>
                  <input
                    type="text"
                    value={catSlug}
                    onChange={(e) => { setCatSlug(e.target.value); setCatAutoSlug(false); setIsDirty(true); }}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
                    placeholder="e.g. wooden-dining-tables"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Category Description</label>
                <textarea
                  rows={3}
                  value={catDescription}
                  onChange={(e) => { setCatDescription(e.target.value); setIsDirty(true); }}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 resize-none font-semibold"
                  placeholder="Short description of this furniture category collection..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Thumbnail Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={catThumbnailImage}
                      onChange={(e) => { setCatThumbnailImage(e.target.value); setIsDirty(true); }}
                      className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
                    />
                    <button type="button" onClick={() => { setPickerTarget('thumbnail'); setPickerOpen(true); }} className="bg-wood-100 hover:bg-wood-200 border-none px-3 rounded-xl cursor-pointer font-bold text-wood-800">Select</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Banner Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={catBannerImage}
                      onChange={(e) => { setCatBannerImage(e.target.value); setIsDirty(true); }}
                      className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
                    />
                    <button type="button" onClick={() => { setPickerTarget('banner'); setPickerOpen(true); }} className="bg-wood-100 hover:bg-wood-200 border-none px-3 rounded-xl cursor-pointer font-bold text-wood-800">Select</button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={catIsFeatured} onChange={(e) => setCatIsFeatured(e.target.checked)} className="accent-wood-800" />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={catIsVisible} onChange={(e) => setCatIsVisible(e.target.checked)} className="accent-wood-800" />
                  <span>Visible in Store</span>
                </label>
              </div>

              <div className="pt-4 border-t border-wood-100 flex items-center justify-between gap-3">
                {isDirty ? (
                  <span className="text-[10px] text-amber-600 font-bold animate-pulse">● Unsaved Form Changes</span>
                ) : <span />}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setIsCatModalOpen(false)} className="border border-wood-300 bg-white text-wood-700 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-wood-50 transition-colors cursor-pointer">Cancel</button>
                  <button type="submit" disabled={submitting} className="bg-wood-800 hover:bg-wood-950 text-white px-7 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer border-none">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Category'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIMBER SPECIES MODAL */}
      {isWoodModalOpen && (
        <div className="fixed inset-0 z-50 bg-wood-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-wood-200/40 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-zoom-in font-sans text-xs font-semibold text-wood-700 select-none">
            <div className="flex items-center justify-between pb-4 border-b border-wood-100 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪵</span>
                <h3 className="font-serif text-xl font-bold text-wood-950">
                  {editingWood ? `Edit Timber Species: ${editingWood.name}` : 'Add New Timber Species'}
                </h3>
              </div>
              <button onClick={() => setIsWoodModalOpen(false)} className="text-wood-400 hover:text-wood-800 border-none bg-transparent cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWood} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Timber Species Name *</label>
                <input
                  type="text"
                  value={woodName}
                  onChange={(e) => setWoodName(e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
                  placeholder="e.g. Premium Teak Wood, Mahogany, Rosewood..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Timber Origin</label>
                  <input
                    type="text"
                    value={woodOrigin}
                    onChange={(e) => setWoodOrigin(e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
                    placeholder="e.g. Nilambur, Kerala / Depot Sourced"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Density & Grain Profile</label>
                  <input
                    type="text"
                    value={woodDensity}
                    onChange={(e) => setWoodDensity(e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
                    placeholder="e.g. High Oil & Tight Grain"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Species Description</label>
                <textarea
                  rows={3}
                  value={woodDescription}
                  onChange={(e) => setWoodDescription(e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 resize-none font-semibold"
                  placeholder="Describe wood durability, seasoning qualities, and carving characteristics..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Sort Order</label>
                  <input
                    type="number"
                    value={woodSortOrderVal}
                    onChange={(e) => setWoodSortOrderVal(Number(e.target.value))}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-4">
                  <input type="checkbox" checked={woodIsVisible} onChange={(e) => setWoodIsVisible(e.target.checked)} className="accent-wood-800" />
                  <span>Visible in Filters & Store</span>
                </label>
              </div>

              <div className="pt-4 border-t border-wood-100 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setIsWoodModalOpen(false)} className="border border-wood-300 bg-white text-wood-700 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-wood-50 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={submitting} className="bg-wood-800 hover:bg-wood-950 text-white px-7 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer border-none">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Timber Species'}
                </button>
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
          if (pickerTarget === 'thumbnail') setCatThumbnailImage(url);
          else if (pickerTarget === 'banner') setCatBannerImage(url);
        }}
        defaultFolder="Products"
      />
    </div>
  );
};

export default Categories;
