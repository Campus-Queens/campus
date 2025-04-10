import axios from 'axios';
import { API_URL } from './config';

const baseURL = API_URL || 'https://campus-backend-if2p.onrender.com';

console.log('API Configuration:', {
  configuredApiUrl: API_URL,
  usingBaseUrl: baseURL,
  environment: process.env.NODE_ENV,
  reactAppEnv: process.env.REACT_APP_ENV
});

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Interceptor for auth and logging
API.interceptors.request.use(
  (config) => {
    // Clean URL formatting
    config.url = config.url.replace(/\/+/g, '/').replace(/^\/+/, '');

    // Determine full request URL
    const fullUrl = `${config.baseURL}/${config.url}`;
    const method = config.method?.toLowerCase();

    console.log('Making API request:', {
      fullUrl,
      method,
      baseURL: config.baseURL,
      url: config.url,
      data: config.data
    });

    const token = localStorage.getItem('access_token');

    // Define public GET endpoints
    const publicGetEndpoints = [
      'listings',
      'books',
      'rideshare',
      'sublets',
      'roommates',
      'events',
      'appuser/create-user',
      'appuser/sign-in',
      'appuser/verify-email',
      'appuser/request-password-reset',
      'appuser/reset-password'
    ];

    const isPublicGet = method === 'get' &&
      publicGetEndpoints.some(endpoint => config.url.includes(endpoint));

    if (token && !isPublicGet) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Auth header set');
    } else {
      delete config.headers.Authorization;
      console.log('🟢 No auth header (public request)');
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config.url,
        baseURL: error.config.baseURL,
        fullUrl: `${error.config.baseURL}${error.config.url}`
      });
    } else if (error.request) {
      console.error('No response received:', {
        request: error.request,
        url: error.config.url,
        baseURL: error.config.baseURL,
        fullUrl: `${error.config.baseURL}${error.config.url}`,
        method: error.config.method
      });
    } else {
      console.error('Error setting up request:', {
        message: error.message,
        config: error.config
      });
    }
    return Promise.reject(error);
  }
);

export default API;
