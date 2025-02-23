import app from "express";
import { UserController } from "./controllers/UserController";
import init from "./database";
import { RegionController } from "./controllers/RegionController";

const server = app();
const router = app.Router();

server.use(app.json());

router.get("/users", async (req, res) => {
	return new UserController().getAll(req, res);
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

router.get("/regions/point", async (req, res) => {
	return new RegionController().getRegionsByPoint(req, res);
});

router.get("/regions/point/distance/user", async (req, res) => {
	return new RegionController().getRegionsByPointByDistanceWithoutUser(
		req,
		res
	);
});

router.post("/regions", async (req, res) => {
	return new RegionController().create(req, res);
});

router.put("/regions/:id", async (req, res) => {
	return new RegionController().updateById(req, res);
});

router.delete("/regions/:id", async (req, res) => {
	return new RegionController().deleteById(req, res);
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

export default server;
