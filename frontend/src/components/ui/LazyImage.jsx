import { useState, useEffect } from 'react';

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=80';

const LazyImage = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbackSrc);
    setLoaded(false);
    setError(false);
  }, [src, fallbackSrc]);

  return (
    <div className={`absolute inset-0 h-full w-full overflow-hidden bg-black/5 dark:bg-white/[0.02] ${containerClassName}`}>
      {/* Skeleton / Shimmer background while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 z-0 bg-neutral-100 dark:bg-neutral-900/40">
          <div className="shimmer h-full w-full" />
        </div>
      )}

      {/* Main Image */}
      <img
        src={imgSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) {
            setImgSrc(fallbackSrc);
            setError(true);
          }
        }}
        className={`absolute inset-0 z-10 h-full w-full object-cover transition-all duration-700 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        } ${className}`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;
