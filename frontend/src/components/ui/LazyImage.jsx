import { memo, useState, useEffect } from 'react';

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=900&q=75&fm=webp';

/**
 * Appends Unsplash optimization parameters to cut image payload.
 * - fm=webp   → WebP format where supported
 * - q=75      → Sufficient quality at reduced size
 * - auto=format → Unsplash CDN chooses best format per browser
 */
const optimizeUnsplash = (url) => {
  if (!url || !url.includes('images.unsplash.com')) return url;
  const u = new URL(url);
  if (!u.searchParams.has('fm')) u.searchParams.set('fm', 'webp');
  if (!u.searchParams.has('q')) u.searchParams.set('q', '75');
  if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
  return u.toString();
};

/**
 * LazyImage — production-grade lazy image with shimmer placeholder.
 *
 * Props:
 *   priority  {boolean}  — Set true for above-the-fold / LCP images.
 *                          Enables eager loading + fetchpriority="high".
 *   src       {string}   — Image URL (Unsplash URLs are auto-optimized).
 *   alt       {string}   — Alt text (required for accessibility).
 *   sizes     {string}   — Responsive sizes hint.
 *   width/height         — Explicit dimensions prevent CLS.
 */
const LazyImage = memo(({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackSrc = DEFAULT_FALLBACK,
  sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 90vw',
  priority = false,
  width,
  height,
  ...props
}) => {
  const optimized = optimizeUnsplash(src) || optimizeUnsplash(fallbackSrc);
  const [imgSrc, setImgSrc] = useState(optimized);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const next = optimizeUnsplash(src) || optimizeUnsplash(fallbackSrc);
    setImgSrc(next);
    setLoaded(false);
    setError(false);
  }, [src, fallbackSrc]);

  return (
    <div
      className={`absolute inset-0 h-full w-full overflow-hidden bg-black/5 dark:bg-white/[0.02] ${containerClassName}`}
    >
      {/* Shimmer skeleton — only rendered while image hasn't loaded */}
      {!loaded && !error && (
        <div className="absolute inset-0 z-0 bg-neutral-100 dark:bg-neutral-900/40">
          <div className="shimmer h-full w-full" />
        </div>
      )}

      <img
        src={imgSrc}
        alt={alt}
        /* Priority images (LCP) load eagerly with high fetchpriority.
           Below-fold images use native lazy loading for network savings. */
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        sizes={sizes}
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!error) {
            setImgSrc(optimizeUnsplash(fallbackSrc));
            setError(true);
          }
        }}
        className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
