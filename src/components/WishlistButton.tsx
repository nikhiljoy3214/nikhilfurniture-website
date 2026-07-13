import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import type { Product } from '../types';

interface WishlistButtonProps {
  product: Product;
  className?: string;
  showText?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  className = '',
  showText = false
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const liked = isInWishlist(product.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center justify-center p-2.5 rounded-full transition-all duration-300 ${
        liked
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-wood-100 text-wood-600 hover:bg-wood-200 hover:text-wood-800'
      } ${className}`}
      aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`w-5 h-5 transition-transform duration-300 ${
          liked ? 'fill-red-500 scale-110' : 'scale-100'
        }`}
      />
      {showText && (
        <span className="ml-2 font-medium text-sm">
          {liked ? 'Saved' : 'Save to Wishlist'}
        </span>
      )}
    </button>
  );
};
