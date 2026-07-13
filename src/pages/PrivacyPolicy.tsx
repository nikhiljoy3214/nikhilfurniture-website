import React from 'react';
import { SEO } from '../components/SEO';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="py-16 bg-wood-50">
      <SEO
        title="Privacy Policy | Nikhil Furniture Kerala"
        description="Read the privacy policy of Nikhil Furniture. Learn about guest wishlist localStorage data usage and contact enquiry handling."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy-policy' }
        ]}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12 bg-white p-8 md:p-12 rounded-3xl border border-wood-200/40 shadow-sm">
        <h1 className="font-serif text-3xl font-bold text-wood-950 mb-8 pb-4 border-b border-wood-100">
          Privacy Policy
        </h1>
        
        <div className="flex flex-col gap-6 text-sm text-wood-700 leading-relaxed font-sans">
          <p>
            At Nikhil Furniture, accessible from our showroom in Pudukkad, Thrissur, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Nikhil Furniture website and how we use it.
          </p>

          <h2 className="font-serif text-xl font-bold text-wood-900 mt-4">1. Guest Wishlist & LocalStorage</h2>
          <p>
            Our website implements a guest wishlist. We do not store your wishlist items on our database servers or require login registration. Instead, all your saved products are persisted directly inside your local browser storage (localStorage). You have complete control over this data and can clear it at any time using the "Clear Wishlist" option.
          </p>

          <h2 className="font-serif text-xl font-bold text-wood-900 mt-4">2. Enquiry & Contact Forms</h2>
          <p>
            When you submit an enquiry form or click to contact us via WhatsApp, the details you enter (name, phone, requirements, and message text) are processed locally to format the WhatsApp pre-filled chat redirect. We do not sell, rent, or distribute this contact information. It is strictly used to address your product quotations and customized wooden furniture requirements.
          </p>

          <h2 className="font-serif text-xl font-bold text-wood-900 mt-4">3. Log Files & Analytics</h2>
          <p>
            Like standard websites, our hosting platforms (Vercel) automatically collect standard server log files. These include IP addresses, browser types, Internet Service Providers (ISPs), date/time stamps, referring/exit pages, and click counts. This metadata is purely used to analyze site performance and load patterns and is not linked to any personally identifiable information.
          </p>

          <h2 className="font-serif text-xl font-bold text-wood-900 mt-4">4. Administrative Auth</h2>
          <p>
            Only administrators are authorized to log in. We utilize Supabase Auth services to authenticate admin credentials securely. Security logs, session states, and administrative tokens are managed strictly under secure HTTPS connections to protect factory inventory records.
          </p>

          <p className="mt-8 text-xs text-wood-500 font-semibold border-t border-wood-100 pt-4">
            Last Updated: July 11, 2026. For any questions regarding our policy, please contact +91 9746321808.
          </p>
        </div>
      </div>
    </div>
  );
};
export default PrivacyPolicy;
