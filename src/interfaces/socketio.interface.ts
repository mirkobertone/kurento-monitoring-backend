import { Socket } from "socket.io";

export interface ServerToClientEvents {
  
  "app:error": (error: any) => void;
  "monitor:pipelines": (pipelines: any) => void;
  "monitor:serverInfo": (serverinfo: any) => void;
  "connect": () => void;
}
export interface ClientToServerEvents {
  "monitor:start": (data: any) => Promise<void>;
}
export interface InterServerEvents {
  ping: () => void;
}
export interface SocketData {
  url: string;
}
