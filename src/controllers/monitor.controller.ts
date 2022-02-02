import { Monitor } from "../models/monitor";
import KurentoService from "../services/kurento.service";
import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../interfaces/socketio.interface";
import { ServerManager } from "kurento-client";


class MonitorController {

  private monitors: {
    [socket_id: string]: {
      monitor: Monitor,
      kurentoManager: ServerManager;
    }
  }
  constructor() {
    this.monitors = {};
  }
  public connectApi = (req: Request, res: Response, next: NextFunction) => {
		try {
      // this.start({}, {});
			res.sendStatus(200);
		} catch (error) {
			next(error);
		}
	};
  
  public async start(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, data: SocketData) {
    const {url} = data;
    console.log("Socket want to connect to kurento server", url);
    try {
      const connection = await KurentoService.connect(url);
      const kurentoManager = await connection.getServerManager();
      const monitor = new Monitor(kurentoManager);
      this.monitors[socket.id] = {
        monitor,
        kurentoManager
      }
      monitor.on("pipelines", pipelines  => socket.emit("monitor:pipelines", pipelines));
      monitor.on("serverInfo", serverInfo  => socket.emit("monitor:serverInfo", serverInfo));

      monitor.start();
      
    } catch (error) {
      console.log("Catch error", error);
      socket.emit("app:error", error.message)
    }
  }

  public stop(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
    if(this.monitors[socket.id]){
      console.log("Stopping monitor for", socket.id, "Releasing resources");
      this.monitors[socket.id].monitor.stop();
      delete this.monitors[socket.id];
    }
  }
}

export default new MonitorController();