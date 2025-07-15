import { io } from 'socket.io-client';
import config from './config.js';

const socket = io(config.socketUrl);

export default socket;
