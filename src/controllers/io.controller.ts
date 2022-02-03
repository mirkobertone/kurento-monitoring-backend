import { Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../interfaces/socketio.interface";
import MonitorController from "./monitor.controller";

class IOController {
	public port: number;
  
  init(server) {
    const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
      cors: {
        // Configures the Access-Control-Allow-Origin CORS header.
          origin: "*",
          // Configures the Access-Control-Allow-Methods CORS header.
          methods: ["GET", "OPTIONS", "POST"],
          // Configures the Access-Control-Allow-Headers CORS header.
          allowedHeaders: [],
          // Configures the Access-Control-Expose-Headers CORS header.
          exposedHeaders: [],
          // Configures the Access-Control-Allow-Credentials CORS header.
          credentials: false
        // Configures the Access-Control-Max-Age CORS header.
        // maxAge: 3600
        }
    });
    io.on('connection', socket => {
      console.log("Socket connected", socket.id);
      socket.emit("connect");
      
      socket.on("monitor:start", (data: SocketData) => MonitorController.start(socket, data))
      socket.on("disconnect", reason => {
        // Release kurento connections
        console.log("Socket disconnected", socket.id);
        MonitorController.stop(socket);
      })
    });
  }

}

export default new IOController();