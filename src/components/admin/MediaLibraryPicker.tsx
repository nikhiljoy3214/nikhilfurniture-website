import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, FolderClosed, Image as ImageIcon, Upload, X, RotateCw, FlipHorizontal, Check, RefreshCw } from 'lucide-react';

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

interface MediaLibraryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  defaultFolder?: string;
}

const defaultMediaList: MediaAsset[] = [
  { id: 'm1', filename: 'sofa.jpg', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', folder: 'Homepage', dimensions: { width: 1200, height: 800 }, fileSize: 184200, uploadDate: '2026-07-12', altText: 'Sofa set', title: 'Sofa Set Banner', tags: ['sofa', 'homepage'] },
  { id: 'm2', filename: 'dining.jpg', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', folder: 'Products', dimensions: { width: 1200, height: 800 }, fileSize: 215000, uploadDate: '2026-07-12', altText: 'Teak dining set', title: 'Teak Dining Set', tags: ['dining', 'teak'] },
  { id: 'm3', filename: 'bed.jpg', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg', folder: 'Products', dimensions: { width: 1200, height: 800 }, fileSize: 198000, uploadDate: '2026-07-12', altText: 'Royal bed cot', title: 'Royal King Size Cot', tags: ['bed', 'cot'] },
  { id: 'm4', filename: 'wardrobe.jpg', src: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg', folder: 'Products', dimensions: { width: 1200, height: 800 }, fileSize: 220000, uploadDate: '2026-07-12', altText: 'Premium Teak Wardrobe', title: 'Teak Wardrobe Unit', tags: ['wardrobe', 'cabinet'] }
];

export const MediaLibraryPicker: React.FC<MediaLibraryPickerProps> = ({ isOpen, onClose, onSelect, defaultFolder = 'General' }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [uploadFolder, setUploadFolder] = useState<string>(defaultFolder);
  const [uploadAlt, setUploadAlt] = useState<string>('');
  const [uploadTitle, setUploadTitle] = useState<string>('');

  // Editing States (Canvas Crop/Rotate/Flip)
  const [editedImageSrc, setEditedImageSrc] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  
  // Crop percentages
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const folders = ['All', 'Products', 'Homepage', 'Gallery', 'Testimonials', 'About', 'Manufacturing', 'General'];

  const fetchMediaCatalog = async () => {
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
      console.error('Error fetching media catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMediaCatalog();
      setActiveTab('browse');
      setSelectedAsset(null);
      setUploadFile(null);
    }
  }, [isOpen]);

  // Load selected file into editor
  useEffect(() => {
    if (uploadFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setEditedImageSrc(e.target.result as string);
          setUploadTitle(uploadFile.name.split('.')[0]);
          setUploadAlt(uploadFile.name.split('.')[0]);
          setRotation(0);
          setFlipH(false);
          setCropLeft(0);
          setCropRight(0);
          setCropTop(0);
          setCropBottom(0);
        }
      };
      reader.readAsDataURL(uploadFile);
    }
  }, [uploadFile]);

  // Apply edits and upload WebP
  const handleEditAndUpload = async () => {
    if (!uploadFile || !editedImageSrc) return;
    setUploading(true);
    setUploadProgress(20);

    try {
      const img = new Image();
      img.src = editedImageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas ref missing');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context missing');

      // Calculate source crop coordinates
      const sX = (cropLeft / 100) * img.width;
      const sY = (cropTop / 100) * img.height;
      const sW = img.width - sX - ((cropRight / 100) * img.width);
      const sH = img.height - sY - ((cropBottom / 100) * img.height);

      // Rotate dimensions check
      const isRotated = rotation % 180 !== 0;
      const finalW = isRotated ? sH : sW;
      const finalH = isRotated ? sW : sH;

      canvas.width = finalW;
      canvas.height = finalH;

      // Translate context to center for rotations
      ctx.translate(canvas.width / 2, canvas.height / 2);

      if (flipH) {
        ctx.scale(-1, 1);
      }

      ctx.rotate((rotation * Math.PI) / 180);

      // Draw cropped slice
      ctx.drawImage(
        img,
        sX,
        sY,
        sW,
        sH,
        -sW / 2,
        -sH / 2,
        sW,
        sH
      );

      setUploadProgress(50);

      // Export canvas to compressed WebP blob
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('WebP blob generation failed'));
          },
          'image/webp',
          0.85
        );
      });

      setUploadProgress(70);

      // Supabase Storage upload
      const fileExt = 'webp';
      const fileName = `${Date.now()}_library_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('furniture')
        .upload(filePath, blob, { contentType: 'image/webp' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('furniture')
        .getPublicUrl(filePath);

      setUploadProgress(90);

      // Save to media library database catalogue
      const newAsset: MediaAsset = {
        id: `m_${Date.now()}`,
        filename: fileName,
        src: publicUrl,
        folder: uploadFolder,
        dimensions: { width: Math.round(finalW), height: Math.round(finalH) },
        fileSize: blob.size,
        uploadDate: new Date().toISOString().split('T')[0],
        altText: uploadAlt.trim() || fileName,
        title: uploadTitle.trim() || fileName.split('.')[0],
        tags: [uploadFolder.toLowerCase()]
      };

      const updatedImages = [newAsset, ...mediaList];
      await supabase
        .from('site_settings')
        .upsert([{ key: 'media_library', value: { images: updatedImages } }]);

      setMediaList(updatedImages);
      setUploadProgress(100);
      alert('Image successfully optimized to WebP and saved!');
      
      // Auto select and trigger onSelect
      onSelect(publicUrl);
      onClose();
    } catch (err: any) {
      alert(`Optimization & Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadFile(null);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-wood-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-wood-200/40 shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden animate-zoom-in font-sans text-xs font-semibold text-wood-700 select-none">
        
        {/* Modal Header */}
        <div className="h-14 border-b border-wood-100 px-6 flex items-center justify-between shrink-0">
          <span className="font-serif text-base font-bold text-wood-950">Select Media Asset</span>
          <button onClick={onClose} className="text-wood-400 hover:text-wood-800 bg-transparent border-none cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-wood-50/50 border-b border-wood-100 px-6 py-2 flex items-center gap-4 shrink-0">
          <button onClick={() => { setActiveTab('browse'); }} className={`py-1.5 px-3 rounded-lg border-none cursor-pointer ${
            activeTab === 'browse' ? 'bg-wood-800 text-white' : 'bg-white hover:bg-wood-100 text-wood-650 border border-wood-200'
          }`}>
            Choose from Library
          </button>
          <button onClick={() => { setActiveTab('upload'); }} className={`py-1.5 px-3 rounded-lg border-none cursor-pointer ${
            activeTab === 'upload' ? 'bg-wood-800 text-white' : 'bg-white hover:bg-wood-100 text-wood-650 border border-wood-200'
          }`}>
            Upload New File
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex overflow-hidden min-h-0">
          
          {/* Tab 1: BROWSE MEDIA */}
          {activeTab === 'browse' && (
            <div className="flex-grow flex overflow-hidden min-h-0 w-full">
              {/* Folder Selector Sidebar */}
              <div className="w-48 border-r border-wood-100 p-4 overflow-y-auto hidden sm:flex flex-col gap-1 shrink-0">
                <span className="text-[9px] uppercase tracking-wider text-wood-400 mb-2 font-bold">Media Folders</span>
                {folders.map((f) => (
                  <button key={f} onClick={() => setSelectedFolder(f)} className={`text-left py-1.5 px-2.5 rounded-lg flex items-center gap-2 border-none cursor-pointer transition-colors ${
                    selectedFolder === f ? 'bg-wood-100 text-wood-950 font-bold' : 'text-wood-600 hover:bg-wood-50'
                  }`}>
                    <FolderClosed className="w-3.5 h-3.5 text-wood-400 shrink-0" />
                    <span className="truncate">{f}</span>
                  </button>
                ))}
              </div>

              {/* Grid content */}
              <div className="flex-grow flex flex-col overflow-hidden p-6 gap-4 min-w-0">
                <div className="relative max-w-sm w-full shrink-0">
                  <input
                    type="text"
                    placeholder="Search image filename, title, or alt text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 pl-8 text-xs focus:outline-none focus:border-wood-500 font-semibold"
                  />
                  <Search className="w-4 h-4 text-wood-400 absolute left-2.5 top-2.5" />
                </div>

                {loading ? (
                  <div className="flex-grow flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-wood-600 animate-spin" />
                  </div>
                ) : filteredList.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-wood-450 gap-2">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                    <span>No matching assets inside the Media Library.</span>
                  </div>
                ) : (
                  <div className="flex-grow overflow-y-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pr-2">
                    {filteredList.map((asset) => {
                      const isSelected = selectedAsset?.id === asset.id;
                      return (
                        <div key={asset.id} onClick={() => setSelectedAsset(asset)} className={`rounded-xl border overflow-hidden aspect-square relative bg-wood-50 cursor-pointer flex items-center justify-center transition-all ${
                          isSelected ? 'border-gold-500 bg-gold-500/5 ring-2 ring-gold-500 scale-[0.98]' : 'border-wood-250/30 hover:border-wood-400'
                        }`}>
                          <img src={asset.src} alt={asset.altText} className="w-full h-full object-cover" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Asset Info Sidebar */}
              <div className="w-64 border-l border-wood-100 p-5 overflow-y-auto shrink-0 flex flex-col justify-between h-full bg-wood-50/20">
                {selectedAsset ? (
                  <div className="flex flex-col gap-4">
                    <span className="text-[9px] uppercase tracking-wider text-wood-400 font-bold">Asset Meta Detail</span>
                    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border bg-white shadow-sm">
                      <img src={selectedAsset.src} alt={selectedAsset.altText} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-2 font-semibold">
                      <div className="truncate"><span className="text-wood-400">File:</span> {selectedAsset.filename}</div>
                      <div><span className="text-wood-400">Resolution:</span> {selectedAsset.dimensions?.width}x{selectedAsset.dimensions?.height} px</div>
                      <div><span className="text-wood-400">Size:</span> {Math.round(selectedAsset.fileSize / 1024)} KB</div>
                      <div><span className="text-wood-400">Folder:</span> {selectedAsset.folder}</div>
                      <div><span className="text-wood-400">Alt Text:</span> {selectedAsset.altText}</div>
                    </div>
                    <button onClick={() => { onSelect(selectedAsset.src); onClose(); }} className="w-full bg-wood-800 hover:bg-wood-950 text-white py-2.5 rounded-xl uppercase tracking-wider text-[10px] font-bold border-none cursor-pointer mt-4 flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> Use Selected Image
                    </button>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-center text-wood-400">
                    Select a thumbnail from the grid to view details.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: UPLOAD & CROP */}
          {activeTab === 'upload' && (
            <div className="flex-grow flex flex-col sm:flex-row overflow-hidden min-h-0 w-full p-6 gap-6">
              
              {/* Drag Zone or Editor Canvas */}
              <div className="flex-grow bg-wood-50/50 border border-dashed border-wood-200 rounded-3xl overflow-hidden flex flex-col items-center justify-center relative min-h-[300px]">
                
                {!uploadFile ? (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-wood-100 flex items-center justify-center text-wood-650 mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-wood-900 font-serif text-sm font-bold">Drag & Drop Image here</span>
                    <span className="text-wood-500 font-normal">Supports PNG, JPG, JPEG up to 8MB</span>
                    <label className="bg-wood-800 hover:bg-wood-950 text-white py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-2">
                      Browse Files
                      <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setUploadFile(e.target.files[0]); }} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col p-4 gap-4 overflow-hidden justify-between">
                    <div className="flex-grow flex items-center justify-center overflow-hidden bg-white rounded-2xl relative border shadow-sm max-h-[70%]">
                      
                      {/* Interactive Edit Preview */}
                      <div className="relative" style={{
                        transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                        transition: 'transform 0.2s ease-out'
                      }}>
                        <img src={editedImageSrc} alt="Preview" className="max-h-56 max-w-full object-contain" />
                        
                        {/* Overlay Crop box visualization */}
                        <div className="absolute border-2 border-gold-500 pointer-events-none" style={{
                          left: `${cropLeft}%`,
                          top: `${cropTop}%`,
                          right: `${cropRight}%`,
                          bottom: `${cropBottom}%`,
                        }} />
                      </div>
                    </div>

                    {/* Controls Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 border border-wood-200/60 rounded-2xl">
                      <div className="flex items-center gap-3.5">
                        <button onClick={() => setRotation(r => (r + 90) % 360)} className="bg-wood-100 hover:bg-wood-200 py-1.5 px-3 rounded-lg border-none cursor-pointer flex items-center gap-1">
                          <RotateCw className="w-4 h-4" /> Rotate 90°
                        </button>
                        <button onClick={() => setFlipH(f => !f)} className="bg-wood-100 hover:bg-wood-200 py-1.5 px-3 rounded-lg border-none cursor-pointer flex items-center gap-1">
                          <FlipHorizontal className="w-4 h-4" /> Flip Horiz
                        </button>
                        <button onClick={() => { setCropLeft(0); setCropRight(0); setCropTop(0); setCropBottom(0); setRotation(0); setFlipH(false); }} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">
                          Reset Edits
                        </button>
                      </div>
                      
                      {/* Hidden output canvas */}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </div>
                )}
              </div>

              {/* Upload settings Sidebar */}
              <div className="w-72 flex flex-col gap-4 font-sans shrink-0 overflow-y-auto max-h-full pr-1.5 scrollbar-thin">
                <span className="text-[9px] uppercase tracking-wider text-wood-400 font-bold border-b border-wood-100 pb-2">Image Info & Destination</span>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase text-wood-500">Destination Folder</label>
                  <select value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none">
                    {folders.filter(x => x !== 'All').map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase text-wood-500">Asset Title</label>
                  <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. Teak Sofa Front" className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase text-wood-500">Alt Text (Accessibility)</label>
                  <input type="text" value={uploadAlt} onChange={(e) => setUploadAlt(e.target.value)} placeholder="Describe the image content..." className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2 px-3 focus:outline-none" />
                </div>

                {/* Range Sliders for Slit Cropping */}
                {uploadFile && (
                  <div className="border border-wood-100 p-3.5 rounded-2xl flex flex-col gap-2.5 bg-wood-50/20">
                    <span className="text-[9px] uppercase text-wood-400 font-bold">Crop Margins (%)</span>
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
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
                )}

                {uploading && (
                  <div className="flex flex-col gap-1 font-sans text-xs">
                    <div className="flex justify-between font-bold text-wood-700">
                      <span>Optimizing to WebP...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-wood-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gold-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-auto">
                  <button onClick={() => { setUploadFile(null); }} className="border border-wood-200 hover:bg-wood-50 py-2 px-4 rounded-xl font-bold uppercase tracking-wider bg-white cursor-pointer text-wood-650 flex-grow">
                    Cancel
                  </button>
                  <button onClick={handleEditAndUpload} disabled={!uploadFile || uploading} className="bg-wood-850 hover:bg-wood-950 text-white py-2 px-5 rounded-xl font-bold uppercase tracking-wider cursor-pointer border-none flex-grow disabled:opacity-50">
                    {uploading ? 'Processing...' : 'Upload Asset'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default MediaLibraryPicker;
