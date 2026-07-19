import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Instagram, Facebook, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [footerConfig, setFooterConfig] = useState<any>(null);

  useEffect(() => {
    const fetchFooterConfig = async () => {
      try {
        const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
        
        // Fetch global general info (highest precedence)
        const genKey = isPreview ? 'general_draft' : 'general';
        const { data: genData } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', genKey)
          .single();

        // Fetch homepage config (fallback)
        const configKey = isPreview ? 'homepage_draft' : 'homepage';
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', configKey)
          .single();

        const merged: any = {};
        if (data && data.value && data.value.footer) {
          Object.assign(merged, data.value.footer);
        }
        if (genData && genData.value) {
          const gen = genData.value;
          merged.description = gen.footerDescription || gen.tagline || merged.description;
          merged.facebookUrl = gen.facebookUrl || merged.facebookUrl;
          merged.instagramUrl = gen.instagramUrl || merged.instagramUrl;
          merged.working_hours = gen.workingHours || merged.working_hours;
          merged.email = gen.email || merged.email;
          merged.phoneNumbers = gen.phoneNumbers || merged.phoneNumbers;
          merged.address = gen.address || merged.address;
          merged.whatsAppNumber = gen.whatsAppNumber || merged.whatsAppNumber;
        }

        setFooterConfig(merged);
      } catch (err) {
        console.error('Failed to load footer config:', err);
      }
    };
    fetchFooterConfig();
  }, []);

  return (
    <footer className="bg-wood-950 text-wood-100/90 pt-20 pb-10 border-t border-wood-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Brand & Tagline */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-wide text-white leading-none">
              NIKHIL
            </span>
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-wood-400 font-semibold leading-none mt-1.5">
              Furniture
            </span>
          </Link>
          <p className="text-wood-300/80 text-sm font-sans mt-2 leading-relaxed">
            {footerConfig?.description || 'Crafting timeless, premium wooden furniture in Kerala since 1995. Exceptional craftsmanship, modern designs, and a legacy of trust.'}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <a
              href={footerConfig?.instagramUrl || "https://www.instagram.com/nikhil__furniture"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-wood-900 hover:bg-wood-800 text-white flex items-center justify-center transition-colors border border-wood-800"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={footerConfig?.facebookUrl || "https://www.facebook.com/profile.php?id=100065195572493"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-wood-900 hover:bg-wood-800 text-white flex items-center justify-center transition-colors border border-wood-800"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Collections / Categories */}
        <div className="flex flex-col gap-6">
          <h4 className="font-serif text-lg font-semibold tracking-wide text-white">Collections</h4>
          <ul className="flex flex-col gap-3 text-sm text-wood-300/80">
            <li><Link to="/products?category=Wooden+Sofa+Sets" className="hover:text-white transition-colors">Wooden Sofa Sets</Link></li>
            <li><Link to="/products?category=Wooden+Dining+Tables" className="hover:text-white transition-colors">Dining & Chairs</Link></li>
            <li><Link to="/products?category=Wooden+Cots" className="hover:text-white transition-colors">Wooden Cots & Beds</Link></li>
            <li><Link to="/products?category=Wardrobes+/+Almirahs" className="hover:text-white transition-colors">Wardrobes & Almirahs</Link></li>
            <li><Link to="/products?category=Customized+Furniture" className="hover:text-white transition-colors">Custom Handcrafted Items</Link></li>
          </ul>
        </div>

        {/* Showroom Details */}
        <div className="flex flex-col gap-6">
          <h4 className="font-serif text-lg font-semibold tracking-wide text-white">Our Showroom</h4>
          <ul className="flex flex-col gap-4 text-sm text-wood-300/80">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-wood-400 mt-1 shrink-0" />
              {footerConfig?.address ? (
                <span>
                  {footerConfig.address.line1},<br />
                  {footerConfig.address.line2}, {footerConfig.address.city}<br />
                  PIN – {footerConfig.address.pin}
                </span>
              ) : (
                <span>
                  Pudukkad P.O.,<br />
                  Thrissur District, Kerala<br />
                  PIN – 680301
                </span>
              )}
            </li>
            <li className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-wood-400 shrink-0" />
              <span>{footerConfig?.working_hours || '9:00 AM - 7:00 PM (Mon - Sat)'}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-wood-400 shrink-0" />
              <a href={`mailto:${footerConfig?.email || 'thekkekaranikhilfurniture@gmail.com'}`} className="hover:text-white transition-colors">{footerConfig?.email || 'thekkekaranikhilfurniture@gmail.com'}</a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-6">
          <h4 className="font-serif text-lg font-semibold tracking-wide text-white">Quick Contact</h4>
          <ul className="flex flex-col gap-4 text-sm text-wood-300/80">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-wood-400 shrink-0" />
              <div className="flex flex-col">
                {footerConfig?.phoneNumbers && Array.isArray(footerConfig.phoneNumbers) ? (
                  footerConfig.phoneNumbers.map((num: string, idx: number) => (
                    <a key={idx} href={`tel:+91${num}`} className="hover:text-white transition-colors">+91 {num}</a>
                  ))
                ) : (
                  <>
                    <a href="tel:+919746321808" className="hover:text-white transition-colors">+91 9746321808</a>
                    <a href="tel:+919447241559" className="hover:text-white transition-colors">+91 9447241559</a>
                    <a href="tel:+919745334644" className="hover:text-white transition-colors">+91 9745334644</a>
                  </>
                )}
              </div>
            </li>
            <li>
              <a
                href={`https://wa.me/91${footerConfig?.whatsAppNumber || '9746321808'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors mt-2"
              >
                WhatsApp Chat
              </a>
            </li>
          </ul>
        </div>

      </div>

      <hr className="border-wood-900 max-w-7xl mx-auto px-6 md:px-12" />

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-wood-400/60 gap-4">
        <p>{footerConfig?.copyright || `© ${currentYear} Nikhil Furniture. All Rights Reserved. Crafted with Wood-Grain Pride in Kerala.`}</p>
        <div className="flex items-center gap-6">
          <Link to="/testimonials" className="hover:text-white transition-colors">Testimonials</Link>
          <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
          <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
          <Link to="/admin/login" className="hover:text-white transition-colors border-l border-wood-800 pl-6 text-wood-400/40">Admin Panel</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
