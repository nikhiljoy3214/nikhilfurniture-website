import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Breadcrumbs } from '../components/admin/Breadcrumbs';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Home,
  FileText,
  Image,
  HelpCircle,
  Inbox,
  HardDrive,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  SearchIcon,
  MessageSquareQuote,
  Loader2,
  Hammer,
  Monitor,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
}

const SEARCHABLE_ITEMS = [
  { name: 'General Settings', category: 'Settings', description: 'Configure site-wide preferences, phone helplines, and draft modes', path: '/admin/settings' },
  { name: 'SEO Metadata Manager', category: 'Site Settings', description: 'Meta titles, keywords, canonical URLs, and robots.txt rules', path: '/admin/site-management', tab: 'seo' },
  { name: 'Website Analytics Dashboard', category: 'Site Settings', description: 'Analyze WhatsApp helper clicks, phone calls, and daily page views', path: '/admin/site-management', tab: 'analytics' },
  { name: 'System Database Health Check', category: 'Site Settings', description: 'Check database status, storage usage, and system performance', path: '/admin/site-management', tab: 'health' },
  { name: 'Maintenance Mode Toggle', category: 'Security', description: 'Offline status mode, custom return timers, and offline banners', path: '/admin/site-management', tab: 'security' },
  { name: 'Database backup & JSON Export', category: 'Settings', description: 'Export catalog products to JSON/CSV or import configuration sheets', path: '/admin/site-management', tab: 'backup' },
  { name: 'System Activity Logs', category: 'Security', description: 'Track actions, timestamps, and modules modified by site admins', path: '/admin/site-management', tab: 'logs' },
  { name: 'General Information & Domain', category: 'Site Settings', description: 'Supabase host, database engine version, and storage details', path: '/admin/site-management', tab: 'general' },
  { name: 'Homepage Content Builder', category: 'Content Sections', description: 'Arrange homepage slider banners, headlines, and toggle cards', path: '/admin/homepage-builder' },
  { name: 'About Page Editor', category: 'Content Pages', description: 'Edit brand story description, history timeline, and signature', path: '/admin/content/about' },
  { name: 'Contact Info & Showroom Maps', category: 'Content Pages', description: 'Update showroom phone numbers, operating hours, and Google maps link', path: '/admin/content/contact' },
  { name: 'FAQ Page Manager', category: 'Content Pages', description: 'Add, update, or reorder customer frequently asked questions', path: '/admin/content/faq' },
  { name: 'Testimonials Review Manager', category: 'Content Pages', description: 'Manage review cards, star ratings, and display statuses', path: '/admin/content/testimonials' },
  { name: 'Products Catalog', category: 'Catalog', description: 'View full product catalog table, edit prices, attributes, and combinations', path: '/admin/products' },
  { name: 'Categories Manager', category: 'Catalog', description: 'Sort, update, or create product classification categories', path: '/admin/categories' },
  { name: 'Media Library', category: 'Media', description: 'Upload and organize product showcase pictures and folders', path: '/admin/media' },
];

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('nikhil-admin-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Settings search state
  const [searchVal, setSearchVal] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Close search dropdown on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.search-container')) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const filteredSearchItems = searchVal.trim()
    ? SEARCHABLE_ITEMS.filter(item => 
        item.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.description.toLowerCase().includes(searchVal.toLowerCase()) ||
        item.category.toLowerCase().includes(searchVal.toLowerCase())
      )
    : [];

  // 1. Session Auth Gating
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
      } else {
        setUserEmail(session.user.email || 'Admin');
        setSessionChecked(true);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/admin/login');
      } else if (session) {
        setUserEmail(session.user.email || 'Admin');
        setSessionChecked(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Sync collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('nikhil-admin-sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  interface NavSection {
    title: string;
    links: NavItem[];
  }

  const sections: NavSection[] = [
    {
      title: 'Storefront',
      links: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: FolderTree },
      ]
    },
    {
      title: 'Content CMS',
      links: [
        { name: 'Homepage Builder', path: '/admin/homepage-builder', icon: Home },
        { name: 'About Page', path: '/admin/content/about', icon: FileText },
        { name: 'Manufacturing', path: '/admin/content/manufacturing', icon: Hammer },
        { name: 'Gallery Showcase', path: '/admin/content/gallery', icon: Image },
        { name: 'Testimonials', path: '/admin/content/testimonials', icon: MessageSquareQuote },
        { name: 'FAQs', path: '/admin/content/faq', icon: HelpCircle },
        { name: 'Contact & Footer', path: '/admin/content/contact', icon: Settings },
      ]
    },
    {
      title: 'Settings & Admin',
      links: [
        { name: 'Contact Enquiries', path: '/admin/enquiries', icon: Inbox },
        { name: 'Media Library', path: '/admin/media-library', icon: HardDrive },
        { name: 'Website Settings', path: '/admin/settings', icon: Settings },
        { name: 'Site Management', path: '/admin/site-management', icon: Monitor },
        { name: 'Profile', path: '/admin/profile', icon: User },
      ]
    }
  ];

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wood-50">
        <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wood-50/50 flex">
      {/* 1. SIDEBAR - DESKTOP */}
      <aside 
        className={`hidden lg:flex flex-col bg-wood-950 text-white border-r border-wood-900 flex-shrink-0 transition-all duration-300 relative select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-wood-900 bg-wood-950 sticky top-0 z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-wood-800 border border-wood-700 flex items-center justify-center text-gold-300 font-serif font-bold text-lg flex-shrink-0">
              N
            </div>
            {!isCollapsed && (
              <span className="font-serif text-sm font-bold text-white tracking-wide truncate">
                Nikhil Furniture
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-6 h-6 rounded-md bg-wood-900 hover:bg-wood-800 border border-wood-800 text-wood-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow py-6 px-3 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-64px)] scrollbar-thin">
          {sections.map((section, secIdx) => (
            <div key={secIdx} className="flex flex-col gap-1">
              {!isCollapsed && (
                <span className="px-3.5 text-[9px] font-bold uppercase tracking-[0.2em] text-wood-500 mb-1 block">
                  {section.title}
                </span>
              )}
              {section.links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 py-2 px-3.5 rounded-xl text-sm font-sans font-semibold tracking-wide transition-all duration-200 ${
                      isActive 
                        ? 'bg-gold-500 text-wood-950 shadow-sm shadow-gold-500/10' 
                        : 'text-wood-300 hover:bg-wood-900 hover:text-white'
                    }`}
                    title={isCollapsed ? link.name : undefined}
                  >
                    <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate text-xs">{link.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* 2. SIDEBAR - MOBILE DRAWER */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-wood-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative flex flex-col w-72 max-w-xs bg-wood-950 text-white shadow-2xl h-full z-10 animate-slide-right">
            <div className="h-16 flex items-center justify-between px-5 border-b border-wood-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-wood-800 border border-wood-700 flex items-center justify-center text-gold-300 font-serif font-bold text-lg">
                  N
                </div>
                <span className="font-serif text-sm font-bold text-white tracking-wide">
                  Nikhil Furniture
                </span>
              </div>
              <button 
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-wood-900 border border-wood-800 text-wood-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-grow py-6 px-4 flex flex-col gap-6 overflow-y-auto">
              {sections.map((section, secIdx) => (
                <div key={secIdx} className="flex flex-col gap-1">
                  <span className="px-3.5 text-[9px] font-bold uppercase tracking-[0.2em] text-wood-500 mb-1 block">
                    {section.title}
                  </span>
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 py-2 px-3.5 rounded-xl text-sm font-sans font-semibold tracking-wide transition-all duration-200 ${
                          isActive 
                            ? 'bg-gold-500 text-wood-950 shadow-sm shadow-gold-500/10' 
                            : 'text-wood-300 hover:bg-wood-900 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                        <span className="truncate text-xs">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* 3. MAIN CONTENT WINDOW */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        {/* STICKY TOP HEADER */}
        <header className="h-16 bg-white border-b border-wood-200/40 px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 shadow-sm select-none">
          <div className="flex items-center gap-4 min-w-0">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-wood-50 hover:bg-wood-100 border border-wood-200/40 text-wood-700 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb path tracker */}
            <div className="hidden sm:block">
              <Breadcrumbs />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search Slot */}
            <div className="relative hidden md:block max-w-xs w-64 search-container">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-wood-400">
                <SearchIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search settings & pages..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-wood-50 border border-wood-200/40 text-xs font-semibold font-sans text-wood-950 placeholder-wood-400 focus:outline-none focus:border-wood-300 focus:bg-white transition-all cursor-text"
              />

              {/* Fuzzy Search Dropdown */}
              {showSearchDropdown && filteredSearchItems.length > 0 && (
                <div className="absolute right-0 top-11 w-80 bg-white border border-wood-200 rounded-2xl shadow-xl overflow-hidden z-50 py-2 animate-slide-up">
                  <div className="px-4 py-1.5 border-b border-wood-100 flex items-center justify-between text-[9px] uppercase tracking-wider text-wood-400 font-bold">
                    <span>Search Results ({filteredSearchItems.length})</span>
                    <button 
                      onClick={() => setShowSearchDropdown(false)}
                      className="text-wood-400 hover:text-wood-650 cursor-pointer border-none bg-none p-0 text-[10px]"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {filteredSearchItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchVal('');
                          const targetPath = item.tab ? `${item.path}?tab=${item.tab}` : item.path;
                          navigate(targetPath);
                          
                          // If already on site-management, trigger navigation tab updates
                          if (location.pathname.startsWith('/admin/site-management') && item.tab) {
                            const newUrl = new URL(window.location.href);
                            newUrl.searchParams.set('tab', item.tab);
                            window.history.pushState({}, '', newUrl.toString());
                            window.dispatchEvent(new Event('popstate'));
                          }
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-wood-50 transition-colors flex flex-col gap-0.5 cursor-pointer border-none bg-transparent"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-wood-950">{item.name}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-wood-100 text-wood-600 uppercase tracking-wider font-extrabold">{item.category}</span>
                        </div>
                        <span className="text-[9px] text-wood-450 font-medium leading-relaxed font-sans">{item.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications trigger */}
            <button 
              className="w-9 h-9 rounded-xl bg-wood-50 hover:bg-wood-100 border border-wood-200/40 text-wood-500 hover:text-wood-950 flex items-center justify-center transition-colors cursor-pointer relative"
              aria-label="Notifications panel"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 border border-white" />
            </button>

            {/* Profile Dropdown Controls */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 border border-wood-200/40 bg-wood-50 rounded-xl py-1 px-1.5 hover:bg-wood-100 transition-colors duration-200 cursor-pointer"
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 rounded-lg bg-wood-800 text-gold-300 font-bold font-serif flex items-center justify-center text-sm shadow-sm">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="hidden sm:block text-xs font-bold text-wood-800 max-w-[120px] truncate pr-1">
                  {userEmail ? userEmail.split('@')[0] : 'Administrator'}
                </span>
              </button>

              {profileMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-wood-200/60 shadow-lg py-1 z-50 font-sans text-xs font-semibold text-wood-700 animate-slide-down">
                    <div className="px-4 py-2 border-b border-wood-100">
                      <span className="block text-[10px] uppercase font-bold text-wood-400">Signed in as</span>
                      <span className="block text-wood-900 truncate font-bold">{userEmail}</span>
                    </div>
                    <Link
                      to="/admin/profile"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-wood-50 hover:text-wood-950 transition-colors"
                    >
                      <User className="w-4 h-4 text-wood-400" />
                      Manage Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-wood-50 hover:text-wood-950 transition-colors animate-fade-in"
                    >
                      <Settings className="w-4 h-4 text-wood-400" />
                      System Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 hover:bg-wood-50 hover:text-rose-600 text-wood-700 border-none transition-colors cursor-pointer bg-transparent"
                    >
                      <LogOut className="w-4 h-4 text-wood-400 group-hover:text-rose-500" />
                      Sign Out Session
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* MAIN SCROLLABLE CONTENT BODY */}
        <main className="flex-grow overflow-y-auto bg-wood-50/30 p-6 md:p-8">
          <React.Suspense
            fallback={
              <div className="h-full flex items-center justify-center bg-transparent">
                <Loader2 className="w-6 h-6 text-wood-700 animate-spin" />
              </div>
            }
          >
            <Outlet />
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
