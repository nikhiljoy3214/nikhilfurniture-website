import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';

export const NotFound: React.FC = () => {
  return (
    <div className="py-20 bg-wood-50 min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <SEO
        title="Page Not Found | Nikhil Furniture"
        description="The page you are looking for does not exist. Browse our timber collections or return home."
      />

      <div className="max-w-md mx-auto">
        <span className="font-serif text-8xl font-bold text-wood-300 block mb-6 animate-pulse">404</span>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-wood-950 mb-4">
          Piece Not Found
        </h1>
        <p className="text-sm text-wood-650 leading-relaxed mb-8">
          The page or product category you are looking for might have been moved, deleted, or does not exist. Let's get you back to the showroom floor.
        </p>
        <Link
          to="/"
          className="bg-wood-800 hover:bg-wood-900 text-white px-8 py-3.5 rounded-full font-semibold uppercase tracking-wider text-xs transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          Return to Showroom
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
export default NotFound;
