import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { ScrollToTopButton } from '../components/ScrollToTopButton';
import { supabase } from '../lib/supabase';
import { Hammer, Phone, MessageSquare } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [hasAnnouncement, setHasAnnouncement] = useState(false);
  useEffect(() => {
    const checkState = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'website_behaviour')
          .single();
        if (data && data.value) {
          setMaintenance(!!data.value.maintenanceMode);
          setHasAnnouncement(!!(data.value.announcement?.enabled && data.value.announcement?.text));
        }
      } catch (err) {
        console.error(err);
      }
    };

    // If accessing admin panels, bypass maintenance lock
    if (!window.location.pathname.startsWith('/admin')) {
      checkState();
    }
  }, []);

  if (maintenance && !window.location.pathname.startsWith('/admin')) {
    return (
      <div className="min-h-screen bg-wood-950 flex flex-col items-center justify-center p-6 text-white font-sans text-center relative select-none overflow-hidden">
        {/* Background gradient grids */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-wood-800/40 via-wood-950 to-wood-950 z-0 pointer-events-none" />
        
        <div className="max-w-md w-full bg-wood-900/40 backdrop-blur-md border border-wood-800/60 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-400/20 flex items-center justify-center text-gold-400 animate-bounce">
            <Hammer className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-2xl font-bold tracking-wide text-white uppercase">CRAFTING UNDERWAY</h1>
            <p className="text-xs text-wood-300 font-semibold leading-relaxed">
              Our digital showroom is undergoing seasonal curation and server carpentry. We will be back shortly withTeak & Rosewood collections.
            </p>
          </div>
          <div className="w-full h-px bg-wood-800/60" />
          <div className="flex flex-col gap-3 w-full font-semibold text-xs text-wood-200">
            <span>Direct support enquiries:</span>
            <div className="flex justify-center gap-4">
              <a href="tel:9746321808" className="bg-wood-800/60 hover:bg-wood-800 py-2 px-4 rounded-xl border border-wood-700/50 flex items-center gap-2 text-white transition-colors">
                <Phone className="w-4 h-4" /> Call Us
              </a>
              <a href="https://wa.me/919746321808" className="bg-emerald-600/80 hover:bg-emerald-600 py-2 px-4 rounded-xl border border-emerald-500/30 flex items-center gap-2 text-white transition-colors">
                <MessageSquare className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-wood-50">
      <ScrollToTop />
      <ScrollToTopButton />
      <Navbar />
      <main className={`flex-grow ${hasAnnouncement ? 'pt-[116px] sm:pt-[124px]' : 'pt-[72px] sm:pt-[88px]'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
