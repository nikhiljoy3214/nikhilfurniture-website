import React, { useState, useEffect } from 'react';
import { Hammer, HardHat, Shield, Flame, Scale, CheckCircle2, Award, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Image } from '../components/Image';
import { supabase } from '../lib/supabase';

const iconMap: Record<string, React.ComponentType<any>> = {
  Scale,
  Flame,
  Shield,
  Hammer,
  HardHat,
  CheckCircle2,
  Award
};

const defaultMfgConfig = {
  heading: 'Behind The Craft',
  title: 'Our Manufacturing Process',
  description: 'The premium quality of Nikhil Furniture is not accidental. It is the result of strict processing protocols, modern seasoning technologies, and expert carpentry. Explore our structural lifecycle below.',
  sec_title: 'Made in Kerala, Configured for Longevity',
  sec_desc_1: 'Kerala\'s climate presents unique challenges for wooden furniture, primarily high humidity and seasonal temperature changes. Inferior furniture manufactured in non-tropical regions often splits, swells, or starts creaking within a few monsoon cycles.',
  sec_desc_2: 'Our workshop is situated in Pudukkad, Thrissur, where we air-season timber under shaded sheds before it goes into the kiln. This double-seasoning protocol is rare but guarantees that our products remain dynamically stable, retaining their fit and alignments for decades.',
  sec_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
  steps: [
    { id: 's1', title: 'Timber Sourcing & Authentication', desc: 'We procure raw logs directly from certified government depots in Kerala, primarily focusing on Nilambur Teak and Malabar Rosewood. We inspect every log for structural defects, knots, or grain twists.', icon: 'Scale', sort_order: 1, enabled: true },
    { id: 's2', title: 'Regulated Kiln Drying', desc: 'Sawn planks are stacked in specialized kiln seasoning chambers. Controlled heat and ventilation reduce the moisture levels of the wood to a strict 8-12%, which is the ideal range for preventing post-assembly warping or shrinkage in tropical climates.', icon: 'Flame', sort_order: 2, enabled: true },
    { id: 's3', title: 'Anti-Termite Treatment', desc: 'Planks are treated with organic wood preservatives that penetrate the grain layers. This treatment acts as an eternal shield against drywood termites, wood-boring beetles, and fungi.', icon: 'Shield', sort_order: 3, enabled: true },
    { id: 's4', title: 'Artisan Carpentry & Assembly', desc: 'Our master carpenters map out cuts matching the design grains. Components are assembled using mortise-and-tenon or tongue-and-groove joinery, ensuring that the joints remain tight and wobble-free for decades.', icon: 'Hammer', sort_order: 4, enabled: true },
    { id: 's5', title: 'Fine Sanding', desc: 'Surfaces undergo multiple stages of hand and belt sanding using progressive grits. This smooths down grains, rounds off sharp edges, and prepares the wood surface for uniform absorption of protective sealers.', icon: 'HardHat', sort_order: 5, enabled: true },
    { id: 's6', title: 'PU & Stain Polishing', desc: 'We apply premium polyurethane (PU) sealers or melamine coatings depending on customer preference. Whether natural matte, honey gloss, or walnut stain, the coats protect the timber from liquid spills and hot plates.', icon: 'CheckCircle2', sort_order: 6, enabled: true }
  ],
  wood_types: [
    { id: 'w1', name: 'Nilambur Teak Wood', characteristics: 'High natural oil content, golden grain lines, and natural resistance to decay.', benefits: 'Excellent (Immune to termites and water dampness)', recommended: 'Sofa sets, main door frames, and custom dining tables', sort_order: 1 },
    { id: 'w2', name: 'Malabar Rosewood', characteristics: 'Very high density, heavy hardwood, and spectacular dark swirl lines.', benefits: 'Exceptional (Stands firm for generations)', recommended: 'Signature sit-out benches (Padi) and royal cot panels', sort_order: 2 },
    { id: 'w3', name: 'Premium Mahogany', characteristics: 'Fine straight grains, highly stable, and holds PU polishes beautifully.', benefits: 'High (Minimal expansion or shrinkage)', recommended: 'Multi-door wardrobes, dining chairs, and bookshelf cases', sort_order: 3 }
  ]
};

export const Manufacturing: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
      const key = isPreview ? 'manufacturing_page_draft' : 'manufacturing_page';
      
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
        console.error('Failed to load manufacturing settings:', err);
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

  const info = data || defaultMfgConfig;
  const activeSteps = info.steps ? info.steps.filter((s: any) => s.enabled) : [];

  return (
    <div className="py-16 bg-wood-50">
      <SEO
        title="Manufacturing Process & Timber Seasoning | Nikhil Furniture"
        description="Learn how Nikhil Furniture seasons Nilambur Teak and Mahogany timber, treats for termites, and applies premium polyurethane (PU) finishes."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Manufacturing', url: '/manufacturing' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">{info.heading}</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2 mb-4">
            {info.title}
          </h1>
          <p className="font-sans text-sm text-wood-700/80 leading-relaxed">
            {info.description}
          </p>
        </div>

        {/* Step List */}
        {activeSteps.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
            {activeSteps
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((step: any, idx: number) => {
                const Icon = iconMap[step.icon] || Hammer;
                return (
                  <div key={step.id} className="bg-white p-8 rounded-3xl border border-wood-200/40 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-wood-100 flex items-center justify-center text-wood-800 mb-6">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-xl font-bold text-wood-950 mb-3">
                        {idx + 1}. {step.title}
                      </h3>
                      <p className="text-xs text-wood-600/90 leading-relaxed font-sans">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Highlight Image Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-24">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-wood-900">
              {info.sec_title}
            </h2>
            <p className="text-sm text-wood-700 leading-relaxed">
              {info.sec_desc_1}
            </p>
            <p className="text-sm text-wood-700 leading-relaxed">
              {info.sec_desc_2}
            </p>
          </div>
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-sm border border-wood-200/40 aspect-[16/10]">
            <Image
              src={info.sec_image}
              alt="Timber workshop logs"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Timber Info block */}
        {info.wood_types && info.wood_types.length > 0 && (
          <div>
            <div className="max-w-3xl mb-12">
              <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Timber Selection</span>
              <h2 className="font-serif text-3xl font-bold text-wood-900 mt-2 mb-4">Our Premium Hardwood Library</h2>
              <p className="text-sm text-wood-700/80 leading-relaxed">
                We select and build exclusively with premium tropical hardwoods. Here is a guide to help you choose the right species.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {info.wood_types
                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((wood: any) => (
                  <div key={wood.id} className="bg-white p-8 rounded-3xl border border-wood-200/40 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-wood-950 mb-4 pb-2 border-b border-wood-100">{wood.name}</h3>
                      <div className="flex flex-col gap-3 text-xs text-wood-700 leading-relaxed font-sans">
                        <div>
                          <span className="font-bold text-wood-900">Characteristics:</span>
                          <p className="text-wood-600 mt-0.5">{wood.characteristics}</p>
                        </div>
                        <div>
                          <span className="font-bold text-wood-900">Durability Profile:</span>
                          <p className="text-wood-600 mt-0.5">{wood.benefits}</p>
                        </div>
                        <div>
                          <span className="font-bold text-wood-900">Recommended For:</span>
                          <p className="text-wood-600 mt-0.5">{wood.recommended}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default Manufacturing;
