import { Router } from "express";
import { ExampleController } from "../controllers/example.controller";
import Route from "../interfaces/routes.interface";

export class ExampleRoute implements Route {
	public path = "/example";
	public router = Router();
	public exampleController = new ExampleController();

	constructor() {
		this.initializeRoutes();
	}

	private initializeRoutes() {
		this.router.get(`${this.path}`, this.exampleController.getExample);
	}
}