import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, MessageCircle, Star, Award, Shield, Hammer, Sparkles, Instagram, MapPin, X, ChevronLeft, ChevronRight, Check, Clock } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { Image } from '../components/Image';
import { SEO } from '../components/SEO';
import { WishlistButton } from '../components/WishlistButton';

gsap.registerPlugin(ScrollTrigger);

export const Home: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeConfig, setHomeConfig] = useState<any>(null);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dynamicTestimonials, setDynamicTestimonials] = useState<any[]>([]);
  
  // Tab control for product grid
  const [activeProductTab, setActiveProductTab] = useState<'featured' | 'popular' | 'new'>('featured');
  
  // Interactive manufacturing steps
  const [activeMfgStep, setActiveMfgStep] = useState(0);

  // Testimonial slider state
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Lightbox modal for recent installations
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

  // Stats counters
  const [stats, setStats] = useState({
    years: 0,
    delivered: 0,
    families: 0,
    craftsmanship: 0
  });

  // GSAP animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const mfgRef = useRef<HTMLDivElement>(null);
  const woodTypesRef = useRef<HTMLDivElement>(null);

  // Mouse interaction parallax for desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bgRef.current) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    const moveX = (clientX / innerWidth - 0.5) * 15;
    const moveY = (clientY / innerHeight - 0.5) * 15;
    
    gsap.to(bgRef.current, {
      x: moveX,
      y: moveY,
      duration: 1.2,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!bgRef.current) return;
    gsap.to(bgRef.current, {
      x: 0,
      y: 0,
      duration: 1.5,
      ease: 'power2.out'
    });
  };

  useEffect(() => {
    const fetchSignatureProductsAndConfig = async () => {
      try {
        // 1. Fetch products
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('*')
          .or('is_featured.eq.true,is_popular.eq.true,is_new_arrival.eq.true')
          .order('created_at', { ascending: false });

        if (prodError) throw prodError;
        if (prodData) setAllProducts(prodData as Product[]);

        // 2. Fetch categories
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('is_visible', true)
          .order('sort_order', { ascending: true });

        if (catData) setDbCategories(catData);

        // 3. Fetch homepage config
        const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
        const configKey = isPreview ? 'homepage_draft' : 'homepage';

        const { data: settingsData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', configKey)
          .single();

        if (settingsData && settingsData.value) {
          setHomeConfig(settingsData.value);
        }

        // Fetch testimonials dynamic module
        const testKey = isPreview ? 'testimonials_module_draft' : 'testimonials_module';
        const { data: testData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', testKey)
          .single();

        if (testData && testData.value && Array.isArray(testData.value.testimonials)) {
          setDynamicTestimonials(testData.value.testimonials);
        }
      } catch (err) {
        console.error('Error fetching spotlights/homepage configs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSignatureProductsAndConfig();
  }, []);

  // GSAP ScrollTrigger Animations
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // 1. Hero Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-bg', 
        { scale: 1.06 }, 
        { scale: 1.01, duration: 2.5, ease: 'power2.out' }
      );

      tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, '-=2.0')
        .to('.hero-title', { opacity: 1, y: 0, duration: 1.0 }, '-=1.6')
        .to('.hero-tagline', { opacity: 1, y: 0, duration: 0.8 }, '-=1.2')
        .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, '-=0.8');

      // Setup stats animate values
      const targetYears = homeConfig?.stats?.years?.number ?? 30;
      const targetDelivered = homeConfig?.stats?.delivered?.number ?? 15000;
      const targetFamilies = homeConfig?.stats?.families?.number ?? 8000;
      const targetCraftsmanship = homeConfig?.stats?.craftsmanship?.number ?? 45;

      tl.to('.hero-stats-wrapper', { 
        opacity: 1, 
        y: 0, 
        duration: 0.8,
        onStart: () => {
          const statsObj = { years: 0, delivered: 0, families: 0, craftsmanship: 0 };
          gsap.to(statsObj, {
            years: targetYears,
            delivered: targetDelivered,
            families: targetFamilies,
            craftsmanship: targetCraftsmanship,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
              setStats({
                years: Math.round(statsObj.years),
                delivered: Math.round(statsObj.delivered),
                families: Math.round(statsObj.families),
                craftsmanship: Math.round(statsObj.craftsmanship)
              });
            }
          });
        }
      }, '-=0.4');

      // 2. Hero scroll parallax triggers
      gsap.to('.hero-bg', {
        scale: 1.15,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.to('.hero-content-wrapper', {
        yPercent: 12,
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      // 3. Reveal scroll effects: Company Intro
      gsap.fromTo('.intro-reveal-img',
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: introRef.current,
            start: 'top 75%'
          }
        }
      );

      gsap.fromTo('.intro-reveal-text',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: introRef.current,
            start: 'top 75%'
          }
        }
      );

      // 4. Reveal Categories Grid
      gsap.fromTo('.reveal-card', 
        { y: 45, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: categoriesRef.current,
            start: 'top 80%'
          }
        }
      );

      // 5. Wood quality section scroll parallax
      gsap.fromTo('.wood-texture',
        { yPercent: -15 },
        {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: woodTypesRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );

      // 6. Manufacturing steps reveal
      gsap.fromTo('.mfg-reveal-step',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mfgRef.current,
            start: 'top 75%'
          }
        }
      );
    });

    return () => ctx.revert();
  }, [loading, homeConfig]);

  // --- DYNAMIC DATA ASSIGNMENTS ---
  const activeHero = homeConfig?.hero || {
    enabled: true,
    badge: 'Celebrating 30+ Years of Craftsmanship',
    heading: 'Where Timeless Craftsmanship Meets Modern Living.',
    subheading: 'With over 30 years of heritage in Kerala, we shape premium timber into bespoke masterpieces. Generational carpentry meets climate-resilient engineering to craft furniture that stands firm for lifetimes.',
    featured_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
    primary_btn_text: 'Explore Collections',
    primary_btn_link: '/products',
    secondary_btn_text: 'WhatsApp Consultation',
    secondary_btn_link: 'https://wa.me/919746321808',
    overlay_opacity: 40
  };

  const activeAbout = homeConfig?.about || {
    enabled: true,
    heading: 'Generations of Carpentry Trust in Kerala',
    description: 'Nikhil Furniture is not just a showroom, it is a 30-year legacy of wooden carpentry located in Pudukkad, Thrissur. We believe that wood is a living material, and crafting it requires an understanding of humidity controls, fiber structure, and seasoned joinery. From selection at Nilambur government timber depots to final multi-layer PU finishes, we handle every detail inside our own workshop facility. No pre-laminated sheets or cheap compressed particles—only genuine hardwood built to survive tropical seasons.',
    experience_badge: '1995',
    image1: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg',
    image2: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
    btn_text: 'OUR STORY',
    btn_link: '/about'
  };

  const activeWhy = homeConfig?.whyChooseUs || {
    enabled: true,
    heading: 'Built on Concrete Values',
    cards: [
      { id: '1', title: '30+ Years of Experience', desc: 'Crafting premium furniture in Kerala since 1995. We understand timber, client needs, and generational aesthetics.', sort_order: 1, enabled: true },
      { id: '2', title: 'Premium Wood Selection', desc: 'Only the highest quality Teak, Rosewood, Mahogany, Jackwood, and Walnut logs sourced legally from government depots.', sort_order: 2, enabled: true },
      { id: '3', title: 'Experienced Craftsmen', desc: 'Generational woodcarvers and carpenters who build structural integrity through mortise-and-tenon interlocking joins.', sort_order: 3, enabled: true },
      { id: '4', title: 'Made-to-Order Customization', desc: 'Tailor-made items fitted to your site dimensions. Modify wood types, configurations, storage styles, and polish finishes.', sort_order: 4, enabled: true },
      { id: '5', title: 'Quality PU Finishes', desc: 'Protected with high-end PU sealer and glossy/matte stains to shield timber fibers from Kerala\'s humid monsoon seasons.', sort_order: 5, enabled: true },
      { id: '6', title: 'Trusted Across Kerala', desc: 'Trusted by families, corporate offices, hotels, and luxury resorts across Cochin, Thrissur, Calicut, and Trivandrum.', sort_order: 6, enabled: true }
    ]
  };

  // Why choose us icons mapping helper
  const getWhyIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('experience') || t.includes('year')) return <Award className="w-6 h-6" />;
    if (t.includes('wood') || t.includes('selection')) return <Shield className="w-6 h-6" />;
    if (t.includes('craft') || t.includes('carpenter')) return <Hammer className="w-6 h-6" />;
    if (t.includes('finish') || t.includes('pu')) return <Check className="w-6 h-6" />;
    if (t.includes('trust') || t.includes('kerala')) return <MapPin className="w-6 h-6" />;
    return <Sparkles className="w-6 h-6" />;
  };

  // Dynamic Featured Categories Override
  const selectedSlugs = homeConfig?.featuredCategories?.selected_slugs || ['wooden-sofa-sets', 'wooden-dining-tables', 'wooden-cots', 'wardrobes-almirahs', 'customized-furniture'];
  const maxCats = homeConfig?.featuredCategories?.max_count || 6;
  const categories = dbCategories.length > 0
    ? dbCategories
        .filter(c => selectedSlugs.includes(c.slug))
        .slice(0, maxCats)
        .map(c => ({
          name: c.name,
          desc: c.description || '',
          path: `/products?category=${encodeURIComponent(c.name)}`,
          image: c.thumbnail_image
        }))
    : [
        { name: 'Wooden Sofa Sets', desc: 'Premium handcrafted sofa sets designed for formal living areas.', path: '/products?category=Wooden+Sofa+Sets', image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg' },
        { name: 'Wooden Dining Tables', desc: 'Sturdy, premium wooden dining tables with hand-carved details.', path: '/products?category=Wooden+Dining+Tables', image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg' },
        { name: 'Wooden Cots', desc: 'Platform beds and poster cots for the perfect night\'s sleep.', path: '/products?category=Wooden+Cots', image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg' },
        { name: 'Wardrobes / Almirahs', desc: 'Spacious wardrobes with customized lockers and hanging rods.', path: '/products?category=Wardrobes+/+Almirahs', image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' },
        { name: 'Customized Furniture', desc: '100% tailor-made wooden temples, oonjals, and custom frames.', path: '/products?category=Customized+Furniture', image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' }
      ];

  // Dynamic Spotlights
  const activeSpotlights = homeConfig?.featuredProducts || {
    heading: 'Signature Pieces',
    description: 'A curated selection of our finest works, showcasing teak wood craftsmanship, rich natural grains, and stunning designs.'
  };

  const getFilteredProducts = () => {
    const activeMode = homeConfig?.featuredProducts?.mode || 'featured';
    const limit = homeConfig?.featuredProducts?.max_count || 8;

    let baseList = allProducts;
    if (activeProductTab === 'featured') {
      baseList = allProducts.filter(p => p.is_featured);
    } else if (activeProductTab === 'popular') {
      baseList = allProducts.filter(p => p.is_popular);
    } else {
      baseList = allProducts.filter(p => p.is_new_arrival);
    }

    // Secondary filter according to CMS overrides
    if (activeMode === 'featured') {
      baseList = baseList.filter(p => p.is_featured);
    } else if (activeMode === 'popular') {
      baseList = baseList.filter(p => p.is_popular);
    }
    return baseList.slice(0, limit);
  };

  // Dynamic Manufacturing Timeline Steps
  const activeMfg = homeConfig?.mfgProcess || {
    heading: 'The Art of Creation',
    description: 'From forest depots to finished showroom masterpieces, learn how we engineer high-durability furniture.'
  };

  const manufacturingSteps = homeConfig?.mfgProcess?.steps
    ? homeConfig.mfgProcess.steps.map((s: any, idx: number) => ({
        id: `0${idx + 1}`,
        title: s.title,
        label: s.title,
        desc: s.desc,
        img: idx === 0 
          ? 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg'
          : idx === 1
          ? 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg'
          : idx === 2
          ? 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg'
          : 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg'
      }))
    : [
        { id: '01', title: 'Selecting Timber', label: 'Premium Sourcing', desc: 'We procure A-grade logs (Teak, Rosewood, Mahogany) exclusively from Nilambur depots and certified plantations, examining grain direction, moisture levels, and structural health.', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg' },
        { id: '02', title: 'Chamber Seasoning', label: 'Moisture Control', desc: 'Logs are cut to dimensions and dried inside computer-regulated solar and steam kiln chambers. We reduce moisture content to 8-12% to prevent warp, split, and expansion.', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg' },
        { id: '03', title: 'Carpentry Joinery', label: 'Generational Craft', desc: 'Our team of expert carpenters handcrafts each frame. We execute mortise-and-tenon and dovetail joinery structures without relying on cheap hardware or brackets.', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg' },
        { id: '04', title: 'Finishing & PU Stains', label: 'Rich Polishing', desc: 'Each piece undergoes multiple rounds of fine-grit hand-sanding. We apply specialized anti-humidity base coats, followed by natural matte or honey PU stains.', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' },
        { id: '05', title: 'Quality Validation', label: 'Rigid Inspection', desc: 'Every joint, drawer alignment, and PU polish uniformity is inspected. Only when it matches our strict design parameters is it approved for packaging.', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg' },
        { id: '06', title: 'Safe Delivery & Set', label: 'Kerala Transport', desc: 'The finished furniture is wrapped in heavy protective blankets and delivered directly to your doorstep using our own logistics trucks, followed by final assembly.', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg' }
      ];

  // Dynamic Wood Types Section
  const activeWood = homeConfig?.woodTypes || {
    heading: 'Timber Species Library'
  };

  const woodSpeciesList = homeConfig?.woodTypes?.cards
    ? homeConfig.woodTypes.cards.map((c: any) => ({
        name: c.name,
        characteristics: c.desc,
        durability: c.benefits,
        appearance: 'Clean grain swirls',
        recommended: 'Premium carving furniture'
      }))
    : [
        { name: 'Nilambur Teak Wood', characteristics: 'High natural oil content, golden grain lines, and natural resistance to decay.', durability: 'Excellent (Immune to termites and water dampness)', appearance: 'Rich golden brown, darkening with age', recommended: 'Sofa sets, main door frames, and custom dining tables' },
        { name: 'Malabar Rosewood', characteristics: 'Very high density, heavy hardwood, and spectacular dark swirl lines.', durability: 'Exceptional (Stands firm for generations)', appearance: 'Deep purple-brown streaks with smooth luster', recommended: 'Signature sit-out benches (Padi) and royal cot panels' },
        { name: 'Premium Mahogany', characteristics: 'Fine straight grains, highly stable, and holds PU polishes beautifully.', durability: 'High (Minimal expansion or shrinkage)', appearance: 'Reddish-brown color maturing to deep red', recommended: 'Multi-door wardrobes, dining chairs, and bookshelf cases' },
        { name: 'Kerala Jackwood', characteristics: 'Bright yellow timber curing to deep brown. Regarded as sacred and durable.', durability: 'Very Durable (Naturally immune to wood pests)', appearance: 'Warm golden yellow with fine wood rays', recommended: 'Traditional puja mandapams and custom entry frames' },
        { name: 'Anjili Wood', characteristics: 'High moisture resistance, budget-friendly hardwood ideal for outdoor conditions.', durability: 'Durable (Resistant to Kerala humidity)', appearance: 'Medium brown with golden highlights', recommended: 'Corridor benches, partitioning doors, and window frames' },
        { name: 'Walnut Wood', characteristics: 'Elegant grain swirls, shock-resistant timber, and premium weight profile.', durability: 'High (Durable and warp-resistant)', appearance: 'Rich dark chocolate brown with swirly configurations', recommended: 'Bespoke office desks and modern platform beds' }
      ];

  // Dynamic Testimonials Section
  const maxTestimonials = homeConfig?.testimonials?.max_count || 6;
  const rawTestimonials = (dynamicTestimonials.length > 0
    ? dynamicTestimonials.filter((t: any) => t.is_visible !== false)
    : [
        { name: 'Dr. Suresh Madhavan', loc: 'Kochi', purchase: 'Bespoke Dining Suite', text: 'Nikhil Furniture exceeded all our expectations. The wood quality is genuine Nilambur teak and the finish matches the premium international collections we saw in showrooms. A perfect addition to our home.', rating: 5, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
        { name: 'Meera Nair', loc: 'Thrissur', purchase: 'Custom Teak Wardrobe', text: 'The carpenters are highly skilled. They visited our home, took exact measurements of the wardrobe space, and designed a custom teak unit that fits perfectly. Highly recommended for custom wooden orders.', rating: 5, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
        { name: 'George Antony', loc: 'Calicut', purchase: 'Royal Rosewood Bench', text: 'Truly exceptional craftsmanship. The tongue-and-groove joints are incredibly sturdy and the natural matte PU polish showcases the rosewood grains beautifully. Truly a piece to pass down generations.', rating: 5, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' }
      ]
  ).map((t: any) => ({
    name: t.name,
    loc: t.location || t.loc || '',
    purchase: t.purchased_item || t.purchase || '',
    text: t.content || t.text || '',
    rating: t.rating || 5,
    avatar: t.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  }));

  const testimonials = rawTestimonials.slice(0, maxTestimonials);

  const handlePrevTestimonial = () => {
    setActiveTestimonial(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setActiveTestimonial(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Dynamic Gallery Section
  const activeGallery = homeConfig?.gallery || {
    enabled: true,
    heading: 'Recent Showcases',
    description: 'Actual furniture setups inside our clients\' beautiful homes across Kerala',
    images_count: 4
  };

  const recentInstallations = [
    { title: 'Teak Dining Set', loc: 'Kochi Villa', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg' },
    { title: 'Royal Teak Cots', loc: 'Thrissur Residence', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg' },
    { title: 'Heritage Sofa Suite', loc: 'Calicut Home', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg' },
    { title: 'Premium Walnut Wardrobe', loc: 'Palakkad Apartment', img: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg' }
  ];

  // Dynamic Instagram Settings
  const activeInstagram = homeConfig?.instagram || {
    heading: 'Follow Our Journey',
    description: 'Sneak peeks of daily workshop woodcarving over on Instagram',
    instagram_url: 'https://www.instagram.com/nikhil__furniture',
    btn_text: 'FOLLOW ON INSTAGRAM'
  };

  // Dynamic Contact CTA Section
  const activeCta = homeConfig?.contactCta || {
    heading: 'Let\'s Build Furniture That Lasts Generations.',
    description: 'Whether you want custom lengths, specific PU coatings, or wood sourced from government depots, our Thrissur woodworking workshop is ready. Reach out today for drawings and quotations.',
    btn_text: 'Consult on WhatsApp',
    whatsapp_number: '9746321808',
    background_image: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg'
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEO
        title="Nikhil Furniture | Handcrafted Teak & Rosewood Furniture in Kerala"
        description="Crafting premium, climate-resilient wooden furniture in Thrissur, Kerala since 1995. Explore customizable sofa sets, dining tables, royal cots, and wardrobes."
        schemaType="FurnitureStore"
        ogImage="https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg"
      />

      {/* 1. HERO SECTION */}
      {activeHero.enabled !== false && (
        <section 
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative min-h-screen w-full bg-wood-950 text-white overflow-hidden select-none pt-8 pb-6 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-24"
        >
          <div ref={bgRef} className="absolute inset-0 z-0 scale-105 hero-bg">
            <img
              src={activeHero.featured_image}
              alt="Showroom premium furniture lifestyle"
              className="w-full h-full object-cover object-center"
              style={{ opacity: (activeHero.overlay_opacity || 40) / 100 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-wood-950/80 via-wood-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-wood-950 via-transparent to-transparent" />
          </div>

          <div className="absolute inset-0 z-0 pointer-events-none opacity-5 flex items-center justify-center">
            <svg className="w-[120%] h-[120%] animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,50 Q25,70 50,50 T100,50" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 z-10 w-full relative flex flex-col justify-between gap-6 sm:gap-12 lg:gap-16 hero-content-wrapper">
            <div className="max-w-3xl mt-0">
              <div className="hero-badge inline-flex items-center gap-2 bg-gold-400/10 border border-gold-400/20 px-4 py-1.5 rounded-full text-gold-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-0 translate-y-4 font-sans">
                <Sparkles className="w-3 h-3" />
                {activeHero.badge}
              </div>

              <h1 className="hero-title font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-tight mb-6 opacity-0 translate-y-8">
                {activeHero.heading.split('Meets').map((txt: string, index: number) => (
                  <React.Fragment key={index}>
                    {index === 1 ? <span className="text-gold-300">Meets {txt}</span> : txt}
                    {index === 0 && <br />}
                  </React.Fragment>
                ))}
              </h1>

              <p className="hero-tagline font-sans text-sm md:text-base text-wood-100/80 leading-relaxed mb-10 max-w-xl opacity-0 translate-y-6">
                {activeHero.subheading}
              </p>

              <div className="hero-cta flex flex-wrap gap-4 items-center opacity-0 translate-y-4">
                <Link
                  to={activeHero.primary_btn_link}
                  className="bg-gold-500 hover:bg-gold-600 text-wood-950 px-8 py-4 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all duration-300 shadow-lg shadow-gold-500/25 flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
                >
                  {activeHero.primary_btn_text}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <a
                  href={activeHero.secondary_btn_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-transparent border border-white/20 hover:border-white/60 hover:bg-white/5 text-white px-8 py-4 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all duration-300 flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  {activeHero.secondary_btn_text}
                </a>
              </div>
            </div>

            {/* Hero Stats */}
            {homeConfig?.stats?.enabled !== false && (
              <div className="hero-stats-wrapper border-t border-white/10 pt-4 sm:pt-8 mt-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 w-full opacity-0 translate-y-4 font-sans text-xs">
                <div className="flex flex-col gap-1">
                  <span className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {stats.years}+
                  </span>
                  <span className="text-[10px] text-wood-300 uppercase tracking-widest font-bold">
                    {homeConfig?.stats?.years?.label || 'Years Experience'}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {stats.delivered}+
                  </span>
                  <span className="text-[10px] text-wood-300 uppercase tracking-widest font-bold">
                    {homeConfig?.stats?.delivered?.label || 'Furniture Delivered'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {stats.families}+
                  </span>
                  <span className="text-[10px] text-wood-300 uppercase tracking-widest font-bold">
                    {homeConfig?.stats?.families?.label || 'Happy Families'}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="font-serif text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {stats.craftsmanship}%
                  </span>
                  <span className="text-[10px] text-wood-300 uppercase tracking-widest font-bold">
                    {homeConfig?.stats?.craftsmanship?.label || 'Craftsmanship Guarantee'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. COMPANY INTRODUCTION */}
      {activeAbout.enabled !== false && (
        <section ref={introRef} className="py-28 bg-white overflow-hidden border-b border-wood-100">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center font-sans">
            
            {/* Left Side */}
            <div className="lg:col-span-6 relative intro-reveal-img opacity-0">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/3] border border-wood-200/40 shadow-md">
                <Image 
                  src={activeAbout.image1} 
                  alt="Nikhil Furniture workshop craft" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-wood-950 text-white p-6 rounded-3xl border border-wood-800 shadow-lg hidden md:flex flex-col gap-1 max-w-[200px]">
                <span className="font-serif text-3xl font-bold text-gold-400">{activeAbout.experience_badge}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-wood-300">Carpentry Established</span>
              </div>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="intro-reveal-text opacity-0">
                <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Authentic Timber Heritage</span>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2 mb-4 leading-tight">
                  {activeAbout.heading}
                </h2>
              </div>
              <p className="intro-reveal-text opacity-0 text-sm text-wood-700 leading-relaxed max-w-xl font-semibold">
                {activeAbout.description}
              </p>
              
              <div className="intro-reveal-text opacity-0 grid grid-cols-2 gap-4 mt-4 text-xs font-bold text-wood-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gold-50 border border-gold-200 text-gold-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>100% Genuine Timber</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gold-50 border border-gold-200 text-gold-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Bespoke Custom Orders</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. FEATURED COLLECTIONS */}
      {(!homeConfig || homeConfig.featuredCategories?.enabled !== false) && (
        <section ref={categoriesRef} className="py-28 bg-wood-50 border-b border-wood-150 font-sans">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
              <div className="max-w-2xl">
                <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Catalog Showcases</span>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2 mb-4">
                  Explore Collections
                </h2>
                <p className="text-xs text-wood-600 leading-relaxed font-bold">
                  Browse our handcrafted items sorted by category. High-end custom wood designs built specifically for every living space.
                </p>
              </div>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 text-wood-800 hover:text-wood-950 font-bold uppercase tracking-wider text-xs border-b-2 border-gold-400 pb-1 transition-all mt-6 md:mt-0"
              >
                All Categories
                <ArrowRight className="w-4 h-4 text-gold-500" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat, index) => (
                <Link
                  key={index}
                  to={cat.path}
                  className="reveal-card group block relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-white border border-wood-200/30"
                >
                  <div className="h-72 relative overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-750"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wood-950/70 via-wood-950/10 to-transparent" />
                  </div>
                  <div className="p-8 flex flex-col justify-between min-h-[170px]">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-wood-900 group-hover:text-wood-700 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-wood-600 leading-relaxed mt-2.5 font-bold">
                        {cat.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gold-600 uppercase tracking-widest mt-6 group-hover:translate-x-1.5 transition-transform duration-300">
                      Browse Pieces
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. WHY CHOOSE NIKHIL FURNITURE */}
      {activeWhy.enabled !== false && (
        <section className="py-28 bg-white border-b border-wood-100 font-sans">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Standard of Excellence</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-wood-900 tracking-wide mt-3 mb-4">
                {activeWhy.heading}
              </h2>
              <p className="text-xs text-wood-600 font-bold">
                We stand apart from retail furniture warehouses. Every piece is handcrafted and climate-resilient.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeWhy.cards.filter((c: any) => c.enabled !== false).map((card: any) => (
                <div key={card.id} className="reveal-why bg-wood-50 p-8 rounded-3xl border border-wood-200/40 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-full bg-white text-gold-600 flex items-center justify-center mb-6 border border-wood-100">
                    {getWhyIcon(card.title)}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-wood-950 mb-2">{card.title}</h3>
                    <p className="text-xs text-wood-600 leading-relaxed font-semibold">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. SPOTLIGHT PRODUCTS */}
      {(!homeConfig || homeConfig.featuredProducts?.enabled !== false) && (
        <section className="py-28 bg-wood-50 font-sans">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Showroom Spotlights</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-wood-900 mt-3 mb-4">
                {activeSpotlights.heading}
              </h2>
              <p className="text-xs text-wood-600 font-bold">
                {activeSpotlights.description}
              </p>
              
              <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                {['featured', 'popular', 'new'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveProductTab(tab as any)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                      activeProductTab === tab
                        ? 'bg-wood-800 border-wood-800 text-white shadow-sm'
                        : 'bg-white border-wood-200 text-wood-700 hover:bg-wood-100'
                    }`}
                  >
                    {tab === 'featured' ? 'Spotlights' : tab === 'popular' ? 'Popular' : 'New Arrivals'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="animate-pulse flex flex-col gap-4">
                    <div className="h-64 bg-wood-100 rounded-3xl" />
                    <div className="h-6 bg-wood-100 w-3/4 rounded" />
                  </div>
                ))}
              </div>
            ) : getFilteredProducts().length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-wood-200/40 text-center text-wood-650">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
                {getFilteredProducts().map((product) => (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-wood-200/30 premium-card-shadow relative"
                  >
                    <div className="h-64 relative overflow-hidden">
                      <Link to={`/products/${product.slug}`} className="block h-full w-full">
                        <Image
                          src={product.featured_image}
                          alt={product.alt_text || product.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                        />
                      </Link>
                      <div className="absolute top-4 left-4 z-10 flex gap-2">
                        {product.is_featured && (
                          <span className="bg-gold-400 text-wood-950 font-sans text-[9px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm border border-gold-300">
                            Spotlight
                          </span>
                        )}
                        {product.is_new_arrival && (
                          <span className="bg-emerald-500 text-white font-sans text-[9px] uppercase font-bold tracking-wider px-3 py-1 rounded-full shadow-sm border border-emerald-400">
                            New
                          </span>
                        )}
                      </div>
                      
                      <div className="absolute top-4 right-4 z-10">
                        <WishlistButton product={product} />
                      </div>
                    </div>

                    <div className="p-6 flex flex-col justify-between flex-grow min-h-[160px] font-sans">
                      <div>
                        <span className="text-[10px] text-wood-400 uppercase tracking-widest font-bold">
                          {product.category}
                        </span>
                        <h3 className="font-serif text-base font-bold text-wood-900 group-hover:text-wood-700 transition-colors mt-1 leading-snug">
                          <Link to={`/products/${product.slug}`}>{product.name}</Link>
                        </h3>
                        <p className="text-[11px] text-wood-500 mt-2 truncate font-semibold">
                          {product.wood_type} • {product.finish}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-wood-100 pt-4 mt-4">
                        <div className="flex flex-col">
                          <span className="text-[8px] uppercase tracking-wider text-wood-400 font-bold">Showroom starting at</span>
                          <span className="text-xs font-bold text-wood-950">₹{(product.base_price || 25000).toLocaleString('en-IN')}</span>
                        </div>
                        <Link
                          to={`/products/${product.slug}`}
                          className="text-[10px] font-bold text-gold-600 uppercase tracking-wider hover:text-wood-950 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. MANUFACTURING PROCESS TIMELINE */}
      {(!homeConfig || homeConfig.mfgProcess?.enabled !== false) && (
        <section ref={mfgRef} className="py-28 bg-white border-b border-wood-100 font-sans">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Process Quality</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-wood-900 tracking-wide mt-3 mb-4">
                {activeMfg.heading}
              </h2>
              <p className="text-xs text-wood-600 font-bold">
                {activeMfg.description}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left timeline index links */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {manufacturingSteps.map((step: any, idx: number) => {
                  const isActive = activeMfgStep === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveMfgStep(idx)}
                      className={`mfg-reveal-step text-left p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex gap-4 ${
                        isActive
                          ? 'bg-wood-50 border-wood-200/50 shadow-sm'
                          : 'bg-white border-transparent hover:bg-wood-50/30'
                      }`}
                    >
                      <span className={`font-serif text-xl font-bold shrink-0 mt-0.5 ${isActive ? 'text-gold-600' : 'text-wood-300'}`}>
                        {step.id}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600">
                          {step.label}
                        </span>
                        <h4 className="font-serif text-base font-bold text-wood-950">
                          {step.title}
                        </h4>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right timeline details and photo */}
              <div className="lg:col-span-7 relative">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/3] border border-wood-200/40 shadow-md">
                  <Image
                    src={manufacturingSteps[activeMfgStep].img}
                    alt={manufacturingSteps[activeMfgStep].title}
                    className="w-full h-full object-cover animate-fade-in"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-wood-950/70 via-transparent to-transparent" />
                  
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <p className="text-xs text-wood-200 font-bold leading-relaxed max-w-xl">
                      {manufacturingSteps[activeMfgStep].desc}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 7. TIMBER SPECIES LIBRARY */}
      {(!homeConfig || homeConfig.woodTypes?.enabled !== false) && (
        <section ref={woodTypesRef} className="py-28 bg-wood-950 text-white overflow-hidden relative">
          <div className="absolute inset-0 z-0 opacity-15 wood-texture pointer-events-none scale-110">
            <img
              src="https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg"
              alt="Timber species grain background texture"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 font-sans">
            <div className="max-w-2xl mb-20">
              <span className="text-gold-400 font-sans text-xs uppercase tracking-[0.2em] font-bold">Material Guide</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-wide text-white mt-2 mb-4">
                {activeWood.heading}
              </h2>
              <p className="text-xs text-wood-300">
                Explore the properties of our core seasoned hardwoods. Different grains, durability parameters, and aesthetics suitable for custom carpentry styles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {woodSpeciesList.slice(0, 3).map((item: any, idx: number) => (
                <div 
                  key={idx}
                  className="bg-wood-900/40 backdrop-blur-sm p-8 rounded-3xl border border-wood-850 flex flex-col gap-6 shadow-sm hover:border-wood-700/60 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                      {item.name}
                    </h3>
                    <span className="text-[10px] text-gold-400 uppercase tracking-wider font-bold">
                      {item.durability}
                    </span>
                  </div>
                  <p className="text-xs text-wood-300 leading-relaxed font-semibold">
                    {item.characteristics}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. RECENT INSTALLATIONS GALLERY */}
      {(!homeConfig || homeConfig.gallery?.enabled !== false) && (
        <section className="py-28 bg-white border-b border-wood-100 font-sans">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
              <div className="max-w-2xl">
                <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Recent Installations</span>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-wood-900 mt-2 mb-4">
                  {activeGallery.heading || 'Recent Showcases'}
                </h2>
                <p className="text-xs text-wood-600 leading-relaxed font-bold">
                  {activeGallery.description || 'Actual furniture setups inside our clients\' beautiful homes across Kerala'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentInstallations.slice(0, activeGallery.images_count || 4).map((inst: any, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedGalleryImage(inst.img)}
                  className="group relative rounded-3xl overflow-hidden aspect-square border border-wood-200/20 shadow-sm cursor-pointer"
                >
                  <Image src={inst.img} alt={inst.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-wood-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <span className="text-[10px] text-gold-400 font-bold uppercase tracking-wider">{inst.loc}</span>
                    <h5 className="font-serif text-sm font-bold text-white mt-1">{inst.title}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. TESTIMONIAL CUSTOMER REVIEWS */}
      {(!homeConfig || homeConfig.testimonials?.enabled !== false) && testimonials.length > 0 && (
        <section className="py-28 bg-wood-50 font-sans">
          <div className="max-w-5xl mx-auto px-6">
            
            <div className="text-center mb-16">
              <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Client Testimonials</span>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-wood-900 mt-3 mb-4">
                {homeConfig?.testimonials?.heading || 'What Our Clients Say'}
              </h2>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 border border-wood-200/40 shadow-sm relative flex flex-col md:flex-row gap-8 items-center min-h-[300px]">
              
              <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border border-wood-200 shadow-sm bg-wood-50">
                <img src={testimonials[activeTestimonial].avatar} alt={testimonials[activeTestimonial].name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-grow flex flex-col gap-4">
                <div className="flex gap-1 text-gold-500">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="font-serif text-base md:text-lg text-wood-850 italic leading-relaxed">
                  "{testimonials[activeTestimonial].text}"
                </p>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-wood-950 font-sans tracking-wide">
                    {testimonials[activeTestimonial].name}
                  </span>
                  <span className="text-[10px] text-wood-400 font-sans mt-0.5 font-bold">
                    {testimonials[activeTestimonial].loc} • Verified {testimonials[activeTestimonial].purchase} Owner
                  </span>
                </div>
              </div>

              {/* Prev / Next buttons */}
              {testimonials.length > 1 && (
                <div className="flex gap-2.5 absolute bottom-8 right-8">
                  <button
                    onClick={handlePrevTestimonial}
                    className="w-10 h-10 rounded-xl bg-wood-50 border border-wood-200 text-wood-600 hover:bg-wood-100 hover:text-wood-900 transition-colors flex items-center justify-center cursor-pointer border-none"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextTestimonial}
                    className="w-10 h-10 rounded-xl bg-wood-50 border border-wood-200 text-wood-600 hover:bg-wood-100 hover:text-wood-900 transition-colors flex items-center justify-center cursor-pointer border-none"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* 11. INSTAGRAM FEED PREVIEW */}
      {(!homeConfig || homeConfig.instagram?.enabled !== false) && (
        <section className="py-24 bg-white border-b border-wood-100 font-sans">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
              <div>
                <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Social Media Feed</span>
                <h2 className="font-serif text-2xl md:text-4xl font-bold text-wood-900 mt-2 mb-3">
                  {activeInstagram.heading}
                </h2>
                <p className="text-xs text-wood-600 font-bold">
                  {activeInstagram.description}
                </p>
              </div>

              <a
                href={activeInstagram.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-wood-950 text-white hover:bg-wood-900 px-6 py-3 rounded-full font-bold uppercase tracking-wider text-[9px] transition-colors flex items-center gap-2 mt-6 md:mt-0 shadow-sm"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                {activeInstagram.btn_text}
              </a>
            </div>

            {/* Dynamic layout grids for Insta photos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(activeInstagram.feed_items || [
                { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg', postUrl: activeInstagram.instagram_url },
                { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/dining.jpg', postUrl: activeInstagram.instagram_url },
                { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/bed.jpg', postUrl: activeInstagram.instagram_url },
                { imageUrl: 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/wardrobe.jpg', postUrl: activeInstagram.instagram_url }
              ]).map((item: any, index: number) => (
                <a 
                  key={index}
                  href={item.postUrl || activeInstagram.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="relative group block rounded-3xl overflow-hidden aspect-[3/4] border border-wood-200/20 shadow-sm"
                >
                  <Image src={item.imageUrl} className="w-full h-full" alt={`Instagram ${index + 1}`} />
                  <div className="absolute inset-0 bg-wood-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Instagram className="w-6 h-6" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 12. CONTACT CTA */}
      {(!homeConfig || homeConfig.contactCta?.enabled !== false) && (
        <section className="py-32 bg-wood-950 text-white relative overflow-hidden font-sans">
          <div className="absolute inset-0 z-0 opacity-10">
            <img
              src={activeCta.background_image}
              alt="Finishing call background texture"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="max-w-5xl mx-auto px-6 text-center z-10 relative flex flex-col items-center gap-8">
            <span className="text-gold-400 font-sans text-xs uppercase tracking-[0.25em] font-bold">Start Your Wooden Journey</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight max-w-3xl leading-tight">
              {activeCta.heading}
            </h2>
            <p className="text-sm text-wood-300 leading-relaxed max-w-2xl font-bold">
              {activeCta.description}
            </p>

            <div className="flex flex-wrap gap-4 items-center justify-center pt-4">
              <a
                href={`tel:+91${activeCta.whatsapp_number}`}
                className="bg-gold-500 hover:bg-gold-600 text-wood-950 px-8 py-4 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all duration-300 shadow-lg shadow-gold-500/20 flex items-center gap-2 hover:scale-[1.02]"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Showroom
              </a>
              
              <a
                href={`https://wa.me/91${activeCta.whatsapp_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-wood-50 text-wood-950 px-8 py-4 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all duration-300 flex items-center gap-2 hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                {activeCta.btn_text}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 13. LOCATION & MAPS */}
      <section id="showroom-location" className="py-24 bg-wood-100/40 border-t border-wood-200/50 font-sans">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5">
            <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Visit Our Showroom</span>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-wood-900 mt-3 mb-6">
              Come Visit Us
            </h2>
            <p className="text-sm text-wood-700 leading-relaxed mb-8 font-semibold">
              We welcome you to visit our physical showroom in Pudukkad, Thrissur to touch the wood finishes, sit on the sofa sets, check the almirah drawers, and inspect our joinery in person.
            </p>
            <div className="flex flex-col gap-4 text-sm text-wood-800">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-wood-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-wood-950">Showroom Address:</span>
                  <p className="mt-1 text-wood-700 font-semibold">
                    Nikhil Furniture,<br />
                    Pudukkad P.O., Thrissur,<br />
                    Kerala – PIN 680301 (Opposite Pudukkad Railway Station Road)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-wood-200 pt-4 mt-2">
                <Clock className="w-5 h-5 text-wood-600 shrink-0" />
                <div>
                  <span className="font-bold text-wood-950">Working Hours:</span>
                  <p className="mt-0.5 text-wood-700 font-semibold">{homeConfig?.footer?.working_hours || '9:00 AM - 7:00 PM (Monday - Saturday)'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 h-96 w-full rounded-3xl overflow-hidden shadow-md border border-wood-200">
            <iframe
              title="Nikhil Furniture Location Map"
              src="https://maps.google.com/maps?q=Thekkekara+Nikhil+furniture,Pudukkad,Kerala&hl=en&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

        </div>
      </section>

      {/* FLOAT WHATSAPP */}
      <a
        href={`https://wa.me/91${activeCta.whatsapp_number || '9746321808'}?text=Hello%2C%20I%20am%20interested%20in%20custom%20wooden%20furniture.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba56] text-white p-4 rounded-full shadow-lg shadow-[#25D366]/25 transition-transform duration-300 hover:scale-110 flex items-center justify-center border-none"
        aria-label="Enquire on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Lightbox Modal */}
      {selectedGalleryImage && (
        <div className="fixed inset-0 z-50 bg-wood-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center animate-zoom-in">
            <button
              onClick={() => setSelectedGalleryImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gold-400 bg-transparent border-none cursor-pointer p-2 flex items-center gap-1.5 font-bold text-xs"
            >
              <X className="w-5 h-5" /> Close
            </button>
            <img
              src={selectedGalleryImage}
              alt="Installation Zoom Preview"
              className="max-w-full max-h-[80vh] rounded-3xl border border-white/10 shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
