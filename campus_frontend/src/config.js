// Environment-specific configuration
const getApiConfig = () => {
  // Use Vite's import.meta.env instead of process.env
  const env = import.meta.env.MODE || 'development';
  
  console.log('Current environment:', {
    MODE: import.meta.env.MODE,
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

  // If env doesn't match any config, use production as fallback
  const config = configs[env] || configs.production;
  
  console.log('Using config:', config);
  
  return config;
};

const config = getApiConfig();

export const { API_URL, WS_URL } = config;
