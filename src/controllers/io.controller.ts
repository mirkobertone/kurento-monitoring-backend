import { Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../interfaces/socketio.interface";
import MonitorController from "./monitor.controller";

class IOController {
	public port: number;
  constructor() {
    this.port = Number(process.env.IO_PORT || 3001);
  }
  init() {
    const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>();
    io.on('connection', socket => {
      console.log("Socket connected", socket.id);
      
      socket.on("monitor:start", (data: SocketData) => MonitorController.start(socket, data))
      socket.on("disconnect", reason => {
        // Release kurento connections
        console.log("Socket disconnected", socket.id);
        MonitorController.stop(socket);
      })
    });
		console.log(`🚀 Socket.IO listening on the port ${this.port}`);
    io.listen(this.port);
  }

}

export default new IOController();