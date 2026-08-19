/**
 * LazyImage.jsx — GoldMarket
 *
 * FIX: Added responsive srcset so the browser fetches the right image size.
 *      Lighthouse flagged images served at 900px being rendered at 183-275px —
 *      wasting 436 KiB of image data.
 * FIX: Added explicit width/height to prevent layout shift (CLS).
 * FIX: fetchpriority="high" only for above-the-fold images (hero).
 */

import { useRef, useState, useEffect } from 'react';

const LazyImage = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  width = 390,
  height = 520,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false, // Set true only for above-the-fold images (e.g. hero)
  objectFit = 'cover',
  ...rest
}) => {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Build responsive srcset from Unsplash URLs automatically
  // Unsplash supports ?w= param for on-the-fly resizing
  const buildSrcSet = (url) => {
    if (!url?.includes('unsplash.com')) return undefined;
    const base = url.split('?')[0];
    return [200, 400, 600, 800, 1200]
      .map((w) => `${base}?auto=format&fm=webp&fit=crop&w=${w}&q=75 ${w}w`)
      .join(', ');
  };

  const srcSet = buildSrcSet(src);

  // Intersection Observer for lazy loading (non-priority images)
  useEffect(() => {
    if (priority || !imgRef.current) return;
    if (!('IntersectionObserver' in window)) {
      setLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          setLoaded(true);
        }
      },
      { rootMargin: '200px' } // Start loading 200px before it's visible
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  if (error) {
    return (
      <div
        ref={imgRef}
        className={`flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-800 ${containerClassName}`}
        style={{ width, height }}
        aria-label={alt}
        role="img"
      >
        <span className="text-xs text-gray-400">Image unavailable</span>
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative h-full w-full overflow-hidden ${containerClassName}`}
      style={{ aspectRatio: width && height ? `${width} / ${height}` : undefined }}
    >
      <img
        // FIX: Don't set src until visible (unless priority)
        src={priority || loaded ? src : undefined}
        srcSet={priority || loaded ? srcSet : undefined}
        sizes={priority || loaded ? sizes : undefined}
        alt={alt}
        // FIX: Explicit dimensions prevent layout shift
        width={width}
        height={height}
        className={`h-full w-full transition-opacity duration-300 ${loaded || priority ? 'opacity-100' : 'opacity-0'} ${className}`}
        style={{ objectFit }}
        // FIX: loading="eager" for priority images, "lazy" for the rest
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        // FIX: fetchpriority for LCP element
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...rest}
      />
    </div>
  );
};

export default LazyImage;
