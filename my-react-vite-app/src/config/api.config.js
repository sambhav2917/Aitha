import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://jsonplaceholder.typicode.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global interceptor for logging/handling errors at a network level
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Global Network Error:', error.response?.status || 'No Response');
    return Promise.reject(error);
  }
);

export default api;