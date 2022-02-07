import { Monitor } from "../models/monitor";
import KurentoService from "../services/kurento.service";
import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../interfaces/socketio.interface";
import { ServerManager } from "kurento-client";
import _ from "lodash";


class MonitorController {

  private monitors: { [url: string]: Monitor}
 
  constructor() {
    this.monitors = {};
  }
  public connectApi = (req: Request, res: Response, next: NextFunction) => {
		try {
			res.sendStatus(200);
		} catch (error) {
			next(error);
		}
	};
  

  public async start(socket: Socket < ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData > , url: string) {
    if (_.isNil(this.monitors[url])) {
      console.log("[NEW_MONITOR]");
      
      const monitor = new Monitor(url);
      try {
        await monitor.init(url);
        this.monitors[url] = monitor;
      } catch (error) {
        console.log("[ERROR_MONITOR_CONTROLLER]", error);
        socket.emit("app:error", error.message);
      }
    }
    this.monitors[url].addClient(socket);
    this.monitors[url].start();
    console.log("[START_MONITOR]", _.keys(this.monitors));
  }

  public stop(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, url: string) {
    const monitor = this.monitors[url]; 
    if(monitor){
      console.log("Stopping monitor for", socket.id, "Releasing resources");
      monitor.removeClient(socket);
      if(monitor.getClients() === 0) {
        monitor.stop();
        console.log("STOP MONITOR");
        delete this.monitors[url];
      }
    }
  }
}

export default new MonitorController();