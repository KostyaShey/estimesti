// API configuration
const isProduction = import.meta.env.PROD;
const isLocal = window.location.hostname === 'localhost';

// Use the deployed backend URL directly for production
const PRODUCTION_BACKEND_URL =
  'https://estimestiserver-7i9q7cazu-kostyasheys-projects.vercel.app';

const config = {
  apiUrl:
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'estimesti.vercel.app'
      ? PRODUCTION_BACKEND_URL
      : 'http://localhost:3001'),
  socketUrl:
    import.meta.env.VITE_SOCKET_URL ||
    (window.location.hostname === 'estimesti.vercel.app'
      ? PRODUCTION_BACKEND_URL
      : 'http://localhost:3001'),
};

// Debug logging
console.log('Config:', { isProduction, isLocal, config });

export default config;
