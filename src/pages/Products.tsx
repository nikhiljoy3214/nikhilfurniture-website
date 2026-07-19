import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { Image } from '../components/Image';
import { SEO } from '../components/SEO';
import { WishlistButton } from '../components/WishlistButton';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Load restored state if user came back from a product details page
  const shouldRestore = sessionStorage.getItem('products_list_restore') === 'true';
  const restoredState = (() => {
    if (shouldRestore) {
      const saved = sessionStorage.getItem('products_list_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const currentCategory = searchParams.get('category') || '';
          const currentWood = searchParams.get('wood_type') || '';
          const currentSort = searchParams.get('sort') || 'default';
          if (
            parsed.filters?.currentCategory === currentCategory &&
            parsed.filters?.currentWood === currentWood &&
            parsed.filters?.currentSort === currentSort
          ) {
            return parsed;
          }
        } catch (e) {
          console.error('Error parsing restored products state:', e);
        }
      }
    }
    return null;
  })();

  const [products, setProducts] = useState<Product[]>(() => restoredState?.products || []);
  const [loading, setLoading] = useState(() => !restoredState);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState<string>(() => restoredState?.search || '');
  const [categorySeo, setCategorySeo] = useState<{ seo_title: string | null; seo_description: string | null } | null>(null);

  const currentCategory = searchParams.get('category') || '';
  const currentWood = searchParams.get('wood_type') || '';
  const currentSort = searchParams.get('sort') || 'default';

  // Fetch category SEO overrides from DB dynamically when a category filter is active
  useEffect(() => {
    if (!currentCategory) {
      setCategorySeo(null);
      return;
    }
    const fetchCategorySEO = async () => {
      try {
        const { data } = await supabase
          .from('categories')
          .select('seo_title, seo_description')
          .eq('name', currentCategory)
          .single();
        if (data) {
          setCategorySeo(data);
        }
      } catch (err) {
        // Silent fallback
      }
    };
    fetchCategorySEO();
  }, [currentCategory]);
  
  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState<number>(() => restoredState?.currentPage || 1);
  const [totalCount, setTotalCount] = useState<number>(() => restoredState?.totalCount || 0);
  const itemsPerPage = 12;

  // Scroll to top when filters change (resets user to top of results on fresh filter)
  useEffect(() => {
    if (sessionStorage.getItem('products_list_restore') === 'true') {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentCategory, currentWood, currentSort, search]);

  // Save products catalog state to session storage on any changes
  useEffect(() => {
    if (products.length > 0 || currentPage === 1) {
      let scrollPosition = undefined;
      const existing = sessionStorage.getItem('products_list_state');
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          scrollPosition = parsed.scrollPosition;
        } catch (e) {}
      }

      sessionStorage.setItem('products_list_state', JSON.stringify({
        products,
        currentPage,
        totalCount,
        search,
        filters: { currentCategory, currentWood, currentSort },
        scrollPosition // Keep the scroll position preserved from overwrites
      }));
    }
  }, [products, currentPage, totalCount, search, currentCategory, currentWood, currentSort]);

  // Scroll restoration on mount
  useEffect(() => {
    if (restoredState && typeof restoredState.scrollPosition === 'number') {
      const timer = setTimeout(() => {
        const lenisInst = (window as any).lenis;
        if (lenisInst) {
          // Trigger Lenis scrolling directly to bypass snap-to-top hijacking
          lenisInst.scrollTo(restoredState.scrollPosition, { immediate: true });
        } else {
          window.scrollTo(0, restoredState.scrollPosition);
        }
        sessionStorage.removeItem('products_list_restore');
      }, 250); // Safe timeout window to allow DOM content paint
      return () => clearTimeout(timer);
    } else {
      sessionStorage.removeItem('products_list_restore');
    }
  }, []);

  // Capture the scroll position immediately upon clicking a product card (before pathname changes)
  const saveScrollBeforeNavigate = () => {
    const saved = sessionStorage.getItem('products_list_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.scrollPosition = window.scrollY;
        sessionStorage.setItem('products_list_state', JSON.stringify(parsed));
      } catch (e) {
        console.error('Error saving scroll position on click:', e);
      }
    }
  };

  const woodTypes = ['Premium Teak Wood', 'Rosewood', 'Mahogany', 'Walnut Wood', 'Anjili', 'Jackwood'];
  const categories = [
    'Wooden Sofa Sets', 'Corner Sofa Sets', 'Wooden Dining Tables',
    'Dining Chairs', 'Wooden Cots', 'Wardrobes / Almirahs',
    'Teapoys', 'Wooden Benches', 'TV Units', 'Bookshelves',
    'Study Tables', 'Office Furniture', 'Customized Furniture'
  ];

  // Fetch products based on parameters
  useEffect(() => {
    const fetchProducts = async () => {
      // If catalog state is being restored, skip fetching to prevent duplications and query race conditions
      if (sessionStorage.getItem('products_list_restore') === 'true') {
        return;
      }

      if (currentPage === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      try {
        // Step 1: Initialize query (select only required list/card columns to minimize egress!)
        let query = supabase
          .from('products')
          .select('id, name, slug, short_description, category, wood_type, finish, featured_image, is_featured, is_popular, is_new_arrival, base_price, specifications', { count: 'exact' });

        // Step 2: Apply Filters
        if (currentCategory) {
          query = query.eq('category', currentCategory);
        }
        if (currentWood) {
          query = query.eq('wood_type', currentWood);
        }
        if (search) {
          query = query.ilike('name', `%${search}%`);
        }

        // Step 3: Apply Sorting
        if (currentSort === 'name-asc') {
          query = query.order('name', { ascending: true });
        } else if (currentSort === 'name-desc') {
          query = query.order('name', { ascending: false });
        } else if (currentSort === 'price-asc') {
          query = query.order('base_price', { ascending: true });
        } else if (currentSort === 'price-desc') {
          query = query.order('base_price', { ascending: false });
        } else if (currentSort === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else {
          query = query.order('sort_order', { ascending: true });
        }

        // Step 4: Apply Pagination (0-indexed ranges)
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        query = query.range(from, to);

        // Step 5: Execute Query
        const { data, count, error } = await query;

        if (error) throw error;
        if (data) {
          if (currentPage === 1) {
            setProducts(data as Product[]);
          } else {
            setProducts(prev => [...prev, ...(data as Product[])]);
          }
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchProducts();
  }, [currentCategory, currentWood, currentSort, search, currentPage]);

  // Reset pagination on filter change
  useEffect(() => {
    if (sessionStorage.getItem('products_list_restore') === 'true') {
      return;
    }
    setCurrentPage(1);
  }, [currentCategory, currentWood, currentSort, search]);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleWoodChange = (wood: string) => {
    const params = new URLSearchParams(searchParams);
    if (wood) {
      params.set('wood_type', wood);
    } else {
      params.delete('wood_type');
    }
    setSearchParams(params);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    if (sort !== 'default') {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearch('');
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Collapsable mobile filter drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Resolve dynamic meta title, description, and breadcrumbs for category SEO targeting Thrissur
  const seoTitle = currentCategory
    ? (categorySeo?.seo_title || `${currentCategory} in Thrissur | Handcrafted Wooden Furniture`)
    : "Premium Furniture Catalog | Nikhil Furniture Kerala";

  const seoDescription = currentCategory
    ? (categorySeo?.seo_description || `Discover premium solid wood ${currentCategory.toLowerCase()} in Thrissur, Kerala. Sourced from seasoned Nilambur timber, customizable to your needs.`)
    : "Browse our luxury collections of wooden sofa sets, dining suites, poster cots, wardrobes, and customized furniture in Thrissur, Kerala.";

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' }
  ];
  if (currentCategory) {
    breadcrumbs.push({
      name: currentCategory,
      url: `/products?category=${encodeURIComponent(currentCategory)}`
    });
  }

  return (
    <div className="py-16 bg-wood-50 min-h-screen">
      <SEO
        title={seoTitle}
        description={seoDescription}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Page Title & Breadcrumbs header */}
        <div className="mb-12">
          <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Kerala's Premier Showroom</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2">
            The Furniture Collection
          </h1>
        </div>

        {/* Mobile Filters Toggle Button */}
        <div className="lg:hidden flex items-center justify-between mb-6 w-full gap-4">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-wood-200 text-wood-800 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm active:bg-wood-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-gold-500" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {(currentCategory || currentWood || search) && (
            <button 
              onClick={clearFilters}
              className="px-5 py-3.5 rounded-xl bg-wood-100 text-wood-800 font-bold uppercase tracking-wider text-xs active:bg-wood-200 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Catalog Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
          
          {/* 1. SIDEBAR FILTERS */}
          <div className={`${showMobileFilters ? 'flex animate-slide-down' : 'hidden'} lg:flex lg:col-span-1 bg-white p-8 rounded-3xl border border-wood-200/40 shadow-sm flex-col gap-8 lg:sticky lg:top-28 lg:z-20`}>
            <div className="flex items-center justify-between pb-4 border-b border-wood-100">
              <span className="font-serif font-bold text-wood-950 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </span>
              <button
                onClick={() => {
                  clearFilters();
                  setShowMobileFilters(false);
                }}
                className="text-xs text-gold-600 hover:text-gold-700 font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* Keyword Search */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-wood-500">Search Product</span>
              <div className="relative">
                <Search className="w-4 h-4 text-wood-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Teak Sofa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-sans focus:outline-none focus:border-wood-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-wood-500">Category</span>
              <select
                value={currentCategory}
                onChange={(e) => {
                  handleCategoryChange(e.target.value);
                  if (window.innerWidth < 1024) setShowMobileFilters(false);
                }}
                className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-4 text-sm font-sans focus:outline-none focus:border-wood-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Wood Type Filter */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-wood-500">Timber Species</span>
              <select
                value={currentWood}
                onChange={(e) => {
                  handleWoodChange(e.target.value);
                  if (window.innerWidth < 1024) setShowMobileFilters(false);
                }}
                className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-4 text-sm font-sans focus:outline-none focus:border-wood-500"
              >
                <option value="">All Woods</option>
                {woodTypes.map((wood, idx) => (
                  <option key={idx} value={wood}>{wood}</option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-wood-500">Sort By</span>
              <select
                value={currentSort}
                onChange={(e) => {
                  handleSortChange(e.target.value);
                  if (window.innerWidth < 1024) setShowMobileFilters(false);
                }}
                className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-4 text-sm font-sans focus:outline-none focus:border-wood-500"
              >
                <option value="default">Default Sort</option>
                <option value="name-asc">Alphabetical (A-Z)</option>
                <option value="name-desc">Alphabetical (Z-A)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">New Arrivals First</option>
              </select>
            </div>
          </div>

          {/* 2. PRODUCTS GRID PANEL */}
          <div className="lg:col-span-3">
            
            {/* Loading / Count Indicator */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-wood-200/40 text-sm text-wood-600">
              <span>
                {loading ? 'Searching pieces...' : `Showing ${products.length} of ${totalCount} pieces`}
              </span>
            </div>

            {/* Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="animate-pulse flex flex-col gap-4">
                    <div className="h-64 bg-wood-200 rounded-3xl" />
                    <div className="h-6 bg-wood-200 w-3/4 rounded" />
                    <div className="h-4 bg-wood-200 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-wood-200/40 p-8">
                <span className="text-lg font-serif font-bold text-wood-900 block mb-2">No items match your selection</span>
                <p className="text-sm text-wood-600 mb-6">Try refining your filters or resetting the search term.</p>
                <button
                  onClick={clearFilters}
                  className="bg-wood-800 text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={saveScrollBeforeNavigate}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-wood-200/30 premium-card-shadow relative"
                  >
                    {/* Wishlist Button Overlay */}
                    <div className="absolute top-4 right-4 z-10">
                      <WishlistButton product={product} />
                    </div>

                    <Link to={`/products/${product.slug}`} className="block aspect-[4/3] w-full relative overflow-hidden bg-white p-2 border-b border-wood-100/30">
                      <Image
                        src={product.featured_image}
                        alt={product.alt_text || product.name}
                        objectFit="contain"
                        className="w-full h-full group-hover:scale-[1.03] transition-transform duration-700"
                      />
                      {/* Flag badges */}
                      {product.is_new_arrival && (
                        <div className="absolute top-4 left-4 bg-gold-400 text-wood-950 font-sans text-[9px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm">
                          New Arrival
                        </div>
                      )}
                      {product.is_popular && !product.is_new_arrival && (
                        <div className="absolute top-4 left-4 bg-wood-800 text-white font-sans text-[9px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm">
                          Popular
                        </div>
                      )}
                    </Link>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-wood-500 font-medium uppercase tracking-wider">{product.category}</span>
                        <Link to={`/products/${product.slug}`}>
                          <h3 className="font-serif text-lg font-bold text-wood-900 group-hover:text-wood-700 transition-colors mt-1 mb-2">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-wood-600/95 leading-relaxed line-clamp-2">
                          {product.short_description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-wood-100">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-wood-400 font-bold uppercase leading-none mb-1">
                            {product.specifications?.is_matrix_pricing ? 'Starts From' : 'Price'}
                          </span>
                          <span className="text-sm font-bold text-wood-950 leading-none">
                            ₹{(product.base_price || 25000).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Link
                          to={`/products/${product.slug}`}
                          className="text-xs font-bold text-gold-600 group-hover:underline inline-flex items-center gap-1"
                        >
                          Details
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center mt-16 pt-8 border-t border-wood-200/40">
                <p className="text-xs text-wood-500 font-sans mb-4 uppercase tracking-wider">
                  Showing <span className="font-bold text-wood-900">{products.length}</span> of{' '}
                  <span className="font-bold text-wood-900">{totalCount}</span> items
                </p>
                {currentPage < totalPages && (
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={loadingMore}
                    className="px-8 py-3.5 rounded-xl bg-wood-800 hover:bg-wood-950 disabled:bg-wood-400 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest transition-all shadow-sm hover:shadow-md inline-flex items-center gap-2 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      'Load More Pieces'
                    )}
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
export default Products;
