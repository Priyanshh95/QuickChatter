import { createContext, useContext } from 'react';
import { useSocket } from '../hooks/useSocket';

// Provides a single authenticated socket connection to the chat subtree.
const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const value = useSocket();
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  return useContext(SocketContext);
}
