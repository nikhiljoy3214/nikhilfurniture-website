import React, { useState, useEffect, useRef } from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'auto',
  objectFit = 'cover',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset loading status when source URL changes and check if already complete in cache
  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      if (img.complete) {
        if (img.naturalWidth === 0) {
          setError(true);
        } else {
          setIsLoaded(true);
        }
      } else {
        setIsLoaded(false);
        setError(false);
      }
    }
  }, [src]);

  let aspectClass = '';
  if (aspectRatio === 'video') aspectClass = 'aspect-video';
  else if (aspectRatio === 'square') aspectClass = 'aspect-square';
  else if (aspectRatio === 'portrait') aspectClass = 'aspect-[3/4]';

  return (
    <div className={`relative overflow-hidden ${objectFit === 'contain' ? 'bg-white' : 'bg-wood-100'} ${aspectClass} ${className}`}>
      {/* Blurred image placeholder or skeleton loader */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-wood-100 via-wood-200 to-wood-100 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-wood-300 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-wood-200 flex flex-col items-center justify-center text-wood-500 p-4 text-center">
          <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-medium">Image unavailable</span>
        </div>
      )}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-${objectFit} transition-opacity duration-700 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
