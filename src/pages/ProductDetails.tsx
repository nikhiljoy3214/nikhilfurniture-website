import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, ArrowLeft, ArrowRight, Check, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { Image } from '../components/Image';
import { SEO } from '../components/SEO';
import { WishlistButton } from '../components/WishlistButton';

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
  const viewTrackedSlug = useRef<string | null>(null);

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
    <div className="py-12 bg-wood-50">
      <SEO
        title={product.seo_title || `${product.name} in Thrissur | Solid Wood Furniture`}
        description={product.seo_description || `Purchase custom ${product.name} in Thrissur, Kerala. Handmade in seasoned ${product.wood_type} with durable ${product.finish} finish. Direct delivery across Kerala.`}
        ogImage={product.featured_image}
        schemaType="Product"
        productSchemaData={{
          name: product.name,
          image: product.featured_image,
          description: product.short_description,
          woodType: product.wood_type,
          finish: product.finish,
          dimensions: product.dimensions,
          url: window.location.href
        }}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: product.category, url: `/products?category=${encodeURIComponent(product.category)}` },
          { name: product.name, url: window.location.pathname }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Back navigation */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-wood-600 hover:text-wood-950 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          
          {/* Left: Gallery Picker */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Primary Main Image Box */}
            <div className="rounded-3xl overflow-hidden shadow-sm border border-wood-200/40 relative bg-white aspect-[4/3] max-h-[500px]">
              <Image
                src={selectedImage}
                alt={product.alt_text || product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 z-10">
                <WishlistButton product={product} className="shadow-md" showText={false} />
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {product.gallery_images && product.gallery_images.length > 1 && (
              <div className="flex items-center gap-4 overflow-x-auto py-2">
                {product.gallery_images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-24 h-18 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img
                        ? 'border-gold-500 scale-102 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Metadata & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <span className="text-xs text-gold-600 font-bold uppercase tracking-[0.15em] block mb-2">{product.category}</span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-wood-900 tracking-wide leading-tight mb-4">
                {product.name}
              </h1>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-wood-100 text-wood-800 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-wood-200/40">
                  {product.wood_type}
                </span>
                <span className="bg-gold-50 text-gold-700 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-gold-200/30">
                  {product.finish}
                </span>
              </div>

              <p className="text-sm text-wood-700 leading-relaxed">
                {product.detailed_description}
              </p>
            </div>

            {/* Price & Wood Variant Selector */}
            <div className="bg-white p-6 rounded-3xl border border-wood-200/40 shadow-sm flex flex-col gap-5">
              <div>
                <span className="text-[10px] text-wood-500 uppercase font-bold tracking-wider block mb-1">Estimated Price (Starts From)</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-wood-950">
                    {formatPrice(getCalculatedPrice())}
                  </span>
                  <span className="text-[10px] text-wood-500 font-sans italic">
                    *Excludes shipping & taxes
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
                      <div className="flex flex-col gap-4">
                        {attrs.map((attr: any) => (
                          <div key={attr.name} className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-wood-500 uppercase font-bold tracking-wider">
                              Select {attr.name}
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {attr.values?.map((val: string) => {
                                const isSelected = selectedVariants[attr.name] === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => setSelectedVariants(prev => ({ ...prev, [attr.name]: val }))}
                                    className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold border transition-all ${
                                      isSelected
                                        ? 'bg-wood-800 border-wood-800 text-white shadow-sm scale-[1.02]'
                                        : 'bg-wood-50/50 border-wood-200 text-wood-800 hover:bg-wood-100'
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
                <>
                  <div>
                    <span className="text-[10px] text-wood-500 uppercase font-bold tracking-wider block mb-3">Timber Selection (Wood Variant)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                      {woodVariants.map((variant) => (
                        <button
                          key={variant.name}
                          type="button"
                          onClick={() => setSelectedWood(variant.name)}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                            selectedWood === variant.name
                              ? 'bg-wood-800 border-wood-800 text-white shadow-sm scale-[1.02]'
                              : 'bg-wood-50/50 border-wood-200 text-wood-800 hover:bg-wood-100'
                          }`}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {product.specifications && product.specifications.custom_variants && (() => {
                    try {
                      const vars = typeof product.specifications.custom_variants === 'string'
                        ? JSON.parse(product.specifications.custom_variants)
                        : product.specifications.custom_variants;
                      if (!Array.isArray(vars) || vars.length === 0) return null;

                      return (
                        <div className="flex flex-col gap-4 mt-3 border-t border-wood-100 pt-4">
                          {vars.map((v: any) => (
                            <div key={v.name} className="flex flex-col gap-1.5">
                              <span className="text-[10px] text-wood-500 uppercase font-bold tracking-wider">
                                Select {v.name}
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {v.options?.map((opt: any) => {
                                  const isSelected = selectedVariants[v.name] === opt.name;
                                  const surchargeText = opt.priceSurcharge > 0 ? ` (+₹${opt.priceSurcharge.toLocaleString('en-IN')})` : '';
                                  return (
                                    <button
                                      key={opt.name}
                                      type="button"
                                      onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt.name }))}
                                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                                        isSelected
                                          ? 'bg-wood-800 border-wood-800 text-white shadow-sm'
                                          : 'bg-wood-50/50 border-wood-200 text-wood-800 hover:bg-wood-100'
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
                </>
              )}
            </div>

            {/* Action buttons (Showroom CTA focuses) */}
            <div className="flex flex-col gap-3 pt-4 border-t border-wood-200/40">
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  supabase.rpc('increment_product_metric', { product_id: product.id, metric_type: 'whatsapp' }).then(({ error }) => { if (error) console.error(error); });
                }}
                className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white py-4 rounded-full font-semibold uppercase tracking-wider text-xs transition-all duration-300 shadow-md shadow-[#25D366]/10 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                Enquire via WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+919746321808"
                  className="bg-wood-800 hover:bg-wood-900 text-white py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Showroom
                </a>
                <Link
                  to="/contact"
                  className="bg-white border border-wood-300 hover:bg-wood-100/50 text-wood-800 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5" />
                  Request Custom
                </Link>
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
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-wood-200/30 premium-card-shadow"
                >
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={p.featured_image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
                  className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-wood-200/30 premium-card-shadow"
                >
                  <div className="h-48 relative overflow-hidden">
                    <Image
                      src={p.featured_image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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

      </div>
    </div>
  );
};
export default ProductDetails;
