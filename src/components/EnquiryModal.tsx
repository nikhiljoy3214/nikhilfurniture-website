import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { X, Send, MapPin, Phone, User, MessageSquare, Tag } from 'lucide-react';

const enquirySchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  phone: zod.string().min(10, 'Please enter a valid 10-digit phone number'),
  location: zod.string().min(2, 'Location / City is required'),
  requirement: zod.string().min(1, 'Please select a requirement'),
  message: zod.string().min(5, 'Message must be at least 5 characters')
});

type EnquiryFormValues = zod.infer<typeof enquirySchema>;

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productCategory?: string;
  whatsAppNumber?: string;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  productName,
  productCategory,
  whatsAppNumber = '9746321808'
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      name: '',
      phone: '',
      location: '',
      requirement: productCategory || 'Custom Furniture',
      message: productName ? `Interested in custom dimensions / specifications for "${productName}".` : ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        phone: '',
        location: '',
        requirement: productCategory || 'Custom Furniture',
        message: productName ? `Interested in custom dimensions / specifications for "${productName}".` : ''
      });
    }
  }, [isOpen, productName, productCategory, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: EnquiryFormValues) => {
    let text = `Hello Nikhil Furniture,\n\nI would like to request a custom enquiry.`;
    if (productName) {
      text += `\nProduct: ${productName}`;
    }
    text += `\n\nName: ${data.name}`;
    text += `\nPhone: ${data.phone}`;
    text += `\nLocation: ${data.location}`;
    text += `\nRequirement: ${data.requirement}`;
    text += `\n\nMessage / Dimensions:\n${data.message}`;

    const url = `https://wa.me/91${whatsAppNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-wood-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-wood-200/40 shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in font-sans text-xs font-semibold text-wood-700 select-none max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="h-16 border-b border-wood-100 px-6 flex items-center justify-between shrink-0 bg-wood-50/50">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-gold-600 font-bold block">Direct Consultation</span>
            <h3 className="font-serif text-base font-bold text-wood-950">
              {productName ? `Request Custom: ${productName}` : 'Request Custom Furniture'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-wood-100 border border-wood-200 flex items-center justify-center text-wood-400 hover:text-wood-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex flex-col gap-4">
          
          {/* Name Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500 flex items-center gap-1">
              <User className="w-3 h-3 text-gold-600" /> Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              {...register('name')}
              className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
            />
            {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
          </div>

          {/* Phone & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-gold-600" /> Phone Number
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                {...register('phone')}
                className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
              />
              {errors.phone && <span className="text-[10px] text-red-500">{errors.phone.message}</span>}
            </div>

            {/* Location Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gold-600" /> Location / City
              </label>
              <input
                type="text"
                placeholder="e.g. Ernakulam, Thrissur"
                {...register('location')}
                className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
              />
              {errors.location && <span className="text-[10px] text-red-500">{errors.location.message}</span>}
            </div>
          </div>

          {/* Requirement Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500 flex items-center gap-1">
              <Tag className="w-3 h-3 text-gold-600" /> Requirement Category
            </label>
            <select
              {...register('requirement')}
              className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 font-semibold"
            >
              <option value="Custom Sofa Set">Custom Sofa Set</option>
              <option value="Dining Table & Chairs">Dining Table & Chairs</option>
              <option value="King/Queen Bed Cot">King/Queen Bed Cot</option>
              <option value="Bedroom Wardrobe">Bedroom Wardrobe</option>
              <option value="Home swing (Oonjal)">Home swing (Oonjal)</option>
              <option value="Custom Furniture">Custom Furniture / Other</option>
            </select>
          </div>

          {/* Message Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-wood-500 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-gold-600" /> Message / Dimension Details
            </label>
            <textarea
              rows={3}
              placeholder="Specify room dimensions, preferred wood (Teak/Mahogany), or custom request..."
              {...register('message')}
              className="w-full bg-wood-50/50 border border-wood-200 rounded-xl py-2.5 px-3.5 text-xs font-sans focus:outline-none focus:border-wood-500 resize-none font-semibold"
            />
            {errors.message && <span className="text-[10px] text-red-500">{errors.message.message}</span>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-wood-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-wood-100 hover:bg-wood-200 text-wood-700 py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer border-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-wood-800 hover:bg-wood-950 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer border-none active:scale-95"
            >
              <Send className="w-3.5 h-3.5" /> Submit Enquiry
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EnquiryModal;
