import axios from 'axios';
import { API_URL } from './config';

const API = axios.create({
    baseURL: API_URL,  // Remove /api since it's now in the config
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false  // Set this to false for cross-origin requests
});

// Add request interceptor for logging and auth
API.interceptors.request.use(
    (config) => {
        console.log('Environment:', process.env.REACT_APP_ENV);
        console.log('API URL:', API_URL);
        console.log('Making request to:', `${API_URL}${config.url}`);
        const token = localStorage.getItem('access_token');
        if (token) {
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
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('Response error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
                url: error.config.url
            });
        } else if (error.request) {
            console.error('No response received:', {
                request: error.request,
                url: error.config.url,
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
