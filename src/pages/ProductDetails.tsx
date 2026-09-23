import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, ArrowRight, Check, Info, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { Image } from '../components/Image';
import { SEO } from '../components/SEO';
import { WishlistButton } from '../components/WishlistButton';
import { EnquiryModal } from '../components/EnquiryModal';

const woodVariants = [
  { name: 'Premium Teak Wood', multiplier: 1.2 },
  { name: 'Rosewood', multiplier: 1.5 },
  { name: 'Mahogany', multiplier: 0.9 },
  { name: 'Walnut Wood', multiplier: 1.3 },
  { name: 'Anjili', multiplier: 0.7 },
  { name: 'Jackwood', multiplier: 0.8 }
];

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'care'>('specs');
  const [selectedWood, setSelectedWood] = useState<string>('Premium Teak Wood');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const viewTrackedSlug = useRef<string | null>(null);

  // Set the restore flag on mount so the products page knows we came from detail view
  useEffect(() => {
    sessionStorage.setItem('products_list_restore', 'true');
  }, []);

  useEffect(() => {
    if (product) {
      const specs = product.specifications || {};
      
      if (specs.is_matrix_pricing) {
        // Initialize default selections for pricing matrix attributes
        try {
          const attrs = typeof specs.matrix_attributes === 'string'
            ? JSON.parse(specs.matrix_attributes)
            : specs.matrix_attributes;
          if (Array.isArray(attrs)) {
            const initial: Record<string, string> = {};
            attrs.forEach((a: any) => {
              if (a.values && a.values.length > 0) {
                initial[a.name] = a.values[0];
              }
            });
            setSelectedVariants(initial);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        const matched = woodVariants.find(
          w => w.name.toLowerCase() === product.wood_type.toLowerCase() || 
               product.wood_type.toLowerCase().includes(w.name.toLowerCase())
        );
        setSelectedWood(matched ? matched.name : 'Premium Teak Wood');

        // Initialize default selections for custom variants
        if (specs.custom_variants) {
          try {
            const vars = typeof specs.custom_variants === 'string'
              ? JSON.parse(specs.custom_variants)
              : specs.custom_variants;
            if (Array.isArray(vars)) {
              const initial: Record<string, string> = {};
              vars.forEach((v: any) => {
                if (v.options && v.options.length > 0) {
                  initial[v.name] = v.options[0].name;
                }
              });
              setSelectedVariants(initial);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }

      // Track recently viewed products
      const saved = localStorage.getItem('recently_viewed_products');
      let list: any[] = [];
      if (saved) {
        try {
          list = JSON.parse(saved);
        } catch (e) {}
      }

      // Filter out the active product from the display list
      const filteredForDisplay = list.filter((p: any) => p.id !== product.id);
      setRecentlyViewed(filteredForDisplay.slice(0, 4));

      // Append active product to localStorage history for next page visits
      const updatedList = [
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          featured_image: product.featured_image,
          category: product.category,
          wood_type: product.wood_type,
          base_price: product.base_price
        },
        ...list.filter((p: any) => p.id !== product.id)
      ].slice(0, 5);

      localStorage.setItem('recently_viewed_products', JSON.stringify(updatedList));

      // Increment product view count in database (guard against StrictMode double-fire)
      if (viewTrackedSlug.current !== product.slug) {
        viewTrackedSlug.current = product.slug;
        supabase.rpc('increment_product_metric', { product_id: product.id, metric_type: 'views' }).then(({ error }) => { if (error) console.error(error); });
      }
    }
  }, [product]);

  const getCalculatedPrice = () => {
    if (!product) return 0;
    const specs = product.specifications || {};

    // 1. Matrix Pricing Mode
    if (specs.is_matrix_pricing) {
      try {
        const combos = typeof specs.matrix_combinations === 'string'
          ? JSON.parse(specs.matrix_combinations)
          : specs.matrix_combinations;
        if (Array.isArray(combos)) {
          // Find combination where all key-values match selectedVariants
          const matchedCombo = combos.find((c: any) => {
            return Object.entries(c.attributes).every(([k, v]) => selectedVariants[k] === v);
          });
          if (matchedCombo && typeof matchedCombo.price === 'number') {
            return matchedCombo.price;
          }
        }
      } catch (e) {
        console.error(e);
      }
      return product.base_price || 0; // fallback to minimum price
    }

    // 2. Simple Pricing Mode
    let price = product.base_price;
    if (product.wood_prices && product.wood_prices[selectedWood]) {
      price = product.wood_prices[selectedWood];
    } else {
      const variant = woodVariants.find(w => w.name === selectedWood) || woodVariants[0];
      price = Math.round(product.base_price * variant.multiplier);
    }

    // Add pricing surcharges for custom variants
    if (specs.custom_variants) {
      try {
        const vars = typeof specs.custom_variants === 'string'
          ? JSON.parse(specs.custom_variants)
          : specs.custom_variants;
        if (Array.isArray(vars)) {
          vars.forEach((v: any) => {
            const selectedOpt = selectedVariants[v.name];
            if (selectedOpt && Array.isArray(v.options)) {
              const option = v.options.find((o: any) => o.name === selectedOpt);
              if (option && typeof option.priceSurcharge === 'number') {
                price += option.priceSurcharge;
              }
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    return price;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        // Fetch product by slug (select all columns for details)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (data) {
          const prod = data as Product;
          setProduct(prod);
          setSelectedImage(prod.featured_image);

          // Fetch related products (same category, excluding current product)
          const { data: related, error: relatedErr } = await supabase
            .from('products')
            .select('id, name, slug, category, wood_type, featured_image')
            .eq('category', prod.category)
            .neq('id', prod.id)
            .limit(4);

          if (!relatedErr && related) {
            setRelatedProducts(related as Product[]);
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        navigate('/404');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 animate-pulse">
        <div className="h-6 w-32 bg-wood-200 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6 h-[450px] bg-wood-200 rounded-3xl" />
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="h-10 bg-wood-200 w-3/4 rounded" />
            <div className="h-6 bg-wood-200 w-1/2 rounded" />
            <div className="h-24 bg-wood-200 rounded" />
            <div className="h-12 bg-wood-200 w-1/3 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Build WhatsApp text with selected variant and price
  const getWhatsAppLink = () => {
    const priceText = formatPrice(getCalculatedPrice());
    const specs = product.specifications || {};
    
    let customSelectionText = '';
    if (specs.is_matrix_pricing) {
      customSelectionText = '\nSelected Configuration:\n' + Object.entries(selectedVariants)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n');
      
      const text = `Hello,\n\nI am interested in the following furniture:\n\nProduct: ${product.name}\nCategory: ${product.category}${customSelectionText}\nPrice: ${priceText}\n\nPlease share:\n- Availability\n- Delivery options\n- Custom dimensions consultation\n\nThank you.`;
      return `https://wa.me/919746321808?text=${encodeURIComponent(text)}`;
    } else {
      if (Object.keys(selectedVariants).length > 0) {
        customSelectionText = '\nSelected Custom Variants:\n' + Object.entries(selectedVariants)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n');
      }

      const text = `Hello,\n\nI am interested in the following furniture:\n\nProduct: ${product.name}\nCategory: ${product.category}\nSelected Wood Variant: ${selectedWood}${customSelectionText}\nEstimated Price: ${priceText}\n\nPlease share:\n- Availability\n- Delivery options\n- Custom dimensions consultation\n\nThank you.`;
      return `https://wa.me/919746321808?text=${encodeURIComponent(text)}`;
    }
  };

  return (
    <div className="py-4 md:py-12 pb-20 md:pb-12 bg-wood-50">
      <SEO
        title={product.seo_title || `${product.name} in Thrissur | Solid Wood Furniture`}
        description={product.seo_description || `Purchase custom ${product.name} in Thrissur, Kerala. Handmade in seasoned ${product.wood_type} with durable ${product.finish} finish. Direct delivery across Kerala.`}
        ogImage={product.featured_image}
        ogType="product"
        schemaType="Product"
        productSchemaData={{
          name: product.name,
          image: product.featured_image,
          description: product.short_description,
          woodType: product.wood_type,
          finish: product.finish,
          dimensions: product.dimensions,
          url: window.location.href,
          price: product.base_price || 25000,
          basePrice: product.base_price,
          sku: product.slug,
          slug: product.slug
        }}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: product.category, url: `/products?category=${encodeURIComponent(product.category)}` },
          { name: product.name, url: window.location.pathname }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-12">
        {/* Back navigation */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-wider text-wood-600 hover:text-wood-950 transition-colors mb-3 md:mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Back to Catalog
        </Link>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-12 items-start mb-12 md:mb-24">
          
          {/* Left: Gallery Picker */}
          {(() => {
            const galleryList = product.gallery_images && product.gallery_images.length > 0 
              ? product.gallery_images 
              : [product.featured_image];

            const currentIdx = galleryList.indexOf(selectedImage) >= 0 
              ? galleryList.indexOf(selectedImage) 
              : 0;

            const handleNext = () => {
              const nextIdx = (currentIdx + 1) % galleryList.length;
              setSelectedImage(galleryList[nextIdx]);
            };

            const handlePrev = () => {
              const prevIdx = (currentIdx - 1 + galleryList.length) % galleryList.length;
              setSelectedImage(galleryList[prevIdx]);
            };

            return (
              <div className="lg:col-span-7 flex flex-col gap-3 md:gap-4">
                
                {/* Primary Main Image Showcase Box (Compact height on mobile for 1st view visibility) */}
                <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-sm border border-wood-200/40 relative bg-white aspect-[4/3] max-h-[220px] sm:max-h-[300px] md:max-h-[500px] group select-none">
                  
                  {/* Sliding Image Track */}
                  <div
                    className="w-full h-full flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer"
                    style={{ transform: `translateX(-${currentIdx * 100}%)` }}
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    {galleryList.map((img, idx) => (
                      <div key={idx} className="w-full h-full shrink-0 relative">
                        <Image
                          src={img}
                          alt={`${product.alt_text || product.name} - View ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Top Right Zoom Search & Wishlist Buttons */}
                  <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 flex items-center gap-1.5 md:gap-2">
                    <WishlistButton product={product} className="shadow-md" showText={false} />
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/90 hover:bg-white text-wood-900 border border-wood-200/60 shadow flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                      title="Zoom Image"
                    >
                      <Search className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Navigation Controls Overlay */}
                  {galleryList.length > 1 && (
                    <>
                      {/* Left (Previous Image) Arrow */}
                      <button
                        onClick={handlePrev}
                        aria-label="Previous image"
                        className="absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white text-wood-900 border border-wood-200/60 shadow-md backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        title="Previous Image"
                      >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
                      </button>

                      {/* Right (Next Image) Arrow */}
                      <button
                        onClick={handleNext}
                        aria-label="Next image"
                        className="absolute right-2.5 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 hover:bg-white text-wood-900 border border-wood-200/60 shadow-md backdrop-blur-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        title="Next Image"
                      >
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 stroke-[2.5]" />
                      </button>

                      {/* Image Counter Badge */}
                      <div className="absolute bottom-2.5 md:bottom-4 left-1/2 -translate-x-1/2 z-10 bg-wood-950/75 text-white text-[10px] md:text-[11px] font-bold py-0.5 md:py-1 px-3 md:px-3.5 rounded-full backdrop-blur-md shadow-md tracking-wider">
                        {currentIdx + 1} / {galleryList.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Thumbnail Selectors */}
                {galleryList.length > 1 && (
                  <div className="flex items-center gap-2 md:gap-3 overflow-x-auto py-0.5">
                    {galleryList.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          selectedImage === img
                            ? 'border-wood-900 scale-102 shadow-sm'
                            : 'border-wood-200/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Right: Product Metadata & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 md:gap-6">
            <div>
              <span className="text-[10px] md:text-xs text-gold-600 font-bold uppercase tracking-[0.15em] block mb-0.5 md:mb-1">{product.category}</span>
              <h1 className="font-serif text-2xl md:text-4xl font-bold text-wood-950 tracking-wide leading-tight mb-2 md:mb-3">
                {product.name}
              </h1>

              {/* Wood Species Pills */}
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2 md:mb-4">
                <span className="bg-[#F5EFE6] text-wood-900 text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 md:py-1 rounded-full border border-wood-200/50">
                  {product.wood_type}
                </span>
                {product.finish && (
                  <span className="bg-[#F5EFE6] text-wood-900 text-[10px] uppercase font-bold tracking-wider px-3 py-0.5 md:py-1 rounded-full border border-wood-200/50">
                    {product.finish}
                  </span>
                )}
              </div>

              <p className="text-xs md:text-sm text-wood-600 leading-relaxed font-sans mb-1 md:mb-2 line-clamp-2 md:line-clamp-none">
                {product.short_description || product.detailed_description}
              </p>
            </div>

            {/* Price & Wood Variant Selector Card Container */}
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-wood-200/60 shadow-sm flex flex-col gap-3 md:gap-5">
              <div>
                <span className="text-[9px] md:text-[10px] text-wood-500 uppercase font-bold tracking-wider block mb-0.5 md:mb-1">Starting From</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl md:text-3xl font-bold text-wood-950">
                    {formatPrice(getCalculatedPrice())}
                  </span>
                  <span className="text-[11px] md:text-xs text-wood-500 font-normal">
                    (Price may vary by wood)
                  </span>
                </div>
              </div>

              {product.specifications?.is_matrix_pricing ? (
                /* RENDER VARIANT PRICING MATRIX SELECTORS */
                (() => {
                  try {
                    const attrs = typeof product.specifications.matrix_attributes === 'string'
                      ? JSON.parse(product.specifications.matrix_attributes)
                      : product.specifications.matrix_attributes;
                    if (!Array.isArray(attrs) || attrs.length === 0) return null;

                    return (
                      <div className="flex flex-col gap-3 md:gap-4 border-t border-wood-100 pt-3 md:pt-4">
                        {attrs.map((attr: any) => (
                          <div key={attr.name} className="flex flex-col gap-1.5 md:gap-2">
                            <span className="text-[9px] md:text-[10px] text-wood-500 uppercase font-bold tracking-wider">
                              Select {attr.name}
                            </span>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                              {attr.values?.map((val: string) => {
                                const isSelected = selectedVariants[attr.name] === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setSelectedVariants(prev => ({ ...prev, [attr.name]: val }))}
                                    className={`py-1.5 md:py-2.5 px-3 md:px-4 rounded-lg md:rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                      isSelected
                                        ? 'bg-[#2A180C] text-white shadow-sm border border-[#2A180C]'
                                        : 'bg-white border border-wood-200 text-wood-800 hover:bg-wood-50'
                                    }`}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  } catch (e) {
                    return null;
                  }
                })()
              ) : (
                /* RENDER SIMPLE WOOD SELECTION + SURCHARGES */
                <div className="border-t border-wood-100 pt-3 md:pt-4">
                  <span className="text-[9px] md:text-[10px] text-wood-500 uppercase font-bold tracking-wider block mb-2 md:mb-2.5">Select Wood</span>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {woodVariants.map((variant) => (
                      <button
                        key={variant.name}
                        type="button"
                        onClick={() => setSelectedWood(variant.name)}
                        className={`py-1.5 md:py-2.5 px-3 md:px-4 rounded-lg md:rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selectedWood === variant.name
                            ? 'bg-[#2A180C] text-white shadow-sm border border-[#2A180C]'
                            : 'bg-white border border-wood-200 text-wood-800 hover:bg-wood-50'
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>

                  {product.specifications && product.specifications.custom_variants && (() => {
                    try {
                      const vars = typeof product.specifications.custom_variants === 'string'
                        ? JSON.parse(product.specifications.custom_variants)
                        : product.specifications.custom_variants;
                      if (!Array.isArray(vars) || vars.length === 0) return null;

                      return (
                        <div className="flex flex-col gap-3 md:gap-4 mt-3 md:mt-4 border-t border-wood-100 pt-3 md:pt-4">
                          {vars.map((v: any) => (
                            <div key={v.name} className="flex flex-col gap-1.5 md:gap-2">
                              <span className="text-[9px] md:text-[10px] text-wood-500 uppercase font-bold tracking-wider">
                                Select {v.name}
                              </span>
                              <div className="flex flex-wrap gap-1.5 md:gap-2">
                                {v.options?.map((opt: any) => {
                                  const isSelected = selectedVariants[v.name] === opt.name;
                                  const surchargeText = opt.priceSurcharge > 0 ? ` (+₹${opt.priceSurcharge.toLocaleString('en-IN')})` : '';
                                  return (
                                    <button
                                      key={opt.name}
                                      type="button"
                                      onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt.name }))}
                                      className={`py-1.5 md:py-2.5 px-3 md:px-4 rounded-lg md:rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-[#2A180C] text-white shadow-sm border border-[#2A180C]'
                                          : 'bg-white border border-wood-200 text-wood-800 hover:bg-wood-50'
                                      }`}
                                    >
                                      {opt.name}{surchargeText}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } catch (e) {
                      return null;
                    }
                  })()}
                </div>
              )}
            </div>

            {/* Inline Action buttons for Desktop & Call/Custom buttons for Mobile */}
            <div className="flex flex-col gap-3 pt-2">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  supabase.rpc('increment_product_metric', { product_id: product.id, metric_type: 'whatsapp' }).then(({ error }) => { if (error) console.error(error); });
                }}
                className="hidden md:flex w-full bg-[#10B981] hover:bg-[#059669] text-white py-4 rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-300 shadow-md shadow-[#10B981]/20 items-center justify-center cursor-pointer"
              >
                BUY NOW
              </a>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+919746321808"
                  className="bg-wood-800 hover:bg-wood-900 text-white py-3 md:py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Showroom
                </a>
                <button
                  type="button"
                  onClick={() => setIsEnquiryModalOpen(true)}
                  className="bg-white border border-wood-300 hover:bg-wood-100/50 text-wood-800 py-3 md:py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  Request Custom
                </button>
              </div>
            </div>

            {/* Specifications Tabs */}
            <div className="mt-8 border border-wood-200/50 bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex border-b border-wood-100 gap-6 pb-3 mb-4">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeTab === 'specs' ? 'text-wood-900' : 'text-wood-400 hover:text-wood-600'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('features')}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeTab === 'features' ? 'text-wood-900' : 'text-wood-400 hover:text-wood-600'
                  }`}
                >
                  Key Features
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    activeTab === 'care' ? 'text-wood-900' : 'text-wood-400 hover:text-wood-600'
                  }`}
                >
                  Care Guide
                </button>
              </div>

              {activeTab === 'specs' && (
                <div className="flex flex-col gap-3.5 text-xs text-wood-700">
                  <div className="flex justify-between py-1.5 border-b border-wood-50">
                    <span className="font-semibold text-wood-500">Dimensions</span>
                    <span className="text-right font-medium text-wood-900">{product.dimensions}</span>
                  </div>
                  {Object.entries(product.specifications || {})
                    .filter(([key]) => key !== 'custom_variants' && key !== 'seo_keywords' && key !== 'seo_canonical' && key !== 'is_matrix_pricing' && key !== 'matrix_attributes' && key !== 'matrix_combinations')
                    .map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1.5 border-b border-wood-50">
                        <span className="font-semibold text-wood-500">{key}</span>
                        <span className="text-right font-medium text-wood-900">{val as string}</span>
                      </div>
                    ))}
                </div>
              )}

              {activeTab === 'features' && (
                <ul className="flex flex-col gap-3 text-xs text-wood-700 font-medium">
                  {product.features && product.features.length > 0 ? (
                    product.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-gold-600 shrink-0" />
                      <span>Termite treated & kiln seasoned timber</span>
                    </li>
                  )}
                </ul>
              )}

              {activeTab === 'care' && (
                <div className="text-xs text-wood-600/90 leading-relaxed flex flex-col gap-2.5">
                  <p>• Avoid exposing wood to direct, intense sunlight for extended periods.</p>
                  <p>• Dust regular items with a dry, soft lint-free microfiber cloth.</p>
                  <p>• Wipe spills immediately with a slightly damp cloth, then wipe dry.</p>
                  <p>• Do not use abrasive cleaners, chemical polishes, or vinegar sprays.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Related Products Slider */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-wood-200/50 pt-20">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-wood-900 mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {relatedProducts.map((p) => (
                 <Link
                   key={p.id}
                   to={`/products/${p.slug}`}
                   replace
                   className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-wood-200/30 premium-card-shadow"
                 >
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-white p-2 border-b border-wood-100/30">
                    <Image
                      src={p.featured_image}
                      alt={p.name}
                      objectFit="contain"
                      className="w-full h-full group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] text-wood-400 font-bold uppercase tracking-wider block mb-1">{p.category}</span>
                    <h3 className="font-serif text-base font-bold text-wood-900 group-hover:text-wood-700 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <div className="flex items-center justify-between mt-4 text-xs font-semibold text-wood-600 border-t border-wood-50 pt-3">
                      <span>{p.wood_type}</span>
                      <span className="text-gold-600 group-hover:underline flex items-center gap-0.5">
                        View
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products */}
        {recentlyViewed.length > 0 && (
          <div className="border-t border-wood-200/50 pt-20 mt-20">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-wood-900 mb-8">
              Recently Viewed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentlyViewed.map((p) => (
                <Link
                  key={p.id}
                  to={`/products/${p.slug}`}
                  replace
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-wood-200/30 premium-card-shadow"
                >
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-white p-2 border-b border-wood-100/30">
                    <Image
                      src={p.featured_image}
                      alt={p.name}
                      objectFit="contain"
                      className="w-full h-full group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[9px] text-wood-400 font-bold uppercase tracking-wider block mb-1">{p.category}</span>
                    <h3 className="font-serif text-base font-bold text-wood-900 group-hover:text-wood-700 transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <div className="flex justify-between items-end mt-4 border-t border-wood-50 pt-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-wider text-wood-400 font-semibold leading-none mb-1">Starting from</span>
                        <span className="text-xs font-bold text-wood-850 leading-none">₹{(p.base_price || 25000).toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-xs font-bold text-gold-600 group-hover:underline inline-flex items-center gap-0.5 leading-none">
                        View
                        <ArrowRight className="w-3 h-3 text-gold-500" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Floating Fixed Bottom CTA Bar for Mobile (Exact green BUY NOW pill without cart icon) */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-wood-200/60 z-40 md:hidden shadow-lg">
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              supabase.rpc('increment_product_metric', { product_id: product.id, metric_type: 'whatsapp' }).then(({ error }) => { if (error) console.error(error); });
            }}
            className="w-full bg-[#10B981] active:bg-[#059669] text-white py-3.5 rounded-full font-bold uppercase tracking-wider text-xs shadow-md shadow-[#10B981]/20 flex items-center justify-center cursor-pointer text-center"
          >
            BUY NOW
          </a>
        </div>

        <EnquiryModal
          isOpen={isEnquiryModalOpen}
          onClose={() => setIsEnquiryModalOpen(false)}
          productName={product?.name}
          productCategory={product?.category}
        />

        {/* Fullscreen Lightbox Zoom Modal */}
        {isLightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt={product.name}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductDetails;
