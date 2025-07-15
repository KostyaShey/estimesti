import { io } from 'socket.io-client';
import config from './config.js';

// Configure socket with appropriate transport based on environment
const isProduction = config.socketUrl.includes('vercel.app');

const socket = io(config.socketUrl, {
  // Use polling for Vercel deployment, allow websockets for local development
  transports: isProduction ? ['polling'] : ['websocket', 'polling'],
  // Increase timeout for serverless functions
  timeout: 10000,
  // Add some retry logic
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
