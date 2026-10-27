import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject Authorization Bearer token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apex_wash_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global 401 unauthenticated responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear local auth
      const currentToken = localStorage.getItem('apex_wash_auth_token');
      if (currentToken && !error.config.url.includes('/auth/login')) {
        localStorage.removeItem('apex_wash_auth_token');
        localStorage.removeItem('apex_wash_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
