import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, MessageCircle, Phone, ArrowRight, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { Image } from '../components/Image';
import { SEO } from '../components/SEO';

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist, syncWishlistWithDb } = useWishlist();

  // Re-verify that all items still exist in database when opening the page
  useEffect(() => {
    syncWishlistWithDb();
  }, []);

  // Format bulk enquiry message for WhatsApp
  const getBulkWhatsAppLink = () => {
    const listItems = wishlist
      .map((item, idx) => `${idx + 1}. ${item.name} (${item.category} - ${item.wood_type})`)
      .join('\n');
    
    const text = `Hello,\n\nI am interested in requesting a quotation for the following furniture items from my wishlist:\n\n${listItems}\n\nPlease share price estimates, customization possibilities, and delivery timelines for Thrissur/Kerala.\n\nThank you.`;
    return `https://wa.me/919746321808?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="py-16 bg-wood-50 min-h-[75vh]">
      <SEO
        title="My Saved Wishlist | Nikhil Furniture Kerala"
        description="View and manage your saved premium wooden furniture pieces. Enquire directly on WhatsApp for bulk pricing and customization details."
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Wishlist', url: '/wishlist' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header navigation */}
        <div className="flex items-center justify-between border-b border-wood-200/50 pb-8 mb-12">
          <div>
            <span className="text-gold-600 font-sans text-xs uppercase tracking-[0.2em] font-bold">My Selections</span>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-wood-900 tracking-wide mt-2">
              Saved Wishlist
            </h1>
          </div>
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs text-red-500 hover:text-red-700 font-bold uppercase tracking-wider transition-colors flex items-center gap-1 bg-red-50 hover:bg-red-100/70 px-4 py-2 rounded-full border border-red-200/20"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Wishlist
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-wood-200/40 p-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-wood-100 text-wood-500 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-bold text-wood-900 mb-2">Your Wishlist is Empty</h2>
            <p className="text-sm text-wood-600 mb-8 max-w-md mx-auto">
              You haven't saved any wooden furniture pieces yet. Browse our collections and click the heart icon to save your favorites.
            </p>
            <Link
              to="/products"
              className="bg-wood-800 hover:bg-wood-900 text-white px-8 py-3.5 rounded-full font-semibold uppercase tracking-wider text-xs transition-colors shadow-sm inline-flex items-center gap-2"
            >
              Explore Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* List items block */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-6 border border-wood-200/40 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:border-wood-300 transition-all duration-300 relative"
                >
                  {/* Thumbnail Box */}
                  <Link to={`/products/${item.slug}`} className="w-full md:w-36 h-28 rounded-2xl overflow-hidden shrink-0">
                    <Image src={item.featured_image} alt={item.name} className="w-full h-full object-cover" />
                  </Link>

                  {/* Metadata */}
                  <div className="flex-grow text-center md:text-left">
                    <span className="text-[10px] text-wood-400 font-bold uppercase tracking-wider">{item.category}</span>
                    <Link to={`/products/${item.slug}`}>
                      <h3 className="font-serif text-lg font-bold text-wood-900 hover:text-wood-700 transition-colors mt-1 mb-1.5">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-wood-500 leading-relaxed font-sans">{item.wood_type} • {item.finish}</p>
                  </div>

                  {/* Actions (Delete icon & detail routing) */}
                  <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
                    <Link
                      to={`/products/${item.slug}`}
                      className="text-xs font-bold text-gold-600 hover:text-gold-700 hover:underline inline-flex items-center gap-1"
                    >
                      View Piece
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors border border-red-200/10"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar actions: Send Bulk Enquiry */}
            <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-wood-200/40 shadow-sm sticky top-28 flex flex-col gap-6">
              <h3 className="font-serif text-xl font-bold text-wood-950">Bulk Enquiry</h3>
              <p className="text-xs text-wood-600 leading-relaxed">
                Send all <span className="font-bold text-wood-900">{wishlist.length} saved furniture items</span> to our showroom manager in a single click. We will reply back with prices, customization options, and delivery timelines.
              </p>
              <div className="flex flex-col gap-3 pt-4 border-t border-wood-100">
                <a
                  href={getBulkWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white py-4 rounded-full font-semibold uppercase tracking-wider text-xs transition-all duration-300 shadow-md shadow-[#25D366]/10 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 fill-white" />
                  Enquire all on WhatsApp
                </a>
                <a
                  href="tel:+919746321808"
                  className="w-full bg-wood-800 hover:bg-wood-900 text-white py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Showroom Directly
                </a>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
export default Wishlist;
