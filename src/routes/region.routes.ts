import { Router } from "express";
import { RegionController } from "../controllers/RegionController";

export async function regionRoutes(router: Router) {
	const regionController = new RegionController();

	router.get("/regions/point", async (req, res) => {
		return regionController.getRegionsByPoint(req, res);
	});

	router.get("/regions/point/distance/user", async (req, res) => {
		return regionController.getRegionsByPointByDistanceWithoutUser(req, res);
	});

	router.post("/regions", async (req, res) => {
		return regionController.create(req, res);
	});

	router.put("/regions/:id", async (req, res) => {
		return regionController.updateById(req, res);
	});

	router.delete("/regions/:id", async (req, res) => {
		return regionController.deleteById(req, res);
	});
}
