// Environment-specific configuration
const getApiConfig = () => {
  // Check both REACT_APP_ENV and NODE_ENV
  const env = process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development';
  
  console.log('Current environment:', {
    REACT_APP_ENV: process.env.REACT_APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    resolved: env
  });

  const configs = {
    development: {
      API_URL: 'http://localhost:8000',
      WS_URL: 'ws://localhost:8000'
    },
    production: {
      API_URL: 'https://campus-backend-if2p.onrender.com',
      WS_URL: 'wss://campus-backend-if2p.onrender.com'
    },
    test: {
      API_URL: 'http://localhost:8000',
      WS_URL: 'ws://localhost:8000'
    }
  };

  // If env doesn't match any config, use production as fallback
  const config = configs[env] || configs.production;
  
  console.log('Using config:', config);
  
  return config;
};

const config = getApiConfig();

export const { API_URL, WS_URL } = config;
