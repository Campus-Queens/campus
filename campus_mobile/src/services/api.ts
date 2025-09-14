import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://campus-backend-if2p.onrender.com/api';

console.log('API Configuration:', {
  API_URL,
  environment: Constants.expoConfig?.extra?.ENV || 'production'
});

const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
});

// Request interceptor for auth and logging
API.interceptors.request.use(
  async (config) => {
    // Clean URL formatting
    config.url = config.url?.replace(/\/+/g, '/').replace(/^\/+/, '');

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

    const token = await AsyncStorage.getItem('access_token');

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

    const cleanedUrl = config.url?.replace(/^\/+/, '') || '';
    
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

// Response interceptor for debugging and token refresh
API.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config.url,
        baseURL: error.config.baseURL,
        fullUrl: `${error.config.baseURL}${error.config.url}`
      });

      // Handle 401 Unauthorized - token expired
      if (error.response.status === 401) {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_URL}/appuser/refresh-token`, {
              refresh: refreshToken
            });
            
            const { access } = refreshResponse.data;
            await AsyncStorage.setItem('access_token', access);
            
            // Retry the original request
            error.config.headers.Authorization = `Bearer ${access}`;
            return API.request(error.config);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
            console.log('Token refresh failed, redirecting to login');
          }
        }
      }
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