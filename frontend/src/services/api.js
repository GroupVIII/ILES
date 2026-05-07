import axios from 'axios';

const api = axios.create({
    // VITE_API_URL will be set in Render. Locally, it defaults to localhost!
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// Intercept every request before it goes out
api.interceptors.request.use(
  (config) => {
    // Grab the token from tab-specific storage
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// Optional: Handle 401 Unauthorized globally (e.g., token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and force reload to kick them to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;