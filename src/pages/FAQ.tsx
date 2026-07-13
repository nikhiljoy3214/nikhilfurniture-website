import React, { useState, useEffect } from 'react';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

const defaultFaqConfig = {
  faqs: [
    { id: 'f1', question: 'Which type of wood is best for home furniture in Kerala?', answer: 'Premium Teak Wood (especially Nilambur Teak) and Rosewood are the best choices for home furniture in Kerala due to their density and natural oils, which make them highly resistant to tropical humidity, drywood termites, and warping.', category: 'Wood Sourcing', sort_order: 1, is_visible: true },
    { id: 'f2', question: 'Do you provide customized furniture sizing?', answer: 'Yes! We specialize in customized wooden furniture. Our team can visit your home or office in Thrissur or nearby districts to take precise measurements, align with your design themes, and manufacture the pieces to fit your spaces perfectly.', category: 'Customization', sort_order: 2, is_visible: true },
    { id: 'f3', question: 'How long does a custom order take to manufacture and deliver?', answer: 'On average, standard custom furniture takes between 3 to 6 weeks depending on the complexity of the design carvings, seasoning requirements of the wood, and the volume of order in the factory.', category: 'Logistics & Time', sort_order: 3, is_visible: true },
    { id: 'f4', question: 'Are your wooden furniture pieces treated against termites?', answer: 'Absolutely. All our raw timbers are seasoned to 8-12% moisture in kiln chambers and undergo chemical anti-pest treatments. This kills borer larvae and guarantees immunity against drywood termites.', category: 'Durability', sort_order: 4, is_visible: true }
  ]
};

export const FAQ: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
      const key = isPreview ? 'faqs_module_draft' : 'faqs_module';
      
      try {
        const { data: res } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', key)
          .single();

        if (res && res.value) {
          setData(res.value);
        }
      } catch (err) {
        console.error('Failed to load FAQ settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wood-50">
        <Loader2 className="w-8 h-8 text-wood-700 animate-spin" />
      </div>
    );
  }

  const info = data || defaultFaqConfig;
  const activeFaqs = info.faqs
    ? info.faqs.filter((x: any) => x.is_visible).sort((a: any, b: any) => a.sort_order - b.sort_order)
    : [];

  const faqsForSeo = activeFaqs.map((f: any) => ({
    question: f.question,
    answer: f.answer
  }));

  return (
    <div className="py-16 bg-wood-50">
      <SEO
        title="Frequently Asked Questions (FAQ) | Nikhil Furniture Kerala"
        description="Find answers to common questions about wood selection, custom furniture, anti-termite treatment, and deliveries across Kerala."
        faqs={faqsForSeo}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'FAQ', url: '/faq' }
        ]}
      />

      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Help Desk</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="font-sans text-sm text-wood-700/80 leading-relaxed max-w-xl mx-auto">
            Got questions about timber logs, polish options, or lead times? Browse our answers below.
          </p>
        </div>

        {/* FAQ list */}
        {activeFaqs.length === 0 ? (
          <div className="py-16 text-center text-wood-500 font-sans text-sm font-semibold bg-white rounded-3xl border border-wood-200/30">
            No FAQs available at the moment.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {activeFaqs.map((faq: any) => (
              <div
                key={faq.id}
                className="bg-white p-8 rounded-3xl border border-wood-200/40 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-wood-100 text-wood-850 px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-sans">{faq.category || 'General'}</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-wood-950">
                  {faq.question}
                </h3>
                <p className="text-xs text-wood-600/90 leading-relaxed font-sans font-medium">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
export default FAQ;
