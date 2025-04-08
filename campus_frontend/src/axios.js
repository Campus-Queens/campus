import axios from 'axios';
import { API_URL } from './config'; // adjust path if needed

const API = axios.create({
  baseURL: `${API_URL}/api/`,
  withCredentials: true,
});

// Add a request interceptor to add the auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
