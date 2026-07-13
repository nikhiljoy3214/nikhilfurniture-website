import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { Image } from '../components/Image';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const defaultGalleryConfig = {
  albums: [
    { id: 'a1', name: 'Showroom', slug: 'showroom', is_visible: true, sort_order: 1 },
    { id: 'a2', name: 'Workshop', slug: 'workshop', is_visible: true, sort_order: 2 },
    { id: 'a3', name: 'Living Room', slug: 'living', is_visible: true, sort_order: 3 },
    { id: 'a4', name: 'Bedroom', slug: 'bedroom', is_visible: true, sort_order: 4 },
    { id: 'a5', name: 'Dining', slug: 'dining', is_visible: true, sort_order: 5 }
  ],
  images: [
    { id: 'g1', title: 'Heritage Teak Sofa Installation', desc: 'Sofa set in living room', album_slug: 'living', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', alt_text: 'Teak sofa', is_featured: true, sort_order: 1, upload_date: '2026-07-12' },
    { id: 'g2', title: 'Mahogany Oval Dining Suite', desc: 'Dining set showcase', album_slug: 'dining', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', alt_text: 'Oval dining table', is_featured: false, sort_order: 2, upload_date: '2026-07-12' },
    { id: 'g3', title: 'Royal King Size Cot Display', desc: 'King cot platform cot', album_slug: 'bedroom', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg', alt_text: 'Teak bed', is_featured: false, sort_order: 3, upload_date: '2026-07-12' },
    { id: 'g4', title: 'Teak Log Seasoning Shed', desc: 'Timber seasoning in workshop', album_slug: 'workshop', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', alt_text: 'Timber workshop seasoning logs', is_featured: true, sort_order: 4, upload_date: '2026-07-12' },
    { id: 'g5', title: '3-Door Teak Wardrobe Unit', desc: 'Spacious locker cabinet wardrobe', album_slug: 'bedroom', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg', alt_text: 'Teak wardrobe', is_featured: true, sort_order: 5, upload_date: '2026-07-12' }
  ]
};

export const Gallery: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
      const key = isPreview ? 'gallery_module_draft' : 'gallery_module';
      
      try {
        const { data: res } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', key)
          .single();

        if (res && res.value) {
          setData(res.value);
        }
      } catch (err) {
        console.error('Failed to load gallery settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wood-50">
        <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
      </div>
    );
  }

  const info = data || defaultGalleryConfig;
  const albums = info.albums ? info.albums.filter((a: any) => a.is_visible).sort((a: any, b: any) => a.sort_order - b.sort_order) : [];
  const images = info.images ? info.images.sort((a: any, b: any) => a.sort_order - b.sort_order) : [];

  const filteredItems = filter === 'all'
    ? images
    : images.filter((item: any) => item.album_slug === filter);

  return (
    <div className="py-16 bg-wood-50">
      <SEO
        title="Project Showcase & Showroom Gallery | Nikhil Furniture"
        description="Explore photographs of our premium wooden cots, dining tables, teak sofa sets, and custom woodworking installations across Kerala."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Gallery', url: '/gallery' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Visual Showcase</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2 mb-4">
            Showroom & Project Gallery
          </h1>
          <p className="font-sans text-sm text-wood-700/80 leading-relaxed">
            A window into our manufacturing workshop in Pudukkad and beautiful installations in client residences across Ernakulam, Thrissur, and Kozhikode.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              filter === 'all'
                ? 'bg-wood-800 text-white shadow-sm'
                : 'bg-white border border-wood-200 text-wood-650 hover:bg-wood-100/50'
            }`}
          >
            All Images
          </button>
          {albums.map((album: any) => (
            <button
              key={album.slug}
              onClick={() => setFilter(album.slug)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                filter === album.slug
                  ? 'bg-wood-800 text-white shadow-sm'
                  : 'bg-white border border-wood-200 text-wood-650 hover:bg-wood-100/50'
              }`}
            >
              {album.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-wood-500 font-sans text-sm font-semibold bg-white rounded-3xl border border-wood-200/30">
            No images found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item: any) => {
              const albumObj = albums.find((a: any) => a.slug === item.album_slug);
              const albumName = albumObj ? albumObj.name : item.album_slug;
              return (
                <div
                  key={item.id}
                  className="group block relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-white border border-wood-200/20"
                >
                  <div className="h-72 overflow-hidden relative">
                    <Image
                      src={item.src}
                      alt={item.alt_text || item.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wood-950/60 via-wood-950/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" />
                  </div>
                  <div className="p-5 font-sans">
                    <span className="text-[10px] text-gold-600 font-bold uppercase tracking-wider block mb-1">{albumName}</span>
                    <h3 className="font-serif text-base font-bold text-wood-950">
                      {item.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
export default Gallery;
