import App from "./app";
import IndexRoute from "./routes/index.route";
import KmsRoute from "./routes/kms.route";

const app = new App([
	new KmsRoute(),
	new IndexRoute()
]);

app.listen();