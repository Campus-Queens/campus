import Constants from 'expo-constants';

const getApiConfig = () => {
  const env = Constants.expoConfig?.extra?.ENV || 'production';
  
  console.log('Current environment:', {
    ENV: Constants.expoConfig?.extra?.ENV,
    resolved: env
  });

  const configs = {
    development: {
      API_URL: 'http://localhost:8000/api',
      WS_URL: 'ws://localhost:8000'
    },
    production: {
      API_URL: 'https://campus-backend-if2p.onrender.com/api',
      WS_URL: 'wss://campus-backend-if2p.onrender.com'
    },
    test: {
      API_URL: 'http://localhost:8000/api',
      WS_URL: 'ws://localhost:8000'
    }
  };

  const config = configs[env as keyof typeof configs] || configs.production;
  
  console.log('Using config:', config);
  
  return config;
};

const config = getApiConfig();

export const { API_URL, WS_URL } = config;

export const APP_CONFIG = {
  name: 'Campus',
  version: '1.0.0',
  timeout: 10000,
}; 