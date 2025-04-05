// Environment-specific configuration
const getApiConfig = () => {
  const env = process.env.REACT_APP_ENV || 'development';
  
  const configs = {
    development: {
      API_URL: 'http://localhost:8000',
      WS_URL: 'ws://localhost:8000'
    },
    production: {
      API_URL: process.env.REACT_APP_API_URL || 'https://api.yourcampusapp.com',
      WS_URL: process.env.REACT_APP_WS_URL || 'wss://api.yourcampusapp.com'
    }
  };

  return configs[env] || configs.development;
};

const config = getApiConfig();

export const { API_URL, WS_URL } = config;