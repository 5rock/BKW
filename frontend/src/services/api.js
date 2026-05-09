import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('goldmarket_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes('/users/login') &&
      !error.config.url.includes('/users/register')
    ) {
      localStorage.removeItem('goldmarket_token');
      localStorage.removeItem('goldmarket_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product APIs
export const fetchProducts = (params = {}) => api.get('/products', { params });
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// User APIs
export const registerUser = (data) => api.post('/users/register', data);
export const loginUser = (data) => api.post('/users/login', data);
export const fetchMe = () => api.get('/users/me');

// Cart APIs
export const fetchCart = () => api.get('/cart');
export const addToCart = (data) => api.post('/cart', data);
export const updateCartItem = (itemId, data) => api.put(`/cart/${itemId}`, data);
export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);

export default api;
