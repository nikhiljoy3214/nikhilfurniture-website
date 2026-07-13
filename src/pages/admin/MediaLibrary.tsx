import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { SEO } from '../../components/SEO';
import { Trash2, FolderClosed, Image as ImageIcon, Upload, Search, Copy, Check, HardDrive, RefreshCw, Crop, RotateCw, FlipHorizontal } from 'lucide-react';

interface MediaAsset {
  id: string;
  filename: string;
  src: string;
  folder: string;
  dimensions: { width: number; height: number };
  fileSize: number;
  uploadDate: string;
  altText: string;
  title: string;
  tags: string[];
}

const defaultMediaList: MediaAsset[] = [
  { id: 'm1', filename: 'sofa.jpg', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', folder: 'Homepage', dimensions: { width: 1200, height: 800 }, fileSize: 184200, uploadDate: '2026-07-12', altText: 'Sofa set', title: 'Sofa Set Banner', tags: ['sofa', 'homepage'] },
  { id: 'm2', filename: 'dining.jpg', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', folder: 'Products', dimensions: { width: 1200, height: 800 }, fileSize: 215000, uploadDate: '2026-07-12', altText: 'Teak dining set', title: 'Teak Dining Set', tags: ['dining', 'teak'] },
  { id: 'm3', filename: 'bed.jpg', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg', folder: 'Products', dimensions: { width: 1200, height: 800 }, fileSize: 198000, uploadDate: '2026-07-12', altText: 'Royal bed cot', title: 'Royal King Size Cot', tags: ['bed', 'cot'] },
  { id: 'm4', filename: 'wardrobe.jpg', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg', folder: 'Products', dimensions: { width: 1200, height: 800 }, fileSize: 220000, uploadDate: '2026-07-12', altText: 'Premium Teak Wardrobe', title: 'Teak Wardrobe Unit', tags: ['wardrobe', 'cabinet'] }
];

export const MediaLibrary: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  
  // Selection
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Usage tracking
  const [assetUsage, setAssetUsage] = useState<string[]>([]);

  const [uploadFolder, setUploadFolder] = useState('General');
  
  // Image Replacement states
  const [replacingAsset, setReplacingAsset] = useState<MediaAsset | null>(null);

  // Crop / Edit Tool inside dashboard
  const [editMode, setEditMode] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const folders = ['All', 'Products', 'Homepage', 'Gallery', 'Testimonials', 'About', 'Manufacturing', 'General'];

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'media_library')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data && data.value && Array.isArray(data.value.images)) {
        setMediaList(data.value.images);
      } else {
        await supabase
          .from('site_settings')
          .upsert([{ key: 'media_library', value: { images: defaultMediaList } }]);
        setMediaList(defaultMediaList);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Sync details on asset select
  useEffect(() => {
    if (selectedAsset) {
      scanAssetUsage(selectedAsset.src);
    } else {
      setAssetUsage([]);
    }
  }, [selectedAsset]);

  // Scan Usage Detection
  const scanAssetUsage = async (src: string) => {
    const usage: string[] = [];
    try {
      // 1. Categories
      const { data: cats } = await supabase.from('categories').select('name');
      if (cats) {
        cats.forEach((c: any) => {
          if (c.thumbnail_image === src || c.banner_image === src) {
            usage.push(`Category: ${c.name}`);
          }
        });
      }

      // 2. Products
      const { data: prods } = await supabase.from('products').select('name, featured_image, gallery_images');
      if (prods) {
        prods.forEach((p: any) => {
          if (p.featured_image === src) {
            usage.push(`Product Hero: ${p.name}`);
          }
          if (Array.isArray(p.gallery_images) && p.gallery_images.includes(src)) {
            usage.push(`Product Gallery: ${p.name}`);
          }
        });
      }

      // 3. Site Settings (About, Mfg, Gallery etc)
      const { data: settings } = await supabase.from('site_settings').select('key, value');
      if (settings) {
        settings.forEach((s: any) => {
          if (s.value && s.key !== 'media_library') {
            const strVal = JSON.stringify(s.value);
            if (strVal.includes(src)) {
              usage.push(`CMS: ${s.key.replace('_page', '').replace('_module', '').toUpperCase()}`);
            }
          }
        });
      }
    } catch (err) {
      console.error('Error checking usage:', err);
    }
    setAssetUsage(usage);
  };

  // Upload New Files
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const file = files[0];
      
      // Auto convert to WebP using Canvas if image is PNG/JPG
      const fileExt = 'webp';
      const fileName = `${Date.now()}_lib_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Load image
      const img = new Image();
      const reader = new FileReader();
      
      const loadedImageSrc: string = await new Promise((resolve) => {
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });
      
      img.src = loadedImageSrc;
      await new Promise((resolve) => img.onload = resolve);
      
      // Draw to Canvas for compression
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      
      const blob: Blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/webp', 0.85);
      });

      const { error: uploadError } = await supabase.storage
        .from('furniture')
        .upload(fileName, blob, { contentType: 'image/webp' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('furniture')
        .getPublicUrl(fileName);

      const newAsset: MediaAsset = {
        id: `m_${Date.now()}`,
        filename: fileName,
        src: publicUrl,
        folder: uploadFolder,
        dimensions: { width: img.width, height: img.height },
        fileSize: blob.size,
        uploadDate: new Date().toISOString().split('T')[0],
        altText: file.name.split('.')[0],
        title: file.name.split('.')[0],
        tags: [uploadFolder.toLowerCase()]
      };

      const updated = [newAsset, ...mediaList];
      await supabase
        .from('site_settings')
        .upsert([{ key: 'media_library', value: { images: updated } }]);

      setMediaList(updated);
      alert('Upload completed and optimized to WebP successfully!');
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }
  };

  // Replace Asset File (Keeps the same storage path and filename reference!)
  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !replacingAsset) return;

    try {
      const file = files[0];
      const targetFilename = replacingAsset.filename;

      // Supabase overwrite
      const { error: uploadError } = await supabase.storage
        .from('furniture')
        .upload(targetFilename, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;

      // Force refresh catalog values
      alert('Asset replaced successfully! Browser caches for this URL have been updated.');
      setReplacingAsset(null);
      fetchCatalog();
    } catch (err: any) {
      alert(`Replacement failed: ${err.message}`);
    }
  };

  // Save Crop edits
  const handleSaveCrop = async () => {
    if (!editingAsset || !canvasRef.current) return;
    
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Enable CORS
      img.src = editingAsset.src;
      await new Promise((resolve) => img.onload = resolve);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context missing');

      const sX = (cropLeft / 100) * img.width;
      const sY = (cropTop / 100) * img.height;
      const sW = img.width - sX - ((cropRight / 100) * img.width);
      const sH = img.height - sY - ((cropBottom / 100) * img.height);

      const isRotated = rotation % 180 !== 0;
      const finalW = isRotated ? sH : sW;
      const finalH = isRotated ? sW : sH;

      canvas.width = finalW;
      canvas.height = finalH;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (flipH) ctx.scale(-1, 1);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, sX, sY, sW, sH, -sW / 2, -sH / 2, sW, sH);

      const blob: Blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/webp', 0.85);
      });

      // Overwrite the same filename in storage
      const { error: uploadError } = await supabase.storage
        .from('furniture')
        .upload(editingAsset.filename, blob, { contentType: 'image/webp', upsert: true });

      if (uploadError) throw uploadError;

      // Update meta in media catalogue
      const newImages = mediaList.map((item) => {
        if (item.id === editingAsset.id) {
          return {
            ...item,
            dimensions: { width: Math.round(finalW), height: Math.round(finalH) },
            fileSize: blob.size
          };
        }
        return item;
      });

      await supabase
        .from('site_settings')
        .upsert([{ key: 'media_library', value: { images: newImages } }]);

      setMediaList(newImages);
      alert('Asset edited and saved successfully!');
      setEditMode(false);
      setEditingAsset(null);
    } catch (err: any) {
      alert(`Crop failed: ${err.message}`);
    }
  };

  // Safe Delete Asset
  const handleDeleteAsset = async (asset: MediaAsset) => {
    // 1. Scan usage
    await scanAssetUsage(asset.src);

    if (assetUsage.length > 0) {
      alert(`SAFETY WARNING:\nThis image is currently used in:\n${assetUsage.join('\n')}\n\nYou must replace references before deleting this asset.`);
      return;
    }

    if (window.confirm(`Delete "${asset.filename}" permanently from the storage and library?`)) {
      try {
        // Delete from Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('furniture')
          .remove([asset.filename]);

        if (storageError) throw storageError;

        // Delete from catalogue
        const updated = mediaList.filter(x => x.id !== asset.id);
        await supabase
          .from('site_settings')
          .upsert([{ key: 'media_library', value: { images: updated } }]);

        setMediaList(updated);
        setSelectedAsset(null);
        alert('Asset successfully deleted!');
      } catch (err: any) {
        alert(`Delete failed: ${err.message}`);
      }
    }
  };

  const copyUrl = (src: string, id: string) => {
    navigator.clipboard.writeText(src);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate statistics
  const totalCount = mediaList.length;
  const storageUsedBytes = mediaList.reduce((acc, x) => acc + (x.fileSize || 0), 0);
  const storageUsedMB = (storageUsedBytes / (1024 * 1024)).toFixed(2);

  const filteredList = mediaList.filter((item) => {
    if (selectedFolder !== 'All' && item.folder !== selectedFolder) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.filename.toLowerCase().includes(q) ||
        (item.altText || '').toLowerCase().includes(q) ||
        (item.title || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-wood-200/40 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-wood-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none font-sans pb-16 font-semibold text-xs text-wood-700">
      <SEO title="Centralized Media Library | Nikhil Furniture" description="Manage media assets." />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-wood-200/60 font-sans text-xs">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-serif text-2xl font-bold text-wood-950">Centralized Media Library</h2>
          <p className="text-xs text-wood-500 font-sans font-normal">Centralized source of truth for products, timeline milestones, sliders, and testimonial customer avatars</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-wood-400 font-bold uppercase">Folder:</span>
            <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} className="bg-white border border-wood-200 rounded-lg py-1.5 px-3 focus:outline-none">
              {folders.filter(x => x !== 'All').map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <label className="bg-wood-800 hover:bg-wood-950 text-white border-none py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> Upload & Optimize
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Storage stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-wood-200/40 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-wood-100 flex items-center justify-center text-wood-800 shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-wood-400 uppercase">Total Files</span>
            <div className="font-serif text-xl font-bold text-wood-950 mt-0.5">{totalCount}</div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-wood-200/40 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-wood-100 flex items-center justify-center text-wood-800 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-wood-400 uppercase">Storage Used</span>
            <div className="font-serif text-xl font-bold text-wood-950 mt-0.5">{storageUsedMB} MB</div>
          </div>
        </div>
      </div>

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Folders List Left */}
        <div className="lg:col-span-3 bg-white border border-wood-200/40 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <span className="text-[10px] font-bold uppercase text-wood-500 tracking-wider">Library Folders</span>
          <div className="flex flex-col gap-1.5 font-semibold text-xs">
            {folders.map(f => {
              const count = f === 'All' ? totalCount : mediaList.filter(x => x.folder === f).length;
              return (
                <button key={f} onClick={() => setSelectedFolder(f)} className={`text-left py-2 px-3 rounded-lg flex items-center gap-2 border-none cursor-pointer transition-all ${
                  selectedFolder === f ? 'bg-wood-100 text-wood-950' : 'text-wood-600 hover:bg-wood-50/60'
                }`}>
                  <FolderClosed className="w-4 h-4 text-wood-400 shrink-0" />
                  <span>{f}</span>
                  <span className="ml-auto text-[9px] bg-wood-200/50 py-0.5 px-1.5 rounded-full text-wood-500">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Media Grid Right */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="bg-white border border-wood-200/40 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 text-xs pl-8 focus:outline-none"
              />
              <Search className="w-4 h-4 text-wood-400 absolute left-2.5 top-2.5" />
            </div>

            {filteredList.length === 0 ? (
              <div className="p-12 text-center text-wood-500 border border-dashed border-wood-200 rounded-2xl bg-wood-50/10">
                No media assets found matching filters.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {filteredList.map((asset) => (
                  <div key={asset.id} className="group rounded-xl border border-wood-200/40 overflow-hidden flex flex-col justify-between hover:border-wood-400 bg-white">
                    <div className="aspect-square bg-wood-50 relative overflow-hidden flex items-center justify-center">
                      <img src={asset.src} alt={asset.altText} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-wood-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button onClick={() => copyUrl(asset.src, asset.id)} className="w-8 h-8 rounded-full bg-white text-wood-800 hover:scale-105 transition-transform flex items-center justify-center border-none cursor-pointer" title="Copy URL">
                          {copiedId === asset.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button onClick={() => { setEditingAsset(asset); setEditMode(true); setRotation(0); setFlipH(false); setCropLeft(0); setCropRight(0); setCropTop(0); setCropBottom(0); }} className="w-8 h-8 rounded-full bg-white text-wood-800 hover:scale-105 transition-transform flex items-center justify-center border-none cursor-pointer" title="Crop & Edit">
                          <Crop className="w-4 h-4" />
                        </button>
                        <label className="w-8 h-8 rounded-full bg-white text-wood-800 hover:scale-105 transition-transform flex items-center justify-center border-none cursor-pointer" title="Replace File">
                          <RefreshCw className="w-4 h-4" />
                          <input type="file" onChange={(e) => { setReplacingAsset(asset); handleReplaceFile(e); }} className="hidden" />
                        </label>
                        <button onClick={() => handleDeleteAsset(asset)} className="w-8 h-8 rounded-full bg-red-500 text-white hover:scale-105 transition-transform flex items-center justify-center border-none cursor-pointer" title="Delete File">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 text-[10px] flex flex-col gap-1 border-t border-wood-100/50">
                      <span className="font-serif font-bold text-wood-950 truncate">{asset.title}</span>
                      <div className="text-wood-400 flex justify-between">
                        <span>{asset.dimensions?.width}x{asset.dimensions?.height} px</span>
                        <span>{Math.round(asset.fileSize / 1024)} KB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Canvas Cropper Modal */}
      {editMode && editingAsset && (
        <div className="fixed inset-0 z-50 bg-wood-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border border-wood-200/40 shadow-2xl max-w-lg w-full animate-zoom-in font-sans text-xs font-semibold text-wood-700">
            <h4 className="font-serif text-base font-bold text-wood-950 mb-4 pb-2 border-b border-wood-100">Crop & Edit Image</h4>
            
            <div className="flex flex-col gap-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border bg-wood-50 flex items-center justify-center relative">
                <div style={{
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                  transition: 'transform 0.2s ease-out'
                }}>
                  <img src={editingAsset.src} alt="Edit preview" className="max-h-56 max-w-full object-contain" />
                  <div className="absolute border border-gold-500 pointer-events-none" style={{
                    left: `${cropLeft}%`,
                    top: `${cropTop}%`,
                    right: `${cropRight}%`,
                    bottom: `${cropBottom}%`
                  }} />
                </div>
              </div>

              {/* Sliders and Rotate */}
              <div className="flex justify-between items-center gap-4">
                <button onClick={() => setRotation(r => (r + 90) % 360)} className="bg-wood-100 hover:bg-wood-200 py-1.5 px-3 rounded-lg border-none cursor-pointer flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                </button>
                <button onClick={() => setFlipH(f => !f)} className="bg-wood-100 hover:bg-wood-200 py-1.5 px-3 rounded-lg border-none cursor-pointer flex items-center gap-1.5">
                  <FlipHorizontal className="w-3.5 h-3.5" /> Flip Horiz
                </button>
              </div>

              <div className="border border-wood-100 p-3.5 rounded-2xl flex flex-col gap-2 bg-wood-50/20">
                <span className="text-[10px] uppercase text-wood-400 font-bold">Crop Margins (%)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label>Left: {cropLeft}%</label>
                    <input type="range" min="0" max="45" value={cropLeft} onChange={(e) => setCropLeft(Number(e.target.value))} className="w-full accent-wood-700" />
                  </div>
                  <div>
                    <label>Right: {cropRight}%</label>
                    <input type="range" min="0" max="45" value={cropRight} onChange={(e) => setCropRight(Number(e.target.value))} className="w-full accent-wood-700" />
                  </div>
                  <div>
                    <label>Top: {cropTop}%</label>
                    <input type="range" min="0" max="45" value={cropTop} onChange={(e) => setCropTop(Number(e.target.value))} className="w-full accent-wood-700" />
                  </div>
                  <div>
                    <label>Bottom: {cropBottom}%</label>
                    <input type="range" min="0" max="45" value={cropBottom} onChange={(e) => setCropBottom(Number(e.target.value))} className="w-full accent-wood-700" />
                  </div>
                </div>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex justify-end gap-2 pt-2 border-t border-wood-100">
                <button onClick={() => { setEditMode(false); setEditingAsset(null); }} className="border border-wood-200 hover:bg-wood-50 py-2 px-4 rounded-xl font-bold uppercase tracking-wider bg-white cursor-pointer text-wood-650">Cancel</button>
                <button onClick={handleSaveCrop} className="bg-wood-800 hover:bg-wood-950 py-2 px-5 rounded-xl font-bold uppercase tracking-wider text-white cursor-pointer border-none">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MediaLibrary;
