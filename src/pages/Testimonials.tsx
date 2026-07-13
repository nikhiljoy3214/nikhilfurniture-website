import React, { useState, useEffect } from 'react';
import { Star, Quote, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';

const defaultTestimonialsConfig = {
  testimonials: [
    { id: 't1', name: 'Mathew Jacob', role: 'Homeowner', location: 'Ernakulam', content: 'We ordered a custom 8-seater Nilambur Teak dining table and a matching console unit. The finishing is unbelievable, and the structure is extremely heavy. They took care of everything, from wood selection to delivering and setting it up at our home.', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', purchased_item: 'Teak Dining Set', is_featured: true, is_visible: true, sort_order: 1 },
    { id: 't2', name: 'Priya Nair', role: 'Architect', location: 'Thrissur', content: 'As an architect, I am highly picky about wood specifications and polish levels. Nikhil Furniture is my go-to choice for clients who want premium solid wood. Their carpenters can execute complex blueprints flawlessly.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', purchased_item: 'Custom Teak Wardrobe', is_featured: true, is_visible: true, sort_order: 2 },
    { id: 't3', name: 'Dr. Hari Das', role: 'Professor', location: 'Palakkad', content: 'We purchased our complete bedroom set - king cot and a 3-door almirah - in 2008. Seventeen years later, the wood grain looks even richer, there is zero creaking, and the drawer slides operate smoothly. Exceptional longevity.', rating: 5, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', purchased_item: 'Royal Cot Panel', is_featured: false, is_visible: true, sort_order: 3 }
  ]
};

export const Testimonials: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
      const key = isPreview ? 'testimonials_module_draft' : 'testimonials_module';
      
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
        console.error('Failed to load testimonials settings:', err);
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

  const info = data || defaultTestimonialsConfig;
  const activeReviews = info.testimonials
    ? info.testimonials.filter((x: any) => x.is_visible).sort((a: any, b: any) => a.sort_order - b.sort_order)
    : [];

  return (
    <div className="py-16 bg-wood-50">
      <SEO
        title="Client Reviews & Testimonials | Nikhil Furniture Kerala"
        description="Read reviews from verified homeowners, architects, and designers across Kerala who trust Nikhil Furniture for premium teak and rosewood furniture."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Testimonials', url: '/testimonials' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16 text-center mx-auto">
          <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Client Success Stories</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2 mb-4">
            Testimonials & Reviews
          </h1>
          <p className="font-sans text-sm text-wood-700/80 leading-relaxed max-w-xl mx-auto">
            We have served over 5,000+ happy homes and offices across Kerala. Discover why architects and families trust us with their dream furniture.
          </p>
        </div>

        {/* Reviews Grid */}
        {activeReviews.length === 0 ? (
          <div className="py-16 text-center text-wood-500 font-sans text-sm font-semibold bg-white rounded-3xl border border-wood-200/30">
            No testimonials found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeReviews.map((rev: any) => (
              <div
                key={rev.id}
                className="bg-white p-8 rounded-3xl border border-wood-200/40 shadow-sm relative flex flex-col justify-between"
              >
                <Quote className="w-12 h-12 text-wood-100 absolute top-6 right-6" />
                <div className="relative z-10">
                  {/* Rating stars */}
                  <div className="flex items-center gap-1 text-gold-500 mb-6">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <p className="font-serif text-base text-wood-850 italic leading-relaxed mb-6">
                    "{rev.content}"
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-wood-100 pt-5 font-sans">
                  {rev.avatar ? (
                    <img src={rev.avatar} alt={rev.name} className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm bg-wood-50" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-wood-100 flex items-center justify-center font-bold text-wood-800 text-xs shrink-0">
                      {rev.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-wood-900 text-xs">{rev.name}</h4>
                    <p className="text-[9px] text-wood-500 uppercase tracking-wider font-bold mt-0.5">
                      {rev.role}, {rev.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
export default Testimonials;
