// API configuration
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
};

export default config;
