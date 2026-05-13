import api from './api';
import { showcaseProducts } from '../constants/marketplace';

/**
 * Fetch products from the REST API instead of Firebase.
 * This ensures the application works with the Mock Backend.
 */
export const getProducts = async (filters = {}) => {
  try {
    const { data } = await api.get('/products', {
      params: {
        search: filters.search,
        category: filters.category,
        sort: filters.sort,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        limit: filters.limit,
        // Mocking other filters as query params if needed
        brands: filters.brands?.join(','),
        colors: filters.colors?.join(','),
        sizes: filters.sizes?.join(','),
        rating: filters.rating,
      }
    });

    return {
      products: data.products || [],
      total: data.total || 0,
      lastDoc: null, // REST API uses offset/page, not Firebase cursor
      hasMore: (data.products?.length || 0) === (filters.limit || 24),
    };
  } catch (error) {
    console.warn('getProducts fallback:', error.message);
    const category = filters.category && filters.category !== 'All' ? String(filters.category).toLowerCase() : '';
    const search = filters.search ? String(filters.search).toLowerCase() : '';
    const products = showcaseProducts
      .filter((product) => !category || product.category.toLowerCase().includes(category))
      .filter((product) => !search || `${product.title} ${product.brand} ${product.category}`.toLowerCase().includes(search))
      .slice(0, filters.limit || 24);
    return {
      products,
      total: products.length,
      lastDoc: null,
      hasMore: false,
    };
  }
};

export const getProductById = async (productId) => {
  try {
    const { data } = await api.get(`/products/${productId}`);
    return data;
  } catch (error) {
    const fallback = showcaseProducts.find((product) => product.id === productId || product._id === productId);
    if (fallback) return fallback;
    throw error;
  }
};

export const createProduct = async ({ data, user }) => {
  const { data: result } = await api.post('/products', {
    ...data,
    sellerId: user.uid,
    createdAt: new Date().toISOString(),
  });
  return result;
};

export const updateProduct = async (productId, data) => {
  const { data: result } = await api.put(`/products/${productId}`, data);
  return result;
};

export const deleteProduct = async (productId) => {
  const { data } = await api.delete(`/products/${productId}`);
  return data;
};

export const getRelatedProducts = async (product, count = 8) => {
  const result = await getProducts({ category: product.category, limit: count + 1, sort: 'top_rated' });
  return result.products.filter((item) => item.id !== product.id).slice(0, count);
};

// Placeholder for image upload (needs backend implementation or third-party service)
export const uploadProductImage = async (file) => {
  console.warn('Image upload is not yet implemented in REST mode. Using placeholder.');
  return URL.createObjectURL(file);
};
