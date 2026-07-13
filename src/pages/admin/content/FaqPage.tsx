import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { SEO } from '../../../components/SEO';
import { Plus, Trash2, Edit3, RotateCcw, Eye, AlertCircle, Loader2 } from 'lucide-react';

const defaultFaqConfig = {
  faqs: [
    { id: 'f1', question: 'Which type of wood is best for home furniture in Kerala?', answer: 'Premium Teak Wood (especially Nilambur Teak) and Rosewood are the best choices for home furniture in Kerala due to their density and natural oils, which make them highly resistant to tropical humidity, drywood termites, and warping.', category: 'Wood Sourcing', sort_order: 1, is_visible: true },
    { id: 'f2', question: 'Do you provide customized furniture sizing?', answer: 'Yes! We specialize in customized wooden furniture. Our team can visit your home or office in Thrissur or nearby districts to take precise measurements, align with your design themes, and manufacture the pieces to fit your spaces perfectly.', category: 'Customization', sort_order: 2, is_visible: true },
    { id: 'f3', question: 'How long does a custom order take to manufacture and deliver?', answer: 'On average, standard custom furniture takes between 3 to 6 weeks depending on the complexity of the design carvings, seasoning requirements of the wood, and the volume of order in the factory.', category: 'Logistics & Time', sort_order: 3, is_visible: true },
    { id: 'f4', question: 'Are your wooden furniture pieces treated against termites?', answer: 'Absolutely. All our raw timbers are seasoned to 8-12% moisture in kiln chambers and undergo chemical anti-pest treatments. This kills borer larvae and guarantees immunity against drywood termites.', category: 'Durability', sort_order: 4, is_visible: true }
  ]
};

export const FaqPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [config, setConfig] = useState<any>(defaultFaqConfig);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal Editor
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'faqs_module_draft')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.value) {
        setConfig({
          ...defaultFaqConfig,
          ...data.value
        });
      } else {
        await supabase
          .from('site_settings')
          .upsert([{ key: 'faqs_module_draft', value: defaultFaqConfig }]);
        setConfig(defaultFaqConfig);
      }
    } catch (err) {
      console.error('Error loading faqs config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const triggerSaveState = (newConfig: any) => {
    setIsDirty(true);
    setConfig(newConfig);
  };

  const handleEditClick = (item: any) => {
    setCurrentEditItem(item);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setCurrentEditItem({
      id: `faq_${Date.now()}`,
      question: '',
      answer: '',
      category: 'General',
      sort_order: config.faqs.length + 1,
      is_visible: true
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!currentEditItem.question.trim() || !currentEditItem.answer.trim()) {
      alert('Please enter both question and answer!');
      return;
    }
    const idx = config.faqs.findIndex((x: any) => x.id === currentEditItem.id);
    let newFaqs = [...config.faqs];
    if (idx >= 0) {
      newFaqs[idx] = currentEditItem;
    } else {
      newFaqs.push(currentEditItem);
    }
    triggerSaveState({ ...config, faqs: newFaqs });
    setIsModalOpen(false);
    setCurrentEditItem(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this FAQ record?')) {
      const newFaqs = config.faqs.filter((x: any) => x.id !== id);
      triggerSaveState({ ...config, faqs: newFaqs });
    }
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'faqs_module_draft', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Draft FAQs successfully saved!');
    } catch (err: any) {
      alert(`Save draft failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!window.confirm('Publish FAQ records live?')) return;
    setSaving(true);
    try {
      await supabase
        .from('site_settings')
        .upsert([{ key: 'faqs_module_draft', value: config, updated_at: new Date() }]);

      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'faqs_module', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Congratulations! FAQs published live successfully!');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Reset FAQ records to default set?')) {
      setConfig(defaultFaqConfig);
      setIsDirty(true);
    }
  };

  const filteredList = config.faqs.filter((x: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      x.question.toLowerCase().includes(query) ||
      x.answer.toLowerCase().includes(query) ||
      (x.category || '').toLowerCase().includes(query)
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
    <div className="flex flex-col gap-6 select-none font-sans pb-16 font-semibold">
      <SEO title="FAQ Manager | Nikhil Furniture" description="Manage page FAQs." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60 font-sans text-xs">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Frequently Asked Questions</h2>
          <p className="text-xs text-wood-500 font-sans">Manage questions, explanations, categories, and priority visibility rankings</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRestoreDefaults} className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Restore Defaults
          </button>
          <a href="/faq?preview=true" target="_blank" rel="noopener noreferrer" className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer decoration-transparent">
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
      <div className="bg-white border border-wood-200/40 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-wood-500 font-sans font-semibold pl-8"
          />
          <svg className="w-4 h-4 text-wood-400 absolute left-2.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button onClick={handleCreateClick} className="bg-wood-800 hover:bg-wood-950 text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer border-none shrink-0">
          <Plus className="w-4 h-4" /> Create FAQ
        </button>
      </div>

      {/* FAQs List Table */}
      <div className="bg-white border border-wood-200/40 rounded-2xl overflow-hidden shadow-sm">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-wood-500">
            No FAQ entries found. Click "Create FAQ" to add the first one.
          </div>
        ) : (
          <div className="overflow-x-auto font-sans text-xs text-wood-700">
            <table className="min-w-full divide-y divide-wood-200/60">
              <thead className="bg-wood-50/50 text-[10px] font-bold uppercase text-wood-500 tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left">Category</th>
                  <th scope="col" className="px-6 py-4 text-left">Question</th>
                  <th scope="col" className="px-6 py-4 text-left">Answer Summary</th>
                  <th scope="col" className="px-6 py-4 text-center">Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-wood-200/40 bg-white">
                {filteredList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-wood-50/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-wood-100 text-wood-850 py-1 px-2.5 rounded-lg font-bold text-[10px]">{item.category || 'General'}</span>
                    </td>
                    <td className="px-6 py-4 font-serif font-bold text-wood-950 max-w-xs truncate">
                      {item.question}
                    </td>
                    <td className="px-6 py-4 max-w-sm truncate text-wood-600">
                      {item.answer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.is_visible ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Visible</span>
                      ) : (
                        <span className="bg-wood-100 text-wood-650 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Hidden</span>
                      )}
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

      {/* Editor Modal popup */}
      {isModalOpen && currentEditItem && (
        <div className="fixed inset-0 z-50 bg-wood-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-wood-200/40 shadow-2xl max-w-md w-full animate-zoom-in font-sans text-xs font-semibold text-wood-700">
            <h4 className="font-serif text-lg font-bold text-wood-950 mb-4 pb-2 border-b border-wood-100">
              {currentEditItem.question ? 'Edit FAQ Item' : 'Create FAQ Item'}
            </h4>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-wider text-wood-500">FAQ Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Wood Sourcing"
                    value={currentEditItem.category}
                    onChange={(e) => setCurrentEditItem({ ...currentEditItem, category: e.target.value })}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase tracking-wider text-wood-500">Priority Sort Order</label>
                  <input
                    type="number"
                    value={currentEditItem.sort_order}
                    onChange={(e) => setCurrentEditItem({ ...currentEditItem, sort_order: Number(e.target.value) })}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-wood-500">FAQ Question</label>
                <input
                  type="text"
                  placeholder="Enter Question..."
                  value={currentEditItem.question}
                  onChange={(e) => setCurrentEditItem({ ...currentEditItem, question: e.target.value })}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-wood-500">FAQ Answer</label>
                <textarea
                  rows={4}
                  placeholder="Enter Answer details..."
                  value={currentEditItem.answer}
                  onChange={(e) => setCurrentEditItem({ ...currentEditItem, answer: e.target.value })}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentEditItem.is_visible}
                    onChange={(e) => setCurrentEditItem({ ...currentEditItem, is_visible: e.target.checked })}
                    className="rounded border-wood-300 text-wood-700 focus:ring-wood-500"
                  />
                  <span>Show to public customers</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-wood-100">
                <button onClick={() => setIsModalOpen(false)} className="border border-wood-200 hover:bg-wood-50 py-2 px-4 rounded-xl font-bold uppercase tracking-wider bg-white cursor-pointer text-wood-650">Cancel</button>
                <button onClick={handleSaveModal} className="bg-wood-800 hover:bg-wood-950 py-2 px-5 rounded-xl font-bold uppercase tracking-wider text-white cursor-pointer border-none">Save FAQ</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FaqPage;
