import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SEO } from '../../components/SEO';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { MediaLibraryPicker } from '../../components/admin/MediaLibraryPicker';

// Default static JSON structure to fallback / restore
const defaultHomepageConfig = {
  hero: {
    enabled: true,
    heading: 'Artisan Wooden Furniture Crafted For Generations',
    subheading: 'Handcrafted in Kerala using premium Nilambur teak and mahogany. Seasoned to withstand humidity.',
    featured_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
    primary_btn_text: 'EXPLORE COLLECTIONS',
    primary_btn_link: '/products',
    secondary_btn_text: 'WHATSAPP CONSULTATION',
    secondary_btn_link: 'https://wa.me/919746321808',
    overlay_opacity: 40,
    badge: 'EST. 1995 • KERALA'
  },
  about: {
    enabled: true,
    heading: 'A Legacy of Carpentry',
    description: 'Nikhil Furniture has been the hallmark of premium woodworking in Thrissur for over three decades. Our master craftsmen combine traditional joinery methods with solar-kiln wood seasoning to build cots, dining tables, and sofa sets that survive the test of time.',
    experience_badge: '30+ Years',
    image1: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg',
    image2: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
    btn_text: 'OUR STORY',
    btn_link: '/about'
  },
  whyChooseUs: {
    enabled: true,
    heading: 'Why Nikhil Furniture?',
    cards: [
      { id: '1', title: '100% Solid Wood', desc: 'No particle board, MDF, or cheap veneers. Built using top-grade Teak, Rosewood, and Mahogany.', sort_order: 1, enabled: true },
      { id: '2', title: 'Seasoned Timber', desc: 'Every timber plank undergoes solar seasoning to extract moisture, preventing wood warping or splitting.', sort_order: 2, enabled: true },
      { id: '3', title: 'Bespoke Carpentry', desc: 'Custom size, custom carvings, custom polish finishes. Tailored directly to your home layout.', sort_order: 3, enabled: true }
    ]
  },
  featuredCategories: {
    enabled: true,
    max_count: 6,
    selected_slugs: ['wooden-sofa-sets', 'corner-sofa-sets', 'wooden-dining-tables', 'wooden-cots', 'wardrobes-almirahs', 'customized-furniture']
  },
  featuredProducts: {
    enabled: true,
    mode: 'featured', // featured | latest | popular | manual
    max_count: 8,
    heading: 'Signature Spotlights',
    description: 'Our most sought-after handcrafted masterworks'
  },
  mfgProcess: {
    enabled: true,
    heading: 'The Art of Creation',
    description: 'From forest depots to finished showroom masterpieces, learn how we engineer high-durability furniture.',
    steps: [
      { title: 'Timber Selection', desc: 'Aged logs handpicked from government timber depots for tight wood grain density.', sort_order: 1 },
      { title: 'Solar Seasoning', desc: 'Wood kiln-dried for 2-3 weeks to regulate moisture content below 12% to prevent wraps.', sort_order: 2 },
      { title: 'Hand-Carving', desc: 'Master artisans chisel traditional accents, framing durable mortise and tenon joinery.', sort_order: 3 },
      { title: 'Season Finish', desc: 'Polished in 3 layers of dust-resistant PU coat for long-term grain highlights.', sort_order: 4 }
    ]
  },
  woodTypes: {
    enabled: true,
    heading: 'Timber Species Library',
    cards: [
      { name: 'Premium Teak Wood', desc: 'Gold standard wood. High natural oil content prevents termite rot and withstands humidity.', benefits: 'Durable, weather resistant, termite proof', sort_order: 1, image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg' },
      { name: 'Rosewood (Eeti)', desc: 'High-end dense wood with rich black-purple streaks. Extremely heavy and highly premium.', benefits: 'Elegant grain, lifetime durability', sort_order: 2, image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg' },
      { name: 'Mahogany', desc: 'Red-brown fine wood. Seasoned meticulously to construct wardrobes and dining chairs.', benefits: 'Stately aesthetics, cost-effective solid wood', sort_order: 3, image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' }
    ]
  },
  stats: {
    enabled: true,
    years: { number: 30, label: 'Years Experience' },
    delivered: { number: 15000, label: 'Furniture Pieces Delivered' },
    families: { number: 8000, label: 'Happy Families' },
    craftsmanship: { number: 45, label: 'Artisans & Craftsmen' }
  },
  gallery: {
    enabled: true,
    heading: 'Recent Showcases',
    description: 'Actual furniture setups inside our clients\' beautiful homes across Kerala',
    images_count: 8
  },
  testimonials: {
    enabled: true,
    heading: 'What Our Clients Say',
    max_count: 6,
    featured_only: true
  },
  instagram: {
    enabled: true,
    heading: 'Follow Our Journey',
    description: 'Sneak peeks of daily workshop woodcarving over on Instagram',
    instagram_url: 'https://www.instagram.com/nikhil__furniture',
    btn_text: 'FOLLOW ON INSTAGRAM',
    feed_items: [
      { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', postUrl: 'https://www.instagram.com/nikhil__furniture' },
      { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', postUrl: 'https://www.instagram.com/nikhil__furniture' },
      { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg', postUrl: 'https://www.instagram.com/nikhil__furniture' },
      { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg', postUrl: 'https://www.instagram.com/nikhil__furniture' }
    ]
  },
  contactCta: {
    enabled: true,
    heading: 'Dreaming of Custom Furniture?',
    description: 'Share design dimensions on WhatsApp. Get instant starting estimations and wood carpentry advices.',
    btn_text: 'START WHATSAPP CHAT',
    whatsapp_number: '9746321808',
    background_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg'
  },
  footer: {
    description: 'Nikhil Furniture stands for authentic craftsmanship, seasoned solid woods, and heirloom-quality carvings since 1995 in Thrissur, Kerala.',
    copyright: '© 2026 Nikhil Furniture. Crafted by Antigravity CMS. All Rights Reserved.',
    google_maps_url: 'https://maps.google.com/?q=Nikhil+Furniture+Pudukkad',
    working_hours: '9:00 AM - 7:00 PM (Monday - Saturday)'
  }
};

export const HomepageBuilder: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPreview, setSavingPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Big State matching config
  const [config, setConfig] = useState<any>(defaultHomepageConfig);

  // Accordion toggle states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hero: true,
    about: false,
    whyChooseUs: false,
    featuredCategories: false,
    featuredProducts: false,
    mfgProcess: false,
    woodTypes: false,
    stats: false,
    gallery: false,
    testimonials: false,
    instagram: false,
    contactCta: false,
    footer: false,
  });

  // DB Categories list for selector
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  // Media library picker states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSection, setPickerSection] = useState('');
  const [pickerField, setPickerField] = useState('');
  const [pickerWoodIndex, setPickerWoodIndex] = useState<number | null>(null);
  const [pickerInstaIndex, setPickerInstaIndex] = useState<number | null>(null);

  // Fetch Homepage Configurations
  const fetchHomepageData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const { data: catData } = await supabase.from('categories').select('name, slug');
      if (catData) setDbCategories(catData);

      // 2. Fetch draft/live site settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'homepage_draft')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.value) {
        // Merge with defaults to prevent missing-key crashes on layout upgrades
        setConfig({
          ...defaultHomepageConfig,
          ...data.value,
        });
      } else {
        // Seed default draft config in database if empty
        await supabase
          .from('site_settings')
          .upsert([{ key: 'homepage_draft', value: defaultHomepageConfig }]);
        setConfig(defaultHomepageConfig);
      }
    } catch (err) {
      console.error('Error fetching homepage configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFieldChange = (section: string, field: string, value: any) => {
    setIsDirty(true);
    setConfig((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };



  // Restore defaults
  const handleRestoreDefaults = () => {
    if (window.confirm('Are you sure you want to restore all sections to their default factory values? You must click Save or Publish to apply.')) {
      setConfig(defaultHomepageConfig);
      setIsDirty(true);
    }
  };

  const handlePreview = async () => {
    setSavingPreview(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'homepage_draft', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      window.open('/?preview=true', '_blank');
    } catch (err: any) {
      alert(`Preview failed to generate: ${err.message}`);
    } finally {
      setSavingPreview(false);
    }
  };

  // Save Draft behavior
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'homepage_draft', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Draft settings saved successfully! Use Preview to test before publishing.');
    } catch (err: any) {
      alert(`Save draft failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Publish changes behavior
  const handlePublish = async () => {
    if (!window.confirm('Are you sure you want to publish these changes? This will update the live public homepage immediately.')) {
      return;
    }
    setSaving(true);
    try {
      // 1. Save to draft key
      await supabase
        .from('site_settings')
        .upsert([{ key: 'homepage_draft', value: config, updated_at: new Date() }]);

      // 2. Publish to live key
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'homepage', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Congratulations! Homepage changes have been successfully published live!');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Leave page checks
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes inside the Homepage Builder. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-wood-200/40 flex items-center justify-center min-h-[400px] shadow-sm">
        <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none font-sans pb-16">
      <SEO
        title="Homepage Content Builder | Nikhil Furniture"
        description="Bespoke section content manager."
      />

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Homepage Content Builder</h2>
          <p className="text-xs text-wood-500 font-sans">Toggle homepage sections and update headlines, photos, statistics or social links</p>
        </div>
        <div className="flex items-center gap-3">
          
          {/* Restore Defaults */}
          <button
            onClick={handleRestoreDefaults}
            className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset form configs"
          >
            <RotateCcw className="w-4 h-4" /> Restore Defaults
          </button>

          {/* Live Preview Button */}
          <button
            onClick={handlePreview}
            disabled={savingPreview || saving}
            className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Saves draft and opens preview tab"
          >
            {savingPreview ? (
              <Loader2 className="w-4 h-4 animate-spin text-wood-700" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            Preview Changes
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="bg-white border border-wood-300 text-wood-850 hover:bg-wood-50 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>

          {/* Publish changes */}
          <button
            onClick={handlePublish}
            disabled={saving}
            className="bg-wood-800 hover:bg-wood-950 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-xs font-bold font-sans">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>You have unsaved edits in the sections builder. Click "Save Draft" or "Publish Live" to commit your modifications.</span>
        </div>
      )}

      {/* SECTION ACCORDIONS CONTROLLER */}
      <div className="flex flex-col gap-4">
        
        {/* SECTION 1: HERO */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('hero')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.hero.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('hero', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Hero Showcase Section</span>
            </div>
            {expandedSections.hero ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.hero && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Overlay Badge Tag</label>
                  <input
                    type="text"
                    value={config.hero.badge || ''}
                    onChange={(e) => handleFieldChange('hero', 'badge', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Overlay Opacity (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={config.hero.overlay_opacity || 40}
                    onChange={(e) => handleFieldChange('hero', 'overlay_opacity', Number(e.target.value))}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Main Heading Title</label>
                <input
                  type="text"
                  value={config.hero.heading}
                  onChange={(e) => handleFieldChange('hero', 'heading', e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Sub-heading Description</label>
                <input
                  type="text"
                  value={config.hero.subheading}
                  onChange={(e) => handleFieldChange('hero', 'subheading', e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Primary Button Copy</label>
                  <input
                    type="text"
                    value={config.hero.primary_btn_text}
                    onChange={(e) => handleFieldChange('hero', 'primary_btn_text', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Primary Button URL</label>
                  <input
                    type="text"
                    value={config.hero.primary_btn_link}
                    onChange={(e) => handleFieldChange('hero', 'primary_btn_link', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Secondary Button Copy</label>
                  <input
                    type="text"
                    value={config.hero.secondary_btn_text}
                    onChange={(e) => handleFieldChange('hero', 'secondary_btn_text', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Secondary Button URL</label>
                  <input
                    type="text"
                    value={config.hero.secondary_btn_link}
                    onChange={(e) => handleFieldChange('hero', 'secondary_btn_link', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* Background Image Upload */}
              <div className="flex flex-col gap-2 pt-2 border-t border-wood-150">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Showcase Hero Background Image</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setPickerSection('hero'); setPickerField('featured_image'); setPickerWoodIndex(null); setPickerOpen(true); }}
                    className="bg-wood-800 hover:bg-wood-950 text-white border-none py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    Select from Media
                  </button>
                  {config.hero.featured_image && (
                    <div className="w-16 h-12 rounded border overflow-hidden shrink-0 shadow-sm bg-wood-50">
                      <img src={config.hero.featured_image} alt="Hero Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Hero statistics numbers inside Hero Section */}
              <div className="flex flex-col gap-3 pt-4 border-t border-wood-150 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Hero Section statistics counters</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Stat 1: Years */}
                  <div className="p-3 rounded-lg border border-wood-200 bg-wood-50/10 flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase text-wood-400">Years Experience</span>
                    <input
                      type="number"
                      value={config.stats.years.number}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            years: { ...prev.stats.years, number: Number(e.target.value) }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={config.stats.years.label}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            years: { ...prev.stats.years, label: e.target.value }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none text-[9px]"
                    />
                  </div>

                  {/* Stat 2: Delivered */}
                  <div className="p-3 rounded-lg border border-wood-200 bg-wood-50/10 flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase text-wood-400">Pieces Delivered</span>
                    <input
                      type="number"
                      value={config.stats.delivered.number}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            delivered: { ...prev.stats.delivered, number: Number(e.target.value) }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={config.stats.delivered.label}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            delivered: { ...prev.stats.delivered, label: e.target.value }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none text-[9px]"
                    />
                  </div>

                  {/* Stat 3: Families */}
                  <div className="p-3 rounded-lg border border-wood-200 bg-wood-50/10 flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase text-wood-400">Happy Families</span>
                    <input
                      type="number"
                      value={config.stats.families.number}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            families: { ...prev.stats.families, number: Number(e.target.value) }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={config.stats.families.label}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            families: { ...prev.stats.families, label: e.target.value }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none text-[9px]"
                    />
                  </div>

                  {/* Stat 4: Craftsmanship */}
                  <div className="p-3 rounded-lg border border-wood-200 bg-wood-50/10 flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold uppercase text-wood-400">Artisans & Guarantee</span>
                    <input
                      type="number"
                      value={config.stats.craftsmanship.number}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            craftsmanship: { ...prev.stats.craftsmanship, number: Number(e.target.value) }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={config.stats.craftsmanship.label}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            craftsmanship: { ...prev.stats.craftsmanship, label: e.target.value }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none text-[9px]"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 2: ABOUT US */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('about')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.about.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('about', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">About Story Section</span>
            </div>
            {expandedSections.about ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.about && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section Title</label>
                  <input
                    type="text"
                    value={config.about.heading}
                    onChange={(e) => handleFieldChange('about', 'heading', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Experience Badge</label>
                  <input
                    type="text"
                    value={config.about.experience_badge}
                    onChange={(e) => handleFieldChange('about', 'experience_badge', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Detailed Story Paragraph</label>
                <textarea
                  rows={4}
                  value={config.about.description}
                  onChange={(e) => handleFieldChange('about', 'description', e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Button Copy</label>
                  <input
                    type="text"
                    value={config.about.btn_text}
                    onChange={(e) => handleFieldChange('about', 'btn_text', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Button URL</label>
                  <input
                    type="text"
                    value={config.about.btn_link}
                    onChange={(e) => handleFieldChange('about', 'btn_link', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dual image uploader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-wood-150">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-wood-500">About Story Photo 1</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setPickerSection('about'); setPickerField('image1'); setPickerWoodIndex(null); setPickerOpen(true); }}
                      className="bg-wood-800 hover:bg-wood-950 text-white border-none py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Select Image
                    </button>
                    {config.about.image1 && (
                      <div className="w-12 h-10 rounded border overflow-hidden shrink-0 shadow-sm bg-wood-50">
                        <img src={config.about.image1} alt="About 1 Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-wood-500">About Story Photo 2</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setPickerSection('about'); setPickerField('image2'); setPickerWoodIndex(null); setPickerOpen(true); }}
                      className="bg-wood-800 hover:bg-wood-950 text-white border-none py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Select Image
                    </button>
                    {config.about.image2 && (
                      <div className="w-12 h-10 rounded border overflow-hidden shrink-0 shadow-sm bg-wood-50">
                        <img src={config.about.image2} alt="About 2 Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 3: WHY CHOOSE US */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('whyChooseUs')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.whyChooseUs.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('whyChooseUs', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Why Choose Us Section</span>
            </div>
            {expandedSections.whyChooseUs ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.whyChooseUs && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section Title</label>
                <input
                  type="text"
                  value={config.whyChooseUs.heading}
                  onChange={(e) => handleFieldChange('whyChooseUs', 'heading', e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              {/* Cards list */}
              <div className="flex flex-col gap-4 border-t border-wood-150 pt-4 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Feature Value Cards</span>
                
                {config.whyChooseUs.cards.map((card: any, index: number) => (
                  <div key={card.id} className="p-4 rounded-xl border border-wood-200/50 bg-wood-50/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between select-none">
                      <span className="text-[9px] font-bold uppercase text-wood-400">Card #{index + 1}</span>
                      <label className="flex items-center gap-1 text-[9px] font-bold uppercase text-wood-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={card.enabled}
                          onChange={(e) => {
                            const newCards = [...config.whyChooseUs.cards];
                            newCards[index].enabled = e.target.checked;
                            handleFieldChange('whyChooseUs', 'cards', newCards);
                          }}
                          className="rounded border-wood-300 text-wood-700"
                        />
                        Active
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase text-wood-500">Card Title</span>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => {
                            const newCards = [...config.whyChooseUs.cards];
                            newCards[index].title = e.target.value;
                            handleFieldChange('whyChooseUs', 'cards', newCards);
                          }}
                          className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase text-wood-500">Sorting weight</span>
                        <input
                          type="number"
                          value={card.sort_order}
                          onChange={(e) => {
                            const newCards = [...config.whyChooseUs.cards];
                            newCards[index].sort_order = Number(e.target.value);
                            handleFieldChange('whyChooseUs', 'cards', newCards);
                          }}
                          className="w-24 bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase text-wood-500">Card Description</span>
                      <input
                        type="text"
                        value={card.desc}
                        onChange={(e) => {
                          const newCards = [...config.whyChooseUs.cards];
                          newCards[index].desc = e.target.value;
                          handleFieldChange('whyChooseUs', 'cards', newCards);
                        }}
                        className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: FEATURED CATEGORIES */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('featuredCategories')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.featuredCategories.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('featuredCategories', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Featured Categories Section</span>
            </div>
            {expandedSections.featuredCategories ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.featuredCategories && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Max Categories display limit</label>
                  <input
                    type="number"
                    value={config.featuredCategories.max_count || 6}
                    onChange={(e) => handleFieldChange('featuredCategories', 'max_count', Number(e.target.value))}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* Selector checkboxes of dbCategories */}
              <div className="flex flex-col gap-2 pt-2 border-t border-wood-150 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Select categories to feature on Homepage</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {dbCategories.map((c) => {
                    const isChecked = config.featuredCategories.selected_slugs.includes(c.slug);
                    return (
                      <label 
                        key={c.slug} 
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isChecked 
                            ? 'border-gold-400 bg-gold-50/5 text-wood-950 font-bold' 
                            : 'border-wood-200 hover:border-wood-300 text-wood-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let list = [...config.featuredCategories.selected_slugs];
                            if (e.target.checked) {
                              list.push(c.slug);
                            } else {
                              list = list.filter((s: string) => s !== c.slug);
                            }
                            handleFieldChange('featuredCategories', 'selected_slugs', list);
                          }}
                          className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
                        />
                        {c.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 5: FEATURED PRODUCTS */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('featuredProducts')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.featuredProducts.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('featuredProducts', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Spotlight Products Grid Section</span>
            </div>
            {expandedSections.featuredProducts ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.featuredProducts && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section Headline</label>
                  <input
                    type="text"
                    value={config.featuredProducts.heading}
                    onChange={(e) => handleFieldChange('featuredProducts', 'heading', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section Subtitle</label>
                  <input
                    type="text"
                    value={config.featuredProducts.description}
                    onChange={(e) => handleFieldChange('featuredProducts', 'description', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Products Selection Mode</label>
                  <select
                    value={config.featuredProducts.mode}
                    onChange={(e) => handleFieldChange('featuredProducts', 'mode', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  >
                    <option value="featured">Home Featured flag only</option>
                    <option value="latest">Latest added products</option>
                    <option value="popular">Popular flag collection</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Maximum Products limit</label>
                  <input
                    type="number"
                    value={config.featuredProducts.max_count}
                    onChange={(e) => handleFieldChange('featuredProducts', 'max_count', Number(e.target.value))}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 6: MANUFACTURING TIMELINE */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('mfgProcess')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.mfgProcess.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('mfgProcess', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Manufacturing Process Timeline Section</span>
            </div>
            {expandedSections.mfgProcess ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.mfgProcess && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section Title</label>
                  <input
                    type="text"
                    value={config.mfgProcess.heading}
                    onChange={(e) => handleFieldChange('mfgProcess', 'heading', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section description</label>
                  <input
                    type="text"
                    value={config.mfgProcess.description}
                    onChange={(e) => handleFieldChange('mfgProcess', 'description', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* Steps reordering */}
              <div className="flex flex-col gap-4 border-t border-wood-150 pt-4 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Timeline steps list</span>
                {config.mfgProcess.steps.map((step: any, index: number) => (
                  <div key={index} className="p-4 rounded-xl border border-wood-200/50 bg-wood-50/10 flex flex-col gap-3">
                    <span className="text-[9px] font-bold uppercase text-wood-400">Step #{index + 1}</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase text-wood-500">Step Title</span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const newSteps = [...config.mfgProcess.steps];
                            newSteps[index].title = e.target.value;
                            handleFieldChange('mfgProcess', 'steps', newSteps);
                          }}
                          className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase text-wood-500">Step Description</span>
                        <input
                          type="text"
                          value={step.desc}
                          onChange={(e) => {
                            const newSteps = [...config.mfgProcess.steps];
                            newSteps[index].desc = e.target.value;
                            handleFieldChange('mfgProcess', 'steps', newSteps);
                          }}
                          className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 7: WOOD TYPES */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('woodTypes')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.woodTypes.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('woodTypes', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Timber Species cards section</span>
            </div>
            {expandedSections.woodTypes ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.woodTypes && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section title</label>
                <input
                  type="text"
                  value={config.woodTypes.heading}
                  onChange={(e) => handleFieldChange('woodTypes', 'heading', e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              {/* Cards CRUD list */}
              <div className="flex flex-col gap-4 border-t border-wood-150 pt-4 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Wood cards library</span>
                {config.woodTypes.cards.map((card: any, index: number) => (
                  <div key={index} className="p-4 rounded-xl border border-wood-200/50 bg-wood-50/10 flex flex-col gap-3">
                    <span className="text-[9px] font-bold uppercase text-wood-400">Card #{index + 1} ({card.name})</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase text-wood-500">Species Name</span>
                        <input
                          type="text"
                          value={card.name}
                          onChange={(e) => {
                            const newCards = [...config.woodTypes.cards];
                            newCards[index].name = e.target.value;
                            handleFieldChange('woodTypes', 'cards', newCards);
                          }}
                          className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase text-wood-500">Key Benefits summary</span>
                        <input
                          type="text"
                          value={card.benefits}
                          onChange={(e) => {
                            const newCards = [...config.woodTypes.cards];
                            newCards[index].benefits = e.target.value;
                            handleFieldChange('woodTypes', 'cards', newCards);
                          }}
                          className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none"
                        />
                      </div>
                      
                      {/* Image upload */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold uppercase text-wood-500">Card Photo</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => { setPickerSection('woodTypes'); setPickerField('cards'); setPickerWoodIndex(index); setPickerOpen(true); }}
                            className="bg-wood-800 hover:bg-wood-950 text-white border-none py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                          >
                            Select Image
                          </button>
                          {card.image && (
                            <div className="w-10 h-8 rounded border overflow-hidden shrink-0 shadow-sm">
                              <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase text-wood-500">Short description</span>
                      <textarea
                        rows={2}
                        value={card.desc}
                        onChange={(e) => {
                          const newCards = [...config.woodTypes.cards];
                          newCards[index].desc = e.target.value;
                          handleFieldChange('woodTypes', 'cards', newCards);
                        }}
                        className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none resize-none font-sans"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 8: STATISTICS COUNTERS */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('stats')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.stats.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('stats', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Metrics & Statistics counters section</span>
            </div>
            {expandedSections.stats ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.stats && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-5 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                
                {/* Stat 1: Years */}
                <div className="p-4 rounded-xl border border-wood-200 bg-wood-50/10 flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-wood-400">Years Experience</span>
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="number"
                      value={config.stats.years.number}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            years: { ...prev.stats.years, number: Number(e.target.value) }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={config.stats.years.label}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            years: { ...prev.stats.years, label: e.target.value }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none text-[10px]"
                    />
                  </div>
                </div>

                {/* Stat 2: Delivered */}
                <div className="p-4 rounded-xl border border-wood-200 bg-wood-50/10 flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-wood-400">Furniture Pieces Delivered</span>
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="number"
                      value={config.stats.delivered.number}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            delivered: { ...prev.stats.delivered, number: Number(e.target.value) }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={config.stats.delivered.label}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            delivered: { ...prev.stats.delivered, label: e.target.value }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none text-[10px]"
                    />
                  </div>
                </div>

                {/* Stat 3: Families */}
                <div className="p-4 rounded-xl border border-wood-200 bg-wood-50/10 flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-wood-400">Happy Families</span>
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="number"
                      value={config.stats.families.number}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            families: { ...prev.stats.families, number: Number(e.target.value) }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={config.stats.families.label}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            families: { ...prev.stats.families, label: e.target.value }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none text-[10px]"
                    />
                  </div>
                </div>

                {/* Stat 4: Craftsmanship */}
                <div className="p-4 rounded-xl border border-wood-200 bg-wood-50/10 flex flex-col gap-2">
                  <span className="text-[9px] font-bold uppercase text-wood-400">Artisans & Craftsmen</span>
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="number"
                      value={config.stats.craftsmanship.number}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            craftsmanship: { ...prev.stats.craftsmanship, number: Number(e.target.value) }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={config.stats.craftsmanship.label}
                      onChange={(e) => {
                        setIsDirty(true);
                        setConfig((prev: any) => ({
                          ...prev,
                          stats: {
                            ...prev.stats,
                            craftsmanship: { ...prev.stats.craftsmanship, label: e.target.value }
                          }
                        }));
                      }}
                      className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2 focus:outline-none text-[10px]"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* SECTION 9: GALLERY PREVIEW */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('gallery')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.gallery.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('gallery', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Showcase Installations Gallery preview section</span>
            </div>
            {expandedSections.gallery ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.gallery && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section Title</label>
                  <input
                    type="text"
                    value={config.gallery.heading}
                    onChange={(e) => handleFieldChange('gallery', 'heading', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section subtitle</label>
                  <input
                    type="text"
                    value={config.gallery.description}
                    onChange={(e) => handleFieldChange('gallery', 'description', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Number of Images to show</label>
                  <input
                    type="number"
                    value={config.gallery.images_count || 8}
                    onChange={(e) => handleFieldChange('gallery', 'images_count', Number(e.target.value))}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 10: TESTIMONIAL PREVIEW */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('testimonials')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.testimonials.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('testimonials', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Testimonials slider preview section</span>
            </div>
            {expandedSections.testimonials ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.testimonials && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section Title</label>
                  <input
                    type="text"
                    value={config.testimonials.heading}
                    onChange={(e) => handleFieldChange('testimonials', 'heading', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Max testimonials count limit</label>
                  <input
                    type="number"
                    value={config.testimonials.max_count || 6}
                    onChange={(e) => handleFieldChange('testimonials', 'max_count', Number(e.target.value))}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-wood-750 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={config.testimonials.featured_only}
                      onChange={(e) => handleFieldChange('testimonials', 'featured_only', e.target.checked)}
                      className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
                    />
                    Featured customer reviews only
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 11: INSTAGRAM SECTION */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('instagram')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.instagram.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('instagram', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Instagram Feed CTA Section</span>
            </div>
            {expandedSections.instagram ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.instagram && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Instagram Handle Header</label>
                  <input
                    type="text"
                    value={config.instagram.heading}
                    onChange={(e) => handleFieldChange('instagram', 'heading', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Section Subtitle</label>
                  <input
                    type="text"
                    value={config.instagram.description}
                    onChange={(e) => handleFieldChange('instagram', 'description', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Instagram Page Link URL</label>
                  <input
                    type="text"
                    value={config.instagram.instagram_url}
                    onChange={(e) => handleFieldChange('instagram', 'instagram_url', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Instagram Button Copy</label>
                  <input
                    type="text"
                    value={config.instagram.btn_text}
                    onChange={(e) => handleFieldChange('instagram', 'btn_text', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* Instagram Feed Showcase Posts Editor */}
              <div className="border-t border-wood-100/60 pt-6 mt-4 flex flex-col gap-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Instagram Showcase Posts (4 items)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {(config.instagram.feed_items || [
                    { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', postUrl: config.instagram.instagram_url },
                    { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', postUrl: config.instagram.instagram_url },
                    { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg', postUrl: config.instagram.instagram_url },
                    { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg', postUrl: config.instagram.instagram_url }
                  ]).map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 p-4 rounded-xl border border-wood-200/50 bg-wood-50/10">
                      {/* Image Thumbnail Preview */}
                      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-wood-200 bg-white relative group">
                        <img src={item.imageUrl} alt={`Post ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setPickerSection('instagram');
                            setPickerField('feed_items');
                            setPickerInstaIndex(index);
                            setPickerWoodIndex(null);
                            setPickerOpen(true);
                          }}
                          className="absolute inset-0 bg-black/45 text-white text-[9px] font-bold uppercase flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      {/* Info Inputs */}
                      <div className="flex-grow flex flex-col gap-2 justify-center">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] uppercase tracking-wider text-wood-400 font-bold font-sans">Post Link URL</label>
                          <input
                            type="text"
                            value={item.postUrl}
                            onChange={(e) => {
                              const defaultItems = [
                                { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', postUrl: config.instagram.instagram_url },
                                { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', postUrl: config.instagram.instagram_url },
                                { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg', postUrl: config.instagram.instagram_url },
                                { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg', postUrl: config.instagram.instagram_url }
                              ];
                              const newFeed = [...(config.instagram.feed_items || defaultItems)];
                              newFeed[index] = { ...newFeed[index], postUrl: e.target.value };
                              handleFieldChange('instagram', 'feed_items', newFeed);
                            }}
                            placeholder="https://www.instagram.com/p/..."
                            className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 text-[11px] font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 12: CONTACT CTA */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('contactCta')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={config.contactCta.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleFieldChange('contactCta', 'enabled', e.target.checked)}
                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
              />
              <span className="font-serif text-sm font-bold text-wood-950">Contact WhatsApp CTA Banner Section</span>
            </div>
            {expandedSections.contactCta ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.contactCta && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Banner Heading Title</label>
                  <input
                    type="text"
                    value={config.contactCta.heading}
                    onChange={(e) => handleFieldChange('contactCta', 'heading', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Banner Description</label>
                  <input
                    type="text"
                    value={config.contactCta.description}
                    onChange={(e) => handleFieldChange('contactCta', 'description', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">WhatsApp Chat Button copy</label>
                  <input
                    type="text"
                    value={config.contactCta.btn_text}
                    onChange={(e) => handleFieldChange('contactCta', 'btn_text', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Consultation WhatsApp Mobile Number</label>
                  <input
                    type="text"
                    value={config.contactCta.whatsapp_number}
                    onChange={(e) => handleFieldChange('contactCta', 'whatsapp_number', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* BG Photo */}
              <div className="flex flex-col gap-2 pt-2 border-t border-wood-150">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Banner Background Photo</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setPickerSection('contactCta'); setPickerField('background_image'); setPickerWoodIndex(null); setPickerOpen(true); }}
                    className="bg-wood-800 hover:bg-wood-950 text-white border-none py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    Select from Media
                  </button>
                  {config.contactCta.background_image && (
                    <div className="w-16 h-12 rounded border overflow-hidden shrink-0 shadow-sm bg-wood-50">
                      <img src={config.contactCta.background_image} alt="CTA Bg Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 13: FOOTER DETAILS */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div 
            onClick={() => toggleSection('footer')}
            className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between transition-colors"
          >
            <span className="font-serif text-sm font-bold text-wood-950 ml-8">Footer & Site Metadata Settings</span>
            {expandedSections.footer ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          
          {expandedSections.footer && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Footer description</label>
                <textarea
                  rows={2}
                  value={config.footer.description}
                  onChange={(e) => handleFieldChange('footer', 'description', e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Copyright label</label>
                  <input
                    type="text"
                    value={config.footer.copyright}
                    onChange={(e) => handleFieldChange('footer', 'copyright', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Google Maps Location URL</label>
                  <input
                    type="text"
                    value={config.footer.google_maps_url}
                    onChange={(e) => handleFieldChange('footer', 'google_maps_url', e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <MediaLibraryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          if (pickerWoodIndex !== null) {
            const newCards = [...config.woodTypes.cards];
            newCards[pickerWoodIndex].image = url;
            handleFieldChange('woodTypes', 'cards', newCards);
          } else if (pickerInstaIndex !== null) {
            const defaultItems = [
              { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', postUrl: config.instagram.instagram_url },
              { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', postUrl: config.instagram.instagram_url },
              { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg', postUrl: config.instagram.instagram_url },
              { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg', postUrl: config.instagram.instagram_url }
            ];
            const newFeed = [...(config.instagram.feed_items || defaultItems)];
            newFeed[pickerInstaIndex] = {
              ...newFeed[pickerInstaIndex],
              imageUrl: url
            };
            handleFieldChange('instagram', 'feed_items', newFeed);
            setPickerInstaIndex(null);
          } else {
            handleFieldChange(pickerSection, pickerField, url);
          }
        }}
        defaultFolder="Homepage"
      />
    </div>
  );
};

export default HomepageBuilder;
