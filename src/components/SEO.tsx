import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface FAQItem {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'product';
  ogImage?: string;
  robotsMeta?: string;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  schemaType?: 'FurnitureStore' | 'LocalBusiness' | 'Product' | 'None';
  productSchemaData?: {
    name: string;
    image: string;
    description: string;
    woodType: string;
    finish: string;
    dimensions: string;
    url: string;
    price?: number;
    basePrice?: number;
    sku?: string;
    slug?: string;
  };
  itemListData?: { name: string; url: string; image?: string; position: number }[];
  reviewData?: { reviews: { author: string; rating: number; body: string }[]; ratingValue: number; reviewCount: number };
  imageGalleryData?: { name: string; contentUrl: string; description?: string }[];
}

// Global in-memory cache to prevent multiple fetches across page mounts
let cachedSeoSettings: any = null;

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  robotsMeta = 'index, follow',
  breadcrumbs,
  faqs,
  schemaType = 'None',
  productSchemaData,
  itemListData,
  reviewData,
  imageGalleryData
}) => {
  const [dbSeo, setDbSeo] = useState<any>(cachedSeoSettings);
  const [favicon, setFavicon] = useState<string>('');

  useEffect(() => {
    const fetchSeoAndFavicon = async () => {
      try {
        if (cachedSeoSettings) {
          setDbSeo(cachedSeoSettings);
        } else {
          const { data } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'seo_settings')
            .single();
          if (data && data.value) {
            cachedSeoSettings = data.value;
            setDbSeo(data.value);
          }
        }

        const { data: genData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'general')
          .single();
        if (genData && genData.value && genData.value.faviconUrl) {
          setFavicon(genData.value.faviconUrl);
        }
      } catch (err) {
        // Silent fallback to static props
      }
    };

    fetchSeoAndFavicon();
  }, []);

  // Compute final title, description, and keywords
  let finalTitle = title;
  let finalDescription = description;
  let finalKeywords = '';
  let finalCanonical = canonicalUrl || window.location.href;
  let finalOgImage = ogImage;

  // Resolve page slug based on path
  const pathname = window.location.pathname;
  let slug = 'home';
  if (pathname === '/about') slug = 'about';
  else if (pathname.startsWith('/products')) {
    const isProductDetail = pathname.split('/').filter(Boolean).length > 1;
    slug = isProductDetail ? 'product-detail' : 'products';
  }
  else if (pathname === '/categories') slug = 'categories';
  else if (pathname === '/manufacturing') slug = 'manufacturing';
  else if (pathname === '/gallery') slug = 'gallery';
  else if (pathname === '/faq') slug = 'faq';
  else if (pathname === '/contact') slug = 'contact';
  else if (pathname === '/privacy-policy') slug = 'privacy';
  else if (pathname === '/terms-conditions') slug = 'terms';

  // Apply overrides if page matches and custom settings are available
  if (dbSeo && slug !== 'product-detail') {
    if (dbSeo.global) {
      if (dbSeo.global.defaultKeywords) {
        finalKeywords = dbSeo.global.defaultKeywords;
      }
      if (!finalOgImage && dbSeo.global.ogImage) {
        finalOgImage = dbSeo.global.ogImage;
      }
      if (dbSeo.global.siteTitle && slug === 'home') {
        finalTitle = dbSeo.global.siteTitle;
      }
      if (dbSeo.global.siteDescription && slug === 'home') {
        finalDescription = dbSeo.global.siteDescription;
      }
    }

    if (Array.isArray(dbSeo.pages)) {
      const pageConfig = dbSeo.pages.find((p: any) => p.slug === slug);
      if (pageConfig) {
        if (pageConfig.meta_title) finalTitle = pageConfig.meta_title;
        if (pageConfig.meta_description) finalDescription = pageConfig.meta_description;
        if (pageConfig.keywords) {
          finalKeywords = finalKeywords ? `${finalKeywords}, ${pageConfig.keywords}` : pageConfig.keywords;
        }
        if (pageConfig.og_image) finalOgImage = pageConfig.og_image;
        if (pageConfig.canonical_url) finalCanonical = pageConfig.canonical_url;
      }
    }
  }

  useEffect(() => {
    // 1. Update Document Title
    document.title = finalTitle;

    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      if (!contentVal) return;
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    const setLinkTag = (relVal: string, hrefVal: string) => {
      // Find and remove any existing link tags with this rel to force browser repaint/refresh
      const existingElements = document.querySelectorAll(`link[rel="${relVal}"]`);
      existingElements.forEach(el => el.remove());

      const element = document.createElement('link');
      element.setAttribute('rel', relVal);
      element.setAttribute('href', hrefVal);
      document.head.appendChild(element);
    };

    // 2. Set Standard Meta Tags
    setMetaTag('name', 'description', finalDescription);
    if (finalKeywords) {
      setMetaTag('name', 'keywords', finalKeywords);
    }

    // 2b. Set Robots Meta Tag
    setMetaTag('name', 'robots', robotsMeta);

    // 3. Set Open Graph (Facebook/Instagram/WhatsApp preview)
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDescription);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', finalCanonical);
    if (finalOgImage) {
      setMetaTag('property', 'og:image', finalOgImage);
    }

    // 4. Set Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDescription);
    if (finalOgImage) {
      setMetaTag('name', 'twitter:image', finalOgImage);
    }

    // 5. Set Canonical Link & Favicon
    setLinkTag('canonical', finalCanonical);
    if (favicon) {
      const cacheBustingFavicon = `${favicon}${favicon.includes('?') ? '&' : '?'}v=2`;
      setLinkTag('icon', cacheBustingFavicon);
      setLinkTag('shortcut icon', cacheBustingFavicon);
      setLinkTag('apple-touch-icon', cacheBustingFavicon);
    }

    // 6. Inject Schema.org JSON-LD Script Tags
    const jsonLdScripts: HTMLScriptElement[] = [];

    const injectScript = (schemaData: object) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
      jsonLdScripts.push(script);
    };

    // Global Organization Schema
    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Nikhil Furniture',
      'url': window.location.origin,
      'logo': 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/logo.jpg',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91-9746321808',
        'contactType': 'customer service',
        'areaServed': 'IN',
        'availableLanguage': ['en', 'ml']
      },
      'sameAs': [
        'https://www.facebook.com/profile.php?id=100065195572493',
        'https://www.instagram.com/nikhil__furniture'
      ]
    };
    injectScript(orgSchema);

    // Global WebSite Schema
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Nikhil Furniture',
      'url': window.location.origin,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${window.location.origin}/products?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
    injectScript(websiteSchema);

    // Local Business & Furniture Store Schema (typically on Home/About/Contact)
    if (schemaType === 'FurnitureStore' || schemaType === 'LocalBusiness' || slug === 'home' || slug === 'contact') {
      const storeSchema = {
        '@context': 'https://schema.org',
        '@type': 'FurnitureStore',
        'name': 'Nikhil Furniture',
        'description': 'Premium handcrafted solid teak and rosewood furniture manufacturer and showroom in Thrissur, Kerala.',
        'image': finalOgImage || 'https://psbbpjdpadygskkjfyon.supabase.co/storage/v1/object/public/furniture/sofa.jpg',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Pudukkad P.O., Opposite Pudukkad Railway Station Road',
          'addressLocality': 'Pudukkad, Thrissur',
          'addressRegion': 'Kerala',
          'postalCode': '680301',
          'addressCountry': 'IN'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': '10.4156036',
          'longitude': '76.270145'
        },
        'url': window.location.origin,
        'telephone': '+91-9746321808',
        'priceRange': '$$$',
        'openingHoursSpecification': [
          {
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            'opens': '09:00',
            'closes': '19:00'
          }
        ],
        'sameAs': [
          'https://www.facebook.com/profile.php?id=100065195572493',
          'https://www.instagram.com/nikhil__furniture'
        ],
        'areaServed': [
          { '@type': 'AdministrativeArea', 'name': 'Thrissur' },
          { '@type': 'AdministrativeArea', 'name': 'Pudukkad' },
          { '@type': 'AdministrativeArea', 'name': 'Ernakulam' },
          { '@type': 'AdministrativeArea', 'name': 'Kochi' },
          { '@type': 'AdministrativeArea', 'name': 'Palakkad' },
          { '@type': 'AdministrativeArea', 'name': 'Kerala' }
        ]
      };
      injectScript(storeSchema);
    }

    // Breadcrumb Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'name': crumb.name,
          'item': crumb.url.startsWith('http') ? crumb.url : `${window.location.origin}${crumb.url}`
        }))
      };
      injectScript(breadcrumbSchema);
    }

    // FAQ Schema
    if (faqs && faqs.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer
          }
        }))
      };
      injectScript(faqSchema);
    }

    // Product Schema (for ProductDetails Page)
    if (schemaType === 'Product' && productSchemaData) {
      const dynamicPrice = productSchemaData.price || productSchemaData.basePrice || 25000;
      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': productSchemaData.name,
        'image': productSchemaData.image,
        'description': productSchemaData.description,
        'sku': productSchemaData.sku || productSchemaData.slug || '',
        'url': productSchemaData.url,
        'itemCondition': 'https://schema.org/NewCondition',
        'offers': {
          '@type': 'Offer',
          'priceCurrency': 'INR',
          'price': String(dynamicPrice),
          'availability': 'https://schema.org/InStock',
          'seller': {
            '@type': 'Organization',
            'name': 'Nikhil Furniture'
          },
          'priceSpecification': {
            '@type': 'PriceSpecification',
            'valueAddedTaxIncluded': true,
            'priceCurrency': 'INR',
            'price': String(dynamicPrice)
          }
        },
        'additionalProperty': [
          {
            '@type': 'PropertyValue',
            'name': 'Wood Type',
            'value': productSchemaData.woodType
          },
          {
            '@type': 'PropertyValue',
            'name': 'Finish',
            'value': productSchemaData.finish
          },
          {
            '@type': 'PropertyValue',
            'name': 'Dimensions',
            'value': productSchemaData.dimensions
          }
        ],
        'brand': {
          '@type': 'Brand',
          'name': 'Nikhil Furniture'
        }
      };
      injectScript(productSchema);
    }

    // ItemList Schema (for Products/Categories listing pages)
    if (itemListData && itemListData.length > 0) {
      const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': itemListData.map(item => ({
          '@type': 'ListItem',
          'position': item.position,
          'name': item.name,
          'url': item.url.startsWith('http') ? item.url : `${window.location.origin}${item.url}`,
          ...(item.image ? { 'image': item.image } : {})
        }))
      };
      injectScript(itemListSchema);
    }

    // AggregateRating + Review Schema (for Testimonials page)
    if (reviewData && reviewData.reviews.length > 0) {
      const reviewSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Nikhil Furniture',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': String(reviewData.ratingValue),
          'reviewCount': String(reviewData.reviewCount),
          'bestRating': '5',
          'worstRating': '1'
        },
        'review': reviewData.reviews.map(r => ({
          '@type': 'Review',
          'author': { '@type': 'Person', 'name': r.author },
          'reviewRating': {
            '@type': 'Rating',
            'ratingValue': String(r.rating),
            'bestRating': '5'
          },
          'reviewBody': r.body
        }))
      };
      injectScript(reviewSchema);
    }

    // ImageGallery Schema (for Gallery page)
    if (imageGalleryData && imageGalleryData.length > 0) {
      const gallerySchema = {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        'name': finalTitle,
        'description': finalDescription,
        'url': finalCanonical,
        'image': imageGalleryData.map(img => ({
          '@type': 'ImageObject',
          'name': img.name,
          'contentUrl': img.contentUrl,
          'description': img.description || img.name
        }))
      };
      injectScript(gallerySchema);
    }

    // AboutPage Specific Schema
    if (slug === 'about') {
      const aboutPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        'name': finalTitle,
        'description': finalDescription,
        'url': finalCanonical
      };
      injectScript(aboutPageSchema);
    }

    // ContactPage Specific Schema
    if (slug === 'contact') {
      const contactPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        'name': finalTitle,
        'description': finalDescription,
        'url': finalCanonical
      };
      injectScript(contactPageSchema);
    }

    // WebPage (Fallback page schema for other pages)
    if (slug !== 'home' && slug !== 'about' && slug !== 'contact' && schemaType !== 'Product') {
      const webPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        'name': finalTitle,
        'description': finalDescription,
        'url': finalCanonical
      };
      injectScript(webPageSchema);
    }

    return () => {
      jsonLdScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [finalTitle, finalDescription, finalKeywords, finalCanonical, ogType, finalOgImage, robotsMeta, breadcrumbs, faqs, schemaType, productSchemaData, itemListData, reviewData, imageGalleryData, favicon]);


  return null;
};
