import { UserController } from "../controllers/UserController";
import { Router } from "express";

export async function userRoutes(router: Router) {
	const userController = new UserController();

	router.get("/users", async (req, res) => {
		return userController.getAll(req, res);
	});

	router.get("/users/:id", async (req, res) => {
		return new UserController().getById(req, res);
	});

	router.put("/users/:id", async (req, res) => {
		return new UserController().updateById(req, res);
	});

	router.post("/users", async (req, res) => {
		return new UserController().create(req, res);
	});

	router.delete("/users/:id", async (req, res) => {
		return new UserController().deleteById(req, res);
	});
}
