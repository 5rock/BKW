/**
 * productService.js — Cache-first, abort-safe product data access.
 *
 * Improvements:
 *  1. Uses getCached() from api.js for GET requests — shares TTL cache +
 *     in-flight deduplication with the api layer
 *  2. AbortController pattern: all read functions accept an optional signal
 *     so callers can cancel in-flight requests on component unmount
 *  3. getProducts: builds params object without undefined keys to avoid
 *     sending empty query params (e.g., ?search=undefined)
 */
import { getCached, invalidateCache } from './api';
import api from './api';
import { showcaseProducts } from '../constants/marketplace';

// ── Fallback data when API is unavailable (dev mode / no backend)
const fallbackProducts = (filters = {}) => {
  const category = filters.category && filters.category !== 'All'
    ? String(filters.category).toLowerCase() : '';
  const search = filters.search ? String(filters.search).toLowerCase() : '';

  return showcaseProducts
    .filter((p) => !category || p.category.toLowerCase().includes(category))
    .filter((p) => !search || `${p.title} ${p.brand} ${p.category}`.toLowerCase().includes(search))
    .slice(0, filters.limit || 24);
};

// ── Build clean params object (no undefined values that pollute query strings)
const buildParams = (filters = {}) => {
  const p = {};
  if (filters.search)    p.search   = filters.search;
  if (filters.category)  p.category = filters.category;
  if (filters.sort)      p.sort     = filters.sort;
  if (filters.minPrice != null) p.minPrice = filters.minPrice;
  if (filters.maxPrice != null) p.maxPrice = filters.maxPrice;
  if (filters.limit)     p.limit    = filters.limit;
  if (filters.brands?.length)  p.brands  = filters.brands.join(',');
  if (filters.colors?.length)  p.colors  = filters.colors.join(',');
  if (filters.sizes?.length)   p.sizes   = filters.sizes.join(',');
  if (filters.rating)    p.rating   = filters.rating;
  return p;
};

/**
 * Fetch products with cache-first strategy.
 * Pass `signal` from AbortController to cancel on unmount.
 */
export const getProducts = async (filters = {}, signal) => {
  try {
    const params = buildParams(filters);
    const { data } = await getCached('/products', { params, signal });

    const apiCount = data.products?.length || 0;

    if (!apiCount) {
      const products = fallbackProducts(filters);
      return { products, total: products.length, lastDoc: null, hasMore: false };
    }

    return {
      products: data.products,
      total: data.total || apiCount,
      lastDoc: null,
      hasMore: apiCount === (filters.limit || 24),
    };
  } catch (error) {
    // Don't log abort errors — they are intentional
    if (error?.name !== 'AbortError' && error?.code !== 'ERR_CANCELED') {
      console.warn('[productService] getProducts fallback:', error?.message);
    }
    const products = fallbackProducts(filters);
    return { products, total: products.length, lastDoc: null, hasMore: false };
  }
};

/**
 * Fetch a single product by ID (cache-first, 5-minute TTL).
 */
export const getProductById = async (productId, signal) => {
  try {
    const { data } = await getCached(`/products/${productId}`, { signal, ttl: 300_000 });
    return data;
  } catch (error) {
    if (error?.name !== 'AbortError') {
      const fallback = showcaseProducts.find((p) => p.id === productId || p._id === productId);
      if (fallback) return fallback;
    }
    throw error;
  }
};

export const createProduct = async ({ data, user }) => {
  const { data: result } = await api.post('/products', {
    ...data,
    sellerId: user.uid,
    createdAt: new Date().toISOString(),
  });
  invalidateCache('/products');
  return result;
};

export const updateProduct = async (productId, data) => {
  const { data: result } = await api.put(`/products/${productId}`, data);
  invalidateCache('/products');
  invalidateCache(`/products/${productId}`);
  return result;
};

export const deleteProduct = async (productId) => {
  const { data } = await api.delete(`/products/${productId}`);
  invalidateCache('/products');
  return data;
};

export const getRelatedProducts = async (product, count = 8, signal) => {
  const result = await getProducts({ category: product.category, limit: count + 1, sort: 'top_rated' }, signal);
  return result.products.filter((item) => item.id !== product.id).slice(0, count);
};

export const uploadProductImage = async (file) => {
  console.warn('[productService] Image upload not yet implemented. Using object URL placeholder.');
  return URL.createObjectURL(file);
};
