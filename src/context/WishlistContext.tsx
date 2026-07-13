import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types';
import { supabase } from '../lib/supabase';

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncWishlistWithDb: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('nikhil_furniture_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nikhil_furniture_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;

      // Increment wishlist saves count in database
      supabase.rpc('increment_product_metric', { product_id: product.id, metric_type: 'wishlist' }).then(({ error }) => { if (error) console.error(error); });

      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  // Check if any products in wishlist have been deleted from the database
  const syncWishlistWithDb = async () => {
    if (wishlist.length === 0) return;
    
    try {
      const ids = wishlist.map(item => item.id);
      
      // Query only the IDs of products that still exist
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .in('id', ids);

      if (error) {
        console.error('Error syncing wishlist:', error);
        return;
      }

      if (data) {
        const existingIds = new Set(data.map(item => item.id));
        setWishlist(prev => prev.filter(item => existingIds.has(item.id)));
      }
    } catch (err) {
      console.error('Failed to sync wishlist with DB:', err);
    }
  };

  // Sync wishlist with DB on initial load
  useEffect(() => {
    syncWishlistWithDb();
  }, []);

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      syncWishlistWithDb
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
