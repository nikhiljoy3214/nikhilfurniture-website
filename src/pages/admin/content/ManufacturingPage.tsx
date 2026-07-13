import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { SEO } from '../../../components/SEO';
import { ChevronDown, ChevronUp, RotateCcw, Eye, Plus, Trash2, ArrowUp, ArrowDown, Loader2, AlertCircle } from 'lucide-react';
import { MediaLibraryPicker } from '../../../components/admin/MediaLibraryPicker';

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

export const ManufacturingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [config, setConfig] = useState<any>(defaultMfgConfig);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    headings: true,
    steps: false,
    wood: false
  });

  const fetchMfgData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'manufacturing_page_draft')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.value) {
        setConfig({
          ...defaultMfgConfig,
          ...data.value
        });
      } else {
        await supabase
          .from('site_settings')
          .upsert([{ key: 'manufacturing_page_draft', value: defaultMfgConfig }]);
        setConfig(defaultMfgConfig);
      }
    } catch (err) {
      console.error('Error fetching mfg configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Media library picker states
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    fetchMfgData();
  }, []);

  const handleFieldChange = (_section: string, field: string, value: any) => {
    setIsDirty(true);
    setConfig((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };



  // Drag and Drop steps
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('dragIdx', index.toString());
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    const dragIndex = parseInt(e.dataTransfer.getData('dragIdx'), 10);
    const newSteps = [...config.steps];
    const [removed] = newSteps.splice(dragIndex, 1);
    newSteps.splice(dropIndex, 0, removed);
    newSteps.forEach((s, idx) => s.sort_order = idx + 1);
    setIsDirty(true);
    setConfig((prev: any) => ({ ...prev, steps: newSteps }));
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'manufacturing_page_draft', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Draft settings saved successfully!');
    } catch (err: any) {
      alert(`Save draft failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Publish Live
  const handlePublish = async () => {
    if (!window.confirm('Publish manufacturing steps and wood species details live?')) return;
    setSaving(true);
    try {
      await supabase
        .from('site_settings')
        .upsert([{ key: 'manufacturing_page_draft', value: config, updated_at: new Date() }]);

      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'manufacturing_page', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Congratulations! Manufacturing configurations published live!');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Restore defaults
  const handleRestoreDefaults = () => {
    if (window.confirm('Reset manufacturing configurations to default factory values?')) {
      setConfig(defaultMfgConfig);
      setIsDirty(true);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
      <SEO title="Manufacturing Process CMS | Nikhil Furniture" description="Manage steps and wood options." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Manufacturing Process</h2>
          <p className="text-xs text-wood-500 font-sans">Manage step titles, descriptions, icons, and species characteristic sheets</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRestoreDefaults} className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Restore Defaults
          </button>
          <a href="/manufacturing?preview=true" target="_blank" rel="noopener noreferrer" className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer decoration-transparent">
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
        {/* Accordion 1: Headings */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('headings')} className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-wood-950">Header copy & Highlight block</span>
            {expandedSections.headings ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          {expandedSections.headings && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Timeline Small Tagline</label>
                  <input type="text" value={config.heading} onChange={(e) => handleFieldChange('mfg', 'heading', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Timeline Main Title</label>
                  <input type="text" value={config.title} onChange={(e) => handleFieldChange('mfg', 'title', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Brief Process summary description</label>
                <textarea rows={2} value={config.description} onChange={(e) => handleFieldChange('mfg', 'description', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-wood-150 mt-2">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Secondary Highlight Section title</label>
                    <input type="text" value={config.sec_title} onChange={(e) => handleFieldChange('mfg', 'sec_title', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Description Paragraph 1</label>
                    <textarea rows={2} value={config.sec_desc_1} onChange={(e) => handleFieldChange('mfg', 'sec_desc_1', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Description Paragraph 2</label>
                    <textarea rows={2} value={config.sec_desc_2} onChange={(e) => handleFieldChange('mfg', 'sec_desc_2', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Highlight section photo</span>
                  <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setPickerOpen(true); }}
                    className="bg-wood-800 hover:bg-wood-950 text-white border-none py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    Select Image
                  </button>
                    {config.sec_image && (
                      <div className="w-16 h-12 rounded border overflow-hidden shrink-0 shadow-sm bg-wood-50">
                        <img src={config.sec_image} alt="Highlight Section" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: Manufacturing steps */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('steps')} className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-wood-950">Manufacturing Process Steps ({config.steps.length} Steps)</span>
            {expandedSections.steps ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          {expandedSections.steps && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="flex justify-between items-center pb-2 border-b border-wood-100">
                <span className="text-[10px] font-bold text-wood-500 uppercase tracking-widest">Drag-and-Drop steps or use arrows to change procedural sequencing</span>
                <button onClick={() => {
                  const newSteps = [...config.steps];
                  newSteps.push({
                    id: `step_${Date.now()}`,
                    title: 'New Sourcing/Assembly step',
                    desc: 'Details about this production process.',
                    icon: 'Hammer',
                    sort_order: newSteps.length + 1,
                    enabled: true
                  });
                  handleFieldChange('mfg', 'steps', newSteps);
                }} className="bg-wood-850 hover:bg-wood-950 text-white py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Step
                </button>
              </div>

              {config.steps.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-wood-200 rounded-2xl bg-wood-50/10 text-wood-600">
                  No steps found. Click "Add Step" to start.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {config.steps
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
                              const newSteps = [...config.steps];
                              const temp = newSteps[index];
                              newSteps[index] = newSteps[index - 1];
                              newSteps[index - 1] = temp;
                              newSteps.forEach((s, i) => s.sort_order = i + 1);
                              handleFieldChange('mfg', 'steps', newSteps);
                            }} className="text-wood-400 hover:text-wood-800 disabled:opacity-30 cursor-pointer">
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-bold text-wood-500">#{index + 1}</span>
                            <button disabled={index === config.steps.length - 1} onClick={() => {
                              const newSteps = [...config.steps];
                              const temp = newSteps[index];
                              newSteps[index] = newSteps[index + 1];
                              newSteps[index + 1] = temp;
                              newSteps.forEach((s, i) => s.sort_order = i + 1);
                              handleFieldChange('mfg', 'steps', newSteps);
                            }} className="text-wood-400 hover:text-wood-800 disabled:opacity-30 cursor-pointer">
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 flex-grow w-full">
                            <div className="sm:col-span-4 flex flex-col gap-1">
                              <label className="text-[9px] uppercase text-wood-500">Step Title</label>
                              <input type="text" value={item.title} onChange={(e) => {
                                const newSteps = [...config.steps];
                                newSteps[index].title = e.target.value;
                                handleFieldChange('mfg', 'steps', newSteps);
                              }} className="w-full bg-wood-50/50 border border-wood-200 rounded-lg py-1 px-2 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-5 flex flex-col gap-1">
                              <label className="text-[9px] uppercase text-wood-500">Step Description</label>
                              <input type="text" value={item.desc} onChange={(e) => {
                                const newSteps = [...config.steps];
                                newSteps[index].desc = e.target.value;
                                handleFieldChange('mfg', 'steps', newSteps);
                              }} className="w-full bg-wood-50/50 border border-wood-200 rounded-lg py-1 px-2 focus:outline-none" />
                            </div>
                            <div className="sm:col-span-3 flex flex-col gap-1">
                              <label className="text-[9px] uppercase text-wood-500">Predefined Icon</label>
                              <select value={item.icon} onChange={(e) => {
                                const newSteps = [...config.steps];
                                newSteps[index].icon = e.target.value;
                                handleFieldChange('mfg', 'steps', newSteps);
                              }} className="w-full bg-wood-50/50 border border-wood-200 rounded-lg py-1 px-2 focus:outline-none">
                                <option value="Scale">Scale (Measurements)</option>
                                <option value="Flame">Flame (Kiln Drying)</option>
                                <option value="Shield">Shield (Anti-Termite)</option>
                                <option value="Hammer">Hammer (Carpentry)</option>
                                <option value="HardHat">HardHat (Sanding)</option>
                                <option value="CheckCircle2">CheckCircle (PU Finish)</option>
                                <option value="Award">Award (Certificates)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-wood-100/60 w-full md:w-auto justify-end">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" checked={item.enabled} onChange={(e) => {
                              const newSteps = [...config.steps];
                              newSteps[index].enabled = e.target.checked;
                              handleFieldChange('mfg', 'steps', newSteps);
                            }} className="rounded border-wood-300 text-wood-700 focus:ring-wood-500" />
                            <span className="text-[10px] text-wood-600 font-bold uppercase">Show</span>
                          </label>

                          <button onClick={() => {
                            if (window.confirm('Delete this step?')) {
                              const newSteps = config.steps.filter((s: any) => s.id !== item.id);
                              newSteps.forEach((s: any, idx: number) => s.sort_order = idx + 1);
                              handleFieldChange('mfg', 'steps', newSteps);
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

        {/* Accordion 3: Wood Species Library */}
        <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
          <div onClick={() => toggleSection('wood')} className="px-6 py-4 bg-wood-50/20 hover:bg-wood-50/40 cursor-pointer flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-wood-950">Solid Hardwood Timber Library ({config.wood_types.length} species)</span>
            {expandedSections.wood ? <ChevronUp className="w-4 h-4 text-wood-400" /> : <ChevronDown className="w-4 h-4 text-wood-400" />}
          </div>
          {expandedSections.wood && (
            <div className="p-6 border-t border-wood-100/60 flex flex-col gap-4 text-xs font-semibold text-wood-700">
              <div className="flex justify-between items-center pb-2 border-b border-wood-100">
                <span className="text-[10px] font-bold text-wood-500 uppercase tracking-widest">Species characteristic guidelines</span>
                <button onClick={() => {
                  const newWood = [...config.wood_types];
                  newWood.push({
                    id: `wood_${Date.now()}`,
                    name: 'New Premium Species',
                    desc: 'Characteristics...',
                    characteristics: 'Highly density structure...',
                    benefits: 'Resistant to weather Warp',
                    recommended: 'Doors and cabinets',
                    sort_order: newWood.length + 1
                  });
                  handleFieldChange('mfg', 'wood_types', newWood);
                }} className="bg-wood-850 hover:bg-wood-950 text-white py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Species
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {config.wood_types.map((wood: any, index: number) => (
                  <div key={wood.id} className="p-4 rounded-xl border border-wood-200 bg-wood-50/10 flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2 border-b border-wood-100/40">
                      <span className="text-[10px] font-bold uppercase text-wood-500">Timber Species #{index + 1} ({wood.name})</span>
                      <button onClick={() => {
                        if (window.confirm('Delete this wood species item?')) {
                          const newWood = config.wood_types.filter((w: any) => w.id !== wood.id);
                          newWood.forEach((w: any, idx: number) => w.sort_order = idx + 1);
                          handleFieldChange('mfg', 'wood_types', newWood);
                        }
                      }} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-wood-500">Species Name</label>
                        <input type="text" value={wood.name} onChange={(e) => {
                          const newWood = [...config.wood_types];
                          newWood[index].name = e.target.value;
                          handleFieldChange('mfg', 'wood_types', newWood);
                        }} className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-wood-500">Characteristics</label>
                        <input type="text" value={wood.characteristics} onChange={(e) => {
                          const newWood = [...config.wood_types];
                          newWood[index].characteristics = e.target.value;
                          handleFieldChange('mfg', 'wood_types', newWood);
                        }} className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase text-wood-500">Durability Benefits</label>
                        <input type="text" value={wood.benefits} onChange={(e) => {
                          const newWood = [...config.wood_types];
                          newWood[index].benefits = e.target.value;
                          handleFieldChange('mfg', 'wood_types', newWood);
                        }} className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none" />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[9px] uppercase text-wood-500">Recommended Uses</label>
                        <input type="text" value={wood.recommended} onChange={(e) => {
                          const newWood = [...config.wood_types];
                          newWood[index].recommended = e.target.value;
                          handleFieldChange('mfg', 'wood_types', newWood);
                        }} className="w-full bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <MediaLibraryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          handleFieldChange('mfg', 'sec_image', url);
        }}
        defaultFolder="Manufacturing"
      />
    </div>
  );
};

export default ManufacturingPage;
