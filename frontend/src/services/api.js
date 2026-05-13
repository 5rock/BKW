import axios from 'axios';
import { refreshAccessToken } from './authService';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gm_access_token') || sessionStorage.getItem('gm_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Auto-refresh on 401 — retry once with new access token
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    const isAuthEndpoint =
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/register') ||
      original.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue requests while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry   = true;
      isRefreshing      = true;

      const storedRefresh = localStorage.getItem('gm_refresh_token') || sessionStorage.getItem('gm_refresh_token');
      if (!storedRefresh) {
        // No refresh token — force logout
        localStorage.removeItem('gm_access_token');
        localStorage.removeItem('gm_refresh_token');
        sessionStorage.removeItem('gm_access_token');
        sessionStorage.removeItem('gm_refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await refreshAccessToken(storedRefresh);
        const storage = localStorage.getItem('gm_refresh_token') ? localStorage : sessionStorage;
        storage.setItem('gm_access_token', data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('gm_access_token');
        localStorage.removeItem('gm_refresh_token');
        sessionStorage.removeItem('gm_access_token');
        sessionStorage.removeItem('gm_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Product APIs
export const fetchProducts     = (params = {}) => api.get('/products', { params });
export const fetchProductById  = (id)          => api.get(`/products/${id}`);
export const createProduct     = (data)        => api.post('/products', data);
export const updateProduct     = (id, data)    => api.put(`/products/${id}`, data);
export const deleteProduct     = (id)          => api.delete(`/products/${id}`);

// ── Cart APIs
export const fetchCart        = ()             => api.get('/cart');
export const addToCart        = (data)         => api.post('/cart', data);
export const updateCartItem   = (itemId, data) => api.put(`/cart/${itemId}`, data);
export const removeFromCart   = (itemId)       => api.delete(`/cart/${itemId}`);

// ── User Profile
export const fetchMe          = ()             => api.get('/users/me');

export default api;
