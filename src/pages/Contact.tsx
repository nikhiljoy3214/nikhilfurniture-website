import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Phone, MapPin, Mail, Clock, MessageCircle, Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';

const contactFormSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  phone: zod.string().min(10, 'Please enter a valid phone number'),
  requirement: zod.string().min(1, 'Please select a requirement'),
  message: zod.string().min(5, 'Message must be at least 5 characters')
});

type ContactFormValues = zod.infer<typeof contactFormSchema>;

const defaultGeneralConfig = {
  companyName: 'Nikhil Furniture',
  address: {
    line1: 'Pudukkad P.O.',
    line2: 'Opposite Pudukkad Railway Station Road',
    city: 'Thrissur',
    state: 'Kerala',
    pin: '680301'
  },
  phoneNumbers: ['9746321808', '9447241559', '9745334644'],
  whatsAppNumber: '9746321808',
  email: 'info@nikhilfurniture.com',
  googleMapsUrl: 'https://maps.google.com/maps?q=Thekkekara+Nikhil+furniture,Pudukkad,Kerala&hl=en&z=17&output=embed',
  workingHours: '9:00 AM - 7:00 PM (Monday - Saturday)',
  facebookUrl: 'https://www.facebook.com/profile.php?id=100065195572493',
  instagramUrl: 'https://www.instagram.com/nikhil__furniture',
  youtubeUrl: '',
  tagline: 'Crafting Timeless Wooden Furniture Since 1995',
  footerDescription: 'Nikhil Furniture stands for authentic craftsmanship, seasoned solid woods, and heirloom-quality carvings since 1995 in Thrissur, Kerala.'
};

export const Contact: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      requirement: 'Custom Sofa Set',
      message: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
      const key = isPreview ? 'general_draft' : 'general';
      
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
        console.error('Failed to load contact settings:', err);
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

  const info = data || defaultGeneralConfig;

  const onSubmit = (formData: ContactFormValues) => {
    const text = `Hello ${info.companyName},\n\nMy name is ${formData.name}.\nContact Phone: ${formData.phone}\nRequirement Type: ${formData.requirement}\n\nMessage:\n${formData.message}\n\nPlease get back to me with availability and pricing.`;
    const url = `https://wa.me/91${info.whatsAppNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="py-16 bg-wood-50">
      <SEO
        title={`Contact Us & Showroom Location ${info.address.city} | ${info.companyName}`}
        description={`Contact ${info.companyName} ${info.address.city}, Kerala. Call +91 ${info.phoneNumbers[0]}, WhatsApp us, or visit our showroom.`}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">Connect With Us</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2 mb-4">
            Contact Our Showroom
          </h1>
          <p className="font-sans text-sm text-wood-700/80 leading-relaxed">
            Have a custom measurement query or want to request a quote? Submit the form below to immediately start a chat with our showroom manager, or visit us in {info.address.city}.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-24">
          
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white p-8 rounded-3xl border border-wood-200/40 shadow-sm flex flex-col gap-6">
              <h3 className="font-serif text-xl font-bold text-wood-950">Showroom Details</h3>
              
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-wood-650 shrink-0 mt-0.5" />
                <div className="text-sm font-sans font-semibold">
                  <span className="font-bold text-wood-950">Address</span>
                  <p className="mt-1 text-wood-700 font-medium leading-relaxed">
                    {info.companyName},<br />
                    {info.address.line1 && <>{info.address.line1},<br /></>}
                    {info.address.line2 && <>{info.address.line2},<br /></>}
                    {info.address.city} District,<br />
                    {info.address.state} – PIN {info.address.pin}
                  </p>
                </div>
              </div>

              {info.phoneNumbers && info.phoneNumbers.length > 0 && (
                <div className="flex items-start gap-4 border-t border-wood-100 pt-5">
                  <Phone className="w-5 h-5 text-wood-650 shrink-0 mt-0.5" />
                  <div className="text-sm font-sans font-semibold">
                    <span className="font-bold text-wood-950">Phone Numbers</span>
                    <p className="mt-1 text-wood-700 flex flex-col gap-1 font-medium">
                      {info.phoneNumbers.map((phone: string, idx: number) => (
                        <a key={idx} href={`tel:+91${phone}`} className="hover:underline">
                          +91 {phone} {idx === 0 ? '(WhatsApp)' : ''}
                        </a>
                      ))}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 border-t border-wood-100 pt-5">
                <Mail className="w-5 h-5 text-wood-650 shrink-0 mt-0.5" />
                <div className="text-sm font-sans font-semibold">
                  <span className="font-bold text-wood-950">Email</span>
                  <p className="mt-1 text-wood-700 font-medium">
                    <a href={`mailto:${info.email}`} className="hover:underline">{info.email}</a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 border-t border-wood-100 pt-5">
                <Clock className="w-5 h-5 text-wood-650 shrink-0 mt-0.5" />
                <div className="text-sm font-sans font-semibold">
                  <span className="font-bold text-wood-950">Operational Hours</span>
                  <p className="mt-1 text-wood-700 font-medium leading-relaxed">
                    {info.workingHours}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl border border-wood-200/40 shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-wood-950 mb-8">Send an Enquiry</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              
              <div className="flex flex-col gap-1.5 font-sans font-semibold">
                <label className="text-xs font-bold uppercase tracking-wider text-wood-500">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  {...register('name')}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-4 text-sm font-sans focus:outline-none focus:border-wood-500 font-semibold"
                />
                {errors.name && <span className="text-[10px] text-red-500 font-semibold">{errors.name.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5 font-sans font-semibold">
                <label className="text-xs font-bold uppercase tracking-wider text-wood-500">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  {...register('phone')}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-4 text-sm font-sans focus:outline-none focus:border-wood-500 font-semibold"
                />
                {errors.phone && <span className="text-[10px] text-red-500 font-semibold">{errors.phone.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5 font-sans font-semibold">
                <label className="text-xs font-bold uppercase tracking-wider text-wood-500">Requirement Category</label>
                <select
                  {...register('requirement')}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-4 text-sm font-sans focus:outline-none focus:border-wood-500 font-semibold"
                >
                  <option value="Custom Sofa Set">Custom Sofa Set</option>
                  <option value="Dining Table & Chairs">Dining Table & Chairs</option>
                  <option value="King/Queen Bed Cot">King/Queen Bed Cot</option>
                  <option value="Bedroom Wardrobe">Bedroom Wardrobe</option>
                  <option value="Home swing (Oonjal)">Home swing (Oonjal)</option>
                  <option value="General Consultation">General Consultation</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 font-sans font-semibold">
                <label className="text-xs font-bold uppercase tracking-wider text-wood-500">Message / Dimension details</label>
                <textarea
                  rows={4}
                  placeholder="Share detail specifications or dimensions..."
                  {...register('message')}
                  className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-4 text-sm font-sans focus:outline-none focus:border-wood-500 resize-none font-semibold"
                />
                {errors.message && <span className="text-[10px] text-red-500 font-semibold">{errors.message.message}</span>}
              </div>

              <button
                type="submit"
                className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white py-4 rounded-full font-semibold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm border-none cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                Submit and Chat on WhatsApp
              </button>

            </form>
          </div>

        </div>

        {/* Showroom Map */}
        {info.googleMapsUrl && (
          <div className="w-full h-[450px] rounded-3xl overflow-hidden shadow-sm border border-wood-200 mb-8">
            <iframe
              title={`${info.companyName} Google Maps Showroom Location`}
              src={info.googleMapsUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default Contact;
