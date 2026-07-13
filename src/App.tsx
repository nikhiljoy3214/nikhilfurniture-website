import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WishlistProvider } from './context/WishlistContext';
import { MainLayout } from './layouts/MainLayout';

// Lazy load pages for high performance code-splitting!
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Manufacturing = React.lazy(() => import('./pages/Manufacturing'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const About = React.lazy(() => import('./pages/About'));
const Testimonials = React.lazy(() => import('./pages/Testimonials'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Admin pages
const Login = React.lazy(() => import('./pages/admin/Login'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const ProductsAdmin = React.lazy(() => import('./pages/admin/Products'));
const CategoriesAdmin = React.lazy(() => import('./pages/admin/Categories'));
const HomepageBuilder = React.lazy(() => import('./pages/admin/HomepageBuilder'));
const AdminLayout = React.lazy(() => import('./layouts/AdminLayout'));
const AdminPlaceholder = React.lazy(() => import('./components/admin/AdminPlaceholder'));

// Admin CMS pages
const AboutAdmin = React.lazy(() => import('./pages/admin/content/AboutPage'));
const ManufacturingAdmin = React.lazy(() => import('./pages/admin/content/ManufacturingPage'));
const GalleryAdmin = React.lazy(() => import('./pages/admin/content/GalleryPage'));
const TestimonialsAdmin = React.lazy(() => import('./pages/admin/content/TestimonialsPage'));
const FaqAdmin = React.lazy(() => import('./pages/admin/content/FaqPage'));
const ContactAdmin = React.lazy(() => import('./pages/admin/content/ContactPage'));

// Centralized Media Library and global Website Settings
const MediaLibrary = React.lazy(() => import('./pages/admin/MediaLibrary'));
const WebsiteSettings = React.lazy(() => import('./pages/admin/Settings'));
const SiteManagement = React.lazy(() => import('./pages/admin/SiteManagement'));

// Create Query Client for caching site settings and product listings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable refetching on window focus for free tier optimizations
      staleTime: 1000 * 60 * 10, // Cache product lists for 10 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <WishlistProvider>
        <Router>
          <React.Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-wood-50">
                <svg
                  className="w-10 h-10 text-wood-700 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            }
          >
            <Routes>
              {/* Public routes wrapped in MainLayout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:slug" element={<ProductDetails />} />
                <Route path="categories" element={<Categories />} />
                <Route path="manufacturing" element={<Manufacturing />} />
                <Route path="gallery" element={<Gallery />} />
                <Route path="about" element={<About />} />
                <Route path="testimonials" element={<Testimonials />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="contact" element={<Contact />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="terms-conditions" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin Login & Protected Dashboard */}
              <Route path="/admin/login" element={<Login />} />
              
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<ProductsAdmin />} />
                
                {/* Active dynamic admin modules */}
                <Route path="categories" element={<CategoriesAdmin />} />
                <Route path="homepage-builder" element={<HomepageBuilder />} />
                
                {/* Content CMS Routes */}
                <Route path="content/about" element={<AboutAdmin />} />
                <Route path="content/manufacturing" element={<ManufacturingAdmin />} />
                <Route path="content/gallery" element={<GalleryAdmin />} />
                <Route path="content/testimonials" element={<TestimonialsAdmin />} />
                <Route path="content/faq" element={<FaqAdmin />} />
                <Route path="content/contact" element={<ContactAdmin />} />
                
                <Route path="enquiries" element={<AdminPlaceholder name="Contact Enquiries" />} />
                <Route path="media-library" element={<MediaLibrary />} />
                <Route path="settings" element={<WebsiteSettings />} />
                <Route path="seo-manager" element={<SiteManagement />} />
                <Route path="site-management" element={<SiteManagement />} />
                <Route path="backup" element={<SiteManagement />} />
                <Route path="profile" element={<AdminPlaceholder name="Profile" />} />
              </Route>
            </Routes>
          </React.Suspense>
        </Router>
      </WishlistProvider>
    </QueryClientProvider>
  );
};

export default App;
