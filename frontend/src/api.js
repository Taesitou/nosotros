import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = (credentials) => api.post('/auth/login', credentials);
export const getAlbums = () => api.get('/albums');
export const getAlbum = (id) => api.get(`/albums/${id}`);
export const createAlbum = (data) => api.post('/albums', data);
export const updateAlbum = (id, data) => api.put(`/albums/${id}`, data);
export const uploadMedia = (id, formData) => api.post(`/albums/${id}/media`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteAlbum = (id) => api.delete(`/albums/${id}`);
export const getMediaUrl = (filename) => `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/uploads/${filename}`;

export default api;
