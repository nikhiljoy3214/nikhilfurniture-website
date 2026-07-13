import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import {
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Settings,
  DollarSign,
  Search,
  SlidersHorizontal,
  Eye,
  Copy,
  AlertCircle,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { MediaLibraryPicker } from './MediaLibraryPicker';

interface ProductEditorProps {
  product: Product | null; // Null means creating new product
  allProducts: Product[];   // Used for Related Products dropdown list
  categories: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<Product>) => Promise<void>;
  onImageUpload: (file: File, type: 'featured' | 'gallery') => Promise<string>;
  onDuplicate: (product: Product) => void;
}

type TabType = 'general' | 'images' | 'specifications' | 'pricing' | 'seo' | 'related' | 'visibility';

export const ProductEditor: React.FC<ProductEditorProps> = ({
  product,
  allProducts,
  categories,
  isOpen,
  onClose,
  onSave,
  onDuplicate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- FORM STATES ---
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [shortDesc, setShortDesc] = useState('');
  const [detailedDesc, setDetailedDesc] = useState('');
  const [category, setCategory] = useState('Wooden Sofa Sets');
  const [tagsInput, setTagsInput] = useState('');

  // Images State
  const [featuredImage, setFeaturedImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Specs State (Warranty, Care etc will be saved inside the specifications JSONB column)
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('Genuine Hardwood');
  const [finish, setFinish] = useState('Natural Matte');
  const [woodType, setWoodType] = useState('Premium Teak Wood');
  const [warranty, setWarranty] = useState('5 Years Manufacturing Warranty');
  const [careInstructions, setCareInstructions] = useState('Wipe with dry microfiber cloth. Avoid exposure to direct water.');
  const [availability, setAvailability] = useState('In Stock');
  const [customizable, setCustomizable] = useState('Yes');
  const [deliveryInfo, setDeliveryInfo] = useState('Delivered in protective crates in 10-15 business days across Kerala.');
  const [customSpecs, setCustomSpecs] = useState(''); // Textarea of 'Key: Value' for custom key/values

  // Pricing State
  const [basePrice, setBasePrice] = useState<number>(25000);
  const [woodPrices, setWoodPrices] = useState<Record<string, number>>({});

  // Variant Pricing Matrix States
  const [isMatrixPricing, setIsMatrixPricing] = useState<boolean>(false);
  const [matrixAttributes, setMatrixAttributes] = useState<{ name: string; values: string[]; rawInput?: string }[]>([]);
  const [matrixCombinations, setMatrixCombinations] = useState<{ attributes: Record<string, string>; price: number }[]>([]);

  const getCombinationKey = (comboAttrs: Record<string, string>) => {
    return Object.entries(comboAttrs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
  };

  const generateCombinations = (attributes: { name: string; values: string[] }[]) => {
    const filtered = attributes.filter(a => a.name.trim() !== '' && a.values.length > 0);
    if (filtered.length === 0) return [];
    
    let results: Record<string, string>[] = [{}];
    
    filtered.forEach(attr => {
      const temp: Record<string, string>[] = [];
      results.forEach(res => {
        attr.values.forEach(val => {
          if (val.trim() !== '') {
            temp.push({
              ...res,
              [attr.name]: val.trim()
            });
          }
        });
      });
      results = temp;
    });
    
    return results;
  };

  const handleAttributesChange = (newAttributes: { name: string; values: string[]; rawInput?: string }[]) => {
    setMatrixAttributes(newAttributes);
    
    // Generate new combinations
    const newCombos = generateCombinations(newAttributes);
    
    // Map existing prices
    const existingPrices: Record<string, number> = {};
    matrixCombinations.forEach(c => {
      existingPrices[getCombinationKey(c.attributes)] = c.price;
    });
    
    // Build new combinations array with default or existing price
    const updatedCombos = newCombos.map(combo => {
      const key = getCombinationKey(combo);
      return {
        attributes: combo,
        price: existingPrices[key] !== undefined ? existingPrices[key] : 10000
      };
    });
    
    setMatrixCombinations(updatedCombos);
    setIsDirty(true);
  };

  const addMatrixAttribute = () => {
    handleAttributesChange([
      ...matrixAttributes,
      { name: 'New Attribute', values: ['Option 1', 'Option 2'], rawInput: 'Option 1, Option 2' }
    ]);
  };

  const removeMatrixAttribute = (index: number) => {
    handleAttributesChange(matrixAttributes.filter((_, i) => i !== index));
  };

  const updateMatrixAttributeName = (index: number, newName: string) => {
    const updated = matrixAttributes.map((a, i) => i === index ? { ...a, name: newName } : a);
    handleAttributesChange(updated);
  };

  const updateMatrixAttributeValues = (index: number, valuesStr: string) => {
    const values = valuesStr.split(',').map(v => v.trim()).filter(Boolean);
    const updated = matrixAttributes.map((a, i) => i === index ? { ...a, values, rawInput: valuesStr } : a);
    handleAttributesChange(updated);
  };

  const updateCombinationPrice = (comboIndex: number, newPrice: number) => {
    setMatrixCombinations(prev => prev.map((c, i) => i === comboIndex ? { ...c, price: newPrice } : c));
    setIsDirty(true);
  };

  // Auto Generate SEO Config
  const handleAutoGenerateSEO = () => {
    if (!name.trim()) {
      alert('Please enter a Product Name first.');
      return;
    }
    const generatedTitle = `${name} | Nikhil Furniture Kerala`.slice(0, 60);
    setSeoTitle(generatedTitle);
    
    const generatedDesc = `Discover the premium handcrafted ${name}. Sourced from seasoned Nilambur timber in Kerala, customizable to your dimensions. Buy today!`.slice(0, 160);
    setSeoDescription(generatedDesc);
    
    const generatedKeywords = `${category}, ${name}, solid wood ${name}, custom wood furniture, Kerala carpentry`.toLowerCase();
    setKeywords(generatedKeywords);
    
    const generatedAlt = `${name} handcrafted wooden furniture by Nikhil Furniture`;
    setAltText(generatedAlt);
    
    setIsDirty(true);
    alert('SEO parameters generated from product info! Review below and click Save Changes to apply.');
  };

  // SEO State
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [altText, setAltText] = useState('');

  // Related Products State
  const [relatedQuery, setRelatedQuery] = useState('');
  const [selectedRelatedSlugs, setSelectedRelatedSlugs] = useState<string[]>([]);

  // Visibility State
  const [status, setStatus] = useState<'published' | 'draft' | 'archived' | 'hidden'>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(0);

  // Initialize fields
  useEffect(() => {
    if (product) {
      setName(product.name);
      setSlug(product.slug);
      setAutoSlug(false);
      setShortDesc(product.short_description || '');
      setDetailedDesc(product.detailed_description || '');
      setCategory(product.category || 'Wooden Sofa Sets');
      setTagsInput((product.tags || []).join(', '));
      setFeaturedImage(product.featured_image || '');
      setGalleryImages(product.gallery_images || []);

      // Specs
      setDimensions(product.dimensions || '');
      setWoodType(product.wood_type || 'Premium Teak Wood');
      setFinish(product.finish || 'Natural Matte');
      
      const specs = product.specifications || {};
      setMaterial(specs.material || 'Genuine Hardwood');
      setWarranty(specs.warranty || '5 Years Manufacturing Warranty');
      setCareInstructions(specs.care_instructions || 'Wipe with dry microfiber cloth. Avoid exposure to direct water.');
      setAvailability(specs.availability || 'In Stock');
      setCustomizable(specs.customizable || 'Yes');
      setDeliveryInfo(specs.delivery_info || 'Delivered in protective crates in 10-15 business days across Kerala.');

      // Extract custom spec lines (excluding the standard parameters above)
      const standardKeys = ['material', 'warranty', 'care_instructions', 'availability', 'customizable', 'delivery_info', 'custom_variants', 'is_matrix_pricing', 'matrix_attributes', 'matrix_combinations'];
      const customLines = Object.entries(specs)
        .filter(([k]) => !standardKeys.includes(k))
        .map(([k, v]) => `${k}: ${v}`);
      setCustomSpecs(customLines.join('\n'));

      // Extract custom variants matrix if present
      if (specs.is_matrix_pricing) {
        setIsMatrixPricing(true);
        try {
          const attrs = typeof specs.matrix_attributes === 'string' ? JSON.parse(specs.matrix_attributes) : specs.matrix_attributes;
          const combos = typeof specs.matrix_combinations === 'string' ? JSON.parse(specs.matrix_combinations) : specs.matrix_combinations;
          if (Array.isArray(attrs)) {
            setMatrixAttributes(attrs.map((a: any) => ({ ...a, rawInput: a.values.join(', ') })));
          } else {
            setMatrixAttributes([]);
          }
          setMatrixCombinations(Array.isArray(combos) ? combos : []);
        } catch (e) {
          setMatrixAttributes([]);
          setMatrixCombinations([]);
        }
      } else {
        setIsMatrixPricing(false);
        setMatrixAttributes([]);
        setMatrixCombinations([]);
      }

      // Pricing
      setBasePrice(product.base_price || 25000);
      setWoodPrices(product.wood_prices || {});

      // SEO
      setSeoTitle(product.seo_title || '');
      setSeoDescription(product.seo_description || '');
      setKeywords(specs.seo_keywords || '');
      setCanonicalUrl(specs.seo_canonical || '');
      setAltText(product.alt_text || '');

      // Related Products
      setSelectedRelatedSlugs((product as any).related_products || []);

      // Visibility
      setStatus((product as any).status || 'published');
      setIsFeatured(product.is_featured || false);
      setIsPopular(product.is_popular || false);
      setIsNewArrival(product.is_new_arrival || false);
      setSortOrder(product.sort_order || 0);
    } else {
      // Default / Reset states
      setName('');
      setSlug('');
      setAutoSlug(true);
      setShortDesc('');
      setDetailedDesc('');
      setCategory('Wooden Sofa Sets');
      setTagsInput('Premium Wood, Handcrafted, Kerala Furniture');
      setFeaturedImage('');
      setGalleryImages([]);
      setIsMatrixPricing(false);
      setMatrixAttributes([]);
      setMatrixCombinations([]);
      
      setDimensions('');
      setMaterial('Genuine Hardwood');
      setWoodType('Premium Teak Wood');
      setFinish('Natural Matte');
      setWarranty('5 Years Manufacturing Warranty');
      setCareInstructions('Wipe with dry microfiber cloth. Avoid exposure to direct water.');
      setAvailability('In Stock');
      setCustomizable('Yes');
      setDeliveryInfo('Delivered in protective crates in 10-15 business days across Kerala.');
      setCustomSpecs('');

      setBasePrice(25000);
      setWoodPrices({});

      setSeoTitle('');
      setSeoDescription('');
      setKeywords('');
      setCanonicalUrl('');
      setAltText('');

      setSelectedRelatedSlugs([]);
      setStatus('published');
      setIsFeatured(false);
      setIsPopular(false);
      setIsNewArrival(false);
      setSortOrder(0);
    }
    setIsDirty(false);
    setActiveTab('general');
  }, [product, isOpen]);

  // Slugify Helper
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setIsDirty(true);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    onClose();
  };

  const getProductSeoHealth = () => {
    const scoreItems: string[] = [];
    let scoreVal = 0;

    if (seoTitle.trim()) {
      scoreVal += 20;
      if (seoTitle.length >= 50 && seoTitle.length <= 60) {
        scoreVal += 10;
      } else {
        scoreItems.push('Optimal Title is 50-60 chars');
      }
    } else {
      scoreItems.push('Meta Title is missing');
    }

    if (seoDescription.trim()) {
      scoreVal += 20;
      if (seoDescription.length >= 120 && seoDescription.length <= 160) {
        scoreVal += 10;
      } else {
        scoreItems.push('Optimal Description is 120-160 chars');
      }
    } else {
      scoreItems.push('Meta Description is missing');
    }

    if (altText.trim()) {
      scoreVal += 20;
    } else {
      scoreItems.push('Image Alt Text is missing');
    }

    if (keywords.trim()) {
      scoreVal += 10;
    } else {
      scoreItems.push('Keywords are missing');
    }

    if (canonicalUrl.trim()) {
      scoreVal += 10;
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slug.trim()) {
      scoreItems.push('URL Slug is missing');
    } else if (!slugRegex.test(slug)) {
      scoreItems.push('Slug has invalid format');
    } else if (allProducts && allProducts.some(p => p.slug === slug && p.id !== product?.id)) {
      scoreItems.push('Slug is duplicate');
    }

    return { score: scoreVal, items: scoreItems };
  };

  // Media library picker states
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'featured' | 'gallery' | ''>('');

  // Save handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Product Name is required.');
    if (!slug.trim()) return alert('Slug path is required.');
    if (!featuredImage) return alert('Featured Image is required.');

    setSaving(true);

    // Format tags
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    // Auto generate SEO if empty
    const finalSeoTitle = seoTitle.trim() || `${name} | Nikhil Furniture Kerala`.slice(0, 60);
    const finalSeoDesc = seoDescription.trim() || `Discover the premium handcrafted ${name}. Sourced from seasoned Nilambur timber in Kerala, customizable to your dimensions.`.slice(0, 160);
    const finalKeywords = keywords.trim() || `${category}, ${name}, solid wood ${name}, custom wood furniture, Kerala carpentry`.toLowerCase();
    const finalAltText = altText.trim() || `${name} handcrafted wooden furniture by Nikhil Furniture`;

    // Calculate final base price (lowest combination price)
    let finalBasePrice = basePrice;
    if (isMatrixPricing) {
      if (matrixCombinations.length > 0) {
        finalBasePrice = Math.min(...matrixCombinations.map(c => c.price || 0));
      } else {
        finalBasePrice = 0;
      }
    }

    // Parse custom specs
    const specifications: Record<string, any> = {
      material,
      warranty,
      care_instructions: careInstructions,
      availability,
      customizable,
      delivery_info: deliveryInfo,
      seo_keywords: finalKeywords,
      seo_canonical: canonicalUrl,
      // Matrix Properties
      is_matrix_pricing: isMatrixPricing,
      matrix_attributes: isMatrixPricing ? matrixAttributes.map(({ name, values }) => ({ name, values })) : null,
      matrix_combinations: isMatrixPricing ? matrixCombinations : null,
    };

    customSpecs.split('\n').forEach(line => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        specifications[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    });

    const payload: Partial<Product> = {
      name,
      slug,
      short_description: shortDesc,
      detailed_description: detailedDesc,
      category,
      wood_type: woodType,
      finish,
      dimensions,
      specifications,
      tags,
      featured_image: featuredImage,
      gallery_images: galleryImages.length > 0 ? galleryImages : [featuredImage],
      seo_title: finalSeoTitle,
      seo_description: finalSeoDesc,
      alt_text: finalAltText,
      is_featured: isFeatured,
      is_popular: isPopular,
      is_new_arrival: isNewArrival,
      sort_order: sortOrder,
      base_price: finalBasePrice,
      wood_prices: isMatrixPricing ? {} : woodPrices,
      status,
      related_products: selectedRelatedSlugs,
    } as any;

    try {
      await onSave(payload);
      setIsDirty(false);
      onClose();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Filter products for Related Products dropdown (exclude self)
  const availableRelated = allProducts
    .filter(p => p.slug !== slug && !selectedRelatedSlugs.includes(p.slug))
    .filter(p => {
      if (!relatedQuery) return true;
      return p.name.toLowerCase().includes(relatedQuery.toLowerCase()) || p.category.toLowerCase().includes(relatedQuery.toLowerCase());
    })
    .slice(0, 5);

  const tabs: { id: TabType; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'general', label: 'General', icon: FileText },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'specifications', label: 'Specifications', icon: SlidersHorizontal },
    { id: 'pricing', label: 'Wood & Pricing', icon: DollarSign },
    { id: 'seo', label: 'SEO Config', icon: Eye },
    { id: 'related', label: 'Related Items', icon: Layers },
    { id: 'visibility', label: 'Visibility & Stats', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-wood-950/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl border border-wood-200/50 shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-slide-up">
        
        {/* HEADER BAR */}
        <div className="px-8 py-5 border-b border-wood-100 bg-wood-50/50 flex items-center justify-between select-none">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-serif text-lg font-bold text-wood-950">
              {product ? `Edit "${product.name}"` : 'Create New Furniture Item'}
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-widest text-wood-400">
              CMS Tabbed Editor Sheet
            </span>
          </div>

          <div className="flex items-center gap-3">
            {product && (
              <>
                <a
                  href={`/products/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-wood-200 text-wood-700 hover:text-wood-950 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer decoration-transparent font-sans"
                >
                  <Eye className="w-4 h-4" /> Live Preview
                </a>
                <button
                  type="button"
                  onClick={() => onDuplicate(product)}
                  className="bg-white border border-wood-200 text-wood-700 hover:text-wood-950 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent font-sans"
                >
                  <Copy className="w-4 h-4" /> Duplicate
                </button>
              </>
            )}
            <button
              onClick={handleClose}
              className="w-9 h-9 rounded-xl bg-wood-100/50 hover:bg-wood-200/50 border border-wood-200/20 text-wood-500 hover:text-wood-950 flex items-center justify-center cursor-pointer transition-colors border-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex border-b border-wood-100 bg-wood-50/20 px-6 py-2 overflow-x-auto select-none scrollbar-none font-sans text-xs font-bold uppercase tracking-wider">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 rounded-xl border-none transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? 'bg-wood-800 text-white shadow-sm' 
                    : 'text-wood-400 hover:text-wood-700 hover:bg-wood-50'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* EDITOR FORM CONTENT CONTAINER */}
        <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-8 flex flex-col gap-6">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="flex flex-col gap-5 animate-fade-in font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Heritage Teak Sofa Set"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Route Slug</label>
                    <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-wood-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="rounded border-wood-300 text-wood-700"
                      />
                      Auto-generate
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    disabled={autoSlug}
                    value={slug}
                    onChange={(e) => {
                      setSlug(slugify(e.target.value));
                      setIsDirty(true);
                    }}
                    placeholder="heritage-teak-sofa-set"
                    className={`w-full bg-wood-50/50 border rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none transition-colors disabled:opacity-60 ${
                      !slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || (allProducts && allProducts.some(p => p.slug === slug && p.id !== product?.id))
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-wood-200 focus:border-wood-500'
                    }`}
                  />
                  {/* Real-time Validation Alerts */}
                  {!slug.trim() && (
                    <span className="text-[9px] font-bold text-rose-600 mt-1">Slug path is required</span>
                  )}
                  {slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && (
                    <span className="text-[9px] font-bold text-rose-600 mt-1">Invalid format: lowercase, numbers, and hyphens only</span>
                  )}
                  {slug.trim() && allProducts && allProducts.some(p => p.slug === slug && p.id !== product?.id) && (
                    <span className="text-[9px] font-bold text-rose-600 mt-1">Duplicate warning: Another product already uses this slug</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none"
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Tags / Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => {
                      setTagsInput(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Teak, Handcrafted, Living Room, Royal"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Short Summary description (listing cards)</label>
                <input
                  type="text"
                  required
                  value={shortDesc}
                  onChange={(e) => {
                    setShortDesc(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Seating capacity 3+1+1 made from pure Nilambur teak wood..."
                  className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Detailed showcase story description</label>
                <textarea
                  rows={6}
                  required
                  value={detailedDesc}
                  onChange={(e) => {
                    setDetailedDesc(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Details regarding carpentry joins, solar kiln timber seasoning, and polyurethane polish..."
                  className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none resize-none font-sans"
                />
              </div>
            </div>
          )}

          {/* TAB 2: IMAGES & GALLERY */}
          {activeTab === 'images' && (
            <div className="flex flex-col gap-6 animate-fade-in font-sans">
              <div className="border-2 border-dashed border-wood-200 bg-wood-50/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3 relative">
                <div className="w-12 h-12 rounded-xl bg-wood-100 flex items-center justify-center text-wood-500 shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-wood-850">Upload Product Media Assets</span>
                  <span className="text-[10px] text-wood-500 font-semibold">Images will be stored publicly on Supabase CDN storage</span>
                </div>
                
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => { setPickerTarget('featured'); setPickerOpen(true); }}
                    className="bg-wood-800 hover:bg-wood-950 text-white border-none py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    Select Featured Image
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPickerTarget('gallery'); setPickerOpen(true); }}
                    className="bg-white border border-wood-200 text-wood-700 hover:text-wood-950 hover:bg-wood-50 py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    Add Gallery Photo
                  </button>
                </div>
              </div>

              {/* Media Previews */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Left: Featured Image Box */}
                <div className="md:col-span-4 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Main Thumbnail</span>
                  {featuredImage ? (
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-wood-200 shadow-sm bg-wood-50">
                      <img src={featuredImage} alt="Featured Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFeaturedImage('');
                          setIsDirty(true);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white cursor-pointer border-none shadow-sm"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-wood-200 aspect-[4/3] flex items-center justify-center text-wood-300 font-semibold text-xs bg-wood-50/20">
                      No featured image uploaded
                    </div>
                  )}
                </div>

                {/* Right: Gallery list */}
                <div className="md:col-span-8 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Gallery Items ({galleryImages.length})</span>
                  {galleryImages.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {galleryImages.map((img, index) => {
                        const isFeaturedVal = img === featuredImage;
                        return (
                          <div 
                            key={index} 
                            className={`relative rounded-xl overflow-hidden aspect-[4/3] border shadow-sm group bg-wood-50 ${
                              isFeaturedVal ? 'border-gold-400 ring-1 ring-gold-400' : 'border-wood-200/50'
                            }`}
                          >
                            <img src={img} alt={`Gallery item ${index}`} className="w-full h-full object-cover" />
                            
                            <div className="absolute inset-0 bg-wood-950/60 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  setFeaturedImage(img);
                                  setIsDirty(true);
                                }}
                                className="p-1 rounded bg-white text-wood-800 hover:text-gold-600 cursor-pointer border-none"
                                title="Set as Featured Image"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setGalleryImages(prev => prev.filter(g => g !== img));
                                  setIsDirty(true);
                                }}
                                className="p-1 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer border-none"
                                title="Remove Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-wood-200 p-8 flex items-center justify-center text-wood-300 font-semibold text-xs bg-wood-50/20 flex-grow">
                      No gallery assets uploaded. Standard detail pages will fallback to display the Main Thumbnail.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: SPECIFICATIONS */}
          {activeTab === 'specifications' && (
            <div className="flex flex-col gap-6 animate-fade-in font-sans">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Dimensions</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => {
                      setDimensions(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. 180cm x 90cm x 75cm"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Timber Species</label>
                  <input
                    type="text"
                    value={woodType}
                    onChange={(e) => {
                      setWoodType(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. Nilambur Teak Wood"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Finish Polish</label>
                  <input
                    type="text"
                    value={finish}
                    onChange={(e) => {
                      setFinish(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. PU Matte Honey Stain"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Structural Material</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => {
                      setMaterial(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Genuine Nilambur Hardwood"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Warranty Term</label>
                  <input
                    type="text"
                    value={warranty}
                    onChange={(e) => {
                      setWarranty(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="5 Years Structural Warranty"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Availability Status</label>
                  <select
                    value={availability}
                    onChange={(e) => {
                      setAvailability(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="In Stock">In Stock (Available in Showroom)</option>
                    <option value="Made to Order">Made to Order (Carpentry timeline applies)</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Bespoke Customizable</label>
                  <select
                    value={customizable}
                    onChange={(e) => {
                      setCustomizable(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="Yes">Yes (100% customizable size/design)</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Delivery Information</label>
                  <input
                    type="text"
                    value={deliveryInfo}
                    onChange={(e) => {
                      setDeliveryInfo(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Delivered safely inside blankets to doorsteps."
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Care & Maintenance Instructions</label>
                <input
                  type="text"
                  value={careInstructions}
                  onChange={(e) => {
                    setCareInstructions(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Avoid direct sun exposure. Dust with dry soft cloth."
                  className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1 border-t border-wood-100 pt-4 mt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Custom Parameters (Format 'Key: Value' per line)</label>
                <textarea
                  rows={3}
                  value={customSpecs}
                  onChange={(e) => {
                    setCustomSpecs(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Seating Capacity: 6-Seater&#10;Primary Timber Origin: Nilambur Depots"
                  className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none resize-none font-sans"
                />
              </div>
            </div>
          )}

          {/* TAB 4: WOOD TYPES & PRICING MATRIX */}
          {activeTab === 'pricing' && (
            <div className="flex flex-col gap-6 animate-fade-in font-sans">
              
              {/* Pricing Mode Toggle */}
              <div className="bg-wood-50 border border-wood-100 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-wood-950">Pricing Configuration Mode</h4>
                  <p className="text-xs text-wood-500 font-semibold mt-0.5">
                    Choose between standard starting showroom rates (using base price) or a precise multi-attribute Variant Pricing Matrix.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-wood-700">{isMatrixPricing ? 'Variant Matrix Pricing' : 'Simple Pricing'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMatrixPricing(!isMatrixPricing);
                      setIsDirty(true);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isMatrixPricing ? 'bg-wood-800' : 'bg-wood-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isMatrixPricing ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {!isMatrixPricing ? (
                <>
                  {/* Standard Base Price and Wood pricing multipliers */}
                  <div className="bg-wood-50 border border-wood-100 p-5 rounded-2xl flex flex-col gap-2">
                    <h4 className="font-serif text-sm font-bold text-wood-950 flex items-center gap-1.5">
                      Timber Species Starting Showroom Rates
                    </h4>
                    <p className="text-xs text-wood-500 font-semibold leading-relaxed">
                      The website catalog calculates dynamic price quotes for different wood choices based on the **Base Price**. You can define *custom starting prices* for specific species below.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 max-w-sm">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Base Showcase Price (₹)</label>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => {
                        setBasePrice(Number(e.target.value));
                        setIsDirty(true);
                      }}
                      placeholder="25000"
                      className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-bold focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5 mt-2">
                    {[
                      'Premium Teak Wood',
                      'Rosewood',
                      'Mahogany',
                      'Walnut Wood',
                      'Anjili',
                      'Jackwood'
                    ].map((woodName) => (
                      <div 
                        key={woodName} 
                        className="bg-white p-4 rounded-xl border border-wood-200/50 flex flex-col gap-2 shadow-sm transition-all hover:border-wood-300"
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider text-wood-600 block truncate" title={woodName}>
                          {woodName}
                        </span>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-2.5 flex items-center text-wood-400 text-xs font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={woodPrices[woodName] || ''}
                            onChange={(e) => {
                              const val = e.target.value ? Number(e.target.value) : undefined;
                              setIsDirty(true);
                              setWoodPrices(prev => {
                                const copy = { ...prev };
                                if (val === undefined || isNaN(val)) {
                                  delete copy[woodName];
                                } else {
                                  copy[woodName] = val;
                                }
                                return copy;
                              });
                            }}
                            placeholder="Default Auto"
                            className="w-full bg-wood-50/20 border border-wood-200 focus:border-wood-500 rounded-lg py-1.5 pl-6 pr-2 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* VARIANT PRICING MATRIX SYSTEM */}
                  <div className="bg-wood-50 border border-wood-100 p-5 rounded-2xl flex flex-col gap-2">
                    <h4 className="font-serif text-sm font-bold text-wood-950 flex items-center gap-1.5">
                      Attribute Variant Pricing Matrix
                    </h4>
                    <p className="text-xs text-wood-500 font-semibold leading-relaxed">
                      Define the attributes (e.g. Size, Wood, Storage) and enter the **actual price** for each combination. The website will automatically search and render selectors showing these exact prices. The **lowest price** will be displayed to customers in grids.
                    </p>
                  </div>

                  {/* Attributes Manager */}
                  <div className="flex flex-col gap-4 border border-wood-250/60 p-5 rounded-2xl bg-white">
                    <div className="flex items-center justify-between border-b border-wood-100 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-wood-800">1. Define Attributes & Values</span>
                      <button
                        type="button"
                        onClick={addMatrixAttribute}
                        className="bg-wood-800 hover:bg-wood-950 text-white font-sans text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg border-none cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        + Add Attribute
                      </button>
                    </div>

                    {matrixAttributes.length > 0 ? (
                      <div className="flex flex-col gap-4">
                        {matrixAttributes.map((attr, index) => (
                          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="md:col-span-3 flex flex-col gap-1">
                              <label className="text-[9px] uppercase font-bold text-wood-400">Name (e.g. Size)</label>
                              <input
                                type="text"
                                value={attr.name}
                                onChange={(e) => updateMatrixAttributeName(index, e.target.value)}
                                placeholder="Attribute Name"
                                className="w-full bg-wood-50/30 border border-wood-200 focus:border-wood-500 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none"
                              />
                            </div>
                            <div className="md:col-span-8 flex flex-col gap-1">
                              <label className="text-[9px] uppercase font-bold text-wood-400">Values (Comma Separated, e.g. Teak wood, Mahogany wood)</label>
                              <input
                                type="text"
                                value={attr.rawInput !== undefined ? attr.rawInput : attr.values.join(', ')}
                                onChange={(e) => updateMatrixAttributeValues(index, e.target.value)}
                                placeholder="Teak wood, Mahogany wood"
                                className="w-full bg-wood-50/30 border border-wood-200 focus:border-wood-500 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none"
                              />
                            </div>
                            <div className="md:col-span-1 flex justify-center pt-4">
                              <button
                                type="button"
                                onClick={() => removeMatrixAttribute(index)}
                                className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer p-1"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-wood-400 italic">No variant attributes configured yet. Click "Add Attribute" to start.</span>
                    )}
                  </div>

                  {/* Combinations Matrix Prices Table */}
                  <div className="flex flex-col gap-4 border border-wood-250/60 p-5 rounded-2xl bg-white">
                    <div className="border-b border-wood-100 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-wood-800">2. Configure Combination Prices</span>
                    </div>

                    {matrixCombinations.length > 0 ? (
                      <div className="flex flex-col gap-3.5 max-h-[450px] overflow-y-auto pr-2">
                        {matrixCombinations.map((combo, idx) => {
                          const comboLabel = Object.entries(combo.attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' — ');

                          return (
                            <div 
                              key={idx} 
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-wood-200/50 bg-wood-50/10 hover:bg-wood-50/20 transition-all gap-4"
                            >
                              <span className="text-xs font-semibold text-wood-900 leading-snug">{comboLabel}</span>
                              <div className="relative shrink-0 w-full sm:w-44">
                                <span className="absolute inset-y-0 left-3 flex items-center text-wood-400 text-xs font-bold pointer-events-none">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  value={combo.price || ''}
                                  onChange={(e) => updateCombinationPrice(idx, Number(e.target.value))}
                                  placeholder="Price (e.g. 8000)"
                                  className="w-full bg-white border border-wood-200 focus:border-wood-500 rounded-lg py-1.5 pl-8 pr-3 text-xs font-bold focus:outline-none"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-wood-400 italic">No combinations generated. Please define at least one attribute with values above.</span>
                    )}
                  </div>
                </>
              )}

            </div>
          )}

          {/* TAB 5: SEO CONFIGURATION */}
          {activeTab === 'seo' && (() => {
            const seoHealth = getProductSeoHealth();

            return (
              <div className="flex flex-col gap-5 animate-fade-in font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-wood-100">
                  <span className="text-[11px] font-bold text-wood-500 uppercase tracking-widest">Metadata, Search Snippet Previews & Image Alt Tags</span>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSEO}
                    className="bg-gold-50 hover:bg-gold-100/70 border border-gold-300 text-gold-800 py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Generate from Info
                  </button>
                </div>

                {/* SEO Health Score Banner */}
                <div className="bg-wood-50/40 border border-wood-200/60 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative flex items-center justify-center shrink-0">
                    {/* Visual Circular/Ring Progress */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-wood-100 relative">
                      <span className={`text-sm font-bold font-mono ${
                        seoHealth.score >= 80 ? 'text-emerald-600' : seoHealth.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {seoHealth.score}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow text-left">
                    <h4 className="font-serif text-sm font-bold text-wood-950 mb-1">SEO Health Score</h4>
                    <p className="text-[10px] text-wood-500 mb-3 leading-relaxed">
                      Optimize your metadata to reach a score above 80% for best local ranking visibility.
                    </p>
                    {seoHealth.items.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {seoHealth.items.map((item, i) => (
                          <span key={i} className="text-[8px] font-bold uppercase bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] font-bold uppercase bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1 w-max">
                        ✓ All SEO checks passed! Excellent optimization
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Meta Fields */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">SEO Page Title</label>
                        <span className={`text-[9px] font-bold ${
                          seoTitle.length >= 50 && seoTitle.length <= 60
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}>
                          {seoTitle.length} / 60 chars (Optimal: 50-60)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => {
                          setSeoTitle(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Heritage Handcarved Teak Dining Table | Nikhil Furniture Kerala"
                        className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Meta Description</label>
                        <span className={`text-[9px] font-bold ${
                          seoDescription.length >= 120 && seoDescription.length <= 160
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}>
                          {seoDescription.length} / 160 chars (Optimal: 120-160)
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={seoDescription}
                        onChange={(e) => {
                          setSeoDescription(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Explore premium customizable dining tables handcrafted from aged wood in Thrissur. Secure WhatsApp booking options."
                        className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Keywords (Comma Separated)</label>
                      <input
                        type="text"
                        value={keywords}
                        onChange={(e) => {
                          setKeywords(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Kerala Teak wood table, buy customized table Thrissur, Nilambur wood shop"
                        className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Slug previews and Alt Tags */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Alt Image Text (For Accessibility & Image SEO)</label>
                        {!altText.trim() && (
                          <span className="text-[8px] font-bold uppercase bg-rose-50 border border-rose-100 text-rose-600 px-1.5 py-0.5 rounded">
                            Missing Alt Text
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => {
                          setAltText(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="Vintage Teak Wood Dining Table with Carved Legs"
                        className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Canonical URL Override (Optional)</label>
                      <input
                        type="text"
                        value={canonicalUrl}
                        onChange={(e) => {
                          setCanonicalUrl(e.target.value);
                          setIsDirty(true);
                        }}
                        placeholder="https://nikhilfurniture.com/products/customized-teak-sofa"
                        className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    {/* Google Search Snippet Preview */}
                    <div className="border border-wood-200/60 bg-white rounded-2xl p-5 flex flex-col gap-2.5 shadow-sm">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-wood-400">Search Engine Index Preview</span>
                      <div className="flex flex-col text-left">
                        {/* Favicon & URL row */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-wood-50 border border-wood-200/50 flex items-center justify-center text-[9px] text-wood-600 font-bold shrink-0">
                            N
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-sans text-wood-800 font-semibold truncate leading-tight">Nikhil Furniture</span>
                            <span className="text-[9px] font-sans text-wood-400 truncate leading-none">
                              https://nikhilfurniture.com › products › {slug || 'product-slug'}
                            </span>
                          </div>
                        </div>
                        {/* Blue Link title */}
                        <span className="text-blue-800 hover:underline font-serif text-sm font-bold truncate cursor-pointer leading-tight mb-1">
                          {seoTitle || name || 'Snippet preview Title'}
                        </span>
                        {/* Snippet Description */}
                        <p className="text-[11px] font-sans text-wood-600 line-clamp-2 leading-relaxed">
                          {seoDescription || shortDesc || 'Snippet preview meta description summary.'}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* TAB 6: RELATED PRODUCTS */}
          {activeTab === 'related' && (
            <div className="flex flex-col gap-6 animate-fade-in font-sans">
              <div className="bg-wood-50 border border-wood-100 p-5 rounded-2xl flex flex-col gap-2">
                <h4 className="font-serif text-sm font-bold text-wood-950 flex items-center gap-1.5">
                  Bespoke Related Products
                </h4>
                <p className="text-xs text-wood-500 font-semibold leading-relaxed">
                  Link related items that will display at the bottom of this product's detail page. You can add dining chairs to dining tables, or tea tables to living room sofa sets.
                </p>
              </div>

              {/* Selector search */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Search / selector */}
                <div className="md:col-span-5 flex flex-col gap-3 relative">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Search Catalog Listings</span>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 text-wood-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={relatedQuery}
                      onChange={(e) => setRelatedQuery(e.target.value)}
                      placeholder="Search items by name..."
                      className="w-full bg-white border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Dropdown results */}
                  {relatedQuery && (
                    <div className="absolute top-[76px] left-0 right-0 bg-white border border-wood-200/60 rounded-xl shadow-lg z-10 py-1 flex flex-col divide-y divide-wood-100 max-h-48 overflow-y-auto">
                      {availableRelated.length === 0 ? (
                        <span className="p-3 text-[10px] font-bold text-wood-400 text-center font-sans">No matches found</span>
                      ) : (
                        availableRelated.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedRelatedSlugs(prev => [...prev, p.slug]);
                              setIsDirty(true);
                              setRelatedQuery('');
                            }}
                            className="w-full text-left p-3 hover:bg-wood-50/50 flex items-center gap-3 transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <img src={p.featured_image} alt={p.name} className="w-8 h-6 rounded bg-wood-50 object-cover" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-wood-950 truncate">{p.name}</span>
                              <span className="text-[9px] text-wood-400 truncate">{p.category}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selected related products chip cards */}
                <div className="md:col-span-7 flex flex-col gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Attached Related Items ({selectedRelatedSlugs.length})</span>
                  
                  {selectedRelatedSlugs.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {selectedRelatedSlugs.map((relSlug) => {
                        const relatedProduct = allProducts.find(p => p.slug === relSlug);
                        if (!relatedProduct) return null;

                        return (
                          <div 
                            key={relSlug}
                            className="flex items-center gap-3 p-3 rounded-xl border border-wood-200/50 bg-wood-50/10 hover:bg-wood-50/30 transition-colors shadow-sm"
                          >
                            <img src={relatedProduct.featured_image} alt={relatedProduct.name} className="w-10 h-8 rounded bg-wood-50 object-cover shadow-sm" />
                            <div className="flex-grow min-w-0 flex flex-col">
                              <span className="text-xs font-bold text-wood-950 truncate">{relatedProduct.name}</span>
                              <span className="text-[9px] text-wood-400 truncate">{relatedProduct.category}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRelatedSlugs(prev => prev.filter(s => s !== relSlug));
                                setIsDirty(true);
                              }}
                              className="p-1 text-wood-400 hover:text-rose-600 rounded bg-transparent border-none cursor-pointer"
                              title="Detach related product"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-wood-200 p-8 flex items-center justify-center text-wood-300 font-semibold text-xs bg-wood-50/20">
                      No related products attached. The public detail page will display generic items from the same category instead.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 7: VISIBILITY, STATUS & METRICS */}
          {activeTab === 'visibility' && (
            <div className="flex flex-col gap-6 animate-fade-in font-sans">
              
              {/* Status and Sort parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Publishing Status</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value as any);
                      setIsDirty(true);
                    }}
                    className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none"
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Admin eyes only)</option>
                    <option value="archived">Archived (Decommissioned)</option>
                    <option value="hidden">Hidden (Accessible via direct slug link only)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500">Sort Order Index Weight</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(Number(e.target.value));
                      setIsDirty(true);
                    }}
                    placeholder="0"
                    className="w-full bg-wood-50/50 border border-wood-200 focus:border-wood-500 rounded-xl py-2.5 px-4 text-xs font-bold focus:outline-none"
                  />
                </div>

                {/* Layout Checkbox Flags */}
                <div className="flex flex-col gap-2 pt-4 select-none">
                  <label className="flex items-center gap-2 text-xs font-semibold text-wood-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => {
                        setIsFeatured(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
                    />
                    Featured Product (Pin to Hero)
                  </label>
                  
                  <label className="flex items-center gap-2 text-xs font-semibold text-wood-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPopular}
                      onChange={(e) => {
                        setIsPopular(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
                    />
                    Popular Selection (List on Home)
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-wood-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNewArrival}
                      onChange={(e) => {
                        setIsNewArrival(e.target.checked);
                        setIsDirty(true);
                      }}
                      className="rounded border-wood-300 text-wood-700 focus:ring-wood-500 cursor-pointer"
                    />
                    New Arrival Indicator
                  </label>
                </div>

              </div>

              {/* Product Performance Metrics */}
              <div className="border border-wood-200 bg-wood-50/20 rounded-2xl p-6 mt-2 select-none">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-wood-400" />
                  <h4 className="font-serif text-sm font-bold text-wood-950">
                    Product Performance Metrics
                  </h4>
                  <span className="text-[9px] font-bold bg-green-50 border border-green-200/40 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans ml-2">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-wood-500 mb-6 font-sans leading-relaxed">
                  Real-time tracking of customer engagement. Views are counted on page load, wishlist saves on add-to-wishlist clicks, and WhatsApp referrals on inquiry button clicks.
                </p>

                <div className="grid grid-cols-3 gap-6 font-sans">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-wood-400">Total Views</span>
                    <span className="text-xl font-bold font-mono text-wood-700">{(product?.views_count ?? 0).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-wood-400">Wishlist Saves</span>
                    <span className="text-xl font-bold font-mono text-wood-700">{(product?.wishlist_count ?? 0).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-wood-400">WhatsApp Referrals</span>
                    <span className="text-xl font-bold font-mono text-wood-700">{(product?.whatsapp_count ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </form>

        {/* BOTTOM SAVE ACTIONS FOOTER */}
        <div className="px-8 py-5 border-t border-wood-100 bg-wood-50/30 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-wood-400">
            {isDirty && (
              <span className="flex items-center gap-1 text-amber-600 animate-pulse font-sans font-bold">
                <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes in form
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="border border-wood-300 bg-white text-wood-700 px-6 py-2.5 rounded-xl text-xs font-bold font-sans uppercase tracking-wider hover:bg-wood-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={saving}
              className="bg-wood-800 hover:bg-wood-950 text-white px-8 py-2.5 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
      <MediaLibraryPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          setIsDirty(true);
          if (pickerTarget === 'featured') {
            setFeaturedImage(url);
            if (!altText) setAltText(`${name} - Handcrafted premium furniture`);
          } else if (pickerTarget === 'gallery') {
            setGalleryImages(prev => [...prev, url]);
          }
        }}
        defaultFolder="Products"
      />
    </div>
  );
};

export default ProductEditor;
