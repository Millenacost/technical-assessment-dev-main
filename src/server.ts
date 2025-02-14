import * as app from "express";
import { UserController } from "./controllers/UserController";

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

export default server.listen(3003);
