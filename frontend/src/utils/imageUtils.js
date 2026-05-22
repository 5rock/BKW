/**
 * imageUtils.js — Production-ready image URL optimization helpers.
 *
 * These utilities ensure consistent image quality/format parameters
 * across all components without duplicating logic.
 */

const UNSPLASH_HOST = 'images.unsplash.com';
const FIREBASE_HOSTS = ['firebasestorage.googleapis.com', 'storage.googleapis.com'];

/**
 * Appends WebP + quality optimization params to Unsplash CDN URLs.
 * Unsplash's CDN (Imgix) supports fm, q, w, fit, auto natively.
 *
 * @param {string} url  - Original image URL
 * @param {object} opts - Override options
 * @param {number} opts.w    - Width hint (default: undefined)
 * @param {number} opts.q    - Quality 1-100 (default: 75)
 * @param {string} opts.fm   - Format: 'webp' | 'avif' | 'jpg' (default: 'webp')
 * @returns {string} Optimized URL
 */
export const optimizeUnsplash = (url, { w, q = 75, fm = 'webp' } = {}) => {
  if (!url || !url.includes(UNSPLASH_HOST)) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has('fm'))   u.searchParams.set('fm', fm);
    if (!u.searchParams.has('q'))    u.searchParams.set('q', String(q));
    if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
    if (w && !u.searchParams.has('w')) u.searchParams.set('w', String(w));
    return u.toString();
  } catch {
    return url;
  }
};

/**
 * Returns true if a URL points to a Firebase Storage asset.
 * Useful for applying Firebase-specific caching or fetch strategies.
 */
export const isFirebaseStorageUrl = (url = '') =>
  FIREBASE_HOSTS.some((host) => url.includes(host));

/**
 * Generates a srcset string for a given Unsplash image URL.
 * Uses standard breakpoints aligned with our Tailwind config.
 *
 * @param {string} url - Base Unsplash URL
 * @returns {string} srcset attribute value
 */
export const unsplashSrcSet = (url) => {
  if (!url || !url.includes(UNSPLASH_HOST)) return undefined;
  const widths = [480, 768, 1024, 1280, 1600];
  return widths
    .map((w) => `${optimizeUnsplash(url, { w, q: 75, fm: 'webp' })} ${w}w`)
    .join(', ');
};

/**
 * Returns the best fallback image URL with optimization params applied.
 */
export const DEFAULT_PRODUCT_IMAGE = optimizeUnsplash(
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?fit=crop&w=900'
);
