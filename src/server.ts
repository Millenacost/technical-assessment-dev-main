import app from "express";
import { UserController } from "./controllers/UserController";
import init from "./database";

const server = app();
const router = app.Router();

router.get("/user", async (req, res) => {
	return new UserController().getAll(req, res);
});

router.get("/users/:id", async (req, res) => {
	return new UserController().getById(req, res);
});

router.put("/users/:id", async (req, res) => {
	return new UserController().updateById(req, res);
});

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
