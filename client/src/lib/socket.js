import { io } from 'socket.io-client';
import { getToken } from '../api/http';

// Creates a Socket.IO connection authenticated with the stored JWT. In dev the
// connection goes to the same origin and Vite proxies it (ws) to the backend.
export function createSocket() {
  return io({
    auth: { token: getToken() },
    autoConnect: true,
  });
}
