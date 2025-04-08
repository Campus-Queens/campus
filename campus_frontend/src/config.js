// config.js

const getApiConfig = () => {
  const env = process.env.REACT_APP_ENV || 'development';

  const configs = {
    development: {
      API_URL: 'http://localhost:8000/api',
      WS_URL: 'ws://localhost:8000'
    },
    production: {
      API_URL: process.env.REACT_APP_API_URL,
      WS_URL: process.env.REACT_APP_WS_URL
    }
  };

  return configs[env] || configs.development;
};

const config = getApiConfig();

export const { API_URL, WS_URL } = config;
