import axios from 'axios';
import { API_URL } from './config';

// Ensure we have a valid API_URL, fallback to production if undefined
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

// Add request interceptor for logging and auth
API.interceptors.request.use(
    (config) => {
        // Clean up any double slashes in the URL
        config.url = config.url.replace(/\/+/g, '/');
        
        // Remove any leading slash to prevent double slashes
        config.url = config.url.replace(/^\/+/, '');
        
        // Enhanced request logging
        const fullUrl = `${config.baseURL}/${config.url}`;
        console.log('Making API request:', {
            fullUrl,
            method: config.method,
            baseURL: config.baseURL,
            url: config.url,
            data: config.data
        });

        const token = localStorage.getItem('access_token');

        // Define routes that don't need auth
        const publicEndpoints = [
        'appuser/create-user',
        'appuser/sign-in',
        'appuser/verify-email',
        'appuser/request-password-reset',
        'appuser/reset-password'
        ];
        const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));

if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
}
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
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
