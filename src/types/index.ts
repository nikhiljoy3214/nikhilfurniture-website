export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  detailed_description: string;
  category: string;
  wood_type: string;
  finish: string;
  dimensions: string;
  specifications: Record<string, string>;
  features: string[];
  featured_image: string;
  gallery_images: string[];
  seo_title: string;
  seo_description: string;
  alt_text: string;
  tags: string[];
  is_featured: boolean;
  is_popular: boolean;
  is_new_arrival: boolean;
  sort_order: number;
  base_price: number;
  wood_prices: Record<string, number>;
  created_at: string;
  status?: 'published' | 'draft' | 'archived' | 'hidden';
  related_products?: string[];
  views_count?: number;
  wishlist_count?: number;
  whatsapp_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pin: string;
  };
  phoneNumbers: string[];
  whatsAppNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  workingHours: string;
  email: string;
}
