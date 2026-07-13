import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Phone } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../lib/supabase';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { wishlist } = useWishlist();
  const location = useLocation();

  const [announcement, setAnnouncement] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    const fetchNavbarSettings = async () => {
      try {
        const { data: behData } = await supabase.from('site_settings').select('*').eq('key', 'website_behaviour').single();
        if (behData && behData.value && behData.value.announcement?.enabled && behData.value.announcement?.text) {
          setAnnouncement(behData.value.announcement);
        }

        const { data: genData } = await supabase.from('site_settings').select('*').eq('key', 'general').single();
        if (genData && genData.value && genData.value.logoUrl) {
          setLogoUrl(genData.value.logoUrl);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchNavbarSettings();
  }, []);

  // Track scrolling to toggle glassmorphism shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'Manufacturing', path: '/manufacturing' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      {announcement && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] h-9 flex items-center justify-center text-[10px] font-sans font-bold uppercase tracking-wider gap-3"
          style={{
            backgroundColor: announcement.bgColor || '#8B5A2B',
            color: announcement.textColor || '#FFFFFF'
          }}
        >
          <span>{announcement.text}</span>
          {announcement.btnText && (
            <Link
              to={announcement.btnLink || '/products'}
              className="px-2 py-0.5 rounded border border-white/25 bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {announcement.btnText}
            </Link>
          )}
        </div>
      )}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass-panel shadow-md py-4'
            : 'bg-transparent py-6 border-b border-wood-200/10'
        }`}
        style={{ top: announcement ? '36px' : '0px' }}
      >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo and Brand Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoUrl || "/logo.jpg"}
            alt="Nikhil Furniture Logo"
            className="w-10 h-10 object-cover rounded-full border border-wood-700/20 group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback if logo.jpg is missing or corrupted
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-wide text-wood-900 leading-none group-hover:text-wood-700 transition-colors">
              NIKHIL
            </span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-wood-600 font-semibold leading-none mt-1">
              Furniture
            </span>
          </div>
        </Link>

        {/* Desktop Menu links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-sans text-sm font-medium tracking-wide transition-all duration-300 relative py-1.5 ${
                  isActive
                    ? 'text-wood-800'
                    : 'text-wood-600/80 hover:text-wood-900'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-wood-700 rounded-full animate-fade-in" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Wishlist Link & Quick Enquiry Buttons */}
        <div className="hidden lg:flex items-center gap-6">
          <Link
            to="/wishlist"
            className="flex items-center gap-2 text-wood-700 hover:text-wood-950 transition-colors relative p-2 rounded-full hover:bg-wood-100/50"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 -right-1 text-gold-600 text-[10px] font-bold leading-none">
                {wishlist.length}
              </span>
            )}
          </Link>

          <a
            href="tel:+919746321808"
            className="flex items-center gap-2 bg-wood-800 hover:bg-wood-900 text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-sm shadow-wood-950/10 hover:shadow-md"
          >
            <Phone className="w-3.5 h-3.5" />
            Call Showroom
          </a>
        </div>

        {/* Mobile Navbar Buttons */}
        <div className="flex items-center gap-4 lg:hidden">
          <Link
            to="/wishlist"
            className="relative text-wood-700 p-2"
            title="Wishlist"
          >
            <Heart className="w-6 h-6" />
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 -right-0.5 text-gold-600 text-[10px] font-bold leading-none">
                {wishlist.length}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-wood-800 p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-[72px] bg-wood-50/95 backdrop-blur-lg z-40 py-8 px-6 flex flex-col gap-4 shadow-lg overflow-y-auto h-[calc(100vh-72px)] animate-slide-up">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-sans text-base font-semibold py-3 px-4 rounded-xl ${
                  isActive
                    ? 'bg-wood-800 text-white shadow-sm'
                    : 'text-wood-700 hover:bg-wood-100 hover:text-wood-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <hr className="border-wood-200 my-2" />
          <div className="flex flex-col gap-3">
            <a
              href="tel:+919746321808"
              className="flex items-center justify-center gap-2 bg-wood-800 hover:bg-wood-900 text-white py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              <Phone className="w-4 h-4" />
              Call Showroom
            </a>
            <a
              href="https://wa.me/919746321808"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-colors shadow-sm"
            >
              Contact on WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar;
