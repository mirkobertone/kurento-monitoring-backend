import { Server } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData, SocketDataRelease } from "../interfaces/socketio.interface";
import MonitorController from "./monitor.controller";
import _ from "lodash";

class IOController {

  private socket_urls: { [socket_id: string]: string[]} = {};

  
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
      this.socket_urls[socket.id] = [];
      
      socket.on("monitor:start", (data: SocketData) => {
        console.log("[START_SIGNAL]");
        
        const { url } = data;
        if (!url) {
          socket.emit("app:error", "Error parameter - url is not defined");
          return;
        }
        MonitorController.start(socket, url)
        this.socket_urls[socket.id].push(data.url);
      });
    
      socket.on("monitor:stop", (data: SocketData) => {
        const { url } = data;
        if (!url) {
          socket.emit("app:error", "Error parameter - url is not defined");
          return;
        }
        MonitorController.stop(socket, url);
        _.remove(this.socket_urls[socket.id], s => s === url )
      });

      socket.on("kurento:release", (data: SocketDataRelease) => {
        console.log("kurento:release received", data);
        const ids = { data };
        const url = { data };
        if(!ids || !url) {
          socket.emit("app:error", "Error parameter - ids or url are not defined");
        }
        MonitorController.release(socket, data.url, data.ids)
      })

      socket.on("disconnect", reason => {
        // Release kurento connections
        console.log("Socket disconnected", socket.id);
        _.forEach(this.socket_urls[socket.id], url => {
          MonitorController.stop(socket, url);
          delete this.socket_urls[socket.id];
        })
      })
    });
  }
}

export default new IOController();