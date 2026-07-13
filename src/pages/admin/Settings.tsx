import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SEO } from '../../components/SEO';
import { MediaLibraryPicker } from '../../components/admin/MediaLibraryPicker';
import { RotateCcw, AlertCircle, Loader2, Info } from 'lucide-react';

const defaultGeneral = {
  companyName: 'Nikhil Furniture',
  tagline: 'Crafting Timeless Wooden Furniture Since 1995',
  address: { line1: 'Pudukkad P.O.', line2: 'Opposite Pudukkad Railway Station Road', city: 'Thrissur', state: 'Kerala', pin: '680301' },
  phoneNumbers: ['9746321808', '9447241559', '9745334644'],
  whatsAppNumber: '9746321808',
  email: 'info@nikhilfurniture.com',
  googleMapsUrl: 'https://maps.google.com/maps?q=Thekkekara+Nikhil+furniture,Pudukkad,Kerala&hl=en&z=17&output=embed',
  workingHours: '9:00 AM - 7:00 PM (Monday - Saturday)',
  facebookUrl: 'https://www.facebook.com/profile.php?id=100065195572493',
  instagramUrl: 'https://www.instagram.com/nikhil__furniture',
  youtubeUrl: '',
  linkedinUrl: '',
  footerDescription: 'Nikhil Furniture stands for authentic craftsmanship, seasoned solid woods, and heirloom-quality carvings since 1995 in Thrissur, Kerala.',
  logoUrl: '',
  faviconUrl: ''
};

const defaultBehaviour = {
  maintenanceMode: false,
  comingSoon: false,
  enableWishlist: true,
  enableWhatsApp: true,
  enableGallery: true,
  enableTestimonials: true,
  enableInstagramSection: false,
  announcement: {
    enabled: true,
    text: 'Premium Nilambur Teak Furniture - Festival Special Offers!',
    bgColor: '#8B5A2B',
    textColor: '#FFFFFF',
    btnText: 'View Offers',
    btnLink: '/products'
  },
  whatsappWidget: {
    number: '9746321808',
    message: 'Hello, I am interested in custom solid wood furniture from Thrissur.',
    position: 'right',
    showOnMobile: true,
    showOnDesktop: true
  }
};

const defaultSeo = {
  siteTitle: 'Nikhil Furniture | Solid Teak & Rosewood Carpentry in Thrissur',
  siteDescription: 'Premium solid wooden furniture manufacturer since 1995 in Pudukkad, Thrissur. Custom designs in Nilambur Teak, Malabar Rosewood, and premium PU coatings.',
  keywords: 'furniture thrissur, teak wood furniture, rosewood cots kerala, carpentry thrissur, nikhil furniture, solid wood dining tables',
  ogImage: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg'
};

const defaultHeader = {
  opacity: 95,
  bgColor: '#FAF8F5',
  textColor: '#4a3b32',
  menuItems: [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products', hasCategoriesSubmenu: true },
    { name: 'Categories', path: '/categories' },
    { name: 'Manufacturing', path: '/manufacturing' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ]
};

export const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'behaviour' | 'seo' | 'header' | 'backup'>('info');

  // Config States
  const [general, setGeneral] = useState<any>(defaultGeneral);
  const [behaviour, setBehaviour] = useState<any>(defaultBehaviour);
  const [seo, setSeo] = useState<any>(defaultSeo);
  const [headerConfig, setHeaderConfig] = useState<any>(defaultHeader);

  // Media Picker Trigger
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<string>('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // 1. Fetch general settings
      const { data: genRes } = await supabase.from('site_settings').select('*').eq('key', 'general_draft').single();
      if (genRes && genRes.value) {
        setGeneral({ ...defaultGeneral, ...genRes.value });
      }

      // 2. Fetch behaviour settings
      const { data: behRes } = await supabase.from('site_settings').select('*').eq('key', 'website_behaviour_draft').single();
      if (behRes && behRes.value) {
        setBehaviour({ ...defaultBehaviour, ...behRes.value });
      } else {
        await supabase.from('site_settings').upsert([{ key: 'website_behaviour_draft', value: defaultBehaviour }]);
        setBehaviour(defaultBehaviour);
      }

      // 3. Fetch SEO defaults
      const { data: seoRes } = await supabase.from('site_settings').select('*').eq('key', 'seo_defaults_draft').single();
      if (seoRes && seoRes.value) {
        setSeo({ ...defaultSeo, ...seoRes.value });
      } else {
        await supabase.from('site_settings').upsert([{ key: 'seo_defaults_draft', value: defaultSeo }]);
        setSeo(defaultSeo);
      }

      // 4. Fetch Header configuration settings
      const { data: headRes } = await supabase.from('site_settings').select('*').eq('key', 'header_settings_draft').single();
      if (headRes && headRes.value) {
        setHeaderConfig({ ...defaultHeader, ...headRes.value });
      } else {
        await supabase.from('site_settings').upsert([{ key: 'header_settings_draft', value: defaultHeader }]);
        setHeaderConfig(defaultHeader);
      }

    } catch (err) {
      console.error('Error fetching global settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const openPicker = (target: string) => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    setIsDirty(true);
    if (pickerTarget === 'logo') {
      setGeneral((prev: any) => ({ ...prev, logoUrl: url }));
    } else if (pickerTarget === 'favicon') {
      setGeneral((prev: any) => ({ ...prev, faviconUrl: url }));
    } else if (pickerTarget === 'ogImage') {
      setSeo((prev: any) => ({ ...prev, ogImage: url }));
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await supabase.from('site_settings').upsert([
        { key: 'general_draft', value: general, updated_at: new Date() },
        { key: 'website_behaviour_draft', value: behaviour, updated_at: new Date() },
        { key: 'seo_defaults_draft', value: seo, updated_at: new Date() },
        { key: 'header_settings_draft', value: headerConfig, updated_at: new Date() }
      ]);
      setIsDirty(false);
      alert('Draft settings updated successfully!');
    } catch (err: any) {
      alert(`Save draft failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!window.confirm('Publish settings live? This will affect global layout rules instantly.')) return;
    setSaving(true);
    try {
      // Upsert drafts
      await supabase.from('site_settings').upsert([
        { key: 'general_draft', value: general, updated_at: new Date() },
        { key: 'website_behaviour_draft', value: behaviour, updated_at: new Date() },
        { key: 'seo_defaults_draft', value: seo, updated_at: new Date() },
        { key: 'header_settings_draft', value: headerConfig, updated_at: new Date() }
      ]);

      // Upsert live versions
      const { error } = await supabase.from('site_settings').upsert([
        { key: 'general', value: general, updated_at: new Date() },
        { key: 'website_behaviour', value: behaviour, updated_at: new Date() },
        { key: 'seo_defaults', value: seo, updated_at: new Date() },
        { key: 'header_settings', value: headerConfig, updated_at: new Date() }
      ]);

      if (error) throw error;
      setIsDirty(false);
      alert('Congratulations! Global settings published live successfully!');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Restore system defaults? You must save/publish to write.')) {
      setGeneral(defaultGeneral);
      setBehaviour(defaultBehaviour);
      setSeo(defaultSeo);
      setHeaderConfig(defaultHeader);
      setIsDirty(true);
    }
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ general, behaviour, seo }));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nikhil_furniture_settings_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
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
      <SEO title="Website Configuration Panels | Nikhil Furniture" description="Manage global branding." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60 font-sans text-xs">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Website Settings</h2>
          <p className="text-xs text-wood-500 font-sans font-normal">Manage global brand assets, maintenance toggle bars, default SEO rules, and database exports</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRestoreDefaults} className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Restore Defaults
          </button>
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

      {/* Tab select bar */}
      <div className="flex border-b border-wood-150 gap-4 shrink-0 overflow-x-auto text-[10px]">
        <button onClick={() => setActiveTab('info')} className={`pb-3 font-bold uppercase tracking-wider bg-transparent border-b-2 px-1 cursor-pointer transition-colors ${
          activeTab === 'info' ? 'border-wood-800 text-wood-950' : 'border-transparent text-wood-400 hover:text-wood-650'
        }`}>
          General & Branding
        </button>
        <button onClick={() => setActiveTab('behaviour')} className={`pb-3 font-bold uppercase tracking-wider bg-transparent border-b-2 px-1 cursor-pointer transition-colors ${
          activeTab === 'behaviour' ? 'border-wood-800 text-wood-950' : 'border-transparent text-wood-400 hover:text-wood-650'
        }`}>
          Site Behaviour & Banners
        </button>
        <button onClick={() => setActiveTab('seo')} className={`pb-3 font-bold uppercase tracking-wider bg-transparent border-b-2 px-1 cursor-pointer transition-colors ${
          activeTab === 'seo' ? 'border-wood-800 text-wood-950' : 'border-transparent text-wood-400 hover:text-wood-650'
        }`}>
          SEO Defaults
        </button>
        <button onClick={() => setActiveTab('header')} className={`pb-3 font-bold uppercase tracking-wider bg-transparent border-b-2 px-1 cursor-pointer transition-colors ${
          activeTab === 'header' ? 'border-wood-800 text-wood-950' : 'border-transparent text-wood-400 hover:text-wood-650'
        }`}>
          Header & Menu
        </button>
        <button onClick={() => setActiveTab('backup')} className={`pb-3 font-bold uppercase tracking-wider bg-transparent border-b-2 px-1 cursor-pointer transition-colors ${
          activeTab === 'backup' ? 'border-wood-800 text-wood-950' : 'border-transparent text-wood-400 hover:text-wood-650'
        }`}>
          Backups
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-wood-200/40 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        
        {/* Tab 1: General Info & Branding */}
        {activeTab === 'info' && (
          <div className="flex flex-col gap-6 font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Business Details</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">Company Name</label>
                <input type="text" value={general.companyName} onChange={(e) => { setIsDirty(true); setGeneral({ ...general, companyName: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">Tagline / Tag Tag</label>
                <input type="text" value={general.tagline} onChange={(e) => { setIsDirty(true); setGeneral({ ...general, tagline: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-wood-100">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">Working Hours description</label>
                <input type="text" value={general.workingHours} onChange={(e) => { setIsDirty(true); setGeneral({ ...general, workingHours: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">Support Email</label>
                <input type="email" value={general.email} onChange={(e) => { setIsDirty(true); setGeneral({ ...general, email: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">WhatsApp widget Primary Number</label>
                <input type="text" value={general.whatsAppNumber} onChange={(e) => { setIsDirty(true); setGeneral({ ...general, whatsAppNumber: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500 pt-4 border-t border-wood-100">Social URL Profiles</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">Facebook URL</label>
                <input type="text" value={general.facebookUrl} onChange={(e) => { setIsDirty(true); setGeneral({ ...general, facebookUrl: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">Instagram URL</label>
                <input type="text" value={general.instagramUrl} onChange={(e) => { setIsDirty(true); setGeneral({ ...general, instagramUrl: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">YouTube URL</label>
                <input type="text" value={general.youtubeUrl} onChange={(e) => { setIsDirty(true); setGeneral({ ...general, youtubeUrl: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500 pt-4 border-t border-wood-100">Global Branding Logos</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded border bg-wood-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {general.logoUrl ? <img src={general.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Info className="w-6 h-6 text-wood-300" />}
                </div>
                <div>
                  <button onClick={() => openPicker('logo')} className="bg-wood-800 hover:bg-wood-950 text-white py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer border-none">Select logo</button>
                  <p className="text-[9px] text-wood-450 mt-1">Recommended size: 240x80px PNG</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded border bg-wood-50 overflow-hidden shrink-0 flex items-center justify-center">
                  {general.faviconUrl ? <img src={general.faviconUrl} alt="Favicon" className="w-full h-full object-cover" /> : <Info className="w-5 h-5 text-wood-300" />}
                </div>
                <div>
                  <button onClick={() => openPicker('favicon')} className="bg-wood-800 hover:bg-wood-950 text-white py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer border-none">Select favicon</button>
                  <p className="text-[9px] text-wood-450 mt-1">Recommended size: 32x32px ICO/PNG</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Site Behaviour & Banners */}
        {activeTab === 'behaviour' && (
          <div className="flex flex-col gap-6 font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Feature Toggle flags</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-semibold">
              <label className="flex items-center gap-2 bg-wood-50/50 p-4 rounded-xl border border-wood-200/60 cursor-pointer">
                <input type="checkbox" checked={behaviour.maintenanceMode} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, maintenanceMode: e.target.checked }); }} className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 w-4.5 h-4.5" />
                <div className="flex flex-col">
                  <span>Maintenance Mode</span>
                  <span className="text-[9px] text-wood-450 mt-0.5">Locks public site access with warning splash overlay</span>
                </div>
              </label>
              <label className="flex items-center gap-2 bg-wood-50/50 p-4 rounded-xl border border-wood-200/60 cursor-pointer">
                <input type="checkbox" checked={behaviour.enableWishlist} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, enableWishlist: e.target.checked }); }} className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 w-4.5 h-4.5" />
                <div className="flex flex-col">
                  <span>Enable Wishlist</span>
                  <span className="text-[9px] text-wood-450 mt-0.5">Let guest users save products to localWishlist storage</span>
                </div>
              </label>
              <label className="flex items-center gap-2 bg-wood-50/50 p-4 rounded-xl border border-wood-200/60 cursor-pointer">
                <input type="checkbox" checked={behaviour.enableWhatsApp} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, enableWhatsApp: e.target.checked }); }} className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 w-4.5 h-4.5" />
                <div className="flex flex-col">
                  <span>Enable WhatsApp Chat</span>
                  <span className="text-[9px] text-wood-450 mt-0.5">Show floating green chat widget</span>
                </div>
              </label>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500 pt-4 border-t border-wood-100">Top Header Announcement Bar</span>
            <div className="bg-wood-50/20 border p-5 rounded-2xl flex flex-col gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-bold mb-2">
                <input type="checkbox" checked={behaviour.announcement?.enabled} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, announcement: { ...behaviour.announcement, enabled: e.target.checked } }); }} className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 w-4 h-4" />
                <span>Show Announcement Bar at top of public website</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase text-wood-500">Announcement Text</label>
                  <input type="text" value={behaviour.announcement?.text || ''} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, announcement: { ...behaviour.announcement, text: e.target.value } }); }} className="w-full bg-white border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase text-wood-500">Background Color (Hex)</label>
                    <input type="color" value={behaviour.announcement?.bgColor || '#8B5A2B'} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, announcement: { ...behaviour.announcement, bgColor: e.target.value } }); }} className="w-full bg-white border border-wood-200 rounded-xl h-8 p-1 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase text-wood-500">Text Color (Hex)</label>
                    <input type="color" value={behaviour.announcement?.textColor || '#FFFFFF'} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, announcement: { ...behaviour.announcement, textColor: e.target.value } }); }} className="w-full bg-white border border-wood-200 rounded-xl h-8 p-1 focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500 pt-4 border-t border-wood-100">Floating WhatsApp Widget Settings</span>
            <div className="bg-wood-50/20 border p-5 rounded-2xl flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase text-wood-500">WhatsApp Mobile Target</label>
                  <input type="text" value={behaviour.whatsappWidget?.number || ''} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, whatsappWidget: { ...behaviour.whatsappWidget, number: e.target.value } }); }} className="w-full bg-white border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase text-wood-500">Default Chat Message</label>
                  <input type="text" value={behaviour.whatsappWidget?.message || ''} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, whatsappWidget: { ...behaviour.whatsappWidget, message: e.target.value } }); }} className="w-full bg-white border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase text-wood-500">Position Placement</label>
                  <select value={behaviour.whatsappWidget?.position || 'right'} onChange={(e) => { setIsDirty(true); setBehaviour({ ...behaviour, whatsappWidget: { ...behaviour.whatsappWidget, position: e.target.value } }); }} className="w-full bg-white border border-wood-200 rounded-xl py-2 px-3 focus:outline-none">
                    <option value="right">Bottom Right Corner</option>
                    <option value="left">Bottom Left Corner</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: SEO defaults */}
        {activeTab === 'seo' && (
          <div className="flex flex-col gap-6 font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Global Default SEO parameters</span>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase text-wood-500">Default Homepage Site Title</label>
              <input type="text" value={seo.siteTitle} onChange={(e) => { setIsDirty(true); setSeo({ ...seo, siteTitle: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase text-wood-500">Default Site Meta Description</label>
              <textarea rows={3} value={seo.siteDescription} onChange={(e) => { setIsDirty(true); setSeo({ ...seo, siteDescription: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none resize-none font-semibold text-xs" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase text-wood-500">Search Keywords (comma separated)</label>
              <input type="text" value={seo.keywords} onChange={(e) => { setIsDirty(true); setSeo({ ...seo, keywords: e.target.value }); }} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
            </div>
            
            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500 pt-4 border-t border-wood-100">Fallback Social Sharing Image (OG)</span>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded border bg-wood-50 overflow-hidden shrink-0 flex items-center justify-center">
                {seo.ogImage ? <img src={seo.ogImage} alt="OG Default" className="w-full h-full object-cover" /> : <Info className="w-6 h-6 text-wood-300" />}
              </div>
              <div>
                <button onClick={() => openPicker('ogImage')} className="bg-wood-800 hover:bg-wood-950 text-white py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer border-none font-sans">Select OG image</button>
                <p className="text-[9px] text-wood-450 mt-1">Recommended size: 1200x630px JPG</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Header & Menu Customization */}
        {activeTab === 'header' && (
          <div className="flex flex-col gap-6 font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Header Styling & Appearance</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Opacity control */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] uppercase text-wood-500">Navbar Opacity ({headerConfig.opacity || 95}%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={headerConfig.opacity || 95}
                    onChange={(e) => {
                      setIsDirty(true);
                      setHeaderConfig({ ...headerConfig, opacity: parseInt(e.target.value) });
                    }}
                    className="w-full h-1 bg-wood-100 rounded-lg appearance-none cursor-pointer accent-wood-800"
                  />
                </div>
                <p className="text-[9px] text-wood-400 font-normal">Controls background transparency of the menu bar.</p>
              </div>

              {/* Background color */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">Background Color (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={headerConfig.bgColor || '#FAF8F5'}
                    onChange={(e) => {
                      setIsDirty(true);
                      setHeaderConfig({ ...headerConfig, bgColor: e.target.value });
                    }}
                    className="w-8 h-8 rounded-lg border border-wood-200 cursor-pointer overflow-hidden p-0"
                  />
                  <input
                    type="text"
                    value={headerConfig.bgColor || '#FAF8F5'}
                    onChange={(e) => {
                      setIsDirty(true);
                      setHeaderConfig({ ...headerConfig, bgColor: e.target.value });
                    }}
                    className="flex-grow bg-wood-50/50 border border-wood-200 rounded-xl py-1.5 px-3 focus:outline-none font-mono text-xs"
                    placeholder="#FAF8F5"
                  />
                </div>
              </div>

              {/* Text color */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-wood-500">Text & Icon Color (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={headerConfig.textColor || '#4a3b32'}
                    onChange={(e) => {
                      setIsDirty(true);
                      setHeaderConfig({ ...headerConfig, textColor: e.target.value });
                    }}
                    className="w-8 h-8 rounded-lg border border-wood-200 cursor-pointer overflow-hidden p-0"
                  />
                  <input
                    type="text"
                    value={headerConfig.textColor || '#4a3b32'}
                    onChange={(e) => {
                      setIsDirty(true);
                      setHeaderConfig({ ...headerConfig, textColor: e.target.value });
                    }}
                    className="flex-grow bg-wood-50/50 border border-wood-200 rounded-xl py-1.5 px-3 focus:outline-none font-mono text-xs"
                    placeholder="#4a3b32"
                  />
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-wood-100">
              {/* Logo Manager */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Header Branding Logo</span>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded border bg-wood-50 overflow-hidden shrink-0 flex items-center justify-center">
                    {general.logoUrl ? <img src={general.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Info className="w-6 h-6 text-wood-300" />}
                  </div>
                  <div>
                    <button onClick={() => openPicker('logo')} className="bg-wood-800 hover:bg-wood-950 text-white py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer border-none font-sans">Select Header Logo</button>
                    <p className="text-[9px] text-wood-450 mt-1">Recommended format: PNG / SVG with transparent background.</p>
                  </div>
                </div>
              </div>

              {/* Logo Preview */}
              <div className="flex flex-col gap-3 flex-grow">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Live Header Preview</span>
                <div
                  className="p-4 rounded-2xl border border-wood-200 shadow-sm flex items-center justify-between"
                  style={{
                    backgroundColor: `${headerConfig.bgColor || '#FAF8F5'}${Math.round((headerConfig.opacity || 95) * 2.55).toString(16).padStart(2, '0')}`,
                    color: headerConfig.textColor || '#4a3b32'
                  }}
                >
                  <div className="flex items-center gap-2">
                    {general.logoUrl && <img src={general.logoUrl} alt="Preview" className="w-6 h-6 rounded-full object-cover" />}
                    <span className="font-serif text-sm font-bold">NIKHIL</span>
                  </div>
                  <div className="flex gap-3 text-[10px] font-sans">
                    {(headerConfig.menuItems || []).slice(0, 3).map((item: any, i: number) => (
                      <span key={i} className="hover:underline cursor-pointer">{item.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Management */}
            <div className="flex flex-col gap-3 pt-4 border-t border-wood-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Navigation Menu Items</span>
                <button
                  onClick={() => {
                    setIsDirty(true);
                    setHeaderConfig({
                      ...headerConfig,
                      menuItems: [...(headerConfig.menuItems || []), { name: 'New Link', path: '/new-path', hasCategoriesSubmenu: false }]
                    });
                  }}
                  className="bg-wood-800 hover:bg-wood-950 text-white py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer border-none font-sans"
                >
                  + Add Link
                </button>
              </div>

              <div className="border border-wood-200/60 rounded-2xl overflow-hidden shadow-sm bg-wood-50/20">
                <table className="w-full border-collapse text-left text-xs text-wood-800 font-sans">
                  <thead>
                    <tr className="bg-wood-50 border-b border-wood-200">
                      <th className="py-2.5 px-4 font-bold text-[9px] uppercase tracking-wider text-wood-550 w-12">No.</th>
                      <th className="py-2.5 px-4 font-bold text-[9px] uppercase tracking-wider text-wood-550 w-44">Label</th>
                      <th className="py-2.5 px-4 font-bold text-[9px] uppercase tracking-wider text-wood-550">Path / Route</th>
                      <th className="py-2.5 px-4 font-bold text-[9px] uppercase tracking-wider text-wood-550 w-48 text-center">Sub-Menu (Categories)</th>
                      <th className="py-2.5 px-4 font-bold text-[9px] uppercase tracking-wider text-wood-550 w-44 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(headerConfig.menuItems || []).map((item: any, index: number) => (
                      <tr key={index} className="border-b border-wood-100 hover:bg-white/60 transition-colors">
                        <td className="py-3 px-4 font-mono text-[10px] font-bold">{index + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              setIsDirty(true);
                              const newItems = [...(headerConfig.menuItems || [])];
                              newItems[index].name = e.target.value;
                              setHeaderConfig({ ...headerConfig, menuItems: newItems });
                            }}
                            className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2.5 focus:outline-none font-semibold text-xs text-wood-850"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.path}
                            onChange={(e) => {
                              setIsDirty(true);
                              const newItems = [...(headerConfig.menuItems || [])];
                              newItems[index].path = e.target.value;
                              setHeaderConfig({ ...headerConfig, menuItems: newItems });
                            }}
                            className="w-full bg-white border border-wood-200 rounded-lg py-1 px-2.5 focus:outline-none font-semibold text-xs text-wood-850"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={!!item.hasCategoriesSubmenu}
                            onChange={(e) => {
                              setIsDirty(true);
                              const newItems = [...(headerConfig.menuItems || [])];
                              newItems[index].hasCategoriesSubmenu = e.target.checked;
                              setHeaderConfig({ ...headerConfig, menuItems: newItems });
                            }}
                            className="w-4 h-4 rounded text-wood-800 border-wood-300 focus:ring-wood-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-4 text-right flex items-center justify-end gap-1.5 mt-0.5">
                          <button
                            disabled={index === 0}
                            onClick={() => {
                              setIsDirty(true);
                              const newItems = [...(headerConfig.menuItems || [])];
                              const temp = newItems[index];
                              newItems[index] = newItems[index - 1];
                              newItems[index - 1] = temp;
                              setHeaderConfig({ ...headerConfig, menuItems: newItems });
                            }}
                            className="p-1 hover:bg-wood-100 rounded text-wood-500 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            disabled={index === (headerConfig.menuItems || []).length - 1}
                            onClick={() => {
                              setIsDirty(true);
                              const newItems = [...(headerConfig.menuItems || [])];
                              const temp = newItems[index];
                              newItems[index] = newItems[index + 1];
                              newItems[index + 1] = temp;
                              setHeaderConfig({ ...headerConfig, menuItems: newItems });
                            }}
                            className="p-1 hover:bg-wood-100 rounded text-wood-500 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${item.name}" link?`)) {
                                setIsDirty(true);
                                const newItems = (headerConfig.menuItems || []).filter((_: any, idx: number) => idx !== index);
                                setHeaderConfig({ ...headerConfig, menuItems: newItems });
                              }
                            }}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                            title="Delete"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Database Export */}
        {activeTab === 'backup' && (
          <div className="flex flex-col gap-6 font-sans">
            <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">System Backup & Exporter</span>
            <div className="bg-wood-50/50 border border-wood-200/50 p-6 rounded-2xl flex flex-col gap-3 max-w-lg">
              <h4 className="font-serif text-sm font-bold text-wood-950">Export System Configuration</h4>
              <p className="text-wood-500 text-xs font-normal leading-relaxed">
                Download a serialized JSON backup file of all database settings (Branding, Announcers, SEO, widgets configs, timeline milestones, and homepage slider structures). Save this file locally to prevent data loss during testing.
              </p>
              <button onClick={handleExportBackup} className="bg-wood-800 hover:bg-wood-950 text-white py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border-none cursor-pointer mt-2 w-fit">
                Download settings.json Backup
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Embedded Picker Modal */}
      <MediaLibraryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleMediaSelect}
        defaultFolder="General"
      />

    </div>
  );
};

export default SettingsPage;
