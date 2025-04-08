// Environment-specific configuration
const getApiConfig = () => {
  const env = process.env.REACT_APP_ENV || 'development';
  
  const configs = {
    development: {
      API_URL: 'http://localhost:8000/api',
      WS_URL: 'ws://localhost:8000'
    },
    production: {
      API_URL: 'https://campus-backend-if2p.onrender.com/api',
      WS_URL: 'wss://campus-backend-if2p.onrender.com'
    }
  };

  return configs[env] || configs.development;
};

const config = getApiConfig();

export const { API_URL, WS_URL } = config;