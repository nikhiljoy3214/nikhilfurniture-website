import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Phone, ChevronDown } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../lib/supabase';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const { wishlist } = useWishlist();
  const location = useLocation();

  const [announcement, setAnnouncement] = useState<any>(() => {
    const saved = localStorage.getItem('cached_announcement');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem('cached_logo_url') || '';
  });
  const [headerConfig, setHeaderConfig] = useState<any>(() => {
    const saved = localStorage.getItem('cached_header_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [navCategories, setNavCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchNavbarSettings = async () => {
      try {
        const { data: behData } = await supabase.from('site_settings').select('*').eq('key', 'website_behaviour').single();
        if (behData && behData.value && behData.value.announcement?.enabled && behData.value.announcement?.text) {
          setAnnouncement(behData.value.announcement);
          localStorage.setItem('cached_announcement', JSON.stringify(behData.value.announcement));
        } else {
          setAnnouncement(null);
          localStorage.removeItem('cached_announcement');
        }

        const { data: genData } = await supabase.from('site_settings').select('*').eq('key', 'general').single();
        if (genData && genData.value && genData.value.logoUrl) {
          setLogoUrl(genData.value.logoUrl);
          localStorage.setItem('cached_logo_url', genData.value.logoUrl);
        }

        const { data: headData } = await supabase.from('site_settings').select('*').eq('key', 'header_settings').single();
        if (headData && headData.value) {
          setHeaderConfig(headData.value);
          localStorage.setItem('cached_header_config', JSON.stringify(headData.value));
        }

        const { data: catData } = await supabase.from('categories').select('name, slug');
        if (catData) {
          setNavCategories(catData);
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

  const navLinks = headerConfig?.menuItems || [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products', hasCategoriesSubmenu: true },
    { name: 'Categories', path: '/categories' },
    { name: 'Manufacturing', path: '/manufacturing' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const hexColor = headerConfig?.bgColor || '#FAF8F5';
  const opacityPct = isScrolled ? 100 : (headerConfig?.opacity ?? 95);
  const opacityHex = Math.round(opacityPct * 2.55).toString(16).padStart(2, '0');

  const navbarStyle = {
    backgroundColor: `${hexColor}${opacityHex}`,
    color: headerConfig?.textColor || '#4a3b32',
    borderColor: isScrolled ? `${headerConfig?.textColor || '#4a3b32'}15` : 'transparent'
  };

  return (
    <>
      {announcement && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] h-11 sm:h-9 flex items-center justify-center text-[8.5px] sm:text-[10px] font-sans font-bold uppercase tracking-wider gap-2 sm:gap-3 px-3 sm:px-6"
          style={{
            backgroundColor: announcement.bgColor || '#8B5A2B',
            color: announcement.textColor || '#FFFFFF'
          }}
        >
          <span className="truncate max-w-[190px] min-[375px]:max-w-[230px] min-[410px]:max-w-[260px] sm:max-w-none">{announcement.text}</span>
          {announcement.btnText && (
            <Link
              to={announcement.btnLink || '/products'}
              className="px-1.5 py-0.5 rounded border border-white/25 bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 text-[8px] sm:text-[10px]"
            >
              {announcement.btnText}
            </Link>
          )}
        </div>
      )}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-500 py-4 shadow-sm border-b ${
          announcement ? 'top-11 sm:top-9' : 'top-0'
        }`}
        style={navbarStyle}
      >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo and Brand Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={logoUrl || "/logo.jpg"}
            alt="Nikhil Furniture Logo"
            className="w-10 h-10 object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback if logo.jpg is missing or corrupted
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-wide leading-none group-hover:opacity-80 transition-opacity" style={{ color: headerConfig?.textColor || '#4a3b32' }}>
              NIKHIL
            </span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold leading-none mt-1" style={{ color: headerConfig?.textColor || '#4a3b32', opacity: 0.7 }}>
              Furniture
            </span>
          </div>
        </Link>

        {/* Desktop Menu links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link: any) => {
            const isActive = location.pathname === link.path;
            return (
              <div key={link.path} className="relative group/menu py-1.5">
                <Link
                  to={link.path}
                  className="font-sans text-sm font-medium tracking-wide transition-all duration-300 relative py-1"
                  style={{
                    color: headerConfig?.textColor || '#4a3b32',
                    opacity: isActive ? 1 : 0.8
                  }}
                >
                  {link.name}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full animate-fade-in"
                      style={{ backgroundColor: headerConfig?.textColor || '#4a3b32' }}
                    />
                  )}
                </Link>

                {link.hasCategoriesSubmenu && navCategories.length > 0 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-52 bg-white border border-wood-100 rounded-xl shadow-lg opacity-0 translate-y-1 group-hover/menu:opacity-100 group-hover/menu:translate-y-0 pointer-events-none group-hover/menu:pointer-events-auto transition-all duration-200 z-[110] p-2 flex flex-col gap-1">
                    {navCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/products?category=${encodeURIComponent(cat.name)}`}
                        className="text-left px-3 py-2 rounded-lg text-xs font-semibold text-wood-700 hover:bg-wood-50 hover:text-wood-950 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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

      {isOpen && (
        <div className={`lg:hidden fixed inset-x-0 bottom-0 bg-wood-50/95 backdrop-blur-lg z-40 py-8 px-6 flex flex-col gap-4 shadow-lg overflow-y-auto animate-slide-up ${
          announcement 
            ? 'top-[116px] sm:top-[108px] h-[calc(100vh-116px)] sm:h-[calc(100vh-108px)]' 
            : 'top-[72px] h-[calc(100vh-72px)]'
        }`}>
          {navLinks.map((link: any) => {
            const isActive = location.pathname === link.path;
            const isExpanded = !!expandedMenus[link.name];
            return (
              <div key={link.path} className="flex flex-col">
                <div className="flex items-center justify-between rounded-xl hover:bg-wood-100/50 transition-colors">
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`font-sans text-base font-semibold py-3 px-4 flex-grow text-left rounded-xl ${
                      isActive
                        ? 'text-wood-950 font-bold'
                        : 'text-wood-700 hover:text-wood-900'
                    }`}
                  >
                    {link.name}
                  </Link>
                  {link.hasCategoriesSubmenu && navCategories.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setExpandedMenus(prev => ({
                          ...prev,
                          [link.name]: !prev[link.name]
                        }));
                      }}
                      className="p-3 text-wood-650 hover:text-wood-900 transition-colors cursor-pointer focus:outline-none"
                      aria-label={`Toggle ${link.name} sub-menu`}
                    >
                      <ChevronDown
                        className="w-4 h-4 transition-transform duration-300"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </button>
                  )}
                </div>
                {link.hasCategoriesSubmenu && navCategories.length > 0 && isExpanded && (
                  <div className="pl-6 flex flex-col gap-1 border-l-2 border-wood-200/55 mt-1.5 ml-6 text-left animate-fade-in">
                    {navCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/products?category=${encodeURIComponent(cat.name)}`}
                        onClick={() => setIsOpen(false)}
                        className="py-2.5 px-3 rounded-lg text-xs font-semibold text-wood-600 hover:bg-wood-150/40 text-left w-full block transition-all"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
