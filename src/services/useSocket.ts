import { useEffect } from "react";
import { Socket } from "socket.io-client";

export const getUseSocket =
  (socket: Socket) => (message: string, handler: (...args: any[]) => void) => {
    useEffect(() => {
      socket.on(message, handler);
      return () => {
        socket.off(message);
      };
    });
  };
