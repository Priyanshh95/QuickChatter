import { useEffect, useState } from 'react';
import { createSocket } from '../lib/socket';

// Opens an authenticated Socket.IO connection for the lifetime of the
// component and tracks the connection state. Listeners for app events are
// attached by the consumer (keyed on the returned socket).
export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = createSocket();
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    setSocket(s);
    return () => s.close();
  }, []);

  return { socket, connected };
}
