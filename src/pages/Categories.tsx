import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Image } from '../components/Image';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';

interface CategoryItem {
  name: string;
  description: string;
  thumbnail_image: string;
}

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Local fallback array containing static data in case of Supabase offline or missing connections
  const fallbackCategories = [
    { name: 'Wooden Sofa Sets', description: 'Premium handcrafted sofa sets designed for formal living areas and general lounges.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg' },
    { name: 'Corner Sofa Sets', description: 'Space-saving premium L-shape Sectional sofas built in solid teak and mahogany.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg' },
    { name: 'Wooden Dining Tables', description: 'Sturdy, premium wooden dining tables with hand-carved details or modern minimalist cuts.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg' },
    { name: 'Dining Chairs', description: 'Ergonomic, elegant dining chairs with customizable fabric overlays and sturdy backrests.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg' },
    { name: 'Wooden Cots', description: 'Luxurious wooden bed frames, poster cots, and platform cots for the perfect night\'s sleep.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg' },
    { name: 'Wardrobes / Almirahs', description: 'Spacious wardrobes with customized lockers, hanging rods, and integrated mirrors.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' },
    { name: 'Teapoys', description: 'Timeless center tables and corner teapoys in mahogany and teak finishes.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg' },
    { name: 'Wooden Benches', description: 'Traditional Kerala sit-out benches (Padi), dining benches, and corridor seating.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg' },
    { name: 'TV Units', description: 'Elegant entertainment consoles with pre-installed cable management pathways.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' },
    { name: 'Bookshelves', description: 'Stately libraries and wall shelving cabinets to house books, collectibles, and decor.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' },
    { name: 'Study Tables', description: 'Highly ergonomic writing desks and desktop tables with keyboard drawers.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' },
    { name: 'Office Furniture', description: 'Solid wood executive desks, office credenzas, and meeting room furniture.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' },
    { name: 'Customized Furniture', description: '100% tailor-made wooden temples, oonjals, partitioning doors, and custom frames.', thumbnail_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name, description, thumbnail_image')
          .eq('is_visible', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setCategories(data as CategoryItem[]);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err) {
        console.error('Error fetching categories from database, utilizing local fallback:', err);
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="py-16 bg-wood-50">
      <SEO
        title="Furniture Categories | Nikhil Furniture Kerala"
        description="Browse premium wooden furniture categories including handcrafted sofa sets, dining suites, royal cots, almirahs, and bespoke customized solutions."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Categories', url: '/categories' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Page title header */}
        <div className="max-w-3xl mb-16">
          <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Catalog Sorts</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2 mb-4">
            Browse Categories
          </h1>
          <p className="font-sans text-sm text-wood-700/80 leading-relaxed font-semibold">
            Every piece of furniture we manufacture is tailored to Kerala's climate conditions, ensuring it is resistant to humidity and stands firm for generations. Select a collection below to browse catalog details.
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-wood-200/20"
              >
                <div className="h-60 relative overflow-hidden">
                  <Image
                    src={cat.thumbnail_image || 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg'}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wood-950/60 via-wood-950/10 to-transparent" />
                </div>
                <div className="p-8 flex flex-col justify-between min-h-[180px] font-sans">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-wood-900 group-hover:text-wood-700 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-wood-600 leading-relaxed mt-2.5 font-semibold">
                      {cat.description || cat.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gold-600 mt-6 group-hover:translate-x-1.5 transition-transform">
                    EXPLORE PIECES
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
