import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://event-platform-backend-u2sx.onrender.com/api'
});

// Axios Request Interceptor: Auto-attach JWT token if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('event_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios Response Interceptor: Catch expired or invalid JWT (401/403) and log user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Avoid infinite logout loops
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('event_token');
        localStorage.removeItem('event_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
