// utils/api.js
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let authToken = null;

if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('authToken');
}

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      authToken = null;
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const api = {
  setToken: (token) => {
    authToken = token;
    if (token) {
      localStorage.setItem('authToken', token);
    }
  },

  clearToken: () => {
    authToken = null;
    localStorage.removeItem('authToken');
  },

  get: (url, config) => client.get(url, config),
  post: (url, data, config) => client.post(url, data, config),
  put: (url, data, config) => client.put(url, data, config),
  delete: (url, config) => client.delete(url, config),
  patch: (url, data, config) => client.patch(url, data, config),

  auth: {
    register: (email, password, firstName, lastName) =>
      api.post('/auth/register', { email, password, firstName, lastName }),
    login: (email, password) =>
      api.post('/auth/login', { email, password }),
    getProfile: () =>
      api.get('/auth/profile'),
    updateProfile: (firstName, lastName) =>
      api.put('/auth/profile', { firstName, lastName })
  },

  receipts: {
    list: (page = 1, limit = 20, filters = {}) =>
      api.get('/receipts', { params: { page, limit, ...filters } }),
    get: (id) =>
      api.get(`/receipts/${id}`),
    create: (data) =>
      api.post('/receipts', data),
    update: (id, data) =>
      api.put(`/receipts/${id}`, data),
    delete: (id) =>
      api.delete(`/receipts/${id}`),
    updateItemCategory: (receiptId, itemId, categoryId) =>
      api.put(`/receipts/${receiptId}/items/${itemId}/category`, { categoryId })
  },

  categories: {
    list: () =>
      api.get('/categories'),
    create: (name, color, icon) =>
      api.post('/categories', { name, color, icon }),
    update: (id, data) =>
      api.put(`/categories/${id}`, data),
    delete: (id) =>
      api.delete(`/categories/${id}`),
    getSummary: (id) =>
      api.get(`/categories/${id}/summary`)
  }
};

export default api;
