import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { SEO } from '../../../components/SEO';
import { ChevronDown, ChevronUp, RotateCcw, Eye, Plus, Trash2, ArrowUp, ArrowDown, Loader2, AlertCircle } from 'lucide-react';
import { MediaLibraryPicker } from '../../../components/admin/MediaLibraryPicker';

const defaultAboutConfig = {
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

export const AboutPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [config, setConfig] = useState<any>(defaultAboutConfig);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    story: true,
    missionVision: false,
    founder: false,
    pillars: false,
    timeline: false
  });

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'about_page_draft')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.value) {
        setConfig({
          ...defaultAboutConfig,
          ...data.value
        });
      } else {
        await supabase
          .from('site_settings')
          .upsert([{ key: 'about_page_draft', value: defaultAboutConfig }]);
        setConfig(defaultAboutConfig);
      }
    } catch (err) {
      console.error('Error loading About page settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Media library picker states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'main_image' | 'secondary_image' | 'timeline' | ''>('');
  const [pickerTimelineIndex, setPickerTimelineIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const handleFieldChange = (_section: string, field: string, value: any) => {
    setIsDirty(true);
    setConfig((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  // Drag and Drop Timeline Reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('dragIndex', index.toString());
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('dragIndex'), 10);
    const newItems = [...config.timeline];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, removed);
    newItems.forEach((item, idx) => {
      item.sort_order = idx + 1;
    });
    setIsDirty(true);
    setConfig((prev: any) => ({ ...prev, timeline: newItems }));
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'about_page_draft', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Draft settings saved successfully! Use preview=true to inspect.');
    } catch (err: any) {
      alert(`Save draft failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!window.confirm('Are you sure you want to publish these changes? This will update the live About Page immediately.')) return;
    setSaving(true);
    try {
      await supabase
        .from('site_settings')
        .upsert([{ key: 'about_page_draft', value: config, updated_at: new Date() }]);

      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'about_page', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Congratulations! About Page published live successfully!');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Restore Defaults
  const handleRestoreDefaults = () => {
    if (window.confirm('Restore About page settings to defaults? You must save to apply.')) {
      setConfig(defaultAboutConfig);
      setIsDirty(true);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-wood-200/40 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none font-sans pb-16">
      <SEO title="About Page Editor | Nikhil Furniture" description="Manage stories and history timeline." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">About Page CMS</h2>
          <p className="text-xs text-wood-500 font-sans">Manage company history milestones, visions, mission statements, and pictures</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRestoreDefaults} className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Restore Defaults
          </button>
          <a href="/about?preview=true" target="_blank" rel="noopener noreferrer" className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer decoration-transparent">
            <Eye className="w-4 h-4" /> Preview
          </a>
          <button onClick={handleSaveDraft} disabled={saving} className="bg-white border border-wood-300 text-wood-850 hover:bg-wood-50 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handlePublish} disabled={saving} className="bg-wood-800 hover:bg-wood-950 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50">
            {saving ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {isDirty && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-xs font-bold">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>You have unsaved edits. Click "Save Draft" or "Publish Live" to commit your modifications.</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Accordion 1: Story */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('story')} className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-wood-950">Company Story & Banner</span>
            {expandedSections.story ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          {expandedSections.story && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Story Title Heading</label>
                <input type="text" value={config.story_heading} onChange={(e) => handleFieldChange('about', 'story_heading', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Story Narrative Paragraph</label>
                <textarea rows={4} value={config.story_description} onChange={(e) => handleFieldChange('about', 'story_description', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Call-To-Action Button text</label>
                  <input type="text" value={config.cta_btn_text} onChange={(e) => handleFieldChange('about', 'cta_btn_text', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Call-To-Action Button URL</label>
                  <input type="text" value={config.cta_btn_link} onChange={(e) => handleFieldChange('about', 'cta_btn_link', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-wood-150">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Main Story Image</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setPickerTarget('main_image'); setPickerTimelineIndex(null); setPickerOpen(true); }}
                      className="bg-wood-800 hover:bg-wood-950 text-white border-none py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Select Main
                    </button>
                    {config.main_image && (
                      <div className="w-12 h-10 rounded border overflow-hidden shrink-0 shadow-sm bg-wood-50">
                        <img src={config.main_image} alt="Main Story" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Secondary Side Image</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setPickerTarget('secondary_image'); setPickerTimelineIndex(null); setPickerOpen(true); }}
                      className="bg-wood-800 hover:bg-wood-950 text-white border-none py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                    >
                      Select Sec
                    </button>
                    {config.secondary_image && (
                      <div className="w-12 h-10 rounded border overflow-hidden shrink-0 shadow-sm bg-wood-50">
                        <img src={config.secondary_image} alt="Secondary Story" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: Mission & Vision */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('missionVision')} className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-wood-950">Mission & Vision Statement</span>
            {expandedSections.missionVision ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          {expandedSections.missionVision && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Mission Title</label>
                    <input type="text" value={config.mission_heading} onChange={(e) => handleFieldChange('about', 'mission_heading', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Mission Statement Body</label>
                    <textarea rows={3} value={config.mission_description} onChange={(e) => handleFieldChange('about', 'mission_description', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Vision Title</label>
                    <input type="text" value={config.vision_heading} onChange={(e) => handleFieldChange('about', 'vision_heading', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Vision Statement Body</label>
                    <textarea rows={3} value={config.vision_description} onChange={(e) => handleFieldChange('about', 'vision_description', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: Founder Message */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('founder')} className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-wood-950">Founder Quotes & Badges</span>
            {expandedSections.founder ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          {expandedSections.founder && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Established Badge Year</label>
                  <input type="text" value={config.experience_badge} onChange={(e) => handleFieldChange('about', 'experience_badge', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Founder Name Label</label>
                  <input type="text" value={config.founder_name} onChange={(e) => handleFieldChange('about', 'founder_name', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Founder Role title</label>
                  <input type="text" value={config.founder_role} onChange={(e) => handleFieldChange('about', 'founder_role', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Founder Message Quote</label>
                <textarea rows={3} value={config.founder_message} onChange={(e) => handleFieldChange('about', 'founder_message', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Accordion 4: Core Pillars */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('pillars')} className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-wood-950">Core Pillars & Values (3 Cards)</span>
            {expandedSections.pillars ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          {expandedSections.pillars && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-6 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {config.pillars.map((pillar: any, index: number) => (
                  <div key={pillar.id} className="p-4 rounded-xl border border-wood-200 bg-wood-50/10 flex flex-col gap-2.5">
                    <span className="text-[10px] font-bold uppercase text-wood-400">Pillar Card #{index + 1}</span>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-wider text-wood-500">Pillar Title</label>
                      <input type="text" value={pillar.title} onChange={(e) => {
                        const newPillars = [...config.pillars];
                        newPillars[index].title = e.target.value;
                        handleFieldChange('about', 'pillars', newPillars);
                      }} className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase tracking-wider text-wood-500">Pillar Description</label>
                      <textarea rows={3} value={pillar.desc} onChange={(e) => {
                        const newPillars = [...config.pillars];
                        newPillars[index].desc = e.target.value;
                        handleFieldChange('about', 'pillars', newPillars);
                      }} className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accordion 5: Timeline */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('timeline')} className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-wood-950">About Timeline Entries ({config.timeline.length} Milestones)</span>
            {expandedSections.timeline ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          {expandedSections.timeline && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="flex justify-between items-center pb-2 border-b border-wood-100">
                <span className="text-[10px] font-bold text-wood-500 uppercase tracking-widest">Drag-and-Drop cards or use arrows to reorder chronologically</span>
                <button onClick={() => {
                  const newTimeline = [...config.timeline];
                  newTimeline.push({
                    id: `new_${Date.now()}`,
                    year: '2026',
                    title: 'New Milestone',
                    desc: 'Milestone description goes here.',
                    image: '',
                    sort_order: newTimeline.length + 1,
                    enabled: true
                  });
                  handleFieldChange('about', 'timeline', newTimeline);
                }} className="bg-wood-850 hover:bg-wood-950 text-white py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Milestone
                </button>
              </div>

              {config.timeline.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-wood-200 rounded-2xl bg-wood-50/10 text-wood-600">
                  No timeline milestones found. Click "Add Milestone" to start tracking.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {config.timeline
                    .sort((a: any, b: any) => a.sort_order - b.sort_order)
                    .map((item: any, index: number) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="p-4 rounded-xl border border-wood-200 bg-white shadow-sm hover:shadow-md hover:border-wood-300 transition-all flex flex-col md:flex-row gap-4 items-center justify-between cursor-move"
                      >
                        <div className="flex items-center gap-4 flex-grow w-full">
                          <div className="flex flex-col gap-1 items-center justify-center border-r border-wood-100 pr-3 shrink-0">
                            <button disabled={index === 0} onClick={() => {
                              const newTimeline = [...config.timeline];
                              const temp = newTimeline[index];
                              newTimeline[index] = newTimeline[index - 1];
                              newTimeline[index - 1] = temp;
                              newTimeline.forEach((t, i) => t.sort_order = i + 1);
                              handleFieldChange('about', 'timeline', newTimeline);
                            }} className="text-wood-400 hover:text-wood-800 disabled:opacity-30 cursor-pointer">
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-bold text-wood-500">#{index + 1}</span>
                            <button disabled={index === config.timeline.length - 1} onClick={() => {
                              const newTimeline = [...config.timeline];
                              const temp = newTimeline[index];
                              newTimeline[index] = newTimeline[index + 1];
                              newTimeline[index + 1] = temp;
                              newTimeline.forEach((t, i) => t.sort_order = i + 1);
                              handleFieldChange('about', 'timeline', newTimeline);
                            }} className="text-wood-400 hover:text-wood-800 disabled:opacity-30 cursor-pointer">
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 flex-grow w-full">
                            <div className="sm:col-span-2 flex flex-col gap-1">
                              <label className="text-[9px] uppercase text-wood-500">Year</label>
                              <input type="text" value={item.year} onChange={(e) => {
                                const newTimeline = [...config.timeline];
                                newTimeline[index].year = e.target.value;
                                handleFieldChange('about', 'timeline', newTimeline);
                              }} className="w-full bg-wood-50/50 border border-wood-200 rounded-lg py-1 px-2 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-4 flex flex-col gap-1">
                              <label className="text-[9px] uppercase text-wood-500">Title</label>
                              <input type="text" value={item.title} onChange={(e) => {
                                const newTimeline = [...config.timeline];
                                newTimeline[index].title = e.target.value;
                                handleFieldChange('about', 'timeline', newTimeline);
                              }} className="w-full bg-wood-50/50 border border-wood-200 rounded-lg py-1 px-2 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-6 flex flex-col gap-1">
                              <label className="text-[9px] uppercase text-wood-500">Short Description</label>
                              <input type="text" value={item.desc} onChange={(e) => {
                                const newTimeline = [...config.timeline];
                                newTimeline[index].desc = e.target.value;
                                handleFieldChange('about', 'timeline', newTimeline);
                              }} className="w-full bg-wood-50/50 border border-wood-200 rounded-lg py-1 px-2 focus:outline-none" />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-wood-100/60 w-full md:w-auto justify-end">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={item.enabled} onChange={(e) => {
                              const newTimeline = [...config.timeline];
                              newTimeline[index].enabled = e.target.checked;
                              handleFieldChange('about', 'timeline', newTimeline);
                            }} className="rounded border-wood-300 text-wood-700 focus:ring-wood-500" />
                            <span className="text-[10px] text-wood-600 font-bold uppercase">Show</span>
                          </label>

                          <div className="flex items-center gap-2 border-l border-wood-200 pl-3">
                            <button
                              type="button"
                              onClick={() => { setPickerTarget('timeline'); setPickerTimelineIndex(index); setPickerOpen(true); }}
                              className="bg-wood-100 hover:bg-wood-200 text-wood-800 border-none py-1.5 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Select Image
                            </button>
                            {item.image && (
                              <div className="w-8 h-7 rounded overflow-hidden shadow-sm">
                                <img src={item.image} alt="Timeline Milestone" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          <button onClick={() => {
                            if (window.confirm('Delete this milestone entry?')) {
                              const newTimeline = config.timeline.filter((t: any) => t.id !== item.id);
                              newTimeline.forEach((t: any, idx: number) => t.sort_order = idx + 1);
                              handleFieldChange('about', 'timeline', newTimeline);
                            }
                          }} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <MediaLibraryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          if (pickerTarget === 'timeline' && pickerTimelineIndex !== null) {
            const newTimeline = [...config.timeline];
            newTimeline[pickerTimelineIndex].image = url;
            handleFieldChange('about', 'timeline', newTimeline);
          } else if (pickerTarget === 'main_image' || pickerTarget === 'secondary_image') {
            handleFieldChange('about', pickerTarget, url);
          }
        }}
        defaultFolder="About"
      />
    </div>
  );
};

export default AboutPage;
