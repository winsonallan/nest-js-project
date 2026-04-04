import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;

  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("err", err.response)
    if (err.response?.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        Cookies.remove('token', { path: '/' });
        Cookies.remove('role', { path: '/' });
        Cookies.remove('user', { path: '/' });
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;