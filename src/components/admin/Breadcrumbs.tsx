import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const { pathname } = useLocation();
  const pathnames = pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-wood-500 font-sans font-semibold">
      <Link 
        to="/admin/dashboard" 
        className="flex items-center gap-1 text-wood-500 hover:text-wood-950 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        // Format label names elegantly (e.g. homepage-builder -> Homepage Builder)
        const label = value
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3 h-3 text-wood-300 flex-shrink-0" />
            {isLast ? (
              <span className="text-wood-950 font-bold capitalize select-none truncate max-w-[150px] md:max-w-none">
                {label}
              </span>
            ) : (
              <Link 
                to={to} 
                className="hover:text-wood-950 transition-colors capitalize truncate max-w-[100px] md:max-w-none"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
