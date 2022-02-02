import App from "./app";
import KurentoRoute from "./routes/kurento.route";

const app = new App([
	new KurentoRoute(),
]);

app.listen();