import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // No user logged in — nothing to connect
    if (!user) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token: user.token },
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection failed:", err.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

   
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};