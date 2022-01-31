import { NextFunction, Request, Response } from "express";

export class ExampleController {
    
	public getExample = (req: Request, res: Response, next: NextFunction) => {
		res.send("getExample");
	};
}