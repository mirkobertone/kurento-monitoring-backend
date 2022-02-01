import { Monitor } from "../models/monitor";
import kmsController from "../services/kurento.service";
import { NextFunction, Request, Response } from "express";

class MonitorController {

  public connectApi = (req: Request, res: Response, next: NextFunction) => {
		try {
      this.start({}, {});
			res.sendStatus(200);
		} catch (error) {
			next(error);
		}
	};
  
  public async start(socket, data) {
    const {url} = data;

    try {
      const connection = await kmsController.connect(url);
      const manager = await connection.getServerManager();
      const monitor = new Monitor(manager);
            
      monitor.on("pipelines", pipelines  => console.log(pipelines));
      monitor.on("serverInfo", serverInfo  => console.log(serverInfo));

      monitor.start();
      
    } catch (error) {
      console.log("Catch error", error);
      socket.emit("connect_error", error.message)
    }

  }

}

export default new MonitorController();