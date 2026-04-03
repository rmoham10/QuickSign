import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('befit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;