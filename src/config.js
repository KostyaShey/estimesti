// API configuration
const isProduction = import.meta.env.PROD;
const isLocal = window.location.hostname === 'localhost';

const config = {
  apiUrl:
    import.meta.env.VITE_API_URL ||
    (isProduction && !isLocal
      ? 'https://estimestiserver-lfmtraz7v-kostyasheys-projects.vercel.app'
      : 'http://localhost:3001'),
  socketUrl:
    import.meta.env.VITE_SOCKET_URL ||
    (isProduction && !isLocal
      ? 'https://estimestiserver-lfmtraz7v-kostyasheys-projects.vercel.app'
      : 'http://localhost:3001'),
};

// Debug logging
console.log('Config:', { isProduction, isLocal, config });

export default config;
