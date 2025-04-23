import axios from 'axios';
import { API_URL } from './config';

const baseURL = API_URL || 'http://localhost:8000';

console.log('API Configuration:', {
  configuredApiUrl: API_URL,
  usingBaseUrl: baseURL,
  environment: import.meta.env.MODE
});

const API = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false,
  timeout: 10000, // 10 second timeout
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

    const alwaysPublicEndpoints = [
        'appuser/create-user',
        'appuser/sign-in',
        'appuser/verify-email',
        'appuser/request-password-reset',
        'appuser/reset-password'
      ];
      
    const publicGetEndpoints = [
        'listings',
        'books',
        'rideshare',
        'sublets',
        'roommates',
        'events'
      ];

    const cleanedUrl = config.url.replace(/^\/+/, '');
    
    const isAlwaysPublic = alwaysPublicEndpoints.some(endpoint =>
    cleanedUrl.startsWith(endpoint)
    );
    
    const isPublicGet = method === 'get' &&
    publicGetEndpoints.some(endpoint =>
        cleanedUrl.startsWith(endpoint)
    );
      

    if (token && !isAlwaysPublic && !isPublicGet) {
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
