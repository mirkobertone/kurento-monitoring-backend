import express, { Request, Response } from "express";
import Route from "./interfaces/routes.interface";
import errorMiddleware from "./middlewares/error.middleware";

class App {
	public app: express.Application;
	public port: string | number;
	public env: boolean;

	constructor(routes: Route[]) {
		this.app = express();
		this.port = process.env.PORT || 3000;
		this.env = process.env.NODE_ENV === "production" ? true : false;
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

		this.initializeMiddlewares();
		this.initializeRoutes(routes);
		this.initializeErrorHandling();
	}

	public listen() {
		this.app.listen(this.port, () => {
			console.log(`🚀 App listening on the port ${this.port}`);
		});
	}

	public getServer() {
		return this.app;
	}
	private initializeMiddlewares() {
		if (this.env) {
			//production
			// this.app.use(cors());
			// this.app.use(hpp());
			// this.app.use(helmet());
			// this.app.use(logger('combined'));
			//this.app.use(cors({ origin: 'your.domain.com', credentials: true }));
		} else {
			//development
			// this.app.use(logger('dev'));
			// this.app.use(cors({
			//   origin: true,
			//   credentials: true
			// }));
		}
		this.app.use(express.json());
		this.app.use(express.urlencoded({
			extended: true
		}));
	}

	private initializeRoutes(routes: Route[]) {
		routes.forEach(route => {
			this.app.use("/", route.router);
		});
	}

	private initializeErrorHandling() {
		this.app.use(errorMiddleware);
	}
}

export default App;

