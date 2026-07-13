import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { SEO } from '../../../components/SEO';
import { Plus, Trash2, Edit3, Star, Eye, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { MediaLibraryPicker } from '../../../components/admin/MediaLibraryPicker';

const defaultTestimonialsConfig = {
  testimonials: [
    { id: 't1', name: 'Mathew Jacob', role: 'Homeowner', location: 'Ernakulam', content: 'We ordered a custom 8-seater Nilambur Teak dining table and a matching console unit. The finishing is unbelievable, and the structure is extremely heavy. They took care of everything, from wood selection to delivering and setting it up at our home.', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', purchased_item: 'Teak Dining Set', is_featured: true, is_visible: true, sort_order: 1 },
    { id: 't2', name: 'Priya Nair', role: 'Architect', location: 'Thrissur', content: 'As an architect, I am highly picky about wood specifications and polish levels. Nikhil Furniture is my go-to choice for clients who want premium solid wood. Their carpenters can execute complex blueprints flawlessly.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', purchased_item: 'Custom Teak Wardrobe', is_featured: true, is_visible: true, sort_order: 2 },
    { id: 't3', name: 'Dr. Hari Das', role: 'Professor', location: 'Palakkad', content: 'We purchased our complete bedroom set - king cot and a 3-door almirah - in 2008. Seventeen years later, the wood grain looks even richer, there is zero creaking, and the drawer slides operate smoothly. Exceptional longevity.', rating: 5, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', purchased_item: 'Royal Cot Panel', is_featured: false, is_visible: true, sort_order: 3 }
  ]
};

export const TestimonialsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [config, setConfig] = useState<any>(defaultTestimonialsConfig);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);

  // Media library picker states
  const [pickerOpen, setPickerOpen] = useState(false);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'testimonials_module_draft')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.value) {
        setConfig({
          ...defaultTestimonialsConfig,
          ...data.value
        });
      } else {
        await supabase
          .from('site_settings')
          .upsert([{ key: 'testimonials_module_draft', value: defaultTestimonialsConfig }]);
        setConfig(defaultTestimonialsConfig);
      }
    } catch (err) {
      console.error('Error loading testimonials config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const triggerSaveState = (newConfig: any) => {
    setIsDirty(true);
    setConfig(newConfig);
  };

  const handleEditClick = (item: any) => {
    setCurrentEditItem(item);
    setIsDrawerOpen(true);
  };

  const handleCreateClick = () => {
    setCurrentEditItem({
      id: `testimonial_${Date.now()}`,
      name: '',
      role: 'Homeowner',
      location: 'Thrissur',
      content: '',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      purchased_item: 'Premium Sofa',
      is_featured: false,
      is_visible: true,
      sort_order: config.testimonials.length + 1
    });
    setIsDrawerOpen(true);
  };

  const handleSaveDrawer = () => {
    if (!currentEditItem.name.trim()) {
      alert('Please enter a customer name!');
      return;
    }
    const idx = config.testimonials.findIndex((x: any) => x.id === currentEditItem.id);
    let newTestimonials = [...config.testimonials];
    if (idx >= 0) {
      newTestimonials[idx] = currentEditItem;
    } else {
      newTestimonials.push(currentEditItem);
    }
    triggerSaveState({ ...config, testimonials: newTestimonials });
    setIsDrawerOpen(false);
    setCurrentEditItem(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this customer review?')) {
      const newTestimonials = config.testimonials.filter((x: any) => x.id !== id);
      triggerSaveState({ ...config, testimonials: newTestimonials });
    }
  };

  // Avatar Upload


  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'testimonials_module_draft', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Draft testimonials successfully saved!');
    } catch (err: any) {
      alert(`Save draft failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!window.confirm('Publish testimonials review list live?')) return;
    setSaving(true);
    try {
      await supabase
        .from('site_settings')
        .upsert([{ key: 'testimonials_module_draft', value: config, updated_at: new Date() }]);

      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'testimonials_module', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Congratulations! Testimonials published live successfully!');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Reset testimonials to default system list?')) {
      setConfig(defaultTestimonialsConfig);
      setIsDirty(true);
    }
  };

  const filteredList = config.testimonials.filter((x: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      x.name.toLowerCase().includes(query) ||
      x.location.toLowerCase().includes(query) ||
      x.content.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-wood-200/40 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none font-sans pb-16">
      <SEO title="Testimonials Manager | Nikhil Furniture" description="Manage user reviews." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Testimonials & Client Reviews</h2>
          <p className="text-xs text-wood-500 font-sans">Manage customer stories, ratings, locations, and featured statuses</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRestoreDefaults} className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Restore Defaults
          </button>
          <a href="/testimonials?preview=true" target="_blank" rel="noopener noreferrer" className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer decoration-transparent">
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

      {/* Toolbar */}
      <div className="bg-white border border-wood-200/40 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-wood-500 font-sans font-semibold pl-8"
          />
          <svg className="w-4 h-4 text-wood-400 absolute left-2.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button onClick={handleCreateClick} className="bg-wood-800 hover:bg-wood-950 text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer border-none shrink-0">
          <Plus className="w-4 h-4" /> Create Testimonial
        </button>
      </div>

      {/* Reviews Table List */}
      <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-wood-500">
            No testimonials found. Click "Create Testimonial" to add the first one.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs font-semibold text-wood-700 font-sans">
            <table className="min-w-full divide-y divide-wood-200/60">
              <thead className="bg-wood-50/50 text-[10px] font-bold uppercase text-wood-500 tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left">Customer</th>
                  <th scope="col" className="px-6 py-4 text-left">Location / Role</th>
                  <th scope="col" className="px-6 py-4 text-left">Rating</th>
                  <th scope="col" className="px-6 py-4 text-left">Review Body Summary</th>
                  <th scope="col" className="px-6 py-4 text-center">Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood-200/40 bg-white">
                {filteredList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-wood-50/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full object-cover shadow-sm bg-wood-50" />
                        <div>
                          <div className="font-serif text-sm font-bold text-wood-950">{item.name}</div>
                          <div className="text-[10px] text-wood-400 font-sans mt-0.5">{item.purchased_item || 'Bespoke Item'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{item.location}</div>
                      <div className="text-[10px] text-wood-400 font-sans">{item.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-0.5 text-gold-500">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      {item.content}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-1">
                        {item.is_visible ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Visible</span>
                        ) : (
                          <span className="bg-wood-100 text-wood-650 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Hidden</span>
                        )}
                        {item.is_featured && (
                          <span className="bg-gold-100 text-gold-800 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Featured</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button onClick={() => handleEditClick(item)} className="text-wood-600 hover:text-wood-900 bg-transparent border-none cursor-pointer">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Drawer */}
      {isDrawerOpen && currentEditItem && (
        <div className="fixed inset-0 z-50 bg-wood-950/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-left font-sans text-xs font-semibold text-wood-700 gap-4">
            <div>
              <div className="pb-4 border-b border-wood-100 flex items-center justify-between mb-6">
                <h4 className="font-serif text-lg font-bold text-wood-950">
                  {currentEditItem.name ? 'Edit Customer Review' : 'Create Customer Review'}
                </h4>
                <button onClick={() => setIsDrawerOpen(false)} className="text-wood-400 hover:text-wood-700 bg-transparent border-none cursor-pointer font-bold">Close</button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-sm border bg-wood-50">
                    <img src={currentEditItem.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="bg-wood-100 hover:bg-wood-200 text-wood-800 border-none py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                    >
                      Select Avatar
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-wood-500">Customer Name</label>
                  <input type="text" value={currentEditItem.name} onChange={(e) => setCurrentEditItem({ ...currentEditItem, name: e.target.value })} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-wood-500">Role / Label</label>
                    <input type="text" value={currentEditItem.role} onChange={(e) => setCurrentEditItem({ ...currentEditItem, role: e.target.value })} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-wood-500">City Location</label>
                    <input type="text" value={currentEditItem.location} onChange={(e) => setCurrentEditItem({ ...currentEditItem, location: e.target.value })} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-wood-500">Purchased Product</label>
                    <input type="text" value={currentEditItem.purchased_item} onChange={(e) => setCurrentEditItem({ ...currentEditItem, purchased_item: e.target.value })} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-wood-500">Rating Stars</label>
                    <select value={currentEditItem.rating} onChange={(e) => setCurrentEditItem({ ...currentEditItem, rating: Number(e.target.value) })} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none">
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-wood-500">Review Quote Content</label>
                  <textarea rows={4} value={currentEditItem.content} onChange={(e) => setCurrentEditItem({ ...currentEditItem, content: e.target.value })} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none" />
                </div>

                <div className="flex gap-6 mt-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={currentEditItem.is_visible} onChange={(e) => setCurrentEditItem({ ...currentEditItem, is_visible: e.target.checked })} className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 w-4 h-4" />
                    <span>Visible in list</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={currentEditItem.is_featured} onChange={(e) => setCurrentEditItem({ ...currentEditItem, is_featured: e.target.checked })} className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 w-4 h-4" />
                    <span>Pin to Showcase</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-wood-100 mt-auto">
              <button onClick={() => setIsDrawerOpen(false)} className="border border-wood-200 hover:bg-wood-55 py-2 px-4 rounded-xl font-bold uppercase tracking-wider bg-white cursor-pointer text-wood-600">Cancel</button>
              <button onClick={handleSaveDrawer} className="bg-wood-800 hover:bg-wood-950 py-2 px-5 rounded-xl font-bold uppercase tracking-wider text-white cursor-pointer border-none">Save Review</button>
            </div>
          </div>
        </div>
      )}

      <MediaLibraryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          setCurrentEditItem((prev: any) => ({ ...prev, avatar: url }));
        }}
        defaultFolder="Testimonials"
      />
    </div>
  );
};

export default TestimonialsPage;
