import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Log API configuration
console.log('🔗 API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (import.meta.env.DEV) {
      console.log('✅ API Success:', response.config.url);
    }
    return response.data;
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', error.config?.url, error.response?.status);
    }

    // Extract detailed error message
    let message = error.message || 'Something went wrong';
    
    if (error.response?.data) {
      // If there are validation errors, show them
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        message = error.response.data.errors.map(err => err.message || err.msg).join(', ');
      } else if (error.response.data.message) {
        message = error.response.data.message;
      }
    }
    
    // Handle specific status codes
    if (error.response?.status === 401) {
      // Don't clear tokens or redirect if we're on login/signup page (login attempt)
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
      
      if (!isAuthPage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Network error. Please check if the backend server is running.');
    }
    
    return Promise.reject(new Error(message));
  }
);

// Authentication API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    return response;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    return response;
  },

  googleLogin: async (credential) => {
    const response = await api.post('/auth/google', { credential });
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    return response;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    if (response.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    return response.user;
  },

  updateProfile: async (updates) => {
    const response = await api.put('/auth/update-profile', updates);
    if (response.user) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
    }
    return response.user;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    return response;
  },

  isLoggedIn: () => {
    return !!localStorage.getItem('authToken');
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAdmin: () => {
    const user = authAPI.getStoredUser();
    return user && user.role === 'admin';
  },
};

// Menu API
export const menuAPI = {
  getAllItems: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/menu?${params}`);
  },

  searchItems: async (query) => {
    return await api.get(`/menu/search?q=${encodeURIComponent(query)}`);
  },

  getByCanteen: async (canteen) => {
    return await api.get(`/menu/canteen/${encodeURIComponent(canteen)}`);
  },

  getByCategory: async (category) => {
    return await api.get(`/menu/category/${encodeURIComponent(category)}`);
  },

  getItem: async (id) => {
    return await api.get(`/menu/${id}`);
  },

  createItem: async (itemData) => {
    return await api.post('/menu', itemData);
  },

  updateItem: async (id, updates) => {
    return await api.put(`/menu/${id}`, updates);
  },

  deleteItem: async (id) => {
    return await api.delete(`/menu/${id}`);
  },
};

// Order API
export const orderAPI = {
  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  getMyOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/orders/my-orders?${params}`);
  },

  getOrder: async (id) => {
    return await api.get(`/orders/${id}`);
  },

  cancelOrder: async (id, reason) => {
    return await api.put(`/orders/${id}/cancel`, { reason });
  },

  getAllOrders: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/orders?${params}`);
  },

  updateStatus: async (id, status, note = '') => {
    return await api.put(`/orders/${id}/status`, { status, note });
  },

  updateItemStatus: async (orderId, canteen, status) => {
    return await api.put(`/orders/${orderId}/items/status`, { canteen, status });
  },

  getStats: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return await api.get(`/orders/stats/dashboard?${params}`);
  },
};

// Review API
export const reviewAPI = {
  createReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  },

  getItemReviews: async (menuItemId) => {
    return await api.get(`/reviews/item/${menuItemId}`);
  },

  getMyReviews: async () => {
    return await api.get('/reviews/my-reviews');
  },

  updateReview: async (id, updates) => {
    return await api.put(`/reviews/${id}`, updates);
  },

  deleteReview: async (id) => {
    return await api.delete(`/reviews/${id}`);
  },
};

// Health Check & Connection Verification
export const apiHealth = {
  /**
   * Check if backend server is reachable
   */
  checkConnection: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
        timeout: 5000,
      });
      return {
        status: 'connected',
        data: response.data,
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message,
      };
    }
  },

  /**
   * Verify API is responding correctly
   */
  verifyAPI: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/`, {
        timeout: 5000,
      });
      return {
        status: 'ok',
        version: response.data?.version,
        endpoints: response.data?.endpoints,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  },

  /**
   * Test authentication endpoint
   */
  testAuth: async () => {
    try {
      // This will fail with 401 if not authenticated, but that's ok - it means the endpoint works
      await api.get('/auth/me');
      return { status: 'ok', authenticated: true };
    } catch (error) {
      if (error.message.includes('401')) {
        return { status: 'ok', authenticated: false };
      }
      return { status: 'error', error: error.message };
    }
  },
};

// Canteen Owner API
export const canteenOwnerAPI = {
  getDashboard: async () => {
    return await api.get('/canteen-owner/dashboard');
  },

  getMyMenuItems: async () => {
    return await api.get('/canteen-owner/menu');
  },

  createMenuItem: async (itemData) => {
    return await api.post('/canteen-owner/menu', itemData);
  },

  updateMenuItem: async (id, updates) => {
    return await api.put(`/canteen-owner/menu/${id}`, updates);
  },

  deleteMenuItem: async (id) => {
    return await api.delete(`/canteen-owner/menu/${id}`);
  },

  getMyOrders: async () => {
    return await api.get('/canteen-owner/orders');
  },

  updateOrderStatus: async (id, status, note = '') => {
    return await api.put(`/canteen-owner/orders/${id}/status`, { status, note });
  },
};

// Payment API
export const paymentAPI = {
  createRazorpayOrder: async (amount, orderId) => {
    return await api.post('/payments/create-order', { amount, orderId });
  },

  verifyPayment: async (paymentData, orderId) => {
    return await api.post('/payments/verify', { ...paymentData, orderId });
  },

  getPaymentStatus: async (orderId) => {
    return await api.get(`/payments/status/${orderId}`);
  },
};

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    return await api.get('/admin/users');
  },

  getAllCanteens: async () => {
    return await api.get('/admin/canteens');
  },

  getAllCanteenOwners: async () => {
    return await api.get('/admin/canteen-owners');
  },

  createCanteenOwner: async (ownerData) => {
    return await api.post('/admin/canteen-owners', ownerData);
  },

  updateCanteenOwner: async (id, updates) => {
    return await api.put(`/admin/canteen-owners/${id}`, updates);
  },

  deleteCanteenOwner: async (id) => {
    return await api.delete(`/admin/canteen-owners/${id}`);
  },
};

// Utility functions
export const apiUtils = {
  /**
   * Get API base URL
   */
  getBaseURL: () => API_BASE_URL,

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get stored auth token
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  /**
   * Clear all auth data
   */
  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  /**
   * Format error message for display
   */
  formatError: (error) => {
    if (typeof error === 'string') return error;
    return error?.message || error?.error || 'An error occurred';
  },
};

export default api;

