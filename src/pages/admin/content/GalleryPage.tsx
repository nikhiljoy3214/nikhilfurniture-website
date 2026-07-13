import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { SEO } from '../../../components/SEO';
import { Trash2, FolderPlus, FolderClosed, Upload, Eye, RotateCcw, AlertCircle, Loader2, Sparkles, Folder } from 'lucide-react';
import { MediaLibraryPicker } from '../../../components/admin/MediaLibraryPicker';

const defaultGalleryConfig = {
  albums: [
    { id: 'a1', name: 'Showroom', slug: 'showroom', is_visible: true, sort_order: 1 },
    { id: 'a2', name: 'Workshop', slug: 'workshop', is_visible: true, sort_order: 2 },
    { id: 'a3', name: 'Living Room', slug: 'living', is_visible: true, sort_order: 3 },
    { id: 'a4', name: 'Bedroom', slug: 'bedroom', is_visible: true, sort_order: 4 },
    { id: 'a5', name: 'Dining', slug: 'dining', is_visible: true, sort_order: 5 }
  ],
  images: [
    { id: 'g1', title: 'Heritage Teak Sofa Installation', desc: 'Sofa set in living room', album_slug: 'living', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', alt_text: 'Teak sofa', is_featured: true, sort_order: 1, upload_date: '2026-07-12' },
    { id: 'g2', title: 'Mahogany Oval Dining Suite', desc: 'Dining set showcase', album_slug: 'dining', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', alt_text: 'Oval dining table', is_featured: false, sort_order: 2, upload_date: '2026-07-12' },
    { id: 'g3', title: 'Royal King Size Cot Display', desc: 'King cot platform cot', album_slug: 'bedroom', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg', alt_text: 'Teak bed', is_featured: false, sort_order: 3, upload_date: '2026-07-12' },
    { id: 'g4', title: 'Teak Log Seasoning Shed', desc: 'Timber seasoning in workshop', album_slug: 'workshop', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', alt_text: 'Timber workshop seasoning logs', is_featured: true, sort_order: 4, upload_date: '2026-07-12' },
    { id: 'g5', title: '3-Door Teak Wardrobe Unit', desc: 'Spacious locker cabinet wardrobe', album_slug: 'bedroom', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg', alt_text: 'Teak wardrobe', is_featured: true, sort_order: 5, upload_date: '2026-07-12' }
  ]
};

export const GalleryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [config, setConfig] = useState<any>(defaultGalleryConfig);

  const [activeAlbumTab, setActiveAlbumTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection states
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [bulkActionTargetAlbum, setBulkActionTargetAlbum] = useState<string>('');

  // Modals / add item configs
  const [showAddAlbumModal, setShowAddAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumSlug, setNewAlbumSlug] = useState('');

  // Media library picker states
  const [pickerOpen, setPickerOpen] = useState(false);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'gallery_module_draft')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.value) {
        setConfig({
          ...defaultGalleryConfig,
          ...data.value
        });
      } else {
        await supabase
          .from('site_settings')
          .upsert([{ key: 'gallery_module_draft', value: defaultGalleryConfig }]);
        setConfig(defaultGalleryConfig);
      }
    } catch (err) {
      console.error('Error loading gallery config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const triggerSaveState = (newConfig: any) => {
    setIsDirty(true);
    setConfig(newConfig);
  };

  // Add Album
  const handleAddAlbum = () => {
    if (!newAlbumName.trim()) return;
    const slug = newAlbumSlug.trim() || newAlbumName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Check duplicate
    if (config.albums.some((a: any) => a.slug === slug)) {
      alert('An album with this slug already exists!');
      return;
    }

    const newAlbum = {
      id: `album_${Date.now()}`,
      name: newAlbumName.trim(),
      slug: slug,
      is_visible: true,
      sort_order: config.albums.length + 1
    };

    const newConfig = {
      ...config,
      albums: [...config.albums, newAlbum]
    };
    triggerSaveState(newConfig);
    setNewAlbumName('');
    setNewAlbumSlug('');
    setShowAddAlbumModal(false);
  };

  // Delete Album
  const handleDeleteAlbum = (slug: string) => {
    if (window.confirm(`Are you sure you want to delete this album? Images inside it will remain but will become uncategorized.`)) {
      const newAlbums = config.albums.filter((a: any) => a.slug !== slug);
      const newImages = config.images.map((img: any) => {
        if (img.album_slug === slug) {
          return { ...img, album_slug: '' };
        }
        return img;
      });
      triggerSaveState({
        ...config,
        albums: newAlbums,
        images: newImages
      });
      if (activeAlbumTab === slug) {
        setActiveAlbumTab('all');
      }
    }
  };

  // Single Delete Image
  const handleDeleteImage = (id: string) => {
    if (window.confirm('Delete this image?')) {
      const newImages = config.images.filter((img: any) => img.id !== id);
      triggerSaveState({ ...config, images: newImages });
      setSelectedImages(prev => prev.filter(x => x !== id));
    }
  };

  // Toggle image selection for bulk action
  const toggleImageSelection = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Select all filtered images
  const selectAllFiltered = (filteredList: any[]) => {
    const filteredIds = filteredList.map(x => x.id);
    const allSelected = filteredIds.every(id => selectedImages.includes(id));
    if (allSelected) {
      setSelectedImages(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedImages(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedImages.length === 0) return;
    if (window.confirm(`Delete all ${selectedImages.length} selected images permanently?`)) {
      const newImages = config.images.filter((img: any) => !selectedImages.includes(img.id));
      triggerSaveState({ ...config, images: newImages });
      setSelectedImages([]);
    }
  };

  // Bulk Move
  const handleBulkMove = () => {
    if (selectedImages.length === 0 || !bulkActionTargetAlbum) return;
    const newImages = config.images.map((img: any) => {
      if (selectedImages.includes(img.id)) {
        return { ...img, album_slug: bulkActionTargetAlbum };
      }
      return img;
    });
    triggerSaveState({ ...config, images: newImages });
    setSelectedImages([]);
    setBulkActionTargetAlbum('');
  };

  // Bulk Toggle Featured
  const handleBulkToggleFeatured = (featuredState: boolean) => {
    if (selectedImages.length === 0) return;
    const newImages = config.images.map((img: any) => {
      if (selectedImages.includes(img.id)) {
        return { ...img, is_featured: featuredState };
      }
      return img;
    });
    triggerSaveState({ ...config, images: newImages });
    setSelectedImages([]);
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'gallery_module_draft', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Draft gallery successfully saved!');
    } catch (err: any) {
      alert(`Save draft failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    if (!window.confirm('Publish gallery changes live? This will show instantly to public customers.')) return;
    setSaving(true);
    try {
      await supabase
        .from('site_settings')
        .upsert([{ key: 'gallery_module_draft', value: config, updated_at: new Date() }]);

      const { error } = await supabase
        .from('site_settings')
        .upsert([{ key: 'gallery_module', value: config, updated_at: new Date() }]);

      if (error) throw error;
      setIsDirty(false);
      alert('Congratulations! Gallery module published live successfully!');
    } catch (err: any) {
      alert(`Publishing failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    if (window.confirm('Reset gallery settings to default setups?')) {
      setConfig(defaultGalleryConfig);
      setIsDirty(true);
    }
  };

  // Filter images based on search queries and active album tags
  const getFilteredImages = () => {
    let list = config.images;
    if (activeAlbumTab !== 'all') {
      list = list.filter((img: any) => img.album_slug === activeAlbumTab);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((img: any) => 
        (img.title || '').toLowerCase().includes(query) || 
        (img.desc || '').toLowerCase().includes(query)
      );
    }
    return list.sort((a: any, b: any) => a.sort_order - b.sort_order);
  };

  const filteredImages = getFilteredImages();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-wood-200/40 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none font-sans pb-16">
      <SEO title="Project Gallery CMS | Nikhil Furniture" description="Manage albums and photos." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Showroom & Project Gallery</h2>
          <p className="text-xs text-wood-500 font-sans">Manage custom project catalogs, installation photos, and organizational albums</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRestoreDefaults} className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer">
            <RotateCcw className="w-4 h-4" /> Restore Defaults
          </button>
          <a href="/gallery?preview=true" target="_blank" rel="noopener noreferrer" className="border border-wood-200 hover:bg-wood-150/40 text-wood-700 bg-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer decoration-transparent">
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

      {/* Main Grid: Albums Left, Images Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Albums CRUD */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white border border-wood-200/40 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-wood-100">
              <span className="text-[10px] font-bold uppercase text-wood-500 tracking-wider">Gallery Albums</span>
              <button onClick={() => setShowAddAlbumModal(true)} className="text-gold-600 hover:text-gold-800 bg-transparent border-none cursor-pointer p-1">
                <FolderPlus className="w-5 h-5" />
              </button>
            </div>

            {/* Album list */}
            <div className="flex flex-col gap-1.5 text-xs font-semibold">
              <button onClick={() => setActiveAlbumTab('all')} className={`text-left py-2 px-3 rounded-lg flex items-center gap-2 transition-all ${
                activeAlbumTab === 'all' ? 'bg-wood-100 text-wood-950' : 'text-wood-600 hover:bg-wood-50/60'
              }`}>
                <Folder className="w-4 h-4 shrink-0 text-wood-500" />
                <span>All Album Images</span>
                <span className="ml-auto text-[10px] bg-wood-200/50 py-0.5 px-1.5 rounded-full text-wood-500">{config.images.length}</span>
              </button>

              {config.albums.map((album: any) => {
                const count = config.images.filter((img: any) => img.album_slug === album.slug).length;
                return (
                  <div key={album.id} className={`group flex items-center justify-between rounded-lg py-1 px-3 transition-all ${
                    activeAlbumTab === album.slug ? 'bg-wood-100 text-wood-950 font-bold' : 'text-wood-650 hover:bg-wood-50/60'
                  }`}>
                    <button onClick={() => setActiveAlbumTab(album.slug)} className="flex-grow text-left py-1.5 flex items-center gap-2 overflow-hidden bg-transparent border-none">
                      <FolderClosed className="w-4 h-4 text-wood-400 shrink-0" />
                      <span className="truncate">{album.name}</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-wood-200/40 py-0.5 px-1 rounded-md text-wood-400">{count}</span>
                      <button onClick={() => handleDeleteAlbum(album.slug)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Images CRUD & Grid list */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="bg-white border border-wood-200/40 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <input
                  type="text"
                  placeholder="Search gallery images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-wood-500 font-sans font-semibold pl-8"
                />
                <svg className="w-4 h-4 text-wood-400 absolute left-2.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Upload block */}
              <div className="flex gap-2 items-center justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="bg-wood-800 hover:bg-wood-950 text-white border-none py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Upload className="w-4 h-4" /> Select / Add Photo
                </button>
              </div>
            </div>

            {/* Bulk Toolbar */}
            {selectedImages.length > 0 && (
              <div className="bg-wood-50 border border-wood-200/60 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-wood-800 animate-slide-up">
                <div className="flex items-center gap-2">
                  <span className="bg-gold-500 text-wood-950 font-bold px-2 py-0.5 rounded-md text-[10px]">{selectedImages.length} Selected</span>
                  <span>Bulk action:</span>
                </div>
                <div className="flex items-center gap-3.5">
                  <button onClick={() => handleBulkToggleFeatured(true)} className="text-gold-600 hover:text-gold-800 font-bold uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Feature
                  </button>
                  <button onClick={() => handleBulkToggleFeatured(false)} className="text-wood-500 hover:text-wood-700 font-bold uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer">
                    Unfeature
                  </button>
                  <div className="flex items-center gap-1.5 border-l border-wood-200 pl-3">
                    <select value={bulkActionTargetAlbum} onChange={(e) => setBulkActionTargetAlbum(e.target.value)} className="bg-white border border-wood-200 rounded py-1 px-1.5 text-[10px] focus:outline-none">
                      <option value="">Move to Album...</option>
                      {config.albums.map((a: any) => (
                        <option key={a.id} value={a.slug}>{a.name}</option>
                      ))}
                    </select>
                    <button onClick={handleBulkMove} disabled={!bulkActionTargetAlbum} className="text-wood-700 disabled:opacity-40 font-bold uppercase text-[10px] bg-transparent border-none cursor-pointer">
                      Apply
                    </button>
                  </div>
                  <button onClick={handleBulkDelete} className="text-red-500 hover:text-red-700 font-bold uppercase tracking-wider text-[10px] bg-transparent border-none cursor-pointer border-l border-wood-200 pl-3 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            )}

            {/* Images Grid */}
            {filteredImages.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-wood-200 rounded-2xl bg-wood-50/10 text-wood-500">
                {searchQuery.trim() ? 'No search matches found.' : 'No images in this album. Click "Upload Photo(s)" to fill this album.'}
              </div>
            ) : (
              <div>
                <div className="pb-3 border-b border-wood-100 flex items-center justify-between mb-4">
                  <label className="flex items-center gap-1.5 text-xs text-wood-500 font-bold uppercase cursor-pointer">
                    <input type="checkbox" checked={filteredImages.every((x: any) => selectedImages.includes(x.id))} onChange={() => selectAllFiltered(filteredImages)} className="rounded border-wood-300 text-wood-700 focus:ring-wood-500" />
                    <span>Select All Filtered</span>
                  </label>
                  <span className="text-[10px] font-bold text-wood-400 uppercase tracking-widest">{filteredImages.length} Image(s) shown</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredImages.map((img: any) => {
                    const isSelected = selectedImages.includes(img.id);
                    return (
                      <div key={img.id} className={`group rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${
                        isSelected ? 'border-gold-500 bg-gold-500/5 ring-1 ring-gold-500' : 'border-wood-200/40 bg-white hover:border-wood-300'
                      }`}>
                        <div className="h-44 relative overflow-hidden bg-wood-50">
                          <img src={img.src} alt={img.alt_text} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-wood-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={() => handleDeleteImage(img.id)} className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-105 transition-transform border-none cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Selection Checkbox */}
                          <div className="absolute top-3 left-3 z-10">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleImageSelection(img.id)}
                              className="rounded border-wood-300 text-gold-600 focus:ring-gold-500 w-4.5 h-4.5 cursor-pointer shadow-sm bg-white"
                            />
                          </div>

                          <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                            {img.is_featured && (
                              <span className="bg-gold-500 text-wood-950 font-bold uppercase tracking-wider text-[8px] px-2 py-0.5 rounded shadow-sm">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-4 flex flex-col gap-2 font-sans text-xs font-semibold">
                          <input
                            type="text"
                            value={img.title}
                            onChange={(e) => {
                              const newImages = [...config.images];
                              const imgIdx = config.images.findIndex((x: any) => x.id === img.id);
                              newImages[imgIdx].title = e.target.value;
                              triggerSaveState({ ...config, images: newImages });
                            }}
                            placeholder="Title"
                            className="w-full bg-transparent border-b border-transparent focus:border-wood-200 py-0.5 focus:outline-none font-serif text-sm font-bold text-wood-950"
                          />
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <select
                              value={img.album_slug}
                              onChange={(e) => {
                                const newImages = [...config.images];
                                const imgIdx = config.images.findIndex((x: any) => x.id === img.id);
                                newImages[imgIdx].album_slug = e.target.value;
                                triggerSaveState({ ...config, images: newImages });
                              }}
                              className="w-full bg-wood-50/50 border border-wood-200 rounded py-1 px-1 focus:outline-none"
                            >
                              <option value="">No Album</option>
                              {config.albums.map((a: any) => (
                                <option key={a.id} value={a.slug}>{a.name}</option>
                              ))}
                            </select>
                            <label className="flex items-center gap-1 cursor-pointer justify-end pr-1">
                              <input
                                type="checkbox"
                                checked={img.is_featured}
                                onChange={(e) => {
                                  const newImages = [...config.images];
                                  const imgIdx = config.images.findIndex((x: any) => x.id === img.id);
                                  newImages[imgIdx].is_featured = e.target.checked;
                                  triggerSaveState({ ...config, images: newImages });
                                }}
                                className="rounded border-wood-300 text-wood-700 focus:ring-wood-500"
                              />
                              <span className="text-[9px] uppercase font-bold text-wood-500">Feature</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Album Modal Popup */}
      {showAddAlbumModal && (
        <div className="fixed inset-0 z-50 bg-wood-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-wood-200/40 shadow-2xl max-w-sm w-full animate-zoom-in font-sans text-xs font-semibold text-wood-800">
            <h4 className="font-serif text-lg font-bold text-wood-950 mb-4">Create New Album</h4>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-wood-500">Album Name</label>
                <input
                  type="text"
                  placeholder="e.g. Completed Projects"
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase tracking-wider text-wood-500">URL Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. completed-projects"
                  value={newAlbumSlug}
                  onChange={(e) => setNewAlbumSlug(e.target.value)}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button onClick={() => setShowAddAlbumModal(false)} className="border border-wood-200 hover:bg-wood-50 py-2 px-4 rounded-xl font-bold uppercase tracking-wider bg-white cursor-pointer text-wood-700">Cancel</button>
                <button onClick={handleAddAlbum} className="bg-wood-800 hover:bg-wood-950 py-2 px-4 rounded-xl font-bold uppercase tracking-wider text-white cursor-pointer border-none">Create Album</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MediaLibraryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          const newImages = [...config.images];
          newImages.push({
            id: `img_${Date.now()}`,
            title: 'Gallery Item',
            desc: '',
            album_slug: activeAlbumTab !== 'all' ? activeAlbumTab : '',
            src: url,
            alt_text: 'Gallery Item',
            is_featured: false,
            sort_order: newImages.length + 1,
            upload_date: new Date().toISOString().split('T')[0]
          });
          triggerSaveState({
            ...config,
            images: newImages
          });
        }}
        defaultFolder="Gallery"
      />
    </div>
  );
};

export default GalleryPage;
