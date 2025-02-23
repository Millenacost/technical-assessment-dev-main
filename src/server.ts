import app from "express";
import init from "./database";
import { userRoutes } from "./routes/user.routes";
import { regionRoutes } from "./routes/region.routes";

const server = app();
const router = app.Router();

server.use(app.json());

userRoutes(router);
regionRoutes(router);

server.use(router);

init()
	.then(() => {
		server.listen(3003, () => {
			console.log("Running port 3003");
		});
	})
	.catch((error) => {
		console.error("Error connecting to mongodb", error);
	});

export default server;
