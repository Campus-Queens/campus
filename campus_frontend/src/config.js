const getApiConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    API_URL: isProduction
      ? process.env.REACT_APP_API_URL
      : 'http://localhost:8000/api',
    WS_URL: isProduction
      ? process.env.REACT_APP_WS_URL
      : 'ws://localhost:8000'
  };
};
