import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const officerToken = localStorage.getItem('officerToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (officerToken) {
      config.headers.Authorization = `Bearer ${officerToken}`;
    } else if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
