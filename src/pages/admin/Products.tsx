import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { SEO } from '../../components/SEO';
import { ProductTable } from '../../components/admin/ProductTable';
import { ProductGrid } from '../../components/admin/ProductGrid';
import { ProductEditor } from '../../components/admin/ProductEditor';
import { FilterPanel } from '../../components/admin/FilterPanel';
import { BulkActionToolbar } from '../../components/admin/BulkActionToolbar';
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Upload,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface FilterState {
  category: string;
  woodType: string;
  finish: string;
  status: string;
  isFeatured: boolean | null;
  isPopular: boolean | null;
  isNewArrival: boolean | null;
}

export const Products: React.FC = () => {
  const location = useLocation();

  // General States
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');

  // Sync state when URL query parameters change
  useEffect(() => {
    const term = searchParams.get('search') || '';
    setSearch(term);
  }, [searchParams]);

  // Sync local edits back to search parameters
  const handleLocalSearch = (val: string) => {
    setSearch(val);
    setSearchParams(
      (prev) => {
        if (val) {
          prev.set('search', val);
        } else {
          prev.delete('search');
        }
        return prev;
      },
      { replace: true }
    );
  };
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showFilters, setShowFilters] = useState(false);

  // Selection & Bulk States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sorting States
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter States
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    woodType: '',
    finish: '',
    status: '',
    isFeatured: null,
    isPopular: null,
    isNewArrival: null,
  });

  // Editor states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Dynamic filter dropdown list options
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [woodTypesList, setWoodTypesList] = useState<string[]>([]);
  const [finishesList, setFinishesList] = useState<string[]>([]);

  const categories = [
    'Wooden Sofa Sets', 'Corner Sofa Sets', 'Wooden Dining Tables',
    'Dining Chairs', 'Wooden Cots', 'Wardrobes / Almirahs',
    'Teapoys', 'Wooden Benches', 'TV Units', 'Bookshelves',
    'Study Tables', 'Office Furniture', 'Customized Furniture'
  ];

  // 1. Fetch catalog products (all columns)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setAllProducts(data as Product[]);
        
        // Extract unique fields dynamically for filter listings
        const uniqueWood = Array.from(new Set(data.map(p => p.wood_type).filter(Boolean)));
        const uniqueFinish = Array.from(new Set(data.map(p => p.finish).filter(Boolean)));
        
        setCategoriesList(categories);
        setWoodTypesList(uniqueWood);
        setFinishesList(uniqueFinish);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle location-state quick modal open
  useEffect(() => {
    if (location.state && (location.state as any).openAdd) {
      handleOpenAdd();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // 2. Perform search, sort, and filters locally for instant response
  useEffect(() => {
    let result = [...allProducts];

    // Search filter: instantly evaluates match highlights
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.wood_type || '').toLowerCase().includes(term) ||
        (p.finish || '').toLowerCase().includes(term) ||
        (p.tags || []).some(t => t.toLowerCase().includes(term))
      );
    }

    // Advanced drop-down filters
    if (filters.category) {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters.woodType) {
      result = result.filter(p => p.wood_type === filters.woodType);
    }
    if (filters.finish) {
      result = result.filter(p => p.finish === filters.finish);
    }
    if (filters.status) {
      result = result.filter(p => ((p as any).status || 'published') === filters.status);
    }
    if (filters.isFeatured !== null) {
      result = result.filter(p => p.is_featured === filters.isFeatured);
    }
    if (filters.isPopular !== null) {
      result = result.filter(p => p.is_popular === filters.isPopular);
    }
    if (filters.isNewArrival !== null) {
      result = result.filter(p => p.is_new_arrival === filters.isNewArrival);
    }

    // Sort order evaluation
    result.sort((a, b) => {
      let aField: any = a[sortField as keyof Product];
      let bField: any = b[sortField as keyof Product];

      // Handle null cases
      if (aField === undefined || aField === null) aField = '';
      if (bField === undefined || bField === null) bField = '';

      if (typeof aField === 'string') {
        aField = aField.toLowerCase();
        bField = bField.toLowerCase();
      }

      if (aField < bField) return sortOrder === 'asc' ? -1 : 1;
      if (aField > bField) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayedProducts(result);
  }, [allProducts, search, filters, sortField, sortOrder]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      woodType: '',
      finish: '',
      status: '',
      isFeatured: null,
      isPopular: null,
      isNewArrival: null,
    });
  };

  // Selection helpers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === displayedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedProducts.map(p => p.id));
    }
  };

  // 3. Create & Update Triggers
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditorOpen(true);
  };

  const handleImageUpload = async (file: File, _type: 'featured' | 'gallery'): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('furniture')
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('furniture')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSaveProduct = async (payload: Partial<Product>) => {
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }
      fetchProducts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Inline Quick Edit handler
  const handleQuickUpdate = async (id: string, fields: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(fields)
        .eq('id', id);
      if (error) throw error;
      
      // Update local state instantly
      setAllProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, ...fields } : p))
      );
    } catch (err: any) {
      alert(`Quick edit failed: ${err.message}`);
    }
  };

  // Product Duplication Logic
  const handleDuplicateProduct = async (p: Product) => {
    const randomSuffix = Math.random().toString(36).substring(4, 8);
    const newSlug = `${p.slug}-dup-${randomSuffix}`;
    const newName = `${p.name} (Copy)`;

    const duplicatePayload = {
      name: newName,
      slug: newSlug,
      short_description: p.short_description,
      detailed_description: p.detailed_description,
      category: p.category,
      wood_type: p.wood_type,
      finish: p.finish,
      dimensions: p.dimensions,
      specifications: p.specifications,
      features: p.features,
      featured_image: p.featured_image,
      gallery_images: p.gallery_images,
      seo_title: `Copy of ${p.seo_title}`,
      seo_description: p.seo_description,
      alt_text: p.alt_text,
      tags: p.tags,
      is_featured: false, // Default duplicates to false
      is_popular: false,
      is_new_arrival: false,
      sort_order: p.sort_order,
      base_price: p.base_price,
      wood_prices: p.wood_prices,
      status: 'draft', // Default duplicates as draft
      related_products: p.related_products,
    };

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .insert([duplicatePayload])
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        await fetchProducts();
        handleOpenEdit(data[0] as Product);
      }
    } catch (err: any) {
      alert(`Duplication failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete with prompt protection
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`⚠️ DELETION IS PERMANENT!\n\nAre you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setSelectedIds(prev => prev.filter(x => x !== id));
      fetchProducts();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // 5. Bulk Actions Implementation
  const handleBulkDelete = async () => {
    const names = allProducts
      .filter(p => selectedIds.includes(p.id))
      .map(p => p.name)
      .join('\n• ');

    if (!window.confirm(`⚠️ BULK DELETION WARNING!\n\nYou are about to permanently delete the following ${selectedIds.length} items:\n\n• ${names}\n\nThis action cannot be undone. Proceed?`)) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedIds);

      if (error) throw error;
      setSelectedIds([]);
      await fetchProducts();
    } catch (err: any) {
      alert(`Bulk deletion failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .in('id', selectedIds);

      if (error) throw error;
      setSelectedIds([]);
      await fetchProducts();
    } catch (err: any) {
      alert(`Bulk archive failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleBulkPublish = async (publish: boolean) => {
    const targetStatus = publish ? 'published' : 'draft';
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .update({ status: targetStatus })
        .in('id', selectedIds);

      if (error) throw error;
      setSelectedIds([]);
      await fetchProducts();
    } catch (err: any) {
      alert(`Bulk status change failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleBulkFeatured = async (featured: boolean) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('products')
        .update({ is_featured: featured })
        .in('id', selectedIds);

      if (error) throw error;
      setSelectedIds([]);
      await fetchProducts();
    } catch (err: any) {
      alert(`Bulk feature update failed: ${err.message}`);
      setLoading(false);
    }
  };

  // 6. CSV/JSON Import & Export
  const handleBulkExport = () => {
    const exportTargets = selectedIds.length > 0 
      ? allProducts.filter(p => selectedIds.includes(p.id))
      : allProducts;

    const headers = [
      'Name', 'Slug', 'Category', 'Wood Type', 'Finish', 'Base Price', 
      'Status', 'Featured', 'Popular', 'New Arrival', 'Short Description'
    ];

    const csvLines = [headers.join(',')];

    exportTargets.forEach((p) => {
      const row = [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.slug}"`,
        `"${p.category}"`,
        `"${p.wood_type || ''}"`,
        `"${p.finish || ''}"`,
        p.base_price || 25000,
        `"${(p as any).status || 'published'}"`,
        p.is_featured ? 'TRUE' : 'FALSE',
        p.is_popular ? 'TRUE' : 'FALSE',
        p.is_new_arrival ? 'TRUE' : 'FALSE',
        `"${(p.short_description || '').replace(/"/g, '""')}"`
      ];
      csvLines.push(row.join(','));
    });

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nikhil-furniture-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    };
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const csvData = event.target?.result as string;
      if (!csvData) return;

      const lines = csvData.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length <= 1) return alert('Import failed: CSV is empty.');

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
      const expectedHeaders = ['name', 'slug', 'category', 'wood type', 'finish', 'base price', 'status'];
      
      const hasHeaderCheck = expectedHeaders.every(h => headers.includes(h));
      if (!hasHeaderCheck) {
        alert(`Import validation failed. Columns must contain: ${expectedHeaders.join(', ')}`);
        return;
      }

      setLoading(true);
      const parsedProducts: any[] = [];
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Basic comma splitter respecting quotations
        const cells: string[] = [];
        let insideQuote = false;
        let currentCell = '';
        
        for (let charIndex = 0; charIndex < lines[i].length; charIndex++) {
          const char = lines[i][charIndex];
          if (char === '"') {
            insideQuote = !insideQuote;
          } else if (char === ',' && !insideQuote) {
            cells.push(currentCell.trim());
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        cells.push(currentCell.trim());

        const getVal = (headerName: string) => {
          const idx = headers.indexOf(headerName);
          return idx !== -1 ? cells[idx]?.replace(/"/g, '') : '';
        };

        const nameVal = getVal('name');
        const slugVal = getVal('slug') || slugify(nameVal);
        const catVal = getVal('category');
        const priceVal = Number(getVal('base price') || 25000);
        const statusVal = getVal('status') || 'draft';

        // Validation checks
        if (!nameVal) {
          errors.push(`Row ${i}: Missing Name`);
          continue;
        }
        if (!catVal) {
          errors.push(`Row ${i}: Missing Category`);
          continue;
        }

        parsedProducts.push({
          name: nameVal,
          slug: slugVal,
          category: catVal,
          wood_type: getVal('wood type') || 'Premium Teak Wood',
          finish: getVal('finish') || 'Natural Matte',
          base_price: isNaN(priceVal) ? 25000 : priceVal,
          status: ['published', 'draft', 'archived', 'hidden'].includes(statusVal) ? statusVal : 'draft',
          short_description: getVal('short description') || 'Premium Kerala wooden furniture.',
          detailed_description: getVal('detailed description') || 'Bespoke handcraft wood styling.',
          featured_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', // Default fallback
          gallery_images: ['https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg'],
          features: ['Handcrafted joinery'],
          specifications: { material: 'Genuine Hardwood' },
          seo_title: `${nameVal} | Premium Furniture`,
          seo_description: `Premium wooden furniture listings.`,
        });
      }

      if (errors.length > 0) {
        setLoading(false);
        alert(`Validation Errors:\n\n• ${errors.slice(0, 5).join('\n• ')}\n\nCorrect rows and upload again.`);
        return;
      }

      try {
        const { error } = await supabase.from('products').upsert(parsedProducts, { onConflict: 'slug' });
        if (error) throw error;
        alert(`CSV import successful! Loaded ${parsedProducts.length} items.`);
        fetchProducts();
      } catch (err: any) {
        alert(`Import database failed: ${err.message}`);
        setLoading(false);
      }
    };

    reader.readAsText(file);
    // Clear input
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-6">
      <SEO
        title="Admin Inventory | Nikhil Furniture"
        description="Bespoke furniture CMS catalog dashboard."
      />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60 select-none">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Products Catalog</h2>
          <p className="text-xs text-wood-500 font-sans">Manage detailed product specs, images, SEO, and variants starting prices</p>
        </div>
        <div className="flex items-center gap-3">
          
          {/* CSV Import */}
          <label className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm">
            <Upload className="w-4 h-4" /> Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
          </label>

          {/* Export CSV button */}
          <button
            onClick={handleBulkExport}
            className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer font-sans shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>

          {/* Add Product Button */}
          <button
            onClick={handleOpenAdd}
            className="bg-wood-800 hover:bg-wood-950 text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Toolbar Filter Toggles & Views */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-wood-200/40 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-wood-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, slug, finish, wood or tag..."
            value={search}
            onChange={(e) => handleLocalSearch(e.target.value)}
            className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold font-sans focus:outline-none transition-colors"
          />
        </div>

        {/* Filters Toggle and View Mode togglers */}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 cursor-pointer ${
              showFilters 
                ? 'bg-wood-100 text-wood-900 border-wood-300' 
                : 'bg-white text-wood-700 border-wood-200 hover:bg-wood-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className="h-8 w-[1px] bg-wood-200" />

          <div className="flex items-center border border-wood-200 rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 border-none cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-wood-800 text-white' : 'bg-white text-wood-500 hover:text-wood-850'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 border-none cursor-pointer transition-colors ${
                viewMode === 'grid' ? 'bg-wood-800 text-white' : 'bg-white text-wood-500 hover:text-wood-850'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          categories={categoriesList}
          woodTypes={woodTypesList}
          finishes={finishesList}
        />
      )}

      {/* Catalog Render Container */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-wood-200/40 flex items-center justify-center min-h-[300px] shadow-sm">
          <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-wood-200/40 text-center text-wood-500 text-sm font-semibold font-sans shadow-sm flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-wood-300" />
          <span>No products found matching search/filter criteria.</span>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-wood-200/40 shadow-sm overflow-hidden mb-12">
          <ProductTable
            products={displayedProducts}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteProduct}
            onDuplicate={handleDuplicateProduct}
            onQuickUpdate={handleQuickUpdate}
            searchQuery={search}
            categories={categoriesList}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </div>
      ) : (
        <div className="mb-20">
          <ProductGrid
            products={displayedProducts}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteProduct}
            onDuplicate={handleDuplicateProduct}
            onQuickUpdate={handleQuickUpdate}
            searchQuery={search}
          />
        </div>
      )}

      {/* Bulk Action Sticky Toolbar */}
      <BulkActionToolbar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkArchive}
        onBulkPublish={handleBulkPublish}
        onBulkFeatured={handleBulkFeatured}
        onBulkExport={handleBulkExport}
      />

      {/* Reusable Tabbed Product Editor modal */}
      <ProductEditor
        product={editingProduct}
        allProducts={allProducts}
        categories={categories}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveProduct}
        onImageUpload={handleImageUpload}
        onDuplicate={handleDuplicateProduct}
      />
    </div>
  );
};

export default Products;
