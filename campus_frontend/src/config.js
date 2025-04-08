const isProduction = import.meta.env.MODE === 'production';

export const API_URL = isProduction
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:8000/api';

export const WS_URL = isProduction
  ? import.meta.env.VITE_WS_URL
  : 'ws://localhost:8000';
