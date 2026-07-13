import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { SEO } from '../../../components/SEO';
import { RotateCcw, Eye, AlertCircle, Loader2 } from 'lucide-react';

const defaultGeneralConfig = {
  companyName: 'Nikhil Furniture',
  address: {
    line1: 'Pudukkad P.O.',
    line2: 'Opposite Pudukkad Railway Station Road',
    city: 'Thrissur',
    state: 'Kerala',
    pin: '680301'
  },
  phoneNumbers: ['9746321808', '9447241559', '9745334644'],
  whatsAppNumber: '9746321808',
  email: 'info@nikhilfurniture.com',
  googleMapsUrl: 'https://maps.google.com/maps?q=Thekkekara+Nikhil+furniture,Pudukkad,Kerala&hl=en&z=17&output=embed',
  workingHours: '9:00 AM - 7:00 PM (Monday - Saturday)',
  facebookUrl: 'https://www.facebook.com/profile.php?id=100065195572493',
  instagramUrl: 'https://www.instagram.com/nikhil__furniture',
  youtubeUrl: '',
  tagline: 'Crafting Timeless Wooden Furniture Since 1995',
  footerDescription: 'Nikhil Furniture stands for authentic craftsmanship, seasoned solid woods, and heirloom-quality carvings since 1995 in Thrissur, Kerala.'
};

export const ContactPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [config, setConfig] = useState<any>(defaultGeneralConfig);

  const fetchContactInfo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'general_draft')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.value) {
        setConfig({
          ...defaultGeneralConfig,
          ...data.value
        });
      } else {
        // Look up live settings to sync if draft is missing
        const { data: liveData } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'general')
          .single();

        if (liveData && liveData.value) {
          setConfig({
            ...defaultGeneralConfig,
            ...liveData.value
          });
        } else {
          await supabase
            .from('site_settings')
            .upsert([{ key: 'general_draft', value: defaultGeneralConfig }]);
          setConfig(defaultGeneralConfig);
        }
      }
    } catch (err) {
      console.error('Error fetching general contact config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    setIsDirty(true);
    setConfig((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setIsDirty(true);
    setConfig((prev: any) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    setIsDirty(true);
    const newPhones = [...config.phoneNumbers];
    newPhones[index] = value;
    setConfig((prev: any) => ({
      ...prev,
      phoneNumbers: newPhones
    }));
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'general_draft', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Draft contact details saved successfully!');
    } catch (err: any) {
      alert(`Save draft failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!window.confirm('Publish contact & footer settings live? This updates headers, footers and contact pages across the website.')) return;
    setSaving(true);
    try {
      await supabase
        .from('site_settings')
        .upsert([{ key: 'general_draft', value: config, updated_at: new Date() }]);

      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'general', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Congratulations! Contact settings published live successfully!');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Reset contact settings to default factory setups?')) {
      setConfig(defaultGeneralConfig);
      setIsDirty(true);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-wood-200/40 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none font-sans pb-16 font-semibold text-xs text-wood-700">
      <SEO title="Contact Settings Editor | Nikhil Furniture" description="Manage support hours and socials." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60 font-sans text-xs">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Contact & Footer Information</h2>
          <p className="text-xs text-wood-500 font-sans font-normal">Edit address lines, phone hotlines, WhatsApp numbers, map frame coordinates, and social media profile URLs</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRestoreDefaults} className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Restore Defaults
          </button>
          <a href="/contact?preview=true" target="_blank" rel="noopener noreferrer" className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer decoration-transparent">
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

      {/* Main Settings Form */}
      <div className="bg-white border border-wood-200/40 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        
        {/* Brand Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Company Name</label>
            <input type="text" value={config.companyName} onChange={(e) => handleFieldChange('companyName', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Tagline / Mission phrase</label>
            <input type="text" value={config.tagline} onChange={(e) => handleFieldChange('tagline', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
          </div>
        </div>

        {/* Global Footer brand desc */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Footer Brand Description</label>
          <textarea rows={2} value={config.footerDescription} onChange={(e) => handleFieldChange('footerDescription', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none font-semibold text-xs" />
        </div>

        {/* Contact Numbers and hours */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-wood-150">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Support Email</label>
            <input type="email" value={config.email} onChange={(e) => handleFieldChange('email', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">WhatsApp Mobile (no + or spaces)</label>
            <input type="text" value={config.whatsAppNumber} onChange={(e) => handleFieldChange('whatsAppNumber', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Showroom Operational Hours</label>
            <input type="text" value={config.workingHours} onChange={(e) => handleFieldChange('workingHours', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
          </div>
        </div>

        {/* Dynamic Phones */}
        <div className="flex flex-col gap-2 pt-4 border-t border-wood-150">
          <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Hotline Phone Numbers</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {config.phoneNumbers.map((phone: string, idx: number) => (
              <div key={idx} className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-400">Phone Hotline #{idx + 1}</label>
                <input type="text" value={phone} onChange={(e) => handlePhoneChange(idx, e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Address Fields */}
        <div className="flex flex-col gap-2 pt-4 border-t border-wood-150">
          <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Showroom Address lines</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase text-wood-400">Street / Area (Line 1)</label>
              <input type="text" value={config.address.line1} onChange={(e) => handleAddressChange('line1', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase text-wood-400">Locality Landmark (Line 2)</label>
              <input type="text" value={config.address.line2} onChange={(e) => handleAddressChange('line2', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase text-wood-400">City</label>
              <input type="text" value={config.address.city} onChange={(e) => handleAddressChange('city', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase text-wood-400">State</label>
              <input type="text" value={config.address.state} onChange={(e) => handleAddressChange('state', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase text-wood-400">Postal PIN Code</label>
              <input type="text" value={config.address.pin} onChange={(e) => handleAddressChange('pin', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Google Maps embed and Socials */}
        <div className="flex flex-col gap-4 pt-4 border-t border-wood-150">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Google Maps Embed URL iframe src</label>
            <input type="text" value={config.googleMapsUrl} onChange={(e) => handleFieldChange('googleMapsUrl', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Facebook profile link</label>
              <input type="text" value={config.facebookUrl} onChange={(e) => handleFieldChange('facebookUrl', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Instagram profile link</label>
              <input type="text" value={config.instagramUrl} onChange={(e) => handleFieldChange('instagramUrl', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">YouTube profile link</label>
              <input type="text" value={config.youtubeUrl} onChange={(e) => handleFieldChange('youtubeUrl', e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
