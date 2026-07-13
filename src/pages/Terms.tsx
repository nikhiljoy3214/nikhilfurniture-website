import React from 'react';
import { SEO } from '../components/SEO';

export const Terms: React.FC = () => {
  return (
    <div className="py-16 bg-wood-50">
      <SEO
        title="Terms & Conditions | Nikhil Furniture Kerala"
        description="Review the terms and conditions for custom order agreements, site measurements, delivery policies, and timber guarantees at Nikhil Furniture."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Terms & Conditions', url: '/terms-conditions' }
        ]}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12 bg-white p-8 md:p-12 rounded-3xl border border-wood-200/40 shadow-sm">
        <h1 className="font-serif text-3xl font-bold text-wood-950 mb-8 pb-4 border-b border-wood-100">
          Terms & Conditions
        </h1>
        
        <div className="flex flex-col gap-6 text-sm text-wood-700 leading-relaxed font-sans">
          <p>
            Welcome to Nikhil Furniture. By browsing this website, viewing our collections, or initiating purchase inquiries, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h2 className="font-serif text-xl font-bold text-wood-900 mt-4">1. Non-eCommerce Operation</h2>
          <p>
            This website is a digital catalog and showroom display. It is NOT an online web store. We do not support online registration, shopping carts, checkout payments, or order tracking. All transactions, material selections, and order bookings must be finalized via direct phone calls, WhatsApp consultations, or showroom visits.
          </p>

          <h2 className="font-serif text-xl font-bold text-wood-900 mt-4">2. Custom Furniture Quotations</h2>
          <p>
            All quotations generated through site measurements or drawing sheets remain valid for 30 days. Custom orders require a standard advance payment (typically 40%) before log cutting and carpentry commence. Remaining balances are settled upon safe delivery and assembly confirmation.
          </p>

          <h2 className="font-serif text-xl font-bold text-wood-900 mt-4">3. Wood Grain Natural Variations</h2>
          <p>
            Solid hardwood furniture exhibits natural grain variations, shade differences, mineral streaks, and unique knots. These are not defects but structural signatures of genuine timber. Finished products may vary slightly in texture and grain pattern from catalog pictures.
          </p>

          <h2 className="font-serif text-xl font-bold text-wood-900 mt-4">4. Delivery & Assembly Policies</h2>
          <p>
            We offer direct transport deliveries across all districts in Kerala. Customers are requested to ensure clearance at doorways, staircases, and corridors for large items like beds, wardrobes, and 3-seater sofas. Our delivery personnel are not responsible for lifting heavy units through narrow balconies or windows unless agreed beforehand.
          </p>

          <h2 className="font-serif text-xl font-bold text-wood-900 mt-4">5. Intellectual Property</h2>
          <p>
            The branding, logotypes, customized graphics, custom generated UI media, and website layout code are the property of Nikhil Furniture and protected under applicable copyright laws.
          </p>

          <p className="mt-8 text-xs text-wood-500 font-semibold border-t border-wood-100 pt-4">
            Last Updated: July 11, 2026. For enquiries, please email info@nikhilfurniture.com.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Terms;
