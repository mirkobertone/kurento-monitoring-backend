import { Router } from "express";
import MonitorController from "../controllers/monitor.controller";

import Route from "../interfaces/routes.interface";

export default class KurentoRoute implements Route {
	public path = "/";
	public router = Router();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}`, MonitorController.connectApi);
	}
}