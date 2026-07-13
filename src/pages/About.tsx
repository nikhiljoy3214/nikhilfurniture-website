import React, { useState, useEffect } from 'react';
import { Award, Shield, Hammer, Check, Loader2, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Image } from '../components/Image';
import { supabase } from '../lib/supabase';

const defaultAbout = {
  enabled: true,
  story_heading: 'Crafting Timeless Wooden Masterpieces Since 1995',
  story_description: 'Nikhil Furniture is a trusted manufacturer and showroom of premium wooden furniture in Thrissur, Kerala. What started as a small, passionate woodworking workshop in 1995 has grown into one of Thrissur\'s most respected names in premium home and commercial furniture.',
  mission_heading: 'Our Mission',
  mission_description: 'To preserve traditional solid wood joinery while bringing premium, sustainably sourced, climate-resilient wooden masterpieces into modern home living.',
  vision_heading: 'Our Vision',
  vision_description: 'To be the gold standard of wooden carpentry in Kerala, celebrated for transparency, generational durability, and artistic teak wood designs.',
  experience_badge: '1995',
  founder_message: 'We believe wood is a living medium that tells a story. We shape raw timber into seasoned assets that live for generations inside your home.',
  founder_name: 'Nikhil Pudukkad',
  founder_role: 'Founder & Master Artisan',
  main_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg',
  secondary_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
  cta_btn_text: 'EXPLORE COLLECTIONS',
  cta_btn_link: '/products',
  pillars: [
    { id: '1', title: 'Sustainably Sourced', desc: 'We source our timber legally and ethically from government timber depots, ensuring we support forest conservation practices in Kerala.', enabled: true },
    { id: '2', title: 'Seasoned for Durability', desc: 'All wood planks go through kiln-seasoning processes to minimize moisture content and prevent post-assembly shrinkage.', enabled: true },
    { id: '3', title: 'Artisan-Made', desc: 'Our carpenters have over 20+ years of individual expertise, bringing detail to carvings, smooth curves, and seamless alignments.', enabled: true }
  ],
  timeline: [
    { id: 't1', year: '1995', title: 'Workshop Inception', desc: 'Opened a small carpentry workshop with 2 generational woodcarvers in Pudukkad opposite Railway station road.', image: '', sort_order: 1, enabled: true },
    { id: 't2', year: '2005', title: 'First Showroom', desc: 'Expanded the workspace to a double-story solid wood display center showcasing custom dining sets and wardrobes.', image: '', sort_order: 2, enabled: true },
    { id: 't3', year: '2015', title: 'Kiln Seasoning Kilns', desc: 'Installed computerized kiln-seasoning chambers to treat rosewood, teak and mahogany planks under 8-12% moisture control.', image: '', sort_order: 3, enabled: true },
    { id: 't4', year: '2025', title: 'Generational Digital CMS', desc: 'Launched fully bespoke customized order management systems to allow custom length drawings and PU coatings.', image: '', sort_order: 4, enabled: true }
  ]
};

export const About: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
      const key = isPreview ? 'about_page_draft' : 'about_page';
      
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
        console.error('Failed to load about settings:', err);
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

  const info = data || defaultAbout;
  const activePillars = info.pillars ? info.pillars.filter((p: any) => p.enabled) : [];

  return (
    <div className="py-16 bg-wood-50">
      <SEO
        title="About Our 30-Year Woodworking Legacy | Nikhil Furniture"
        description="Learn about Nikhil Furniture's history since 1995 in Thrissur, Kerala. Discover our dedication to premium teak, rosewood, and generational craftsmanship."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'About', url: '/about' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Page Title & Intro */}
        <div className="max-w-3xl mb-16">
          <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Our Legacy</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2 mb-4">
            {info.story_heading}
          </h1>
          <p className="font-sans text-sm text-wood-700/80 leading-relaxed">
            {info.story_description}
          </p>
        </div>

        {/* Storytelling Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-24">
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-sm border border-wood-200/40 aspect-[4/3]">
            <Image
              src={info.main_image}
              alt="Artisan woodworking showroom"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 flex flex-col gap-6">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-wood-950">
              Traditional Joinery, Modern Elegance
            </h2>
            <p className="text-sm text-wood-700 leading-relaxed">
              We believe wood is a living medium that tells a story. That's why we never compromise on our raw timber or our joinery techniques. Instead of using cheap composite woods, particle boards, or rapid assembly fasteners, every piece at Nikhil Furniture is built from solid hardwoods (such as Nilambur Teak, Rosewood, and Mahogany) using traditional mortise-and-tenon joints.
            </p>
            <p className="text-sm text-wood-700 leading-relaxed">
              This dedication to traditional craftsmanship ensures that our sofa sets, dining suites, cots, and almirahs do not wobble, warp, or crack under Kerala's high-humidity weather. It is furniture made to be passed down through generations.
            </p>
          </div>
        </div>

        {/* Pillars Grid */}
        {activePillars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            {activePillars.map((pillar: any, index: number) => {
              const Icon = index === 0 ? Award : index === 1 ? Shield : Hammer;
              return (
                <div key={pillar.id} className="bg-white p-8 rounded-3xl border border-wood-200/40 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-wood-100 flex items-center justify-center text-wood-800 mb-6 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-wood-900 mb-3">{pillar.title}</h3>
                  <p className="text-xs text-wood-600/90 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-wood-200/40 shadow-sm">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-wood-900 mb-4">{info.mission_heading}</h3>
            <p className="text-sm text-wood-700 leading-relaxed">{info.mission_description}</p>
          </div>
          <div className="bg-white p-8 md:p-10 rounded-3xl border border-wood-200/40 shadow-sm">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-wood-900 mb-4">{info.vision_heading}</h3>
            <p className="text-sm text-wood-700 leading-relaxed">{info.vision_description}</p>
          </div>
        </div>

        {/* Founder Quote */}
        {info.founder_message && (
          <div className="bg-wood-100/20 border border-wood-200/30 rounded-3xl p-8 md:p-12 mb-24 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-grow">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-wood-500">A Word From Our Founder</span>
              <p className="font-serif text-lg md:text-xl font-medium italic text-wood-850 mt-3 mb-6 leading-relaxed">
                "{info.founder_message}"
              </p>
              <div>
                <h4 className="font-sans font-bold text-wood-950 text-sm">{info.founder_name}</h4>
                <p className="text-[10px] text-wood-500 font-bold uppercase tracking-wider mt-0.5">
                  {info.founder_role} — Est. {info.experience_badge}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Timeline Milestone Section */}
        {info.timeline && info.timeline.filter((x: any) => x.enabled).length > 0 && (
          <div className="mb-24">
            <div className="max-w-3xl mb-12">
              <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Our Journey</span>
              <h2 className="font-serif text-3xl font-bold text-wood-900 mt-2 mb-4">Milestones & History</h2>
            </div>
            <div className="relative border-l border-wood-200/80 ml-4 md:ml-6 pl-8 md:pl-10 flex flex-col gap-12">
              {info.timeline
                .filter((x: any) => x.enabled)
                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((item: any) => (
                  <div key={item.id} className="relative">
                    {/* Circle icon */}
                    <div className="absolute -left-[41px] md:-left-[49px] top-1.5 w-6 h-6 rounded-full bg-wood-800 border-4 border-white shadow-sm flex items-center justify-center" />
                    <div>
                      <span className="font-serif text-lg font-bold text-gold-600">{item.year}</span>
                      <h3 className="font-serif text-xl font-bold text-wood-950 mt-1 mb-2">{item.title}</h3>
                      <p className="text-sm text-wood-700 leading-relaxed max-w-2xl">{item.desc}</p>
                      {item.image && (
                        <div className="mt-4 rounded-2xl overflow-hidden max-w-sm aspect-[16/10] border border-wood-200/40 shadow-sm">
                          <Image src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Showroom Values */}
        <div className="bg-wood-900 text-white rounded-3xl p-8 md:p-16 border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <img
              src={info.secondary_image}
              alt="Timber grain background"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="text-gold-300 font-sans text-xs uppercase tracking-[0.2em] font-bold">Our Promise</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-wide mt-3 mb-6">
              Our Core Principles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-wood-200">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <span>100% Solid Hardwood. Zero veneer or particleboard fallbacks.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <span>Chemical treatments to ensure pest and borer resistance.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <span>Transparent timber certificates upon customer request.</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <span>Secure local deliveries across Kerala with on-site assembly.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        {info.cta_btn_text && (
          <div className="text-center pt-16">
            <a href={info.cta_btn_link} className="inline-flex items-center gap-2 bg-wood-800 hover:bg-wood-950 text-white py-4 px-8 rounded-full font-semibold uppercase tracking-wider text-xs transition-colors shadow-sm decoration-transparent">
              {info.cta_btn_text}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
export default About;
